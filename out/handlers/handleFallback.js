"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFallback = handleFallback;
const chatGPTCommunicator_1 = __importDefault(require("../openai/chatGPTCommunicator"));
const claudeCommunicator_1 = __importDefault(require("../claude/claudeCommunicator"));
async function handleFallback(prompt) {
    try {
        console.log("Attempting fallback using ChatGPTCommunicator...");
        const chatGPTResponse = await chatGPTCommunicator_1.default.processRequest(prompt);
        if (chatGPTResponse) {
            return chatGPTResponse;
        }
    }
    catch (error) {
        console.error("ChatGPT fallback failed:", error);
    }
    try {
        console.log("Attempting fallback using ClaudeCommunicator...");
        const claudeResponse = await claudeCommunicator_1.default.processRequest(prompt);
        if (claudeResponse) {
            return claudeResponse;
        }
    }
    catch (error) {
        console.error("Claude fallback failed:", error);
    }
    throw new Error("All fallback attempts failed. Please check your network and try again.");
}
