import { NextResponse } from "next/server";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { createVectorStore, llm } from "@/lib/ai";
import { RAG_PROMPT } from "@/lib/prompts";

interface RetrieveRequest {
  question: string;
}

export async function POST(request: Request) {
  const data: RetrieveRequest = await request.json();
  const { question } = data;
  
  // 1. Retrieve the most relevant results
  const vectorStore = await createVectorStore();
  const retriever = vectorStore.asRetriever({
    k: 3, // Number of results to retrieve
  }); // See https://js.langchain.com/v0.2/docs/integrations/vectorstores/pinecone/
  const results = await retriever.invoke(question);

  // 2. Generate an answer
  const promptTemplate = PromptTemplate.fromTemplate(RAG_PROMPT); // See https://js.langchain.com/v0.2/docs/concepts/#prompt-templates
  const outputParser = new StringOutputParser();
  const chain = promptTemplate.pipe(llm).pipe(outputParser);  // See https://js.langchain.com/v0.2/docs/how_to/sequence/
  const chainOutput = await chain.stream({
    context: results.map((doc, i) => `* ${doc.pageContent}`).join("\n"),
    question: question,
  });

  // Handle the streaming response
  const stream = new ReadableStream({
    start: async (controller) => {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunkContent of chainOutput) {
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
