import * as vscode from "vscode";
import { checkHealth } from "../common/healthCheck";
import { saveFeedbackToMarkdown } from "../common/saveFeedbackUtils";
import { ChatOllama } from "@langchain/ollama";

export async function communicateWithOllama(prompt: string, timeoutMs: number = 600000): Promise<string> {
  try {
    console.log("Sending request to Ollama");

    // Initialize the ChatOllama client
    const chatOllama = new ChatOllama({
      baseUrl: "http://localhost:11434", // Adjust this URL if your Ollama server runs elsewhere
      model: "llama3.2", // Specify the model you are using
    });

    // Create a timeout promise
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => {
        reject(new Error(`Ollama request timed out after ${timeoutMs / 1000} seconds`));
      }, timeoutMs)
    );

    // Create the Ollama invoke promise
    const ollamaInvokePromise = chatOllama.invoke([
      { role: "user", content: prompt }
    ]);

    // Race between the Ollama invoke and the timeout
    const response = await Promise.race([ollamaInvokePromise, timeoutPromise]);

    console.log("Received complete response from Ollama");

    // Assuming response is in text format
    if (typeof response === "object" && response?.content) {
      return Array.isArray(response.content) ? response.content.join(' ') : response.content.toString();
    } else {
      return "No meaningful response received from Ollama.";
    }

  } catch (error) {
    console.error("Error in Ollama communication:", error);
    throw new Error(`Ollama request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


export async function processOllamaRequest(prompt: string, reviewType: string, fileName: string): Promise<void> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Processing ${reviewType}`,
      cancellable: true,
    },
    async (progress, token) => {
      try {
        progress.report({ increment: 0, message: "Checking Ollama status..." });
        const isHealthy = await checkHealth();
        if (!isHealthy) {
          throw new Error('Ollama is not available');
        }

        progress.report({ increment: 20, message: "Analyzing code..." });
        const response = await communicateWithOllama(prompt);

        if (token.isCancellationRequested) {
          return;
        }

        progress.report({ increment: 40, message: "Processing results..." });

        // If the response has no meaningful content, set default message
        const feedback = response || "No meaningful feedback received from Ollama.";

        // Create and show the feedback document
        const document = await vscode.workspace.openTextDocument({
          content: `# ${reviewType} Results\n\n${feedback}`,
          language: 'markdown',
        });

        await vscode.window.showTextDocument(document, {
          viewColumn: vscode.ViewColumn.Beside,
          preserveFocus: true,
        });

        // Save the feedback to markdown
        await saveFeedbackToMarkdown(feedback, fileName);
        vscode.window.showInformationMessage(`${reviewType} complete!`);
      } catch (error) {
        console.error(`Error in ${reviewType}:`, error);
        vscode.window.showErrorMessage(`Error in ${reviewType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}

export default processOllamaRequest;




