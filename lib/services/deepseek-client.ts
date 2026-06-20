import { aiConfig } from "@/lib/config";

type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekChatArgs = {
  model: string;
  messages: DeepSeekMessage[];
  maxTokens?: number;
  json?: boolean;
  thinking?: "enabled" | "disabled";
  reasoningEffort?: "high" | "max";
};

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function createDeepSeekChatCompletion(args: DeepSeekChatArgs) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("Missing DEEPSEEK_API_KEY");
  }

  const response = await fetch(`${aiConfig.deepseekBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      stream: false,
      max_tokens: args.maxTokens,
      ...(args.json ? { response_format: { type: "json_object" } } : {}),
      thinking: { type: args.thinking ?? "disabled" },
      ...(args.thinking === "enabled"
        ? { reasoning_effort: args.reasoningEffort ?? "high" }
        : {})
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as DeepSeekChatResponse;
}

export function extractDeepSeekText(data: DeepSeekChatResponse) {
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
