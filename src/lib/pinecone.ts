import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromFirebase } from "./firebase";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import md5 from "md5";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

export const getPineconeClient = () => {
  return new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadFirebaseIntoPinecone(fileKey: string) {
  const { buffer, file_name } = await downloadFromFirebase(fileKey);
  if (!buffer || !file_name) {
    throw new Error("could not download from firebase");
  }
  const blob = new Blob([buffer], { type: "application/pdf" });

  const loader = new PDFLoader(blob);
  const pages = (await loader.load()) as PDFPage[];
  const documents = await Promise.all(pages.map(prepareDocument));

  const vectors = await Promise.all(documents.flat().map(embedDocument));
  const client = await getPineconeClient();
  const pineconeIndex = client.index(
    process.env.PINECONE_INDEX || "chatpdf-ai"
  );
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
  await namespace.upsert(vectors);
  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
