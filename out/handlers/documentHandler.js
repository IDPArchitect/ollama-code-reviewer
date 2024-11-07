"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDocumentSave = onDocumentSave;
const ollamaCommunicator_1 = __importDefault(require("../ollama/ollamaCommunicator"));
const handleFallback_1 = __importDefault(require("./handleFallback"));
async function onDocumentSave(document) {
    console.log(`Processing document: ${document.fileName}`);
    try {
        await ollamaCommunicator_1.default.processRequest(`Act as an expert software engineer and analyze this code that was just saved. Provide a brief review of any potential issues, improvements, or notable patterns:\n\n${document.getText()}`, "Auto-Save Analysis", document.fileName);
    }
    catch (error) {
        console.error("Error processing saved document:", error);
        (0, handleFallback_1.default)(`Act as an expert software engineer and analyze this code that was just saved. Provide a brief review of any potential issues, improvements, or notable patterns:\n\n${document.getText()}`).then((response) => {
            console.log("Fallback response:", response);
        }).catch((fallbackError) => {
            console.error("Error in fallback processing:", fallbackError);
        });
    }
}
