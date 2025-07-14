// src/Components/NotLogin.jsx
import React from "react";

function NotLogin({ selectedUser, setSelectedUser, handlelogin }) {
  return (
    <div className="w-full flex justify-center items-center px-3 mt-24">
      <div className="w-full max-w-[480px] p-10 rounded-3xl bg-gradient-to-br from-[#2c2c38] via-[#1f1f2e] to-[#16161e] border border-white/20 shadow-lg backdrop-blur-lg text-white flex flex-col items-center gap-8">
        <h1 className="text-3xl font-extrabold text-indigo-400">
          Welcome to <span className="text-white">AI Chat App</span>
        </h1>

        <select
          className="w-full px-6 py-3 bg-[#2e2e3e] text-white rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
          onChange={(e) => setSelectedUser(e.target.value)}
          value={selectedUser}
        >
          <option value="ABC">Login as ABC</option>
          <option value="XYZ">Login as XYZ</option>
        </select>

        <button
          className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full font-semibold transition-all hover:scale-105 shadow-lg"
          onClick={handlelogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default NotLogin;
