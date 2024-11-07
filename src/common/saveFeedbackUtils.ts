import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function saveFeedbackToMarkdown(rawOutput: string, originalFilePath: string): Promise<void> {
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
    } catch (error) {
      console.error("Error saving feedback to markdown:", error);
      reject(error);
    }
  });
}
