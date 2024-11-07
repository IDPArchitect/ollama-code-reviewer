import * as vscode from "vscode";
import { processOllamaRequest, communicateWithOllama } from "../ollama/ollamaCommunicator";
import { checkHealth } from "../common/healthCheck";
import { handleFallback } from "../handlers/handleFallback";
import * as childProcess from "child_process";

export function registerAllCommands(): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [
    registerCommand("bestPracticesReview", "Act as an expert software engineer and perform a comprehensive best practices review of the following code."),
    registerCommand("securityReview", "Act as an expert security engineer and perform a comprehensive security analysis of the following code."),
    registerCommand("architecturalReview", "Act as an expert software architect and perform a comprehensive architectural analysis of the following code."),
    registerCommand("organizationReview", "Act as an expert software engineer and perform a comprehensive analysis of the code organization and structure."),
    registerCommand("fixCodeWithOllama", "Act as an expert software engineer. Analyze the following code, identify any issues or potential improvements."),
    vscode.commands.registerCommand("backstage-party-social-network.checkHealth", checkHealthCommand),
    vscode.commands.registerCommand("backstage-party-social-network.codeReviewWithOllama", async () => {
      console.log("Executing Code Review with Ollama");
    }),
    vscode.commands.registerCommand("backstage-party-social-network.gitDiffAnalysis", async (uri: vscode.Uri) => {
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
          await processOllamaRequest(prompt, "gitDiffAnalysis", document.fileName);
          console.log("Feedback request sent to Ollama");
            } else {
              console.log("No git changes detected, showing message to user");
              vscode.window.showInformationMessage("No git changes detected.");
            }
          } catch (error) {
            console.error("Error in git diff analysis:", error);
            vscode.window.showErrorMessage(`Error analyzing git diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }),
    
        vscode.commands.registerCommand("backstage-party-social-network.explainCodeWithOllama", async () => {
          console.log("Executing Explain Code with Ollama");
        })
      ];
    
      return commands;
    }


function registerCommand(command: string, prompt: string): vscode.Disposable {
  return vscode.commands.registerCommand(
    `backstage-party-social-network.${command}`,
    async () => {
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
        await processOllamaRequest(`${prompt}\n\n${codeToAnalyze}`, command, editor.document.fileName);
        console.log("Ollama request complete.");

      } catch (error) {
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
            const fallbackResponse = await handleFallback(`${prompt}\n\n${codeToAnalyze}`);
            console.log("Fallback response received:", fallbackResponse);
            vscode.window.showInformationMessage("Fallback response: " + fallbackResponse);
          } else {
            vscode.window.showWarningMessage("No code selected or empty document during fallback");
            console.warn("No code selected or document is empty during fallback. Aborting fallback.");
          }
        } catch (fallbackError) {
          console.error("Error in fallback handling:", fallbackError);
          vscode.window.showErrorMessage("All attempts to analyze the code failed. Please check your connection and try again.");
        }
      }
    }
  );
}

async function checkHealthCommand() {
  try {
    console.log("Executing health check command...");
    const isHealthy = await checkHealth();
    if (isHealthy) {
      vscode.window.showInformationMessage("All services are running and responsive");
    } else {
      vscode.window.showErrorMessage("One or more services are not responding.");
    }
  } catch (error) {
    console.error("Error in health check command:", error);
    vscode.window.showErrorMessage("Error checking service health. Please try again.");
  }
}

function getGitDiffForFile(filePath: string): string | null {
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
      const unstagedDiff = childProcess.execSync(
        `git diff -- "${filePath}"`,
        { cwd: workspacePath, encoding: "utf8" }
      ).trim();
      if (unstagedDiff) {
        console.log("Found unstaged changes");
        combinedDiff += "Unstaged Changes:\n" + unstagedDiff + "\n\n";
      } else {
        console.log("No unstaged changes found");
      }
    } catch (error) {
      console.log("Error checking unstaged changes:", error);
    }

    // Check for staged changes
    try {
      console.log("Checking for staged changes...");
      const stagedDiff = childProcess.execSync(
        `git diff --cached -- "${filePath}"`,
        { cwd: workspacePath, encoding: "utf8" }
      ).trim();
      if (stagedDiff) {
        console.log("Found staged changes");
        combinedDiff += "Staged Changes:\n" + stagedDiff;
      } else {
        console.log("No staged changes found");
      }
    } catch (error) {
      console.log("Error checking staged changes:", error);
    }

    const finalDiff = combinedDiff.trim();
    console.log("Final diff length:", finalDiff.length);
    return finalDiff || null;
  } catch (error) {
    console.error("Error executing git diff:", error);
    return null;
  }
}



