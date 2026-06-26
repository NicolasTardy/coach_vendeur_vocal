import { aiConfig } from "@/lib/config";
import { getGeminiApiKey } from "@/lib/env";
import { buildClientSystemPrompt, formatRecentTranscript } from "@/lib/prompts";
import {
  createDeepSeekChatCompletion,
  extractDeepSeekText
} from "@/lib/services/deepseek-client";
import {
  extractGeminiText,
  generateGeminiContent
} from "@/lib/services/gemini-client";
import type {
  ClientDifficulty,
  Scenario,
  ServiceKey,
  TranscriptTurn
} from "@/lib/types";

export type ConversationEngine = {
  reply(args: {
    scenario: Scenario;
    transcript: TranscriptTurn[];
    sellerText: string;
    difficulty?: ClientDifficulty;
    focusService?: ServiceKey;
    maxTurns?: number;
  }): Promise<string>;
};

export class ClientPersonaEngine implements ConversationEngine {
  async reply({
    scenario,
    transcript,
    sellerText,
    difficulty = "neutre",
    focusService,
    maxTurns = 5
  }: {
    scenario: Scenario;
    transcript: TranscriptTurn[];
    sellerText: string;
    difficulty?: ClientDifficulty;
    focusService?: ServiceKey;
    maxTurns?: number;
  }) {
    const prompt = buildClientSystemPrompt(scenario, difficulty, focusService);
    const input = buildClientTurnInput(transcript, sellerText, maxTurns);
    const geminiApiKey = getGeminiApiKey();
    // Gemini est le moteur texte principal. DeepSeek reste un repli optionnel.
    const preferDeepSeek = aiConfig.textProvider === "deepseek";

    if (geminiApiKey && !preferDeepSeek) {
      const text = await this.tryGeminiReply(prompt, input);
      if (text) return text;
    }

    if (process.env.DEEPSEEK_API_KEY) {
      const text = await this.tryDeepSeekReply(prompt, input);
      if (text) return text;
    }

    if (geminiApiKey && preferDeepSeek) {
      const text = await this.tryGeminiReply(prompt, input);
      if (text) return text;
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("Client reply using local fallback: no text model key available", {
        hasDeepSeekKey: Boolean(process.env.DEEPSEEK_API_KEY),
        hasGeminiKey: Boolean(geminiApiKey),
        hasOpenAIKey: false
      });
      return mockClientReply(scenario, transcript, sellerText);
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiConfig.textModel,
        instructions: prompt,
        input,
        max_output_tokens: 170
      })
    });

    if (!response.ok) {
      throw new Error(`Conversation failed: ${response.status}`);
    }

    const data = (await response.json()) as { output_text?: string };
    return data.output_text?.trim() || mockClientReply(scenario, transcript, sellerText);
  }

  private async tryGeminiReply(prompt: string, input: string) {
    try {
      const data = await generateGeminiContent({
        model: aiConfig.geminiTextModel,
        systemInstruction: prompt,
        parts: [{ text: input }],
        maxOutputTokens: 220,
        // Reponse client directe: pas de budget de reflexion, faible latence
        // et tous les tokens disponibles pour la replique.
        thinkingBudget: 0
      });

      return extractGeminiText(data);
    } catch (error) {
      console.error("Gemini client reply failed; trying next provider", {
        message: error instanceof Error ? error.message : String(error)
      });
      return "";
    }
  }

  private async tryDeepSeekReply(prompt: string, input: string) {
    try {
      const data = await createDeepSeekChatCompletion({
        model: aiConfig.deepseekClientModel,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: input }
        ],
        maxTokens: 220,
        thinking: "disabled"
      });

      return extractDeepSeekText(data);
    } catch (error) {
      console.error("DeepSeek client reply failed; trying next provider", {
        message: error instanceof Error ? error.message : String(error)
      });
      return "";
    }
  }
}

function buildClientTurnInput(
  transcript: TranscriptTurn[],
  sellerText: string,
  maxTurns = 5
) {
  const clientTurns = transcript.filter((turn) => turn.speaker === "client").length;
  const sellerTurns = transcript.filter((turn) => turn.speaker === "seller").length;

  return `
CONVERSATION JUSQU'ICI (du plus ancien au plus recent):
${formatRecentTranscript(transcript)}

DERNIERE PHRASE DU VENDEUR (a laquelle tu reponds maintenant):
"${sellerText}"

CONSIGNE DE TOUR:
- Reponds directement et precisement a cette derniere phrase du vendeur, en
  restant coherent avec tout ce qui a deja ete dit plus haut.
- Tour client a produire: ${clientTurns + 1}/${maxTurns}. Tours vendeur deja faits: ${sellerTurns}/${maxTurns}.
- L'exercice du vendeur est de te proposer, quand c'est pertinent, un financement
  (mensualites / carte Cpay) et/ou une protection (GLD, Estaly). Ne fais pas ce
  travail a sa place: donne des indices realistes sur ton frein budget ou ton
  risque, mais laisse-le proposer le service.
- Ne repete pas une question deja posee sauf si le vendeur n'y a pas repondu.
- Fais evoluer ton hesitation selon ce que le vendeur vient de dire.
- Une seule replique de client, courte et naturelle, sans commentaire.
`.trim();
}

function mockClientReply(
  scenario: Scenario,
  transcript: TranscriptTurn[],
  sellerText: string
) {
  const normalized = sellerText.toLowerCase();
  const sellerTurns = transcript.filter((turn) => turn.speaker === "seller").length;
  const previousClientTexts = transcript
    .filter((turn) => turn.speaker === "client")
    .map((turn) => turn.text);

  if (sellerTurns === 0) {
    return scenario.openingLine;
  }

  if (
    normalized.includes("budget") ||
    normalized.includes("usage") ||
    normalized.includes("besoin") ||
    normalized.includes("important")
  ) {
    return avoidRepeatedReply(
      `Oui, c'est surtout ca. ${scenario.hiddenNeed}. Et on voudrait rester autour de ${scenario.budget}.`,
      previousClientTexts,
      scenario
    );
  }

  if (
    normalized.includes("mensual") ||
    normalized.includes("mois") ||
    normalized.includes("cpay") ||
    normalized.includes("credit") ||
    normalized.includes("carte")
  ) {
    return avoidRepeatedReply(
      "Je peux entendre l'idee des mensualites si c'est clair et sans surprise. Concretement, ca donnerait quoi sur le modele que vous me conseillez ?",
      previousClientTexts,
      scenario
    );
  }

  if (
    normalized.includes("garantie") ||
    normalized.includes("livraison") ||
    normalized.includes("service")
  ) {
    return avoidRepeatedReply(
      "D'accord, expliquez-moi concretement ce que ca change pour moi, parce que je suis assez prudent.",
      previousClientTexts,
      scenario
    );
  }

  if (
    normalized.includes("tache") ||
    normalized.includes("rayure") ||
    normalized.includes("estaly") ||
    normalized.includes("protection")
  ) {
    return avoidRepeatedReply(
      "Oui, c'est exactement le genre de risque qui m'inquiete. Si c'est simple et que je comprends ce qui est couvert, je veux bien regarder.",
      previousClientTexts,
      scenario
    );
  }

  if (transcript.length > 7) {
    return "La proposition me parle. Si vous pouvez me rassurer sur le prix et la suite, on peut avancer.";
  }

  return avoidRepeatedReply(
    `Je suis content de vos conseils, mais j'hesite encore. ${
      scenario.objections[sellerTurns % scenario.objections.length]
    }`,
    previousClientTexts,
    scenario
  );
}

function avoidRepeatedReply(
  reply: string,
  previousClientTexts: string[],
  scenario: Scenario
) {
  if (!previousClientTexts.some((previous) => sameMeaning(previous, reply))) {
    return reply;
  }

  return `Je comprends mieux. Mon vrai point maintenant, c'est de choisir sans regret entre ${scenario.productOptions
    .slice(0, 2)
    .join(" et ")}. Qu'est-ce que vous me conseillez si je veux rester raisonnable sur le budget ?`;
}

function sameMeaning(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
