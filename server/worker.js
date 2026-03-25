import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker('file-upload-queue', async (job) => {
    const data = JSON.parse(job.data)
    console.log("Processing job:", data)

    // load the pdf
    const loader = new PDFLoader(data.source);
    const docs = await loader.load()
    console.log("Loaded docs:", docs.length)

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: "your key",
    })
    // fromDocuments auto-creates the collection if it doesn't exist
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
        url: "http://localhost:6333",
        collectionName: 'pdf-docs'
    })
    console.log("all docs are added")
}, {
    concurrency: 100, connection: {
        host: "localhost",
        port: 6379
    }
})

worker.on('error', (err) => console.error('Worker error:', err))
worker.on('failed', (job, err) => console.error('Job failed:', err))
