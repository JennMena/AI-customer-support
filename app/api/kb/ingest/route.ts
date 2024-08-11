import { Document as VectorDocument } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createVectorStore } from "@/lib/ai";

/**
 * Ingest a text file into the vector store for retrieval.
 * Use "multipart/form-data" to send the file. The file should be a .txt or .md file.
 */
export async function POST(request: Request) {
  // Get the file from the request
  const formData = await request.formData();
  if (!formData.has("file")) {
    return Response.json({ error: "No file found" }, { status: 400 });
  }
  const file = formData.get("file") as File;
  const fileExtension = file.name.split(".").pop();
  if (!fileExtension || !["txt", "md"].includes(fileExtension)) {
    return Response.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Read the file and create a document
  const text = await file.text();
  const doc = new VectorDocument({
    pageContent: text,
    metadata: {
      sourceFile: file.name,
      sourceType: "file"
    }
  });

  // 1. Split the text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments([doc]);

  // 2. Store the splits in the vector store
  const vectorStore = await createVectorStore();
  await vectorStore.addDocuments(splits);
  return Response.json({ message: "Ingested successfully" });
}
