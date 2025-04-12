import { Message } from "@/components/MessageBubble";

const API_URL = "https://api.openai.com/v1/chat/completions";

export async function getChatCompletion(messages: Message[], apiKey: string) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from OpenAI");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// For streaming 
export async function streamChatCompletion(
  messages: Message[],
  apiKey: string,
  onChunk: (chunk: string) => void
) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || 
        `Failed to get response from OpenAI: ${response.status} ${response.statusText}`
      );
    }

    // Get the reader from the response body stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) {
      throw new Error("Failed to get reader from response");
    }

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      
      // Process the SSE format
      const lines = chunk
        .split("\n")
        .filter(line => line.trim() !== "");
      
      for (const line of lines) {
        // Skip non-data lines and [DONE] marker
        if (!line.startsWith("data:") || line.includes("[DONE]")) continue;
        
        try {
          // Parse the JSON data, removing "data: " prefix
          const jsonData = line.replace(/^data: /, "").trim();
          
          // Skip empty data
          if (!jsonData || jsonData === "[DONE]") continue;
          
          const parsedData = JSON.parse(jsonData);
          const content = parsedData.choices?.[0]?.delta?.content;
          
          // Only call onChunk if we have content
          if (content) onChunk(content);
        } catch (e) {
          console.error("Error parsing streaming response:", e);
          // Continue to the next line even if one fails
        }
      }
    }
  } catch (error) {
    console.error("Error in streaming:", error);
    throw error;
  }
} 