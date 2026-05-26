import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Loader2 } from 'lucide-react'; // Added Loader2 for a spinning icon

function ChatAi({ problem }) {
    // 1. Better initial state
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hello! I am your AI DSA tutor. Stuck on this problem? Ask me for a hint!" }] }
    ]);
    // 2. Added loading state
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]); // scroll when loading starts too!

    const onSubmit = async (data) => {
        // --- CRITICAL FIX ---
        // Create the new message array FIRST
        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        const updatedMessages = [...messages, userMessage];
        
        // Update the UI immediately
        setMessages(updatedMessages);
        reset();
        setIsLoading(true);

        try {
            // Pass the newly created array, NOT the stale state variable
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages, 
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: response.data.message }] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "Oops! I'm having trouble connecting. Please try again." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        {/* Make AI bubbles slightly different color from User bubbles */}
                        <div className={`chat-bubble ${msg.role === "user" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                
                {/* 3. Show a typing indicator when AI is thinking */}
                {isLoading && (
                    <div className="chat chat-start">
                        <div className="chat-bubble bg-base-200 text-base-content flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            AI is thinking...
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
            
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex items-center">
                    <input 
                        placeholder="Ask for a hint or paste an error..." 
                        className="input input-bordered flex-1" 
                        disabled={isLoading} // Disable input while waiting
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-ghost ml-2"
                        disabled={errors.message || isLoading} // Disable button while waiting
                    >
                        <Send size={20} className={isLoading ? "opacity-50" : ""} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;