"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_KEY = process.env.CLAUDE_API_KEY; // Make sure your API key is available via environment variable
class ClaudeCommunicator {
    static async processRequest(prompt) {
        try {
            const response = await axios_1.default.post("https://api.anthropic.com/v1/completions", // Placeholder API endpoint for Claude
            {
                model: "claude-v1",
                prompt: prompt,
                max_tokens: 500,
                temperature: 0.7,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
            });
            if (response.data && response.data.completion) {
                return response.data.completion.trim();
            }
            else {
                throw new Error("Unexpected response format from Claude");
            }
        }
        catch (error) {
            console.error("Error in ClaudeCommunicator processRequest:", error);
            throw error;
        }
    }
}
exports.default = ClaudeCommunicator;
