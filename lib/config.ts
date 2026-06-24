import { getGeminiApiKey } from "@/lib/env";

export const aiConfig = {
  textProvider:
    process.env.AI_TEXT_PROVIDER ?? process.env.AI_PROVIDER ?? "deepseek",
  audioProvider:
    process.env.AI_AUDIO_PROVIDER ?? process.env.AI_PROVIDER ?? "gemini",
  textModel: process.env.OPENAI_TEXT_MODEL ?? "gpt-5.4-mini",
  sttModel: process.env.OPENAI_STT_MODEL ?? "gpt-4o-mini-transcribe",
  ttsModel: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
  hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  deepseekClientModel:
    process.env.DEEPSEEK_CLIENT_MODEL ?? "deepseek-v4-flash",
  deepseekCoachModel: process.env.DEEPSEEK_COACH_MODEL ?? "deepseek-v4-flash",
  deepseekCoachThinking: process.env.DEEPSEEK_COACH_THINKING ?? "disabled",
  hasDeepSeekKey: Boolean(process.env.DEEPSEEK_API_KEY),
  geminiTextModel: process.env.GEMINI_TEXT_MODEL ?? "gemini-3.5-flash",
  geminiSttModel: process.env.GEMINI_STT_MODEL ?? "gemini-3.5-flash",
  geminiTtsModel:
    process.env.GEMINI_TTS_MODEL ?? "gemini-3.1-flash-tts-preview",
  hasGeminiKey: Boolean(getGeminiApiKey()),
  port: process.env.PORT ?? "3008",
  pm2Name: process.env.PM2_NAME ?? "simuvente-ia"
};
