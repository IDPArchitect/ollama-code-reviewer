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
exports.VSCodeDocumentHandler = void 0;
const vscode = __importStar(require("vscode"));
class VSCodeDocumentHandler {
    constructor(editor) {
        this.editor = editor;
    }
    static async getCurrentHandler() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No active editor found');
        }
        return new VSCodeDocumentHandler(editor);
    }
    getText() {
        return this.editor.document.getText();
    }
    getSelection() {
        const selection = this.editor.selection;
        return !selection.isEmpty
            ? this.editor.document.getText(selection)
            : null;
    }
    getFileName() {
        return this.editor.document.fileName;
    }
    getLanguage() {
        return this.editor.document.languageId;
    }
    getDocumentInfo() {
        const selection = this.editor.selection;
        return {
            content: this.getText(),
            fileName: this.getFileName(),
            language: this.getLanguage(),
            selection: !selection.isEmpty ? {
                start: this.editor.document.offsetAt(selection.start),
                end: this.editor.document.offsetAt(selection.end),
                text: this.editor.document.getText(selection)
            } : undefined
        };
    }
    async save() {
        await this.editor.document.save();
    }
}
exports.VSCodeDocumentHandler = VSCodeDocumentHandler;
exports.default = VSCodeDocumentHandler;
