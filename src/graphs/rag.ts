import { env } from "@/env";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { collection } from "@/lib/chroma";
import { PromptTemplate } from "@langchain/core/prompts";
import { DocumentInterface } from "@langchain/core/documents";

interface Document extends DocumentInterface {
  metadata: {
    id: string;
    distance: number;
  };
}

const formatDocumentsAsString = (docs: Document[]): string => {
  return docs.map((doc) => doc.pageContent).join("\n\n");
};

export const GraphAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>,
  documents: Annotation<Document[]>,
  routing: Annotation<"generator" | "fallback">,
});

export type GraphAnnotationType = typeof GraphAnnotation.State;

// MARK: - LLM Config
const model = new ChatOpenAI({
  apiKey: env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  streaming: true,
});

// MARK: - Retrieval Function
const retrieveDocuments = async (state: GraphAnnotationType) => {
  const query = state.messages[state.messages.length - 1].content as string;

  const results = await collection.query({
    nResults: 3,
    queryTexts: [query],
  });

  const documents = results.documents[0]
    .map((doc, i) => ({
      pageContent: doc,
      metadata: {
        id: results.ids[0][i],
        distance: results.distances?.[0][i] ?? 1,
      },
    }))
    .filter((doc) => doc.metadata.distance < 0.5);

  return { documents };
};

// MARK: - Check Retrieval Quality
const checkRetrievalQuality = async (state: GraphAnnotationType) => {
  return state.documents.length > 0
    ? { routing: "generator" }
    : { routing: "fallback" };
};

// MARK: - RAG Prompt Template
const ragPromptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on the provided context.
If you don't know the answer based on the context, just say that you don't know.

Context:
{context}

Question:
{question}

Answer:
`);

// MARK: - Generate Response with RAG
const generateResponse = async (state: GraphAnnotationType) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content as string;

  const formattedDocs = formatDocumentsAsString(state.documents);

  const prompt = await ragPromptTemplate.format({
    context: formattedDocs,
    question: query,
  });

  const response = await model.invoke([new HumanMessage(prompt)]);

  return { messages: response };
};

// MARK: - Fallback Response
const fallbackResponse = async (state: GraphAnnotationType) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content as string;

  const response = await model.invoke([
    ...state.messages,
    new HumanMessage(`
      The knowledge base does not contain the answer to the question. 
      However, please try to answer based on your general knowledge.
      Start by saying that the knowledge base does not contain the answer.
    `),
  ]);

  return { messages: response };
};

// MARK: - Graph

export const graphWorkflow = new StateGraph(GraphAnnotation)
  .addNode("retriever", retrieveDocuments)
  .addNode("checker", checkRetrievalQuality)
  .addNode("generator", generateResponse)
  .addNode("fallback", fallbackResponse)
  .addEdge(START, "retriever")
  .addEdge("retriever", "checker")
  .addConditionalEdges("checker", (state) => state.routing)
  .addEdge("generator", END)
  .addEdge("fallback", END)
  .compile();
