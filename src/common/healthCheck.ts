import axios from "axios";
import * as vscode from "vscode";

let healthCheckInterval: NodeJS.Timeout;

export async function checkHealth(): Promise<boolean> {
  try {
    // Ollama health check
    const ollamaHealthUrl = "http://localhost:11434";
    const ollamaHealthResponse = await axios.get(ollamaHealthUrl);
    if (ollamaHealthResponse.status !== 200) {
      console.error("Ollama health check failed with status:", ollamaHealthResponse.status);
      return false;
    }

    // OpenAI health check
    if (process.env.OPENAI_API_KEY) {
      const openAIHealthResponse = await axios.get("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      if (openAIHealthResponse.status !== 200) {
        console.error("OpenAI health check failed with status:", openAIHealthResponse.status);
        return false;
      }
    }

    console.log("All services are healthy");
    return true;
  } catch (error) {
    console.error("Error during health check:", error);
    return false;
  }
}

export function startHealthCheck(): NodeJS.Timeout {
  healthCheckInterval = setInterval(async () => {
    const isHealthy = await checkHealth();
    if (isHealthy) {
      console.log("All services are healthy");
    } else {
      console.error("One or more services are not healthy");
    }
  }, 15 * 60 * 1000); // Every 15 minutes
  return healthCheckInterval;
}

export function stopHealthCheck(interval: NodeJS.Timeout): void {
  clearInterval(interval);
}


