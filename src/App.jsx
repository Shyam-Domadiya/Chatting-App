import React, { useEffect, useRef, useState } from "react";
import { ZIM } from "zego-zim-web";
import bg from "./assets/bg.jpg";
import NotLogin from "./assets/Components/NotLogin";
import Login from "./assets/Components/Login";

const App = () => {
  const [zimInstance, setZimInstance] = useState(null);
  const [userinfo, setUserinfo] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [msg, setMsg] = useState([]);
  const [selectedUser, setSelectedUser] = useState("ABC");
  const [isloggedin, setIsloggedin] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messageEndRef = useRef(null);

  const tokenA =
    "04AAAAAGhvt6UADDffkKCnL9I4xHzAkgCtQJB6hqjOE5AriCf8ex0/kFN2+evjWNfkf4x4WpG6JTDAs4DhQqG/Dpf2z530ydbBglHny+IKERsr9879jT2vCHv7uN+8JMxXifjWqWJ6sFFiZe22WRZvYcSQU8tU2Yk2v7lZVBjTllTKftrTZ21rqbz56Tf4+EKgnEjOdUQ0nmK/1lIuZxNgXXrTx29eCd+Z8a5x/itUHBltFTW1dljvpRqPWg2mcs2dDTJWURQB";
  const tokenB =
    "04AAAAAGhvt9EADAs7toKuEC1AKuJW+ACtXZGHSA8kMw7bqZPdPbKxGLBYi7Q8Cnv8rCL7Ol6Jmkb+ssP2xZrUyZbymwbbjjXGFSkIjzgR5QGQAZRs9wK/byBviv9V5Uv1IGJYGSN0S0EJ/I1XyeTgN7SMedPA3iGfWrpnw61ZydyOLgs8CoepWoprsnj09mGvTFtUATRAjxwHJyf6zSfTYk7Um1/EBDJs8IEV8KLgLK9oCTmM2byhjgkWnuPjmwWxQiJvyqoB";

  useEffect(() => {
    const instance = ZIM.create(2053391239);
    setZimInstance(instance);

    instance.on("error", (zim, errorinfo) => {
      console.log("ZIM error:", errorinfo.message);
    });

    instance.on("connectionStateChanged", (zim, { state }) => {
      console.log("ZIM connection state changed:", state);
      setIsOnline(state === "CONNECTED");
    });

    instance.on("peerMessageReceived", (zim, { messageList }) => {
      setMsg((prev) => [...prev, ...messageList]);
    });

    instance.on("tokenWillExpire", (zim) => {
      const token = selectedUser === "ABC" ? tokenA : tokenB;
      zim
        .renewToken(token)
        .then(() => console.log("Token renewed"))
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
        })
        .catch((err) => {
          console.log("Login failed", err);
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
        console.log("Send message error:", err);
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
        <NotLogin
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          handlelogin={handlelogin}
        />
      ) : (
        <Login
          msg={msg}
          userinfo={userinfo}
          selectedUser={selectedUser}
          msgText={msgText}
          setMsgText={setMsgText}
          handleSendMessage={handleSendMessage}
          messageEndRef={messageEndRef}
          formatTime={formatTime}
          isOnline={isOnline}
        />
      )}
    </div>
  );
};

export default App;
