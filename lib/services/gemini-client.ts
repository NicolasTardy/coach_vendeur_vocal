import { getGeminiApiKey } from "@/lib/env";

type GeminiTextPart = {
  text: string;
};

type GeminiInlinePart = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

type GeminiPart = GeminiTextPart | GeminiInlinePart;

type GeminiGenerateArgs = {
  model: string;
  systemInstruction?: string;
  parts: GeminiPart[];
  maxOutputTokens?: number;
  responseMimeType?: "application/json" | "text/plain";
  responseModalities?: Array<"AUDIO" | "TEXT">;
  speechVoiceName?: string;
  thinkingBudget?: number;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType?: string;
          data?: string;
        };
      }>;
    };
  }>;
};

const geminiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

function serializePart(part: GeminiPart) {
  if ("inlineData" in part) {
    return {
      inline_data: {
        mime_type: part.inlineData.mimeType,
        data: part.inlineData.data
      }
    };
  }

  return part;
}

export async function generateGeminiContent(args: GeminiGenerateArgs) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const generationConfig: Record<string, unknown> = {};

  if (args.maxOutputTokens) {
    generationConfig.maxOutputTokens = args.maxOutputTokens;
  }

  if (args.responseMimeType) {
    generationConfig.responseMimeType = args.responseMimeType;
  }

  if (args.responseModalities) {
    generationConfig.responseModalities = args.responseModalities;
  }

  if (args.speechVoiceName) {
    generationConfig.speechConfig = {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: args.speechVoiceName
        }
      }
    };
  }

  if (typeof args.thinkingBudget === "number") {
    generationConfig.thinkingConfig = {
      thinkingBudget: args.thinkingBudget
    };
  }

  const response = await fetch(
    `${geminiBaseUrl}/${args.model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...(args.systemInstruction
          ? {
              system_instruction: {
                parts: [{ text: args.systemInstruction }]
              }
            }
          : {}),
        contents: [
          {
            role: "user",
            parts: args.parts.map(serializePart)
          }
        ],
        ...(Object.keys(generationConfig).length ? { generationConfig } : {})
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as GeminiGenerateResponse;
}

export function extractGeminiText(data: GeminiGenerateResponse) {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

export function extractGeminiInlineData(data: GeminiGenerateResponse) {
  return data.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)
    ?.inlineData;
}

export function pcmBase64ToWavDataUrl(base64Pcm: string) {
  const pcm = Buffer.from(base64Pcm, "base64");
  const header = Buffer.alloc(44);
  const sampleRate = 24000;
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  const wav = Buffer.concat([header, pcm]);
  return `data:audio/wav;base64,${wav.toString("base64")}`;
}
