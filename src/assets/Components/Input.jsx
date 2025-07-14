// src/Components/Input.jsx
import React from "react";

function Input({ msgText, setMsgText, handleSendMessage }) {
  return (
    <div className="flex items-center px-4 py-4 gap-3 bg-[#1b1b2f] border-t border-gray-600 relative">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-1 px-5 py-3 bg-[#2b2b3f] text-white rounded-full outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500"
        value={msgText}
        onChange={(e) => setMsgText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
      />
      <button
        onClick={handleSendMessage}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full font-bold transition-all"
      >
        Send
      </button>
    </div>
  );
}

export default Input;
