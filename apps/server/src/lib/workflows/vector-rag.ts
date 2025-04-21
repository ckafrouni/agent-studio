import { env } from "~/env";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { DocumentInterface } from "@langchain/core/documents";
import { collection } from "~/lib/vector-database/chroma";

export interface Document extends DocumentInterface {
  metadata: {
    id: string;
    distance: number;
  };
}

export type Routes = "generator" | "fallback";

const formatDocumentsAsString = (docs: Document[]): string => {
  return docs.map((doc) => doc.pageContent).join("\n\n");
};

export const GraphAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>,
  documents: Annotation<Document[]>,
  routing: Annotation<Routes>,
});

export type GraphAnnotationType = typeof GraphAnnotation.State;

// MARK: - LLM Config
const model = new ChatOpenAI({
  apiKey: env.OPENAI_API_KEY,
  model: env.OPENAI_CHAT_MODEL,
  // streaming: true,
});

// MARK: - Retrieval Function
const doc_retriever = async (state: GraphAnnotationType) => {
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
    .filter((doc) => doc.metadata.distance < 0.8);

  return { documents };
};

// MARK: - Check Retrieval Quality
const rag_checker = async (state: GraphAnnotationType) => {
  return state.documents.length > 0
    ? { routing: "generator" }
    : { routing: "fallback" };
};

// MARK: - Generate Response with RAG
const generator = async (state: GraphAnnotationType) => {
  const last_message = state.messages[state.messages.length - 1];
  const question = last_message.content as string;

  const context = formatDocumentsAsString(state.documents);

  const prompt = await PromptTemplate.fromTemplate(
    `
    You are a helpful assistant that answers questions based on the provided context.
    If you don't know the answer based on the context, just say that you don't know.
    
    Context:
    {context}
    
    Question:
    {question}
    `
  ).format({ context, question });

  const response = await model.invoke([
    ...state.messages,
    new SystemMessage(prompt),
  ]);

  return { messages: response };
};

// MARK: - Fallback Response
const fallback_generator = async (state: GraphAnnotationType) => {
  const last_message = state.messages[state.messages.length - 1];
  const question = last_message.content as string;

  const prompt = await PromptTemplate.fromTemplate(
    `
    You are a helpful assistant that answers questions based on the provided context.
    The RAG system failed to retrieve relevant context for the question.
  
    Start by saying "I don't have enough context to answer this question", then briefly explain what you know.
    
    Question:
    {question}
    `
  ).format({ question });

  const response = await model.invoke([
    ...state.messages,
    new SystemMessage(prompt),
  ]);

  return { messages: response };
};

// MARK: - Graph

export const vectorRagGraph = new StateGraph(GraphAnnotation)
  .addNode("retriever", doc_retriever)
  .addNode("checker", rag_checker)
  .addNode("generator", generator)
  .addNode("fallback", fallback_generator)
  .addEdge(START, "retriever")
  .addEdge("retriever", "checker")
  .addConditionalEdges("checker", (state) => state.routing)
  .addEdge("generator", END)
  .addEdge("fallback", END);

export default vectorRagGraph.compile();
