# SimuVente IA - Architecture MVP

## Arborescence

- `app/`: pages Next.js et routes API.
- `app/api/scenarios`: liste des scenarios MVP.
- `app/api/sessions`: creation d'une session anonyme par pseudo.
- `app/api/sessions/[id]/turn`: pipeline voix/texte vendeur vers reponse client.
- `app/api/sessions/[id]/report`: analyse coach et rapport final.
- `app/api/sessions/[id]/replay`: reprise depuis un moment cle.
- `lib/scenarios.ts`: les 5 scenarios MVP.
- `lib/prompts.ts`: prompts systeme client, coach et rapport.
- `lib/services`: modules remplacables: STT, TTS, conversation, coach, rapport, memoire.
- `lib/storage`: stockage local de developpement. En production, remplacer par un adaptateur Postgres.

## Choix IA

MVP HTTP hybride DeepSeek + Gemini:

- Agent client: `deepseek-v4-flash`, thinking desactive pour reduire la latence.
- Agent coach/rapport: `deepseek-v4-flash`, JSON output active. `deepseek-v4-pro` reste une option si les rapports manquent de finesse.
- STT: `gemini-3.5-flash` en audio understanding, prompt explicite de transcription.
- TTS: `gemini-3.1-flash-tts-preview`, generation audio native, voix `Kore` par defaut.
- Variables: `AI_TEXT_PROVIDER=deepseek`, `AI_AUDIO_PROVIDER=gemini`.

Note DeepSeek:

- Base URL OpenAI-compatible: `https://api.deepseek.com`.
- JSON output utilise `response_format: { type: "json_object" }`.
- `deepseek-chat` et `deepseek-reasoner` sont a eviter car leur deprecation est annoncee pour le 24 juillet 2026 a 15:59 UTC.

Fallback OpenAI conserve:

- STT: `gpt-4o-mini-transcribe`, bon compromis cout/latence pour de courts tours audio.
- LLM: `gpt-5.4-mini`, assez rapide pour jouer un client et analyser une transcription sans exploser les couts.
- TTS: `gpt-4o-mini-tts`, adapte aux applications vocales avec controle du ton.

Version avancee:

- Gemini Live API ou OpenAI Realtime via WebRTC pour supprimer les allers-retours HTTP audio.
- Les interfaces `SpeechToTextService`, `ConversationEngine` et `TextToSpeechService` restent la frontiere de remplacement.

Sources verifiees le 20 juin 2026: docs officielles DeepSeek pour quick start, pricing, thinking mode et JSON output; docs officielles Google Gemini pour audio understanding, speech generation et modeles; docs officielles OpenAI conservees pour le fallback.

## VPS

Proposition:

- Repertoire: `/var/www/simuvente-ia`
- Port applicatif: `3008`
- Nom PM2: `simuvente-ia`
- Nginx: `/etc/nginx/conf.d/simuvente-ia.conf`
- Base: Postgres sur le VPS, exposee localement a l'app via `DATABASE_URL`.

Commandes types:

```bash
npm ci
npm run build
PORT=3008 pm2 start npm --name simuvente-ia -- start
```

Le MVP actuel fonctionne aussi sans cles DeepSeek/Gemini: il utilise des reponses deterministes pour pouvoir tester l'UX.

## Developpement local macOS

Si Node refuse les appels HTTPS avec `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`,
le script `npm run dev` charge le bundle systeme via:

```bash
NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem
```

Ne pas utiliser `NODE_TLS_REJECT_UNAUTHORIZED=0`: cela desactive la verification TLS.
