import React, { useState } from "react";
import { apiChat } from "../api"; // <-- uses /api/chat_v2

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState("default"); // NEW — chat mode

  // -------------------------------------
  // Voice Output (Text-to-Speech)
  // -------------------------------------
  function speak(text) {
    const s = new SpeechSynthesisUtterance(text);
    s.lang = "en-US";
    window.speechSynthesis.speak(s);
  }

  // -------------------------------------
  // ChatGPT-style typing animation
  // -------------------------------------
  function animateBotReply(fullText) {
    let index = 0;
    let current = "";

    const interval = setInterval(() => {
      current += fullText[index];
      index++;

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1].text = current;
        return copy;
      });

      if (index >= fullText.length) {
        clearInterval(interval);
        speak(fullText); // voice output
      }
    }, 18);
  }

  // -------------------------------------
  // Send Message
  // -------------------------------------
  async function sendMessage() {
    if (!text.trim()) return;

    const userMsg = text;
    setText("");

    // Push user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);

    // Show typing indicator
    setIsTyping(true);

    // Ask backend (with mode)
    const res = await apiChat(userMsg, mode);
    const botReply = res.reply || "Error connecting to AI.";

    setIsTyping(false);

    // Create empty message to animate
    setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

    // Animate reply
    setTimeout(() => animateBotReply(botReply), 300);
  }

  // Enter key sends message
  function handleKeyPress(e) {
    if (e.key === "Enter") sendMessage();
  }

  // -------------------------------------
  // UI
  // -------------------------------------
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-5">Chat Assistant</h1>

      {/* MODE SELECTOR */}
      <div className="flex gap-3 mb-4">
        {["default", "study", "tasks", "mentor", "motivation"].map((m) => (
          <button
            key={m}
            className={`px-3 py-1 rounded ${
              mode === m ? "bg-blue-700 text-white" : "bg-white border text-black"
            }`}
            onClick={() => setMode(m)}
          >
            {m === "default" && "AI Mode"}
            {m === "study" && "Study Mode"}
            {m === "tasks" && "Task Helper"}
            {m === "mentor" && "Mentor Mode"}
            {m === "motivation" && "Motivation Mode"}
          </button>
        ))}
      </div>

      {/* CHAT BOX */}
      <div className="chat-card">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                "message " + (msg.sender === "user" ? "user-message" : "")
              }
            >
              {msg.text}
            </div>
          ))}

          {/* ChatGPT Typing Indicator */}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="chat-input">
          <input
            placeholder="Ask Univ-Assist…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
