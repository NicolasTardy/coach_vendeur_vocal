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
      const data = Buffer.from(await audio.arrayBuffer()).toString("base64");
      const mimeType = audio.type || "audio/ogg";
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
    }

    if (!process.env.OPENAI_API_KEY) {
      return "";
    }

    const formData = new FormData();
    formData.append("file", audio, "seller.webm");
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

function cleanTranscription(text: string) {
  return text
    .replace(/^["“”]+|["“”]+$/g, "")
    .replace(/\s+but\s+["“”].*$/i, "")
    .replace(/\s+is standard\.?$/i, "")
    .trim();
}
