import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { Queue } from 'bullmq'
const app = express()
app.use(cors())
app.use(express.json())

const queue = new Queue("file-upload-queue", {
    connection: {
        host: "localhost",
        port: 6379
    }
})

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})


const upload = multer({ storage: storage })

app.post("/api/upload", upload.single('pdf'), async (req, res) => {
    await queue.add('file-ready', JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        source: req.file.path
    }))
    res.status(200).json({ message: 'File uploaded successfully' })
})

import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        console.log("Chat request received:", message);

        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "gemini-embedding-001",
            apiKey: process.env.GOOGLE_API_KEY || "AIzaSyDyuiwf4KzOIZ1DNdW0u-_wMKHj_BPf16E",
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: "http://localhost:6333",
                collectionName: 'pdf-docs'
            }
        );

        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash", 
            apiKey: process.env.GOOGLE_API_KEY || "AIzaSyDyuiwf4KzOIZ1DNdW0u-_wMKHj_BPf16E",
            temperature: 0,
        });

        const prompt = PromptTemplate.fromTemplate(`
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.

Context: {context}

Question: {question}

Answer:`);

        const retriever = vectorStore.asRetriever({ k: 4 });

        const chain = RunnableSequence.from([
            {
                context: async (input) => {
                    const docs = await retriever.invoke(input.question);
                    return docs.map(doc => doc.pageContent).join("\n\n");
                },
                question: (input) => input.question,
            },
            prompt,
            llm,
            new StringOutputParser(),
        ]);

        const response = await chain.invoke({
            question: message,
        });

        res.status(200).json({ answer: response });
    } catch (error) {
        console.error("Error in /api/chat:", error);
        res.status(500).json({ error: "Failed to process chat message", details: error.message, stack: error.stack });
    }
});


app.listen(4000, () => {
    console.log('Server is running on port 4000')
})