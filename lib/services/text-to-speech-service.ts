import { aiConfig } from "@/lib/config";
import {
  extractGeminiInlineData,
  generateGeminiContent,
  pcmBase64ToWavDataUrl
} from "@/lib/services/gemini-client";

export type TextToSpeechService = {
  synthesize(text: string): Promise<string | null>;
};

export class OpenAITextToSpeechService implements TextToSpeechService {
  async synthesize(text: string) {
    if (aiConfig.audioProvider === "gemini" && process.env.GEMINI_API_KEY) {
      const data = await generateGeminiContent({
        model: aiConfig.geminiTtsModel,
        parts: [
          {
            text: `Dis d'une voix francaise naturelle de client en magasin, ton realiste et conversationnel: ${text}`
          }
        ],
        responseModalities: ["AUDIO"],
        speechVoiceName: process.env.GEMINI_TTS_VOICE ?? "Kore"
      });
      const inlineData = extractGeminiInlineData(data);

      if (!inlineData?.data) {
        return null;
      }

      if (inlineData.mimeType?.includes("wav")) {
        return `data:audio/wav;base64,${inlineData.data}`;
      }

      return pcmBase64ToWavDataUrl(inlineData.data);
    }

    if (!process.env.OPENAI_API_KEY) {
      return null;
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiConfig.ttsModel,
        voice: "coral",
        input: text,
        instructions:
          "Voix naturelle francaise, client de magasin, ton realiste et conversationnel.",
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:audio/mpeg;base64,${buffer.toString("base64")}`;
  }
}
