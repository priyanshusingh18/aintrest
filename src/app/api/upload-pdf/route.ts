import { BlobServiceClient } from "@azure/storage-blob";
import { NextRequest } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export async function POST(req: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = getUser();
  if (!user || !user.id) throw new Error("Unauthorized");
  if (!req.body) return new Response("Not Found", { status: 404 });
  const contentDisposition = req.headers.get("content-disposition");

  const matches = contentDisposition.match(/filename="(.*)"/);
  const fileName = matches ? matches[1] : "unknown" + new Date().getTime();

  const chunks = [];
  for await (const chunk of req.body) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  if (!fileName) {
    return new Response("Not Found", { status: 402 });
  }
  if (!buffer) {
    return new Response("Not Found", { status: 404 });
  }
  const accountName = "aintrestblob";
  const containerName = "aintrestapp";
  if (!accountName) throw Error("Azure Storage accountName not found");
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_KEY!
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobName = fileName.toLowerCase() + new Date().getTime();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadResponse = await blockBlobClient.upload(buffer, buffer.length);
  console.log("UPLOADED", uploadResponse);
  const blobUrl = blockBlobClient.url;
  const createdFile = await db.file.create({
    data: {
      key: fileName + Number(new Date().getTime),
      name: fileName,
      userId: user.id,
      user: user.id,
      url: blobUrl,
      uploadStatus: "PROCESSING",
    },
  });
  ("HERE");
  try {
    ("!");
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const loader = new PDFLoader(blob);
    const pageLevelDocs = await loader.load();
    const pagesAmt = pageLevelDocs.length;

    const pineconeIndex = pinecone.Index("aintrest");
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
      pineconeIndex: pineconeIndex,
      namespace: createdFile.id,
    });
    await db.file.update({
      data: {
        uploadStatus: "SUCCESS",
      },
      where: {
        id: createdFile.id,
      },
    });
    console.log("got upload status", createdFile.id);
    return Response.json({ key: createdFile.id });
  } catch (error) {
    console.log(error);
    await db.file.update({
      data: {
        uploadStatus: "FAILED",
      },
      where: {
        id: createdFile.id,
      },
    });
  }
}
