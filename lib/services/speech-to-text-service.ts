import { aiConfig } from "@/lib/config";
import {
  extractGeminiText,
  generateGeminiContent
} from "@/lib/services/gemini-client";

export type SpeechToTextService = {
  transcribe(audio: Blob): Promise<string>;
};

export class OpenAISpeechToTextService implements SpeechToTextService {
  async transcribe(audio: Blob) {
    if (aiConfig.audioProvider === "gemini" && process.env.GEMINI_API_KEY) {
      try {
        const data = Buffer.from(await audio.arrayBuffer()).toString("base64");
        const mimeType = normalizeAudioMimeType(audio.type);
        const response = await generateGeminiContent({
          model: aiConfig.geminiSttModel,
          parts: [
            {
              text: "Transcris exactement en francais la parole du vendeur. Retourne uniquement la transcription, sans commentaire."
            },
            {
              inlineData: {
                mimeType,
                data
              }
            }
          ],
          maxOutputTokens: 300
        });

        return cleanTranscription(extractGeminiText(response));
      } catch (error) {
        console.error("Gemini STT failed; trying OpenAI fallback", {
          message: error instanceof Error ? error.message : String(error),
          audioType: audio.type || "unknown",
          audioSize: audio.size
        });
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("STT unavailable: no working Gemini STT and no OPENAI_API_KEY", {
        audioProvider: aiConfig.audioProvider,
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
        audioType: audio.type || "unknown",
        audioSize: audio.size
      });
      return "";
    }

    const formData = new FormData();
    formData.append("file", audio, getAudioFilename(audio.type));
    formData.append("model", aiConfig.sttModel);
    formData.append("response_format", "text");
    formData.append(
      "prompt",
      "Simulation de vente en magasin BUT/Conforama. Vocabulaire: canape, literie, cuisine, electromenager, garantie, livraison, montage, CPay."
    );

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`STT failed: ${response.status}`);
    }

    return response.text();
  }
}

function normalizeAudioMimeType(mimeType: string) {
  if (!mimeType) return "audio/webm";
  return mimeType.split(";")[0] || mimeType;
}

function getAudioFilename(mimeType: string) {
  if (mimeType.includes("mp4")) return "seller.m4a";
  if (mimeType.includes("mpeg")) return "seller.mp3";
  if (mimeType.includes("ogg")) return "seller.ogg";
  if (mimeType.includes("wav")) return "seller.wav";
  return "seller.webm";
}

function cleanTranscription(text: string) {
  return text
    .replace(/^["“”]+|["“”]+$/g, "")
    .replace(/\s+but\s+["“”].*$/i, "")
    .replace(/\s+is standard\.?$/i, "")
    .trim();
}
