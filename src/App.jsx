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
    "04AAAAAGh2Qp4ADNiEAwpuarNRW/33hACuKzqBMb5ndu7DYLV7xEb52SoheYv69oInmfNDA+SsF6qTWRQHUGitFwhc/EZZXhtq59lD2K9TMx+cdxhJRPKX/pJOjTkUiyANne2Us/WS27JfgKD4tx+yaU8YXd/0O6uMzso3lqEfquGO3TbjgN8NW0X8ezvCgOlGtJ4Fqd/yyPVApOpmUrg41oO/W88eHxF5DLtjRCD04rknFTRbcrCNPZBQb2GIVMCoJpLichcvAQ==";

  const tokenB =
    "04AAAAAGh2QrYADAokNT2c989VuEYmtQCuGP2AbgjZtB27V+O8y5tPh0PdcCd9nZr/RyirQyXJBozNPfbTupKMAFPyP5dk7x5BIAOEuqfwfEZNRdfpEFWNqBmhevHpkfm8MHPq3XoEHoFeF3Vxx6wEwrtYyiSwfdCThnlCYYvOhS48PRSKgJ77ek7zWF8rFGtUoExaqFiHAb7/WeBJKy6s4K1cWQBBimJ85gcQiz+IAV69XMKisK+QKTBTCwS7l6DjAII8x/AYAQ==";

  useEffect(() => {
    const instance = ZIM.create(2053391239);
    setZimInstance(instance);

    instance.on("error", (zim, errorinfo) => {
      console.log("ZIM error:", errorinfo.message);
    });

    instance.on("connectionStateChanged", (zim, { state }) => {
      console.log("Connection state:", state);
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
          console.log("Login failed:", err);
        });
    }
  };

  const handleSendMessage = () => {
    if (!isloggedin || msgText.trim() === "") return;

    const toUser = selectedUser === "ABC" ? "XYZ" : "ABC";
    const messageTextObj = {
      type: 1,
      message: msgText,
      extendedData: "",
    };

    zimInstance
      .sendMessage(messageTextObj, toUser, 0, { priority: 1 })
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