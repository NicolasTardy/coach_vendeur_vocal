import { aiConfig } from "@/lib/config";
import { buildClientSystemPrompt, formatTranscript } from "@/lib/prompts";
import {
  createDeepSeekChatCompletion,
  extractDeepSeekText
} from "@/lib/services/deepseek-client";
import {
  extractGeminiText,
  generateGeminiContent
} from "@/lib/services/gemini-client";
import type { Scenario, TranscriptTurn } from "@/lib/types";

export type ConversationEngine = {
  reply(args: {
    scenario: Scenario;
    transcript: TranscriptTurn[];
    sellerText: string;
  }): Promise<string>;
};

export class ClientPersonaEngine implements ConversationEngine {
  async reply({
    scenario,
    transcript,
    sellerText
  }: {
    scenario: Scenario;
    transcript: TranscriptTurn[];
    sellerText: string;
  }) {
    if (aiConfig.textProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      const data = await createDeepSeekChatCompletion({
        model: aiConfig.deepseekClientModel,
        messages: [
          {
            role: "system",
            content: buildClientSystemPrompt(scenario)
          },
          {
            role: "user",
            content: `${formatTranscript(transcript)}\nSELLER: ${sellerText}`
          }
        ],
        maxTokens: 140,
        thinking: "disabled"
      });

      return (
        extractDeepSeekText(data) ||
        mockClientReply(scenario, transcript.length, sellerText)
      );
    }

    if (aiConfig.textProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const data = await generateGeminiContent({
        model: aiConfig.geminiTextModel,
        systemInstruction: buildClientSystemPrompt(scenario),
        parts: [
          {
            text: `${formatTranscript(transcript)}\nSELLER: ${sellerText}`
          }
        ],
        maxOutputTokens: 140
      });

      return (
        extractGeminiText(data) ||
        mockClientReply(scenario, transcript.length, sellerText)
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return mockClientReply(scenario, transcript.length, sellerText);
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiConfig.textModel,
        instructions: buildClientSystemPrompt(scenario),
        input: `${formatTranscript(transcript)}\nSELLER: ${sellerText}`,
        max_output_tokens: 140
      })
    });

    if (!response.ok) {
      throw new Error(`Conversation failed: ${response.status}`);
    }

    const data = (await response.json()) as { output_text?: string };
    return data.output_text?.trim() || mockClientReply(scenario, transcript.length, sellerText);
  }
}

function mockClientReply(scenario: Scenario, turnCount: number, sellerText: string) {
  const normalized = sellerText.toLowerCase();

  if (turnCount < 2) {
    return `Bonjour. Je regarde pour ${scenario.visibleNeed.toLowerCase()}, mais je ne veux pas me tromper.`;
  }

  if (
    normalized.includes("budget") ||
    normalized.includes("usage") ||
    normalized.includes("besoin") ||
    normalized.includes("important")
  ) {
    return `Oui, c'est surtout ca. ${scenario.hiddenNeed}. Et on voudrait rester autour de ${scenario.budget}.`;
  }

  if (
    normalized.includes("garantie") ||
    normalized.includes("livraison") ||
    normalized.includes("service")
  ) {
    return "D'accord, expliquez-moi concretement ce que ca change pour moi, parce que je suis assez prudent.";
  }

  if (turnCount > 7) {
    return "La proposition me parle. Si vous pouvez me rassurer sur le prix et la suite, on peut avancer.";
  }

  return scenario.objections[turnCount % scenario.objections.length];
}
