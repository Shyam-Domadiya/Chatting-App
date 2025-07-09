import React, { useEffect, useRef, useState } from "react";
import { ZIM } from "zego-zim-web";
import bg from "./assets/bg.jpg";

const App = () => {
  const [zimInstance, setZimInstance] = useState(null);
  const [userinfo, setUserinfo] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [msg, setMsg] = useState([]);
  const [selectedUser, setSelectedUser] = useState("ABC");
  const [isloggedin, setIsloggedin] = useState(false);

  const tokenA =
    "04AAAAAGhvt6UADDffkKCnL9I4xHzAkgCtQJB6hqjOE5AriCf8ex0/kFN2+evjWNfkf4x4WpG6JTDAs4DhQqG/Dpf2z530ydbBglHny+IKERsr9879jT2vCHv7uN+8JMxXifjWqWJ6sFFiZe22WRZvYcSQU8tU2Yk2v7lZVBjTllTKftrTZ21rqbz56Tf4+EKgnEjOdUQ0nmK/1lIuZxNgXXrTx29eCd+Z8a5x/itUHBltFTW1dljvpRqPWg2mcs2dDTJWURQB";
  const tokenB =
    "04AAAAAGhvt9EADAs7toKuEC1AKuJW+ACtXZGHSA8kMw7bqZPdPbKxGLBYi7Q8Cnv8rCL7Ol6Jmkb+ssP2xZrUyZbymwbbjjXGFSkIjzgR5QGQAZRs9wK/byBviv9V5Uv1IGJYGSN0S0EJ/I1XyeTgN7SMedPA3iGfWrpnw61ZydyOLgs8CoepWoprsnj09mGvTFtUATRAjxwHJyf6zSfTYk7Um1/EBDJs8IEV8KLgLK9oCTmM2byhjgkWnuPjmwWxQiJvyqoB";

  const messageEndRef = useRef(null);

  useEffect(() => {
    const instance = ZIM.create(2053391239);
    setZimInstance(instance);

    instance.on("error", (zim, errorinfo) => {
      console.log("error", errorinfo, errorinfo.message);
    });

    instance.on("connectionStateChanged", (zim, { state, event }) => {
      console.log("connectionStateChanged", state, event);
    });

    instance.on("peerMessageReceived", (zim, { messageList }) => {
      console.log("Received messages:", messageList);
      setMsg((prev) => [...prev, ...messageList]); // Spread messageList correctly
    });

    instance.on("tokenWillExpire", (zim, { second }) => {
      console.log("tokenWillExpire", second);
      const token = selectedUser === "ABC" ? tokenA : tokenB;
      zim
        .renewToken(token)
        .then(() => console.log("token-renewed"))
        .catch((err) => console.log(err));
    });

    return () => {
      instance.destroy();
    };
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msg]);

  const handlelogin = () => {
    const info = {
      userID: selectedUser,
      userName: selectedUser,
    };
    setUserinfo(info);

    const loginToken = selectedUser === "ABC" ? tokenA : tokenB;

    if (zimInstance) {
      zimInstance
        .login(info, loginToken)
        .then(() => {
          setIsloggedin(true);
          console.log("Logged in");
        })
        .catch((err) => {
          console.log("login failed", err);
        });
    }
  };

  const handleSendMessage = () => {
    if (!isloggedin || msgText.trim() === "") return;

    const toConversationID = selectedUser === "ABC" ? "XYZ" : "ABC";
    const conversationType = 0;
    const config = { priority: 1 };

    const messageTextObj = {
      type: 1,
      message: msgText,
      extendedData: "",
    };

    zimInstance
      .sendMessage(messageTextObj, toConversationID, conversationType, config)
      .then(({ message }) => {
        setMsg((prev) => [...prev, message]);
      })
      .catch((err) => {
        console.log(err);
      });

    setMsgText("");
  };

  const formatTime = (timeStamp) => {
    const date = new Date(timeStamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="p-[20px] w-full h-[100vh] flex items-center flex-col"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "100% 100%",
      }}
    >
      <h1 className="text-black font-bold text-[30px]">AI Chatting App</h1>

      {!isloggedin ? (
        <div className="w-[90%] max-w-[600px] h-[400px] p-[20px] background-blur shadow-2xl bg-[#00000020] mt-[30px] rounded-xl flex flex-col items-center justify-center gap-[30px] border-2 border-gray-700">
          <h1 className="text-[30px] font-semibold">Select User</h1>
          <select
            className="px-[50px] rounded-2xl py-[5px] bg-[#787ad3] text-white"
            onChange={(e) => setSelectedUser(e.target.value)}
            value={selectedUser}
          >
            <option value="ABC">ABC</option>
            <option value="XYZ">XYZ</option>
          </select>
          <button
            className="p-[10px] bg-white font-semibold text-[#787ad3] rounded-lg w-[100px]"
            onClick={handlelogin}
          >
            Login
          </button>
        </div>
      ) : (
        <div className="w-[90%] max-w-[600px] p-[20px] background-blur shadow-2xl bg-[#00000020] mt-[30px] rounded-xl flex flex-col border-2 border-gray-700 relative">
          <h2 className="mb-2 font-semibold">
            {userinfo.userName}
            <span className="text-gray-900 ml-2">Chatting With</span>{" "}
            {selectedUser === "ABC" ? "XYZ" : "ABC"}
          </h2>

          <div className="flex flex-col gap-[10px] overflow-auto h-[400px] pb-[100px]">
            {msg.map((ms, i) => {
              if (!ms || !userinfo) return null;
              const isOwnmsg = ms.senderUserID === userinfo.userID;

              return (
                <div
                  key={i}
                  className={`p-2 max-w-[75%] text-sm ${
                    isOwnmsg
                      ? "bg-[#0f1010] self-end rounded-br-0"
                      : "bg-[#1c2124] self-start rounded-bl-0"
                  } text-white rounded-2xl`}
                >
                  <div>{ms.message}</div>
                  <div className="text-[10px] text-right text-gray-300">
                    {ms.timestamp ? formatTime(ms.timestamp) : ""}
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-[10px] w-full px-[10px] py-[10px] absolute bottom-0 left-0 bg-[#1f1f1f]">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-2xl bg-gray-700 outline-none text-white px-[15px] py-[10px] placeholder-white"
              onChange={(e) => setMsgText(e.target.value)}
              value={msgText}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#787ad3] text-white px-4 py-2 rounded-lg font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
