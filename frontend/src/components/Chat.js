import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";
import ToolSelector from "./ToolSelector";

const Chat = () => {
    const [conversations, setConversations] = useState([{id: 1, title: "Nouvelle conversation", messages: []}]);
    const [activeConv, setActiveConv] = useState(1);
    const [input, setInput] = useState("");
    const [selectedTool, setSelectedTool] = useState(null);
    const [loading, setLoading] = useState(false);
    const [streamingText, setStreamingText] = useState("");
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [pdfName, setPdfName] = useState("");
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    const currentConv = conversations.find(c => c.id === activeConv);

    useEffect(() => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = "fr-FR";
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const newConversation = () => {
        const id = Date.now();
        setConversations(prev => [...prev, {id, title: "Nouvelle conversation", messages: []}]);
        setActiveConv(id);
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await fetch("http://localhost:8000/upload-pdf", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            setPdfLoaded(true);
            setPdfName(file.name);
            setConversations(prev => prev.map(c =>
                c.id === activeConv
                    ? {...c, messages: [...c.messages, {role: "assistant", content: `PDF **${file.name}** charge avec succes (${data.pages} pages). Posez vos questions sur ce document !`}]}
                    : c
            ));
        } catch (error) {
            console.error("Erreur upload PDF:", error);
        }
    };

    const handleSend = async () => {
        if (input.trim() === "" || loading) return;
        const userMessage = { role: "user", content: input };
        const userInput = input;
        setInput("");
        setLoading(true);
        setStreamingText("");

        setConversations(prev => prev.map(c =>
            c.id === activeConv
                ? {...c, messages: [...c.messages, userMessage], title: c.messages.length === 0 ? userInput.slice(0, 30) : c.title}
                : c
        ));

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    messages: [...currentConv.messages, userMessage],
                    tool: selectedTool
                })
            });

            const data = await response.json();
            const fullText = data.message;

            let i = 0;
            const interval = setInterval(() => {
                if (i < fullText.length) {
                    setStreamingText(fullText.slice(0, i + 1));
                    i++;
                } else {
                    clearInterval(interval);
                    setStreamingText("");
                    setConversations(prev => prev.map(c =>
                        c.id === activeConv
                            ? {...c, messages: [...c.messages, {role: "assistant", content: fullText}]}
                            : c
                    ));
                    setLoading(false);
                }
            }, 10);
        } catch (error) {
            setLoading(false);
        }
        setSelectedTool(null);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentConv?.messages, streamingText]);

    return (
        <div style={{height: "100%", display: "flex", borderRadius: "12px", overflow: "hidden", border: "1px solid #2a0000"}}>
            <div style={{width: "260px", background: "#0d0d0d", borderRight: "1px solid #2a0000", display: "flex", flexDirection: "column"}}>
                <div style={{padding: "16px", display: "flex", flexDirection: "column", gap: "8px"}}>
                    <button onClick={newConversation} style={{width: "100%", padding: "10px", background: "#cc0000", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "14px"}}>
                        + Nouvelle conversation
                    </button>
                    <button onClick={() => fileInputRef.current.click()} style={{width: "100%", padding: "10px", background: pdfLoaded ? "#1a4a1a" : "#1a1a1a", border: pdfLoaded ? "1px solid #00cc00" : "1px solid #333", borderRadius: "8px", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "13px"}}>
                        {pdfLoaded ? `📄 ${pdfName.slice(0, 20)}...` : "📄 Charger un PDF"}
                    </button>
                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} style={{display: "none"}} />
                </div>
                <div style={{flex: 1, overflowY: "auto", padding: "0 8px"}}>
                    {conversations.map(conv => (
                        <div key={conv.id} onClick={() => setActiveConv(conv.id)} style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            marginBottom: "4px",
                            cursor: "pointer",
                            background: conv.id === activeConv ? "#1a0000" : "transparent",
                            border: conv.id === activeConv ? "1px solid #cc0000" : "1px solid transparent",
                            color: conv.id === activeConv ? "#fff" : "#888",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            💬 {conv.title}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{flex: 1, display: "flex", flexDirection: "column", background: "#111111"}}>
                <div style={{flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px"}}>
                    {currentConv?.messages.length === 0 && !streamingText && (
                        <div style={{textAlign: "center", marginTop: "60px", color: "#666"}}>
                            <div style={{fontSize: "48px", marginBottom: "16px"}}>🤖</div>
                            <p style={{fontSize: "18px", color: "#cc0000", fontWeight: "600"}}>Comment puis-je vous aider ?</p>
                            <p style={{fontSize: "14px", color: "#444", marginTop: "8px"}}>Posez une question, chargez un PDF, ou lancez une recherche web.</p>
                        </div>
                    )}
                    {currentConv?.messages.map((msg, idx) => (
                        <Message key={idx} message={msg} />
                    ))}
                    {streamingText && (
                        <Message message={{role: "assistant", content: streamingText + "▌"}} />
                    )}
                    {loading && !streamingText && (
                        <div style={{display: "flex", gap: "6px", padding: "12px 16px", background: "#1a1a1a", borderRadius: "12px", width: "fit-content", border: "1px solid #2a0000"}}>
                            <div style={{width: "8px", height: "8px", background: "#cc0000", borderRadius: "50%"}}></div>
                            <div style={{width: "8px", height: "8px", background: "#cc0000", borderRadius: "50%"}}></div>
                            <div style={{width: "8px", height: "8px", background: "#cc0000", borderRadius: "50%"}}></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={{padding: "16px", borderTop: "1px solid #2a0000", background: "#0d0d0d"}}>
                    <ToolSelector selectedTool={selectedTool} onSelect={setSelectedTool} pdfLoaded={pdfLoaded} />
                    <div style={{display: "flex", gap: "8px", marginTop: "12px"}}>
                        <button
                            onClick={toggleListening}
                            style={{
                                padding: "12px",
                                background: isListening ? "#cc0000" : "#1a1a1a",
                                border: isListening ? "none" : "1px solid #333",
                                borderRadius: "8px",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "18px",
                                animation: isListening ? "pulse 1s infinite" : "none"
                            }}
                        >
                            🎤
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder={isListening ? "Parlez maintenant..." : pdfLoaded ? `Posez une question sur ${pdfName}...` : "Tapez votre message..."}
                            style={{flex: 1, padding: "12px 16px", background: "#1a1a1a", border: isListening ? "1px solid #cc0000" : "1px solid #2a0000", borderRadius: "8px", color: "#ffffff", fontSize: "14px", outline: "none"}}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            style={{padding: "12px 20px", background: loading ? "#660000" : "#cc0000", border: "none", borderRadius: "8px", color: "#ffffff", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px"}}
                        >
                            {loading ? "..." : "Envoyer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
