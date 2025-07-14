import { useState, useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useAIChat = () => {
  const [aiLoading, setAiLoading] = useState(false);
  const [lastAIRequest, setLastAIRequest] = useState(0);
  const [conversationId] = useState(() => 
    `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const abortController = useRef(null);

  // Check if backend is available
  const [backendAvailable, setBackendAvailable] = useState(true);
  
  // Test backend connection
  const testBackendConnection = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const isAvailable = response.ok;
      setBackendAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      setBackendAvailable(false);
      return false;
    }
  }, []);

  const getAIResponse = useCallback(async (userMessage, retryCount = 0) => {
    try {
      console.log("Getting AI response for:", userMessage);
      
      // Rate limiting - prevent requests more than once every 3 seconds
      const now = Date.now();
      if (now - lastAIRequest < 3000) {
        const waitTime = 3000 - (now - lastAIRequest);
        return {
          error: true,
          message: `⏳ Please wait ${Math.ceil(waitTime/1000)} seconds before sending another message to AI.`
        };
      }
      
      setLastAIRequest(now);
      setAiLoading(true);
      
      // Test backend connection first
      const isBackendAvailable = await testBackendConnection();
      if (!isBackendAvailable) {
        throw new Error("Backend server is not available");
      }

      // Create abort controller for cancellation
      abortController.current = new AbortController();
      
      const response = await fetch(`${API_BASE_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId,
          systemPrompt: "You are a helpful assistant in a chat app. Keep responses concise and friendly."
        }),
        signal: abortController.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);
      
      const aiMessage = {
        type: 1,
        message: data.reply,
        extendedData: "",
        senderUserID: "AI",
        timestamp: Date.now(),
        messageID: Date.now().toString(),
      };
      
      setAiLoading(false);
      return { success: true, message: aiMessage };
      
    } catch (error) {
      console.error("AI response error:", error);
      setAiLoading(false);
      
      if (error.name === 'AbortError') {
        return { error: true, message: "Request cancelled." };
      }
      
      let errorMessage = "Sorry, I'm having trouble connecting to AI.";
      let shouldRetry = false;
      
      if (error.message.includes("Backend server is not available")) {
        errorMessage = "🔧 Backend server is not available. Please:\n1. Make sure the backend server is running\n2. Check if it's running on http://localhost:5000\n3. Restart the backend server";
      } else if (error.message.includes("AUTH_ERROR")) {
        errorMessage = "🔑 AI service authentication failed. Please check the backend API key configuration.";
      } else if (error.message.includes("RATE_LIMIT")) {
        // Rate limit - retry with exponential backoff
        if (retryCount < 3) {
          shouldRetry = true;
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          errorMessage = `⏳ Rate limit hit. Retrying in ${delay/1000} seconds... (${retryCount + 1}/3)`;
          
          setTimeout(() => {
            getAIResponse(userMessage, retryCount + 1);
          }, delay);
        } else {
          errorMessage = "⏳ Rate limit exceeded. Please wait a few minutes and try again.\n\n💡 Tips:\n- Backend has rate limiting enabled\n- Wait 1-2 minutes before trying again";
        }
      } else if (error.message.includes("QUOTA_ERROR")) {
        errorMessage = "💳 OpenAI quota exceeded. Please:\n1. Check your usage at https://platform.openai.com/usage\n2. Add billing info at https://platform.openai.com/settings/billing\n3. Or wait for quota to reset";
      } else if (error.message.includes("SERVICE_ERROR")) {
        errorMessage = "🔧 AI service temporarily unavailable. Please try again in a few minutes.";
      } else if (error.message.includes("Too many AI requests")) {
        errorMessage = "⏳ Too many AI requests. Please wait a minute before trying again.";
      }
      
      if (!shouldRetry) {
        return { error: true, message: errorMessage };
      }
    }
  }, [lastAIRequest, conversationId, testBackendConnection]);

  const cancelAIRequest = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      setAiLoading(false);
    }
  }, []);

  const clearConversation = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/conversation/${conversationId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  }, [conversationId]);

  return {
    aiLoading,
    getAIResponse,
    cancelAIRequest,
    clearConversation,
    aiAvailable: backendAvailable,
    conversationId,
    testBackendConnection
  };
};
