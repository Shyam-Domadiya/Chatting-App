import React from "react";
import Input from "./Input";

function Login({
  msg,
  userinfo,
  selectedUser,
  msgText,
  setMsgText,
  handleSendMessage,
  messageEndRef,
  formatTime,
}) {
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="w-full flex justify-center items-center mt-6 px-3">
      <div className="w-full max-w-[700px] h-[85vh] rounded-3xl shadow-xl border border-white/10 bg-gradient-to-b from-[#1b1b2f] to-[#151521] backdrop-blur-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#2d2d44] text-white font-bold text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src={`https://ui-avatars.com/api/?name=${selectedUser === "ABC" ? "XYZ" : "ABC"}`}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div>{selectedUser === "ABC" ? "XYZ" : "ABC"}</div>
            </div>
          </div>
          <div className="text-sm text-gray-300">{getCurrentTime()}</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-[#0f0f1a]">
          {msg.map((ms, i) => {
            if (!ms || !userinfo) return null;
            const isOwn = ms.senderUserID === userinfo.userID;

            return (
              <div
                key={i}
                className={`max-w-[80%] px-5 py-3 rounded-[18px] text-sm shadow-md flex flex-col ${
                  isOwn
                    ? "ml-auto bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-br-none"
                    : "mr-auto bg-gray-700 text-white rounded-bl-none"
                }`}
              >
                <div className="flex justify-between gap-2 items-end">
                  <span>{ms.message}</span>
                  <span className="text-[10px] text-gray-300">
                    {ms.timestamp ? formatTime(ms.timestamp) : ""}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        {/* Input */}
        <Input
          msgText={msgText}
          setMsgText={setMsgText}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default Login;
