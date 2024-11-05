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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ollama_1 = require("@langchain/ollama");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const childProcess = __importStar(require("child_process"));
function activate(context) {
    console.log('Extension "backstage-party-social-network" is now active!');
    // Register the command for code review with Ollama
    const codeReviewCommand = vscode.commands.registerCommand("backstage-party-social-network.codeReviewWithOllama", (uri) => {
        console.log("Code Review with Ollama command triggered");
        console.log(`Selected file URI: ${uri.fsPath}`);
        // Open the document from the selected URI and perform analysis
        vscode.workspace.openTextDocument(uri).then((document) => {
            const gitDiff = getGitDiffForFile(uri.fsPath);
            const codeToAnalyze = gitDiff
                ? `### Code Changes:\n${gitDiff}\n\n`
                : document.getText();
            const prompt = `Act as an expert software engineer and do a code review, security code review, best practices review, architecture review, and organization review of the following code:\n\n${codeToAnalyze}`;
            getFeedbackFromOllama(prompt, document.fileName);
        });
    });
    context.subscriptions.push(codeReviewCommand);
    // Add context menu support for the command
    const contextMenuCommand = vscode.commands.registerCommand("backstage-party-social-network.codeReviewContextMenu", (uri) => {
        console.log("Context menu command triggered");
        console.log(`Context menu selected file URI: ${uri.fsPath}`);
        vscode.commands.executeCommand("backstage-party-social-network.codeReviewWithOllama", uri);
    });
    // Register the command for git diff analysis
    const gitDiffCommand = vscode.commands.registerCommand("backstage-party-social-network.gitDiffAnalysis", async (uri) => {
        try {
            console.log("=== Git Diff Analysis Started ===");
            console.log(`Command triggered for file: ${uri.fsPath}`);
            const document = await vscode.workspace.openTextDocument(uri);
            console.log("Document opened successfully");
            const gitDiff = getGitDiffForFile(uri.fsPath);
            console.log("Git diff result:", gitDiff ? "Changes found" : "No changes found");
            console.log("Raw git diff:", gitDiff);
            if (gitDiff) {
                console.log("Preparing to send git diff to Ollama");
                const prompt = `Act as an expert software engineer and analyze the following git diff, focusing on the changes made and their potential impact:\n\n### Git Diff:\n${gitDiff}`;
                await getFeedbackFromOllama(prompt, document.fileName);
                console.log("Feedback request sent to Ollama");
            }
            else {
                console.log("No git changes detected, showing message to user");
                vscode.window.showInformationMessage("No git changes detected for this file.");
            }
        }
        catch (error) {
            console.error("Error in git diff analysis:", error);
            vscode.window.showErrorMessage(`Error analyzing git diff: ${error}`);
        }
    });
    context.subscriptions.push(contextMenuCommand, gitDiffCommand);
    // Register right-click context menu for all file types
    vscode.commands.executeCommand('setContext', 'backstage-party-social-network.isSupportedFileType', true);
    // Register an event listener for when a text document is saved
    vscode.workspace.onDidSaveTextDocument((document) => {
        console.log(`Document saved: ${document.fileName}`);
        vscode.window.showInformationMessage(`Document saved: ${document.fileName}`);
        // Process the document content for Ollama analysis
        processDocument(document);
    });
}
function getGitDiffForFile(filePath) {
    try {
        console.log(`Running git diff for file: ${filePath}`);
        // Check if the workspace is a Git repository
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            console.warn("No workspace folder is open.");
            return null;
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;
        console.log(`Using workspace path: ${workspacePath}`);
        // Get both staged and unstaged changes
        let combinedDiff = "";
        // Check for unstaged changes
        try {
            console.log("Checking for unstaged changes...");
            const unstagedDiff = childProcess.execSync(`git diff -- "${filePath}"`, { cwd: workspacePath, encoding: "utf8" }).trim();
            if (unstagedDiff) {
                console.log("Found unstaged changes");
                combinedDiff += "Unstaged Changes:\n" + unstagedDiff + "\n\n";
            }
            else {
                console.log("No unstaged changes found");
            }
        }
        catch (error) {
            console.log("Error checking unstaged changes:", error);
        }
        // Check for staged changes
        try {
            console.log("Checking for staged changes...");
            const stagedDiff = childProcess.execSync(`git diff --cached -- "${filePath}"`, { cwd: workspacePath, encoding: "utf8" }).trim();
            if (stagedDiff) {
                console.log("Found staged changes");
                combinedDiff += "Staged Changes:\n" + stagedDiff;
            }
            else {
                console.log("No staged changes found");
            }
        }
        catch (error) {
            console.log("Error checking staged changes:", error);
        }
        const finalDiff = combinedDiff.trim();
        console.log("Final diff length:", finalDiff.length);
        return finalDiff || null;
    }
    catch (error) {
        console.error("Error executing git diff:", error);
        return null;
    }
}
async function getFeedbackFromOllama(codeSnippet, originalFilePath) {
    try {
        console.log("Requesting feedback from Ollama");
        const model = new ollama_1.ChatOllama({
            model: "llama3.2",
        });
        const response = await model.invoke(["human", codeSnippet]);
        const feedback = typeof response.content === "string"
            ? response.content
            : "No meaningful feedback received from Ollama.";
        console.log("Complete Ollama API Response:", feedback);
        saveFeedbackToMarkdown(feedback, originalFilePath);
    }
    catch (error) {
        console.error("Error fetching response from Ollama:", error);
        if (typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string" &&
            error.message.includes("fetch failed")) {
            console.log("Fetch failed, re-queuing the document for later processing.");
            const document = await vscode.workspace.openTextDocument(originalFilePath);
            setTimeout(() => {
                processDocument(document);
            }, 1000);
        }
        else {
            vscode.window.showErrorMessage("Unable to get feedback from Ollama.");
        }
    }
}
function saveFeedbackToMarkdown(rawOutput, originalFilePath) {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage("No workspace folder is open.");
            return;
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;
        const feedbackDir = path.join(workspacePath, "ollama_feedback");
        // Create directory if it doesn't exist
        if (!fs.existsSync(feedbackDir)) {
            fs.mkdirSync(feedbackDir);
        }
        // Define the file path for the feedback Markdown file
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const originalFileName = path.basename(originalFilePath, path.extname(originalFilePath));
        const feedbackFilePath = path.join(feedbackDir, `${originalFileName}-OllamaFeedback-${timestamp}.md`);
        // Write the feedback content to the Markdown file
        const content = `# Ollama AI Feedback

**Original File**: ${originalFilePath}

**Feedback Generated on**: ${new Date().toLocaleString()}

## Raw Output

${rawOutput}`;
        fs.writeFileSync(feedbackFilePath, content, "utf8");
        vscode.window.showInformationMessage(`Feedback saved to ${feedbackFilePath}`);
        // Open the feedback file in Markdown preview
        vscode.commands.executeCommand("markdown.showPreview", vscode.Uri.file(feedbackFilePath));
    }
    catch (error) {
        console.error("Error saving feedback to Markdown:", error);
        vscode.window.showErrorMessage("Failed to save feedback to Markdown.");
    }
}
function processDocument(document) {
    console.log(`Processing document: ${document.fileName}`);
    const code = document.getText();
    getFeedbackFromOllama(code, document.fileName);
}
function deactivate() {
    console.log('Extension "backstage-party-social-network" has been deactivated!');
}
