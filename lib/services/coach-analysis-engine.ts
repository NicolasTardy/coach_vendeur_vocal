import { aiConfig } from "@/lib/config";
import { buildCoachSystemPrompt } from "@/lib/prompts";
import type { FinalReport, Scenario, TranscriptTurn } from "@/lib/types";
import { buildFallbackReport } from "@/lib/services/report-generator";
import {
  createDeepSeekChatCompletion,
  extractDeepSeekText
} from "@/lib/services/deepseek-client";
import {
  extractGeminiText,
  generateGeminiContent
} from "@/lib/services/gemini-client";

export type CoachAnalysisEngine = {
  analyze(args: {
    scenario: Scenario;
    transcript: TranscriptTurn[];
  }): Promise<FinalReport>;
};

export class OpenAICoachAnalysisEngine implements CoachAnalysisEngine {
  async analyze({
    scenario,
    transcript
  }: {
    scenario: Scenario;
    transcript: TranscriptTurn[];
  }) {
    if (aiConfig.textProvider === "deepseek" && process.env.DEEPSEEK_API_KEY) {
      const data = await createDeepSeekChatCompletion({
        model: aiConfig.deepseekCoachModel,
        messages: [
          {
            role: "system",
            content: `${buildCoachSystemPrompt(
              scenario,
              transcript
            )}\n\nRetourne du json strict.`
          },
          {
            role: "user",
            content:
              "Analyse la simulation et retourne uniquement un objet JSON strict."
          }
        ],
        maxTokens: 1800,
        json: true,
        thinking:
          aiConfig.deepseekCoachThinking === "enabled" ? "enabled" : "disabled",
        reasoningEffort: "high"
      });

      try {
        return normalizeAiReport(
          parseAiJsonObject(extractDeepSeekText(data)),
          buildFallbackReport(scenario, transcript)
        );
      } catch {
        return buildFallbackReport(scenario, transcript);
      }
    }

    if (aiConfig.textProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const data = await generateGeminiContent({
        model: aiConfig.geminiTextModel,
        systemInstruction: buildCoachSystemPrompt(scenario, transcript),
        parts: [{ text: "Analyse et retourne uniquement du JSON strict." }],
        maxOutputTokens: 1600,
        responseMimeType: "application/json"
      });

      try {
        return normalizeAiReport(
          parseAiJsonObject(extractGeminiText(data)),
          buildFallbackReport(scenario, transcript)
        );
      } catch {
        return buildFallbackReport(scenario, transcript);
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return buildFallbackReport(scenario, transcript);
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiConfig.textModel,
        instructions: buildCoachSystemPrompt(scenario, transcript),
        input: "Analyse et retourne uniquement du JSON strict.",
        max_output_tokens: 1600,
        text: {
          format: {
            type: "json_object"
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Coach analysis failed: ${response.status}`);
    }

    const data = (await response.json()) as { output_text?: string };

    try {
      return normalizeAiReport(
        parseAiJsonObject(data.output_text ?? ""),
        buildFallbackReport(scenario, transcript)
      );
    } catch {
      return buildFallbackReport(scenario, transcript);
    }
  }
}

function normalizeAiReport(
  payload: Record<string, unknown>,
  fallback: FinalReport
): FinalReport {
  payload = asRecord(payload.report ?? payload.analysis ?? payload.result ?? payload);
  const scorePayload = asRecord(payload.score);
  const score = {
    global: normalizeGlobalScore(
      scoreValue(payload.global ?? scorePayload.global, fallback.score.global)
    ),
    accueil: scoreValue(payload.accueil ?? scorePayload.accueil, fallback.score.accueil),
    decouverte: scoreValue(
      payload.decouverte ?? scorePayload.decouverte,
      fallback.score.decouverte
    ),
    reformulation: scoreValue(
      payload.reformulation ?? scorePayload.reformulation,
      fallback.score.reformulation
    ),
    argumentationProduit: scoreValue(
      payload.argumentationProduit ?? scorePayload.argumentationProduit,
      fallback.score.argumentationProduit
    ),
    argumentationServices: scoreValue(
      payload.argumentationServices ?? scorePayload.argumentationServices,
      fallback.score.argumentationServices
    ),
    financement: scoreValue(
      payload.financement ?? scorePayload.financement,
      fallback.score.financement
    ),
    garantieExtension: scoreValue(
      payload.garantieExtension ?? scorePayload.garantieExtension,
      fallback.score.garantieExtension
    ),
    assuranceEsthetisme: scoreValue(
      payload.assuranceEsthetisme ?? scorePayload.assuranceEsthetisme,
      fallback.score.assuranceEsthetisme
    ),
    objections: scoreValue(
      payload.objections ?? scorePayload.objections,
      fallback.score.objections
    ),
    closing: scoreValue(payload.closing ?? scorePayload.closing, fallback.score.closing),
    relationnel: scoreValue(
      payload.relationnel ?? scorePayload.relationnel,
      fallback.score.relationnel
    ),
    strengths:
      firstStringArray(payload.strengths, scorePayload.strengths) ||
      fallback.score.strengths,
    priorities:
      (
        firstStringArray(payload.priorities, scorePayload.priorities) ||
        fallback.score.priorities
      ).slice(0, 3),
    recommendedExercises:
      firstStringArray(
        payload.recommendedExercises,
        scorePayload.recommendedExercises
      ) || fallback.score.recommendedExercises
  };

  return {
    summary: stringifyField(payload.summary) || fallback.summary,
    score,
    keyMoments: Array.isArray(payload.keyMoments)
      ? payload.keyMoments.map((rawItem, index) => {
          const item = asRecord(rawItem);
          return {
            id: `moment_${index}`,
            turnIndex: Number(item.turnIndex ?? index),
            clientQuote: stringifyField(
              item.clientQuote ?? item.client ?? item.quoteClient
            ),
            sellerQuote: stringifyField(
              item.sellerQuote ?? item.seller ?? item.quoteSeller
            ),
            issue: stringifyField(item.issue ?? item.problem),
            betterAnswer: stringifyField(item.betterAnswer ?? item.bestAnswer)
          };
        }).filter((moment) => moment.clientQuote || moment.sellerQuote || moment.betterAnswer)
      : fallback.keyMoments,
    objections: Array.isArray(payload.objectionsReview)
      ? payload.objectionsReview.map((rawItem) => {
          const item = asRecord(rawItem);
          return {
            objection: stringifyField(item.objection),
            givenAnswer: stringifyField(item.givenAnswer ?? item.answerGiven),
            betterAnswer: stringifyField(item.betterAnswer ?? item.bestAnswer)
          };
        }).filter((objection) => objection.objection || objection.betterAnswer)
      : fallback.objections,
    priorityTips:
      asStringArray(payload.priorityTips)?.slice(0, 3) || fallback.priorityTips,
    spacedPlan: Array.isArray(payload.spacedPlan) && payload.spacedPlan.length > 0
      ? payload.spacedPlan.map((rawItem) => {
          const item = asRecord(rawItem);
          return {
            when: normalizeWhen(item.when),
            task: stringifyField(item.task)
          };
        })
      : fallback.spacedPlan,
    memo: asStringArray(payload.memo) || fallback.memo,
    rawText: ""
  };
}

function parseAiJsonObject(text: string): Record<string, unknown> {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return {};
  }

  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

function asStringArray(value: unknown) {
  const items = Array.isArray(value)
    ? value.map(stringifyField).filter(Boolean)
    : [];
  return items.length > 0 ? items : null;
}

function firstStringArray(...values: unknown[]) {
  for (const value of values) {
    const items = asStringArray(value);
    if (items) {
      return items;
    }
  }

  return null;
}

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeWhen(value: unknown) {
  const fallback = "Demain";
  const allowed = ["Demain", "J+3", "J+7", "J+14", "J+30"] as const;
  return allowed.find((item) => item === value) ?? fallback;
}

function scoreValue(value: unknown, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeGlobalScore(value: number) {
  return value > 0 && value <= 10 ? Math.round(value * 10) : value;
}

function stringifyField(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const direct = record.text ?? record.value ?? record.summary ?? record.content;

    if (typeof direct === "string") {
      return direct;
    }

    return Object.values(record).map(stringifyField).filter(Boolean).join(" ");
  }

  return "";
}
