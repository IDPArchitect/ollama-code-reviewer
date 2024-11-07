import axios from "axios";

const API_KEY = process.env.CLAUDE_API_KEY; // Make sure your API key is available via environment variable

class ClaudeCommunicator {
  static async processRequest(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        "https://api.anthropic.com/v1/completions", // Placeholder API endpoint for Claude
        {
          model: "claude-v1",
          prompt: prompt,
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      if (response.data && response.data.completion) {
        return response.data.completion.trim();
      } else {
        throw new Error("Unexpected response format from Claude");
      }
    } catch (error) {
      console.error("Error in ClaudeCommunicator processRequest:", error);
      throw error;
    }
  }
}

export default ClaudeCommunicator;

