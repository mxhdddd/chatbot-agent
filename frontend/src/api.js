export const sendMessage = async (message, tool = null) => {
    try {
        const response = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ messages: [{ role: "user", content: message }], tool }),
        });
        if (!response.ok) throw new Error("Erreur reseau");
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error("Erreur:", error);
        return "Desole, une erreur s est produite";
    }
};
