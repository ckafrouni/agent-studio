import { env } from "~/env";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { DocumentInterface } from "@langchain/core/documents";
import { collection } from "~/lib/vector-database/chroma";
import { ChromaNotFoundError } from "chromadb";

export interface Document extends DocumentInterface {
  metadata: {
    id: string;
    distance: number;
  };
}

export type Routes = "generator" | "fallback";

const formatDocumentsAsString = (docs: Document[]): string => {
  return docs
    .map((doc) => `[doc:${doc.metadata.id}] ${doc.pageContent}`)
    .join("\n\n");
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
  let documents: any[] = []; // Default to empty array

  try {
    const results = await collection.query({
      nResults: 5,
      queryTexts: [query],
    });

    // Check if results and documents exist before processing
    if (
      results &&
      results.documents &&
      results.documents.length > 0 &&
      results.documents[0]
    ) {
      documents = results.documents[0]
        .map((doc, i) => ({
          pageContent: doc,
          metadata: {
            id: results.ids?.[0]?.[i], // Add safe navigation
            distance: results.distances?.[0]?.[i] ?? 1, // Add safe navigation
          },
        }))
        .filter((doc) => doc.metadata.distance < 0.9);
    } else {
      console.warn(
        "Chroma query returned no documents or unexpected structure."
      );
    }
  } catch (error: any) {
    // Check if it's the specific "Not Found" error
    if (error instanceof ChromaNotFoundError) {
      console.warn(
        "Collection not found or empty during query, returning no documents."
      );
      // documents array is already initialized as empty, so just proceed
    } else {
      // Log other unexpected errors
      console.error("Error during document retrieval query:", error);
      // Optionally re-throw or handle differently, but returning empty documents is often safest for the graph
    }
  }

  return { documents }; // Return the potentially empty documents array
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
    You are a helpful assistant that answers questions based ONLY on the provided context.
    Context:
    {context}
    Based ONLY on the context above, answer the question. You MUST cite the 'id' from the document metadata using the markdown link format [doc:ID](#ID) at the end of the relevant sentence whenever you use information from a document. Do not make up information.

    Question:
    {question}

    Answer:
    `
  ).format({ context, question });

  const response = await model.invoke([
    ...state.messages,
    new SystemMessage(prompt),
  ]);

  // Append the retrieved documents to the final message's metadata
  // This isn't strictly necessary for citation but useful for potential client-side linking
  response.response_metadata = {
    ...(response.response_metadata || {}),
    source_documents: state.documents,
  };

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
