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
exports.registerAllCommands = registerAllCommands;
const vscode = __importStar(require("vscode"));
const ollamaCommunicator_1 = require("../ollama/ollamaCommunicator");
const healthCheck_1 = require("../common/healthCheck");
const handleFallback_1 = require("../handlers/handleFallback");
function registerAllCommands() {
    const commands = [
        registerCommand("bestPracticesReview", "Act as an expert software engineer and perform a comprehensive best practices review of the following code."),
        registerCommand("securityReview", "Act as an expert security engineer and perform a comprehensive security analysis of the following code."),
        registerCommand("architecturalReview", "Act as an expert software architect and perform a comprehensive architectural analysis of the following code."),
        registerCommand("organizationReview", "Act as an expert software engineer and perform a comprehensive analysis of the code organization and structure."),
        registerCommand("fixCodeWithOllama", "Act as an expert software engineer. Analyze the following code, identify any issues or potential improvements."),
        vscode.commands.registerCommand("backstage-party-social-network.checkHealth", checkHealthCommand),
        vscode.commands.registerCommand("backstage-party-social-network.codeReviewWithOllama", async () => {
            console.log("Executing Code Review with Ollama");
        }),
        vscode.commands.registerCommand("backstage-party-social-network.gitDiffAnalysis", async () => {
            console.log("Executing Git Diff Analysis with Ollama");
        }),
        vscode.commands.registerCommand("backstage-party-social-network.explainCodeWithOllama", async () => {
            console.log("Executing Explain Code with Ollama");
        })
    ];
    return commands;
}
function registerCommand(command, prompt) {
    return vscode.commands.registerCommand(`backstage-party-social-network.${command}`, async () => {
        try {
            console.log(`Executing command: ${command}`);
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage("No active editor found");
                console.warn("No active editor found. Aborting command.");
                return;
            }
            // Determine the code to analyze
            const codeToAnalyze = editor.selection.isEmpty
                ? editor.document.getText()
                : editor.document.getText(editor.selection);
            if (!codeToAnalyze.trim()) {
                vscode.window.showWarningMessage("No code selected or empty document.");
                console.warn("No code selected or document is empty. Aborting command.");
                return;
            }
            // Log that we have valid code to analyze
            console.log("Valid code to analyze:", codeToAnalyze);
            // Process the Ollama request
            console.log("Sending code to Ollama for analysis...");
            await (0, ollamaCommunicator_1.processOllamaRequest)(`${prompt}\n\n${codeToAnalyze}`, command, editor.document.fileName);
            console.log("Ollama request complete.");
        }
        catch (error) {
            console.error(`Error during command execution (${command}):`, error);
            vscode.window.showErrorMessage(`Error in ${command}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            try {
                // If the main processing fails, handle fallback
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showWarningMessage("No active editor found for fallback");
                    console.warn("No active editor found for fallback. Aborting fallback.");
                    return;
                }
                const codeToAnalyze = editor.selection.isEmpty
                    ? editor.document.getText()
                    : editor.document.getText(editor.selection);
                if (codeToAnalyze.trim()) {
                    console.log("Executing fallback process...");
                    const fallbackResponse = await (0, handleFallback_1.handleFallback)(`${prompt}\n\n${codeToAnalyze}`);
                    console.log("Fallback response received:", fallbackResponse);
                    vscode.window.showInformationMessage("Fallback response: " + fallbackResponse);
                }
                else {
                    vscode.window.showWarningMessage("No code selected or empty document during fallback");
                    console.warn("No code selected or document is empty during fallback. Aborting fallback.");
                }
            }
            catch (fallbackError) {
                console.error("Error in fallback handling:", fallbackError);
                vscode.window.showErrorMessage("All attempts to analyze the code failed. Please check your connection and try again.");
            }
        }
    });
}
async function checkHealthCommand() {
    try {
        console.log("Executing health check command...");
        const isHealthy = await (0, healthCheck_1.checkHealth)();
        if (isHealthy) {
            vscode.window.showInformationMessage("All services are running and responsive");
        }
        else {
            vscode.window.showErrorMessage("One or more services are not responding.");
        }
    }
    catch (error) {
        console.error("Error in health check command:", error);
        vscode.window.showErrorMessage("Error checking service health. Please try again.");
    }
}
