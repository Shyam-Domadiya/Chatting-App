import { useState, useEffect, useCallback } from 'react';
import { ZIM } from 'zego-zim-web';

// Token configuration
const TOKEN_CONFIG = {
  ABC: "04AAAAAGh2Ni0ADKhV79cG5fgWTjxCewCt5xbMekELGZuuX6lhAQAknaVrJum1cvQ44zYC6/9xB6L1xPH4hn34Js+zfSIox2RNJBEYjrOtYsYSO1SReESMyE6io8+orTpXHxF1wmGDc3SYfYDl6Toghzf/UCwKaq4GEN9pvkEcm2HMDUetnMsLlG9N3Eu+4djnqn+O2/MtU+qK1m/utSnWP0l+UNPZjm4ZqQHe+mIl7DiIdJnaBgeTaZeDV0cRnenzCSfj6fkB",
  XYZ: "04AAAAAGh2Nk4ADIPfdS1eVY5Wmid5jACtZDnTM2xSFXgE8tIDxiC3w8fe7S/dNIPyw2h5Wedca1qAJt6cKBjOK9tGNkMLwHAApPBoc1VnLJOTKmLu1v0IXUilbacaC3rryed5xxD2ysWQ47Y8bXgw/vFNj7Hy1MoK8JrK9N3Bx0DgTo9BKwtAqxQzwueNLIJBBfMDUp1S3Ed+5KCVBXqA6app55IOC0nsTTomdm4Ghfs3WAfJMPFwvG/N+MNRQvbiCdHBSGMB"
};

export const useZegoChat = (selectedUser) => {
  const [zimInstance, setZimInstance] = useState(null);
  const [isloggedin, setIsloggedin] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState(null); // eslint-disable-line no-unused-vars
  const [renewalAttempts, setRenewalAttempts] = useState(0); // eslint-disable-line no-unused-vars
  const [msg, setMsg] = useState([]);

  const getTokenForUser = useCallback((userId) => {
    return TOKEN_CONFIG[userId] || TOKEN_CONFIG.ABC;
  }, []);

  const handleTokenRenewal = useCallback(async (zim) => {
    try {
      const currentToken = getTokenForUser(selectedUser);
      console.log(`Attempting to renew token for user: ${selectedUser}`);
      
      setRenewalAttempts(prev => prev + 1);
      
      await zim.renewToken(currentToken);
      
      console.log("Token renewed successfully");
      setTokenExpiry(Date.now() + 24 * 60 * 60 * 1000); // Set expiry to 24 hours from now
      setRenewalAttempts(0);
      
    } catch (error) {
      console.error("Token renewal failed:", error);
      
      // Retry logic - check current attempts from state
      setRenewalAttempts(prev => {
        if (prev < 3) {
          console.log(`Retrying token renewal... Attempt ${prev + 1}`);
          setTimeout(() => handleTokenRenewal(zim), 5000); // Retry after 5 seconds
          return prev + 1;
        } else {
          console.error("Max token renewal attempts reached. User may need to re-login.");
          // Optionally logout user or show error message
          setIsloggedin(false);
          return 0;
        }
      });
    }
  }, [selectedUser, getTokenForUser]);

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
      handleTokenRenewal(zim);
    });

    return () => {
      instance.destroy();
    };
  }, [selectedUser, handleTokenRenewal]);

  const handlelogin = useCallback(() => {
    const info = {
      userID: selectedUser,
      userName: selectedUser,
    };

    const loginToken = getTokenForUser(selectedUser);
    console.log(`Logging in user: ${selectedUser}`);

    if (zimInstance) {
      zimInstance
        .login(info, loginToken)
        .then(() => {
          setIsloggedin(true);
          setTokenExpiry(Date.now() + 24 * 60 * 60 * 1000); // Set initial expiry
          setRenewalAttempts(0);
          console.log("Login successful");
        })
        .catch((err) => {
          console.log("Login failed", err);
        });
    }
  }, [selectedUser, zimInstance, getTokenForUser]);

  const sendMessage = useCallback((messageText) => {
    if (!isloggedin || messageText.trim() === "") return Promise.reject("Not logged in or empty message");

    const toConversationID = selectedUser === "ABC" ? "XYZ" : "ABC";
    const conversationType = 0;
    const config = { priority: 1 };

    const messageTextObj = {
      type: 1,
      message: messageText,
      extendedData: "",
    };

    return zimInstance
      .sendMessage(messageTextObj, toConversationID, conversationType, config)
      .then(({ message }) => {
        setMsg((prev) => [...prev, message]);
        return message;
      })
      .catch((err) => {
        console.log("Send message error:", err);
        throw err;
      });
  }, [selectedUser, zimInstance, isloggedin]);

  const addMessage = useCallback((message) => {
    setMsg((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMsg([]);
  }, []);

  return {
    zimInstance,
    isloggedin,
    isOnline,
    msg,
    handlelogin,
    sendMessage,
    addMessage,
    clearMessages,
    setMsg
  };
};
