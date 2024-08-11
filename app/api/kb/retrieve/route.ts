import { PineconeStore } from "@langchain/pinecone";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { embeddings, llm, pineconeIndex } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { question } = await request.json();
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 5,
    // You can pass a namespace here too
    // namespace: "foo",
  });

  // 1. Retrieve the most relevant results
  const retriever = vectorStore.asRetriever({
    k: 3, // Number of results to retrieve
  });
  const results = await retriever.invoke(question);

  // 2. Generate an answer
  const prompt = PromptTemplate.fromTemplate(RAG_PROMPT);
  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(llm).pipe(outputParser);  // See https://js.langchain.com/v0.2/docs/how_to/sequence/
  const completion = await chain.stream({
    context: results.map((doc, i) => `* ${doc.pageContent}`).join("\n"),
    question: question,
  });

  // Handle the streaming response
  const stream = new ReadableStream({
    start: async (controller) => {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunkContent of completion) {
          if (chunkContent) {
            const text = encoder.encode(chunkContent) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  });

  return new NextResponse(stream);
}
