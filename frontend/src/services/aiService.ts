// This file contains the AI service that interacts with the backend
import { Message } from "@/types/chat";

// Example configuration in frontend:
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Update this to use /api/chat
const CHAT_ENDPOINT = `${API_URL}/api/chat`;

/**
 * Service for interacting with the AI backend
 */
// Define a type for personality options
type Personality = {
  name?: string;
  traits?: string[];
  tone?: string;
  [key: string]: unknown;
};

export const aiService = {
  // Cache for backend availability to reduce repeated checks
  _backendAvailableCache: {
    status: null as boolean | null,
    timestamp: 0,
    expiryMs: 30000, // 30 seconds cache validity
  },

  /**
   * Generates a response from the AI
   */
  async generateResponse(
    query: string,
    conversationHistory: Message[] = [],
    options: { personality?: Personality } = {}
  ): Promise<string> {
    try {
      // Check if backend is available
      const isAvailable = await this.isBackendAvailable();
      if (!isAvailable) {
        throw new Error("Backend service is currently unavailable");
      }

      // Use the backend for response generation
      return await this.getResponseFromBackend(query, conversationHistory, options);
    } catch (error) {
      console.error("Error generating response:", error);
      return "I'm sorry, I'm having trouble connecting to the ALU knowledge base right now. Please try again later.";
    }
  },

  /**
   * Checks if the backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    // Use cache if valid
    const now = Date.now();
    if (
      this._backendAvailableCache.status !== null &&
      now - this._backendAvailableCache.timestamp < this._backendAvailableCache.expiryMs
    ) {
      return this._backendAvailableCache.status;
    }

    try {
      const response = await fetch(`${API_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });

      const isAvailable = response.ok;
      
      // Update cache
      this._backendAvailableCache.status = isAvailable;
      this._backendAvailableCache.timestamp = now;
      
      return isAvailable;
    } catch (error) {
      console.error("Backend health check failed:", error);
      
      // Update cache
      this._backendAvailableCache.status = false;
      this._backendAvailableCache.timestamp = now;
      
      return false;
    }
  },
      
  /**
   * Gets a response from the backend
   */
  async getResponseFromBackend(
    query: string,
    conversationHistory: Message[],
    options: { personality?: Personality } = {}
  ): Promise<string> {
    try {
      // Convert the conversation history to the format expected by the backend
      const history = conversationHistory.map((message) => ({
        role: message.isAi ? "assistant" : "user",
        content: message.text,
      }));

      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          history,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend response error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "No response from backend";
    } catch (error) {
      console.error("Error getting response from backend:", error);
      throw new Error("Failed to get response from backend");
    }
  },

  /**
   * Gets the backend status information
   */
  async getBackendStatus(): Promise<{ status: string; message: string }> {
    const isAvailable = await this.isBackendAvailable();
    
    return {
      status: isAvailable ? 'online' : 'offline',
      message: isAvailable ? 'Knowledge base connected' : 'Knowledge base unavailable'
    };
  },

  /**
   * Gets the status of the Nyptho system
   */
  async getNypthoStatus(): Promise<{
    ready: boolean;
    learning: {
      observation_count: number;
      learning_rate: number;
    };
  }> {
    try {
      const response = await fetch(`${API_URL}/nyptho/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(2000),
      });

      if (!response.ok) {
        return { ready: false, learning: { observation_count: 0, learning_rate: 0 } };
      }

      const data = await response.json();
      return {
        ready: data.ready || false,
        learning: data.learning || { observation_count: 0, learning_rate: 0 }
      };
    } catch (error) {
      console.error("Error getting Nyptho status:", error);
      return { ready: false, learning: { observation_count: 0, learning_rate: 0 } };
    }
  }
};
