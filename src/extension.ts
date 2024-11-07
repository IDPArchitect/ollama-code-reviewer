import * as vscode from "vscode";
import { registerAllCommands } from "./commands/registerCommands";
import { startHealthCheck, stopHealthCheck } from "./common/healthCheck";

// Status bar item to show Ollama connection status
let statusBarItem: vscode.StatusBarItem;
let healthCheckInterval: NodeJS.Timeout;

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "backstage-party-social-network" is now active!');

  // Initialize status bar
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(sync~spin) Checking Ollama...";
  statusBarItem.tooltip = "Checking Ollama connection status";
  statusBarItem.show();

  // Start health checks
  healthCheckInterval = startHealthCheck();

  // Register all commands
  const commands = registerAllCommands();
  context.subscriptions.push(statusBarItem, ...commands);
}

export function deactivate(): void {
  console.log('Extension "backstage-party-social-network" has been deactivated!');
  if (healthCheckInterval) {
    stopHealthCheck(healthCheckInterval);
  }
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}


