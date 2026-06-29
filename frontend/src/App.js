import React from "react";
import Chat from "./components/Chat";
import "./App.css";

function App() {
    return (
        <div style={{height: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0a"}}>
            <header style={{background: "linear-gradient(135deg, #1a0000, #330000)", padding: "16px 24px", borderBottom: "2px solid #cc0000", display: "flex", alignItems: "center", gap: "12px"}}>
                <div style={{width: "32px", height: "32px", background: "#cc0000", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"}}>🤖</div>
                <div>
                    <h1 style={{fontSize: "20px", fontWeight: "700", color: "#ffffff", margin: 0}}>AI Assistant</h1>
                    <p style={{fontSize: "12px", color: "#cc0000", margin: 0}}>Powered by DeepSeek</p>
                </div>
                <div style={{marginLeft: "auto", width: "10px", height: "10px", background: "#00ff00", borderRadius: "50%"}}></div>
            </header>
            <main style={{flex: 1, overflow: "hidden", padding: "16px"}}>
                <Chat />
            </main>
        </div>
    );
}

export default App;
