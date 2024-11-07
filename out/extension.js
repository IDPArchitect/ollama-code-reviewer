"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) { k2 = k; }
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) { k2 = k; }
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) { return mod; }
    var result = {};
    if (mod !== null) {
        for (var k in mod) {
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) {
                __createBinding(result, mod, k);
            }
        }
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const registerCommands_1 = require("./commands/registerCommands");
const healthCheck_1 = require("./common/healthCheck");
// Status bar item to show Ollama connection status
let statusBarItem;
let healthCheckInterval;
function activate(context) {
    console.log('Extension "backstage-party-social-network" is now active!');
    // Initialize status bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(sync~spin) Checking Ollama...";
    statusBarItem.tooltip = "Checking Ollama connection status";
    statusBarItem.show();
    // Start health checks
    healthCheckInterval = (0, healthCheck_1.startHealthCheck)();
    // Register all commands
    const commands = (0, registerCommands_1.registerAllCommands)();
    context.subscriptions.push(statusBarItem, ...commands);
}
function deactivate() {
    console.log('Extension "backstage-party-social-network" has been deactivated!');
    if (healthCheckInterval) {
        (0, healthCheck_1.stopHealthCheck)(healthCheckInterval);
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
