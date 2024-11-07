import axios from "axios";

export async function checkOpenAIAPIHealth(): Promise<[boolean, string]> {
  const url = "https://status.openai.com/api/v2/summary.json";
  try {
    const response = await axios.get(url);
    const data = response.data;

    // Check overall system status
    const overallStatus = data?.status?.indicator;
    if (overallStatus !== 'none') {
      return [false, `OpenAI API is not fully operational: ${data?.status?.description}`];
    }

    // Check the status of individual components
    for (const component of data?.components ?? []) {
      if (component?.status !== 'operational') {
        return [false, `Component '${component?.name}' is not operational.`];
      }
    }

    return [true, "OpenAI API is fully operational."];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return [false, `Failed to reach OpenAI status API: ${error.message}`];
    } else {
      return [false, `An unknown error occurred while checking OpenAI status: ${error}`];
    }
  }
}

