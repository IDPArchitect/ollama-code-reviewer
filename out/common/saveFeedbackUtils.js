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
exports.saveFeedbackToMarkdown = saveFeedbackToMarkdown;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function saveFeedbackToMarkdown(rawOutput, originalFilePath) {
    return new Promise((resolve, reject) => {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error("No workspace folder is open.");
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const feedbackDir = path.join(workspacePath, "ollama_feedback");
            if (!fs.existsSync(feedbackDir)) {
                fs.mkdirSync(feedbackDir);
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const originalFileName = path.basename(originalFilePath, path.extname(originalFilePath));
            const feedbackFilePath = path.join(feedbackDir, `${originalFileName}-OllamaFeedback-${timestamp}.md`);
            const content = `# Ollama AI Feedback\n\n**Original File**: ${originalFilePath}\n\n**Feedback Generated on**: ${new Date().toLocaleString()}\n\n## Feedback\n\n${rawOutput}`;
            fs.writeFileSync(feedbackFilePath, content, "utf8");
            console.log(`Feedback saved to: ${feedbackFilePath}`);
            // Optionally, open the markdown file in the editor after saving
            vscode.workspace.openTextDocument(vscode.Uri.file(feedbackFilePath)).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
            resolve();
        }
        catch (error) {
            console.error("Error saving feedback to markdown:", error);
            reject(error);
        }
    });
}
