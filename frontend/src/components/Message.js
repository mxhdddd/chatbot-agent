import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const Message = ({ message }) => {
    const isUser = message.role === "user";
    return (
        <div style={{display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-start"}}>
            {!isUser && (
                <div style={{width: "32px", height: "32px", background: "#cc0000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginRight: "8px", flexShrink: 0}}>🤖</div>
            )}
            <div style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: isUser ? "linear-gradient(135deg, #cc0000, #990000)" : "#1a1a1a",
                border: isUser ? "none" : "1px solid #2a0000",
                color: "#ffffff",
                fontSize: "14px",
                lineHeight: "1.6"
            }}>
                {isUser ? (
                    <span>{message.content}</span>
                ) : (
                    <ReactMarkdown
                        components={{
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                    <div style={{position: "relative", marginTop: "8px"}}>
                                        <div style={{background: "#0a0a0a", padding: "6px 12px", borderRadius: "8px 8px 0 0", fontSize: "12px", color: "#cc0000", borderBottom: "1px solid #2a0000"}}>
                                            {match[1]}
                                        </div>
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{margin: 0, borderRadius: "0 0 8px 8px", border: "1px solid #2a0000", borderTop: "none"}}
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code style={{background: "#2a0000", padding: "2px 6px", borderRadius: "4px", fontSize: "13px", color: "#ff6666"}} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            h1: ({node, ...props}) => <h1 style={{fontSize: "20px", fontWeight: "700", color: "#ff4444", marginBottom: "8px"}} {...props} />,
                            h2: ({node, ...props}) => <h2 style={{fontSize: "17px", fontWeight: "700", color: "#ff4444", marginBottom: "6px"}} {...props} />,
                            h3: ({node, ...props}) => <h3 style={{fontSize: "15px", fontWeight: "600", color: "#ff6666", marginBottom: "4px"}} {...props} />,
                            strong: ({node, ...props}) => <strong style={{color: "#ff6666", fontWeight: "700"}} {...props} />,
                            ul: ({node, ...props}) => <ul style={{paddingLeft: "20px", marginTop: "8px"}} {...props} />,
                            ol: ({node, ...props}) => <ol style={{paddingLeft: "20px", marginTop: "8px"}} {...props} />,
                            li: ({node, ...props}) => <li style={{marginBottom: "4px"}} {...props} />,
                            p: ({node, ...props}) => <p style={{marginBottom: "8px"}} {...props} />,
                            a: ({node, ...props}) => <a style={{color: "#ff4444", textDecoration: "underline"}} target="_blank" rel="noreferrer" {...props} />
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                )}
            </div>
            {isUser && (
                <div style={{width: "32px", height: "32px", background: "#333", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginLeft: "8px", flexShrink: 0}}>👤</div>
            )}
        </div>
    );
};

export default Message;
