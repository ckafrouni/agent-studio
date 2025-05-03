import type { DocumentInterface } from '@langchain/core/documents'
import type { BaseMessage } from '@langchain/core/messages'
import { SystemMessage } from '@langchain/core/messages'
import { PromptTemplate } from '@langchain/core/prompts'
import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import { TavilySearch } from '@langchain/tavily'
import type { TavilySearchResponse } from '@langchain/tavily'
import { env } from '@/env'
import { getUserCollection } from '@/lib/vector-database/chroma'

export interface Document extends DocumentInterface {
	metadata: {
		id: string
		distance: number
		source: string
	}
}

export type Routes = 'generator' | 'web_searcher'

const extractContextFromDocumentRetrieval = (docs: Document[]): string => {
	return docs
		.map(
			(doc, index) =>
				`[Index: ${String(index + 1)} | Source: ${doc.metadata.source} | ID: ${
					doc.metadata.id
				}] ${doc.pageContent}`,
		)
		.join('\n\n')
}

const extractContextFromTavilyResponse = (response: TavilySearchResponse): string => {
	if (response.results.length === 0) {
		return 'No web search results found.'
	}
	return response.results
		.map(
			(result, index) =>
				`[Index: ${String(index + 1)} | URL: ${result.url} | Title: ${result.title}]
${result.content}`,
		)
		.join('\n\n---\n\n')
}

export const GraphAnnotation = Annotation.Root({
	messages: Annotation<BaseMessage[]>,
	documents: Annotation<Document[]>,
	web_context: Annotation<TavilySearchResponse | null>,
	routing: Annotation<Routes>,
	final_node: Annotation<boolean>,
	userId: Annotation<string>,
})

export type GraphAnnotationType = typeof GraphAnnotation.State

// MARK: - LLM Config
const model = new ChatOpenAI({
	apiKey: env.OPENAI_API_KEY,
	model: env.OPENAI_CHAT_MODEL,
})

// MARK: - Retrieval Function
const doc_retriever = async (state: GraphAnnotationType) => {
	const query = state.messages[state.messages.length - 1].content as string
	const userId = state.userId
	let documents: Document[] = []

	if (!userId) {
		return { documents: [] }
	}

	const userCollection = await getUserCollection(userId)

	const results = await userCollection.query({
		nResults: 5,
		queryTexts: [query],
	})

	if (results.documents[0]?.length > 0) {
		documents = results.documents[0]
			.map((doc, i) => ({
				pageContent: doc ?? '',
				metadata: {
					id: results.ids[0][i],
					distance: results.distances?.[0][i] ?? 1,
					source: String(results.metadatas[0][i]?.source ?? 'Unknown Source'),
				},
			}))
			.filter((doc) => doc.metadata.distance <= 0.6)
	}

	return { documents }
}

// MARK: - Document Check & Routing
const rag_checker = (state: GraphAnnotationType): { routing: Routes } => {
	return state.documents.length > 0 ? { routing: 'generator' } : { routing: 'web_searcher' }
}

// MARK: - Generate Response with RAG
const generator = async (state: GraphAnnotationType) => {
	const last_message = state.messages[state.messages.length - 1]
	const question = last_message.content as string

	const context = extractContextFromDocumentRetrieval(state.documents)

	const prompt = await PromptTemplate.fromTemplate(
		`
    You are a knowledgeable and concise assistant committed to providing accurate answers using only the context below.
    Context:
    {context}
    
    Please answer the following question in fully formatted markdown with the following structure:
    - A main title summarizing your answer.
    - A concise subtitle for clarity.
    - A bullet list outlining key points of information.
    - A table if you need to present tabular data.
    
    When referencing information from a specific source document listed in the context above (e.g., '[Source: example.pdf | ID: some_id]'), you MUST include a citation at the end of the relevant sentence. 
    Format the citation as a relative markdown link: '[Index](/api/files/content/FILENAME)'. Replace FILENAME with the actual filename you extracted from the '[Source: FILENAME | ID: ...]' part of the context for that document. 
    **Important:** Replace the '[Index]' part of the link text with the actual index number (e.g., '[1]', '[2]') corresponding to the '[Index: N | ...]' line in the context you are citing.
    Ensure the FILENAME in the link is properly URL-encoded if it contains spaces or special characters.
    Do not include details that are not supported by the context.
    
    Ensure your response is strictly based on the provided context.
    
    Question:
    {question}
    
    Answer:
    `,
	).format({ context, question })

	const response = await model.invoke([...state.messages, new SystemMessage(prompt)])

	return { messages: response, final_node: true }
}

// MARK: - Web Search Node
const web_searcher = async (state: GraphAnnotationType) => {
	const last_message = state.messages[state.messages.length - 1]
	const question = last_message.content as string

	const tool = new TavilySearch({
		maxResults: 3,
		tavilyApiKey: env.TAVILY_API_KEY,
	})
	const web_context = (await tool.invoke({ query: question })) as TavilySearchResponse | null

	return !web_context
		? { web_context: 'No relevant information found after web search.' }
		: { web_context }
}

// MARK: - Generate Response with Web Context
const web_generator = async (state: GraphAnnotationType) => {
	const last_message = state.messages[state.messages.length - 1]
	const question = last_message.content as string

	const web_context_content = state.web_context
		? extractContextFromTavilyResponse(state.web_context)
		: ''

	const prompt = await PromptTemplate.fromTemplate(
		`
    You are a helpful assistant. You couldn't find relevant information in the local document knowledge base, but you have access to the web.
    Web Search Context:
    {web_context}
    
    Please answer the following question in fully formatted markdown with the following structure:
    - A main title summarizing your answer.
    - A concise subtitle for clarity.
    - A bullet list outlining key points of information.
    - A table if you need to present tabular data.
    
    When referencing information from a specific source document listed in the context above (e.g., '[Source: example.pdf | ID: some_id]'), you MUST include a citation at the end of the relevant sentence. 
    Format the citation as a relative markdown link: '[Index](URL)'. Replace URL with the actual URL you extracted from the '[Source: URL | ID: ...]' part of the context for that document. 
    **Important:** Replace the '[Index]' part of the link text with the actual index number (e.g., '[1]', '[2]') corresponding to the '[Index: N | ...]' line in the context you are citing.
    Do not include details that are not supported by the context.
    
    Ensure your response is strictly based on the provided context.
    
    Question:
    {question}
    
    Answer:
    `,
	).format({ question, web_context: web_context_content })

	const response = await model.invoke([...state.messages, new SystemMessage(prompt)])

	return { messages: response, final_node: true }
}

// MARK: - Graph

export const webSearchRagGraph = new StateGraph(GraphAnnotation)
	.addNode('retriever', doc_retriever)
	.addNode('checker', rag_checker)
	.addNode('generator', generator)
	.addNode('web_searcher', web_searcher)
	.addNode('web_generator', web_generator)
	.addEdge(START, 'retriever')
	.addEdge('retriever', 'checker')
	.addConditionalEdges('checker', (state) => state.routing)
	.addEdge('generator', END)
	.addEdge('web_searcher', 'web_generator')
	.addEdge('web_generator', END)

export default webSearchRagGraph.compile()
