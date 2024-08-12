import { NextResponse } from "next/server";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createVectorStore, llm } from "@/lib/ai";
import { QA_SYSTEM_PROMPT } from "@/lib/prompts";
import { ChatMessage } from "@/lib/types";

interface RetrieveRequest {
  question: string;
  messages: ChatMessage[];
  maxLastMessages?: number; // Maximum number of last messages to include in the context
}

interface PromptTemplateInput {
  context: string;
  question: string;
  chatHistory: BaseMessage[];
}

export async function POST(request: Request) {
  const data: RetrieveRequest = await request.json();
  const { question, messages, maxLastMessages = 10 } = data;
  
  // 1. Retrieve the most relevant results
  const vectorStore = await createVectorStore();
  const retriever = vectorStore.asRetriever({
    k: 3, // Number of results to retrieve
  }); // See https://js.langchain.com/v0.2/docs/integrations/vectorstores/pinecone/
  const results = await retriever.invoke(question);

  const context = results.map((doc, i) => `Extract ${i + 1}:\n${doc.pageContent}`).join("\n\n");
  // Only include the last `maxLastMessages` messages in the chat history
  const chatHistory = messages.slice(-maxLastMessages).map((message) => {
    if (message.role === "user") {
      return new HumanMessage(message.content);
    } else {
      return new AIMessage(message.content);
    }
  });

  // 2. Generate an answer
  // const promptTemplate = PromptTemplate.fromTemplate(RAG_PROMPT); // See https://js.langchain.com/v0.2/docs/concepts/#prompt-templates (use this if you don't want to include the chat history)
  const promptTemplate = ChatPromptTemplate.fromMessages<PromptTemplateInput>([
    ["system", QA_SYSTEM_PROMPT],
    new MessagesPlaceholder("chatHistory"),
    ["human", "{question}"],
  ]); // See https://js.langchain.com/v0.2/docs/tutorials/qa_chat_history/#chain-with-chat-history (use this if you want to include the chat history)
  const outputParser = new StringOutputParser();
  const chain = promptTemplate.pipe(llm).pipe(outputParser);  // See https://js.langchain.com/v0.2/docs/how_to/sequence/
  const chainOutput = await chain.stream({
    context: context,
    question: question,
    chatHistory: chatHistory,
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
