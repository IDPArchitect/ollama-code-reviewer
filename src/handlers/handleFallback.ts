import ChatGPTCommunicator from "../openai/chatGPTCommunicator";
import ClaudeCommunicator from "../claude/claudeCommunicator";

export async function handleFallback(prompt: string): Promise<string> {
  try {
    console.log("Attempting fallback using ChatGPTCommunicator...");
    const chatGPTResponse = await ChatGPTCommunicator.processRequest(prompt);
    if (chatGPTResponse) {
      return chatGPTResponse;
    }
  } catch (error) {
    console.error("ChatGPT fallback failed:", error);
  }

  try {
    console.log("Attempting fallback using ClaudeCommunicator...");
    const claudeResponse = await ClaudeCommunicator.processRequest(prompt);
    if (claudeResponse) {
      return claudeResponse;
    }
  } catch (error) {
    console.error("Claude fallback failed:", error);
  }

  throw new Error("All fallback attempts failed. Please check your network and try again.");
}

