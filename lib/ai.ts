import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

export const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const pinecone = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY as string
});
export const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME as string);

export async function createVectorStore() {
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 5,
    // You can pass a namespace here too
    // namespace: "foo",
  });
  return vectorStore;
} 
