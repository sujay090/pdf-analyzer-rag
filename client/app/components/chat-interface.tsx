'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader2 } from 'lucide-react'

type Message = {
    role: 'user' | 'assistant'
    content: string
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! Please upload a PDF on the left, then ask me questions about it here.' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const res = await fetch('http://localhost:4000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
            } else {
                console.error("Server error:", data.error)
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
            }
        } catch (error) {
            console.error("Failed to fetch:", error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't reach the server. Make sure it's running." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 text-gray-800">
            <div className="bg-white p-4 border-b border-gray-200 shadow-sm z-10">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Bot className="text-blue-500" /> Document Q&A
                </h2>
                <p className="text-sm text-gray-500">Ask questions about your uploaded PDF</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Bot size={18} className="text-blue-600" />
                            </div>
                        )}
                        
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                            m.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'
                        }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        </div>
                        
                        {m.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                <User size={18} className="text-gray-600" />
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Bot size={18} className="text-blue-600" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="text-blue-500 animate-spin" />
                            <span className="text-gray-500 text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about the document..."
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl px-5 py-3 transition-colors flex items-center justify-center shadow-sm"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    )
}
