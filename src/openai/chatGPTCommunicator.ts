import axios from "axios";

const API_KEY = process.env.OPENAI_API_KEY; // Make sure your API key is available via environment variable

class ChatGPTCommunicator {
  static async processRequest(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/completions",
        {
          model: "text-davinci-003",
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

      if (response.data && response.data.choices) {
        return response.data.choices[0].text.trim();
      } else {
        throw new Error("Unexpected response format from ChatGPT");
      }
    } catch (error) {
      console.error("Error in ChatGPTCommunicator processRequest:", error);
      throw error;
    }
  }
}

export default ChatGPTCommunicator;
