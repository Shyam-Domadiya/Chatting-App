// src/Components/AIChatPopup.jsx
import React, { useState } from "react";

const AIChatPopup = ({ onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAwOWBIOiwFsTqrU_4zyctRQuwFeOJmDQA",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await res.json();
      setReply(data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response");
    } catch (err) {
      setReply("❌ Error fetching response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
      <div className="bg-[#1b1b2f] text-white p-6 rounded-2xl w-full max-w-md relative shadow-xl">
        <button onClick={onClose} className="absolute top-3 right-4 text-xl">✖</button>
        <h2 className="text-xl font-bold mb-4">🤖 Chat with Gemini</h2>
        <textarea
          rows="4"
          className="w-full p-3 rounded-lg text-black"
          placeholder="Ask something..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        ></textarea>
        <button
          onClick={handleSend}
          disabled={loading}
          className="mt-3 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
        >
          {loading ? "Thinking..." : "Send"}
        </button>

        {reply && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm">
            <strong>Gemini:</strong> {reply}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatPopup;
