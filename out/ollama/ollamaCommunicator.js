"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicateWithOllama = communicateWithOllama;
exports.processOllamaRequest = processOllamaRequest;
const vscode = __importStar(require("vscode"));
const healthCheck_1 = require("../common/healthCheck");
const saveFeedbackUtils_1 = require("../common/saveFeedbackUtils");
const ollama_1 = require("@langchain/ollama");
async function communicateWithOllama(prompt, timeoutMs = 600000) {
    try {
        console.log("Sending request to Ollama");
        // Initialize the ChatOllama client
        const chatOllama = new ollama_1.ChatOllama({
            baseUrl: "http://localhost:11434", // Adjust this URL if your Ollama server runs elsewhere
            model: "llama3.2", // Specify the model you are using
        });
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
            reject(new Error(`Ollama request timed out after ${timeoutMs / 1000} seconds`));
        }, timeoutMs));
        // Create the Ollama invoke promise
        const ollamaInvokePromise = chatOllama.invoke([
            { role: "user", content: prompt }
        ]);
        // Race between the Ollama invoke and the timeout
        const response = await Promise.race([ollamaInvokePromise, timeoutPromise]);
        console.log("Received complete response from Ollama");
        // Assuming response is in text format
        if (typeof response === "object" && response?.content) {
            return Array.isArray(response.content) ? response.content.join(' ') : response.content.toString();
        }
        else {
            return "No meaningful response received from Ollama.";
        }
    }
    catch (error) {
        console.error("Error in Ollama communication:", error);
        throw new Error(`Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function processOllamaRequest(prompt, reviewType, fileName) {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Processing ${reviewType}`,
        cancellable: true,
    }, async (progress, token) => {
        try {
            progress.report({ increment: 0, message: "Checking Ollama status..." });
            const isHealthy = await (0, healthCheck_1.checkHealth)();
            if (!isHealthy) {
                throw new Error('Ollama is not available');
            }
            progress.report({ increment: 20, message: "Analyzing code..." });
            const response = await communicateWithOllama(prompt);
            if (token.isCancellationRequested) {
                return;
            }
            progress.report({ increment: 40, message: "Processing results..." });
            // If the response has no meaningful content, set default message
            const feedback = response || "No meaningful feedback received from Ollama.";
            // Create and show the feedback document
            const document = await vscode.workspace.openTextDocument({
                content: `# ${reviewType} Results\n\n${feedback}`,
                language: 'markdown',
            });
            await vscode.window.showTextDocument(document, {
                viewColumn: vscode.ViewColumn.Beside,
                preserveFocus: true,
            });
            // Save the feedback to markdown
            await (0, saveFeedbackUtils_1.saveFeedbackToMarkdown)(feedback, fileName);
            vscode.window.showInformationMessage(`${reviewType} complete!`);
        }
        catch (error) {
            console.error(`Error in ${reviewType}:`, error);
            vscode.window.showErrorMessage(`Error in ${reviewType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
}
exports.default = processOllamaRequest;