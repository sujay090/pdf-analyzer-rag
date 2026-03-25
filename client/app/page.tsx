import Image from "next/image";
import FileUploadComponent from "./components/file-upload";
import ChatInterface from "./components/chat-interface";

export default function Home() {
    return (
        <div className="h-[calc(100vh-64px)] w-full flex bg-gray-100">
            <div className="w-1/3 min-w-[300px] border-r border-gray-200 p-6 flex flex-col justify-center bg-gray-50">
                <div className="max-w-md mx-auto w-full space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800">PDF Knowledge Base</h1>
                    <p className="text-gray-500 text-sm">Upload a document to train the AI on its contents.</p>
                    <FileUploadComponent />
                </div>
            </div>
            <div className="flex-1 bg-white h-full relative">
                <ChatInterface />
            </div>
        </div>
    );
}
