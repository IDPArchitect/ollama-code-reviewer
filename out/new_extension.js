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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ollamaCommunicator_1 = __importDefault(require("./ollama/ollamaCommunicator"));
const healthCheckManager_1 = require("./common/healthCheckManager");
// Flags to enable or disable specific services
const ENABLE_OPENAI = 'true';
const ENABLE_ANTHROPIC = 'false';
// Status bar item to show Ollama connection status
let statusBarItem;
let healthCheckInterval;
// Main activation function
function activate(context) {
    console.log('Extension "backstage-party-social-network" is now active!');
    // Initialize status bar
    statusBarItem = healthCheckManager_1.StatusBarManager.initialize();
    // Start health checks
    healthCheckInterval = healthCheckManager_1.StatusBarManager.startHealthCheck(healthCheckManager_1.checkHealth);
    // Register all commands
    const commands = [
        registerCommand("bestPracticesReview", `Act as an expert software engineer and perform a comprehensive best practices review of the following code. Focus on:
      1. Code style and conventions
      2. Design patterns usage
      3. Performance best practices
      4. Error handling
      5. Documentation standards
      6. Testing considerations
      7. Maintainability aspects
      Analyze the code and provide specific recommendations for each category where applicable:`),
        registerCommand("securityReview", `Act as an expert security engineer and perform a comprehensive security analysis of the following code. Focus on:
      1. Potential security vulnerabilities
      2. Input validation
      3. Authentication and authorization concerns
      4. Data protection
      5. Secure coding practices
      6. Common security pitfalls
      7. Security best practices specific to the language/framework
      Provide a detailed security analysis with specific findings and recommendations:`),
        registerCommand("architecturalReview", `Act as an expert software architect and perform a comprehensive architectural analysis of the following code. Focus on:
      1. Overall architecture patterns
      2. Component relationships
      3. Dependency management
      4. Scalability considerations
      5. Modularity and cohesion
      6. Interface design
      7. Architectural principles (SOLID, etc.)
      Provide detailed architectural insights and recommendations:`),
        registerCommand("organizationReview", `Act as an expert software engineer and perform a comprehensive analysis of the code organization and structure. Focus on:
      1. File and code organization
      2. Code structure and hierarchy
      3. Naming conventions
      4. Code grouping and separation
      5. Module organization
      6. Project structure best practices
      7. Code readability and maintainability
      Provide detailed insights and recommendations for improving the code organization:`),
        registerCommand("fixCodeWithOllama", `Act as an expert software engineer. Analyze the following code, identify any issues or potential improvements, and provide a corrected version with explanations of the changes made. If the code appears correct, suggest potential optimizations or best practices that could be applied. Format your response in markdown with clear sections for 'Issues Found', 'Suggested Fixes', and 'Improved Code':`),
        vscode.commands.registerCommand("backstage-party-social-network.checkHealth", async () => {
            try {
                const isHealthy = await (0, healthCheckManager_1.checkHealth)();
                if (isHealthy) {
                    vscode.window.showInformationMessage("All services are running and responsive");
                }
            }
            catch (error) {
                console.error("Error in health check command:", error);
                vscode.window.showErrorMessage("Error checking service health. Please try again.");
            }
        })
    ];
    // Register auto-save handler
    const autoSaveHandler = vscode.workspace.onDidSaveTextDocument((document) => {
        console.log(`Document saved: ${document.fileName}`);
        processDocument(document);
    });
    // Add all commands and disposables to subscriptions
    context.subscriptions.push(statusBarItem, autoSaveHandler, ...commands);
}
// Document Processing
async function processDocument(document) {
    console.log(`Processing document: ${document.fileName}`);
    try {
        await ollamaCommunicator_1.default.processRequest(`Act as an expert software engineer and analyze this code that was just saved. Provide a brief review of any potential issues, improvements, or notable patterns:

${document.getText()}`, "Auto-Save Analysis", document.fileName);
    }
    catch (error) {
        console.error("Error processing saved document:", error);
    }
}
function registerCommand(command, prompt) {
    return vscode.commands.registerCommand(`backstage-party-social-network.${command}`, async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage("No active editor found");
                return;
            }
            const selection = editor.selection;
            const codeToAnalyze = !selection.isEmpty
                ? editor.document.getText(selection)
                : editor.document.getText();
            await ollamaCommunicator_1.default.processRequest(prompt + `

${codeToAnalyze}`, command, editor.document.fileName);
        }
        catch (error) {
            console.error(`Error in ${command}:`, error);
            vscode.window.showErrorMessage(`Error in ${command}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
}
// Deactivation function
function deactivate() {
    console.log('Extension "backstage-party-social-network" has been deactivated!');
    healthCheckManager_1.StatusBarManager.stopHealthCheck(healthCheckInterval);
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
