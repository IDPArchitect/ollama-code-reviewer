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
exports.initializeStatusBar = initializeStatusBar;
exports.startHealthCheck = startHealthCheck;
exports.stopHealthCheck = stopHealthCheck;
const vscode = __importStar(require("vscode"));
const healthCheck_1 = require("./healthCheck");
let healthCheckInterval;
// Initialize Status Bar
function initializeStatusBar() {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "Ollama: Checking health...";
    statusBarItem.show();
    return statusBarItem;
}
// Start Health Check
function startHealthCheck() {
    healthCheckInterval = setInterval(async () => {
        try {
            const isHealthy = await (0, healthCheck_1.checkHealth)();
            const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
            if (isHealthy) {
                statusBarItem.text = "Ollama: Healthy";
                statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
            }
            else {
                statusBarItem.text = "Ollama: Unhealthy";
                statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            }
            statusBarItem.show();
        }
        catch (error) {
            console.error("Error during health check:", error);
        }
    }, 10000); // Every 10 seconds
    return healthCheckInterval;
}
// Stop Health Check
function stopHealthCheck(interval) {
    clearInterval(interval);
}
