import React from "react";

const ToolSelector = ({ selectedTool, onSelect, pdfLoaded }) => {
    const tools = [
        { id: null, name: "💬 Chat" },
        { id: "web_search", name: "🔍 Recherche Web" },
        { id: "calculate", name: "🧮 Calculatrice" },
        { id: "summarize", name: "📝 Resume" },
        ...(pdfLoaded ? [{ id: "pdf", name: "📄 PDF" }] : [])
    ];

    return (
        <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => onSelect(tool.id)}
                    style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: selectedTool === tool.id ? "1px solid #cc0000" : "1px solid #333",
                        background: selectedTool === tool.id ? "#cc0000" : "#1a1a1a",
                        color: "#ffffff",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontWeight: selectedTool === tool.id ? "600" : "400"
                    }}
                >
                    {tool.name}
                </button>
            ))}
        </div>
    );
};

export default ToolSelector;
