"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Mic,
  Play,
  Volume2,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Trophy,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  BrowserHybridVoiceInputProvider,
  BrowserSpeechRecognitionProvider,
  canUseMediaRecorder,
  canUseSpeechRecognition,
  type VoiceInputProvider
} from "@/lib/services/voice-input-provider";
import { scenarios } from "@/lib/scenarios";
import { buildModelDialogue, type ModelExchange } from "@/lib/model-dialogue";
import {
  maxClientTurns,
  maxSellerTurns,
  SESSION_MODE_META
} from "@/lib/session-config";
import { DIFFICULTY_META, DIFFICULTY_ORDER } from "@/lib/services/difficulty";
import type { LiveHint } from "@/lib/services/live-hint";
import type {
  ClientDifficulty,
  FinalReport,
  Scenario,
  ServiceKey,
  SessionMode,
  TrainingSession,
  TranscriptTurn
} from "@/lib/types";
import { cx } from "@/lib/utils";

type DifficultyChoice = ClientDifficulty | "auto";
type FocusChoice = ServiceKey | "auto";

type Step = "setup" | "simulation" | "report";
type Status = "idle" | "recording" | "client" | "analysis";
const FOCUS_LABELS: Record<ServiceKey, string> = {
  cpay: "Cpay",
  gld: "GLD",
  estaly: "Estaly"
};
const FOCUS_CHOICES: ServiceKey[] = ["cpay", "gld", "estaly"];
type Recommendation = {
  service: string;
  label: string;
  reason: string;
  scenarioId: string | null;
  scenarioTitle: string | null;
};

function getAudioFilename(audio: Blob) {
  if (audio.type.includes("mp4")) return "seller.m4a";
  if (audio.type.includes("ogg")) return "seller.ogg";
  if (audio.type.includes("wav")) return "seller.wav";
  return "seller.webm";
}

// L'audio client n'est jamais persiste en base, donc les sessions renvoyees par
// l'API arrivent sans audioUrl. On reattache les audios deja connus (ceux du
// state precedent + le dernier tour client) pour que la voix reste la meme a la
// reecoute, sans retomber sur la voix synthetique du navigateur.
function withClientAudio(
  session: TrainingSession,
  previous: TrainingSession | null,
  latestClientTurn?: TranscriptTurn
): TrainingSession {
  const audioById = new Map<string, string>();
  previous?.transcript.forEach((turn) => {
    if (turn.audioUrl) {
      audioById.set(turn.id, turn.audioUrl);
    }
  });
  if (latestClientTurn?.audioUrl) {
    audioById.set(latestClientTurn.id, latestClientTurn.audioUrl);
  }

  if (audioById.size === 0) {
    return session;
  }

  return {
    ...session,
    transcript: session.transcript.map((turn) => {
      const audioUrl = audioById.get(turn.id);
      return audioUrl ? { ...turn, audioUrl } : turn;
    })
  };
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("setup");
  const [pseudo, setPseudo] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0].id);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyChoice>("auto");
  const [recommendedDifficulty, setRecommendedDifficulty] =
    useState<ClientDifficulty>("neutre");
  const [selectedMode, setSelectedMode] = useState<SessionMode>("full");
  const [selectedFocus, setSelectedFocus] = useState<FocusChoice>("auto");
  const [recommendedFocus, setRecommendedFocus] = useState<ServiceKey>("cpay");

  useEffect(() => {
    fetch("/api/me")
      .then((response) => response.json())
      .then((data: { user?: { pseudo: string } | null }) => {
        if (data.user?.pseudo) {
          setPseudo(data.user.pseudo);
        } else {
          router.replace("/welcome");
        }
      })
      .catch(() => router.replace("/welcome"));
  }, [router]);

  // Boucle d'entrainement: on remonte la prochaine etape (reflexe faible) et on
  // preselectionne le scenario passe en lien profond depuis /progression.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("scenario");
    if (wanted && scenarios.some((scenario) => scenario.id === wanted)) {
      setSelectedScenarioId(wanted);
    }

    fetch("/api/progress")
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          data: {
            recommendation?: Recommendation | null;
            recommendedDifficulty?: ClientDifficulty;
          } | null
        ) => {
          if (data?.recommendation) {
            setRecommendation(data.recommendation);
            const service = data.recommendation.service;
            if (service === "cpay" || service === "gld" || service === "estaly") {
              setRecommendedFocus(service);
            }
          }
          if (data?.recommendedDifficulty)
            setRecommendedDifficulty(data.recommendedDifficulty);
        }
      )
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/welcome");
  }
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [textInput, setTextInput] = useState("");
  const [sellerDraft, setSellerDraft] = useState("");
  const [error, setError] = useState("");
  const [lastSellerText, setLastSellerText] = useState("");
  const [liveHint, setLiveHint] = useState<LiveHint>(null);
  const [clientVoiceEnabled, setClientVoiceEnabled] = useState(false);
  const [clientVoicePassword, setClientVoicePassword] = useState("");
  const [clientVoiceError, setClientVoiceError] = useState("");
  const recorderRef = useRef<VoiceInputProvider | null>(null);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];

  async function startSession() {
    setError("");
    setLastSellerText("");

    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenarioId: selectedScenarioId,
        includeAudio: clientVoiceEnabled,
        mode: selectedMode,
        ...(selectedDifficulty === "auto"
          ? {}
          : { difficulty: selectedDifficulty }),
        ...(selectedMode === "drill" && selectedFocus !== "auto"
          ? { focusService: selectedFocus }
          : {})
      })
    });

    if (!response.ok) {
      setError("Impossible de creer la session.");
      return;
    }

    const data = (await response.json()) as {
      session: TrainingSession;
      scenario: Scenario;
    };
    setSession(data.session);
    setReport(null);
    setLastSellerText("");
    setStep("simulation");
  }

  async function startRecording() {
    setError("");

    if (!canUseMediaRecorder() && !canUseSpeechRecognition()) {
      setError(
        "Parole non supportee dans ce navigateur. Utilise la saisie texte pour tester."
      );
      return;
    }

    const provider = canUseMediaRecorder()
      ? new BrowserHybridVoiceInputProvider()
      : new BrowserSpeechRecognitionProvider();
    recorderRef.current = provider;

    try {
      await provider.start();
      setStatus("recording");
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Permission micro refusee. Autorise le micro dans le navigateur ou utilise la saisie texte."
          : "Micro indisponible. Utilise la saisie texte pour tester.";
      setError(message);
    }
  }

  async function stopRecording() {
    const result = await recorderRef.current?.stop();

    if (!result?.audio && !result?.text.trim()) {
      setStatus("idle");
      setError("Je n'ai pas capte de phrase. Reessaie ou utilise la saisie texte.");
      return;
    }

    setStatus("client");
    await transcribeDraft(result?.audio ?? null, result?.text ?? "");
  }

  async function submitText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = textInput.trim();

    if (!text) {
      return;
    }

    setSellerDraft(text);
    setLastSellerText(text);
    setTextInput("");
  }

  async function transcribeDraft(audio: Blob | null, text: string) {
    if (!session) {
      return;
    }

    const formData = new FormData();
    if (audio) {
      formData.append("audio", audio, getAudioFilename(audio));
    }
    if (text) {
      formData.append("text", text);
    }

    const response = await fetch(`/api/sessions/${session.id}/transcribe`, {
      method: "POST",
      body: formData
    });

    setStatus("idle");

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        sellerText?: string;
      };
      if (data.sellerText) {
        setSellerDraft(data.sellerText);
        setLastSellerText(data.sellerText);
      }
      setError(data.error ?? "La transcription n'a pas pu etre traitee.");
      return;
    }

    const data = (await response.json()) as { sellerText: string };
    setSellerDraft(data.sellerText);
    setLastSellerText(data.sellerText);
    setError("");
  }

  async function validateSellerDraft() {
    const text = sellerDraft.trim();

    if (!text) {
      setError("Aucune phrase vendeur a valider.");
      return;
    }

    setSellerDraft("");
    setStatus("client");
    await sendTurn(null, text);
  }

  function editSellerDraft() {
    setTextInput(sellerDraft);
    setSellerDraft("");
    setError("");
  }

  async function sendTurn(audio: Blob | null, text: string) {
    if (!session) {
      return;
    }

    setLiveHint(null);
    const formData = new FormData();
    if (audio) {
      formData.append("audio", audio, getAudioFilename(audio));
    }
    if (text) {
      formData.append("text", text);
    }
    if (clientVoiceEnabled) {
      formData.append("includeAudio", "true");
    }

    const response = await fetch(`/api/sessions/${session.id}/turn`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setStatus("idle");
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        sellerText?: string;
      };
      if (data.sellerText) {
        setLastSellerText(data.sellerText);
      }
      setError(
        data.sellerText
          ? `${data.error ?? "Le tour n'a pas pu etre traite."} Phrase captee: "${data.sellerText}"`
          : data.error ?? "Le tour n'a pas pu etre traite."
      );
      return;
    }

    const data = (await response.json()) as {
      session: TrainingSession;
      sellerText: string;
      clientTurn?: TranscriptTurn;
      liveHint?: LiveHint;
      maxTurnsReached?: boolean;
    };
    setSession((prev) => withClientAudio(data.session, prev, data.clientTurn));
    setLastSellerText(data.sellerText);
    setLiveHint(data.liveHint ?? null);
    if (clientVoiceEnabled && data.clientTurn) {
      playClientVoice(data.clientTurn ?? data.session.transcript.at(-1));
    }
    if (data.maxTurnsReached || !data.clientTurn) {
      setError("Limite atteinte : termine la session pour recevoir ton feedback.");
    }
    setStatus("idle");
  }

  async function unlockClientVoice() {
    const response = await fetch("/api/client-voice/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: clientVoicePassword })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setClientVoiceError(data.error ?? "Voix client non activee.");
      return;
    }

    setClientVoiceEnabled(true);
    setClientVoicePassword("");
    setClientVoiceError("");
  }

  async function playClientVoice(turn?: TranscriptTurn) {
    if (!turn?.text) {
      return;
    }

    if (turn.audioUrl) {
      try {
        await new Audio(turn.audioUrl).play();
        return;
      } catch {
        // Fall through to on-demand synthesis.
      }
    }

    // Pas d'audio attache (ex: phrase d'ouverture generee avant le
    // deverrouillage de la voix): on synthetise a la demande cote serveur pour
    // garder la vraie voix client au lieu de la voix robotique du navigateur.
    if (clientVoiceEnabled && session) {
      try {
        const response = await fetch(`/api/sessions/${session.id}/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: turn.text })
        });
        if (response.ok) {
          const data = (await response.json()) as { audioUrl?: string };
          if (data.audioUrl) {
            await new Audio(data.audioUrl).play();
            return;
          }
        }
      } catch {
        // Fall through to browser speech synthesis.
      }
    }

    speakWithBrowserVoice(turn.text);
  }

  function speakWithBrowserVoice(text: string) {
    if (!("speechSynthesis" in window)) {
      setError("Voix indisponible dans ce navigateur.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1;
    utterance.pitch = 1;

    const voice = window.speechSynthesis
      .getVoices()
      .find((item) => item.lang.toLowerCase().startsWith("fr"));

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }

  async function finishSession() {
    if (!session) {
      return;
    }

    setStatus("analysis");
    const response = await fetch(`/api/sessions/${session.id}/report`, {
      method: "POST"
    });

    if (!response.ok) {
      setStatus("idle");
      setError("Impossible de generer le rapport.");
      return;
    }

    const data = (await response.json()) as {
      report: FinalReport;
      session: TrainingSession;
      reportId: string;
    };
    setReport(data.report);
    setSession(data.session);
    setReportId(data.reportId);
    setStep("report");
    setStatus("idle");
  }

  async function replayMoment(turnIndex: number) {
    if (!session) {
      return;
    }

    const response = await fetch(`/api/sessions/${session.id}/replay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turnIndex })
    });

    if (!response.ok) {
      setError("Impossible de rejouer ce moment.");
      return;
    }

    const data = (await response.json()) as { session: TrainingSession };
    setSession((prev) => withClientAudio(data.session, prev));
    setReport(null);
    setLastSellerText("");
    setStep("simulation");
  }

  return (
    <main className="noise min-h-svh p-0 text-ink md:py-6">
      <div className="phone-shell bg-paper">
        <AppTopBar
          step={step}
          pseudo={pseudo}
          onBack={step === "setup" ? undefined : () => setStep("setup")}
          onLogout={logout}
        />

        {step === "setup" && (
          <SetupScreen
            pseudo={pseudo}
            selectedScenarioId={selectedScenarioId}
            setSelectedScenarioId={setSelectedScenarioId}
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            recommendation={recommendation}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            recommendedDifficulty={recommendedDifficulty}
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
            selectedFocus={selectedFocus}
            setSelectedFocus={setSelectedFocus}
            recommendedFocus={recommendedFocus}
            error={error}
            onStart={startSession}
          />
        )}

        {step === "simulation" && session && (
          <SimulationScreen
            session={session}
            scenario={selectedScenario}
            status={status}
            error={error}
            lastSellerText={lastSellerText}
            liveHint={liveHint}
            sellerDraft={sellerDraft}
            setSellerDraft={setSellerDraft}
            textInput={textInput}
            setTextInput={setTextInput}
            onValidateSellerDraft={validateSellerDraft}
            onEditSellerDraft={editSellerDraft}
            clientVoiceEnabled={clientVoiceEnabled}
            clientVoicePassword={clientVoicePassword}
            clientVoiceError={clientVoiceError}
            setClientVoicePassword={setClientVoicePassword}
            onUnlockClientVoice={unlockClientVoice}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onSubmitText={submitText}
            onSpeak={playClientVoice}
            onFinish={finishSession}
          />
        )}

        {step === "report" && report && session && (
          <ReportScreen
            report={report}
            reportId={reportId}
            sessionMode={session.mode}
            focusService={session.focusService}
            scenario={
              scenarios.find((item) => item.id === session.scenarioId) ??
              selectedScenario
            }
            onReplay={replayMoment}
            onNew={() => {
              setSession(null);
              setReport(null);
              setReportId(null);
              setLastSellerText("");
              setStep("setup");
            }}
          />
        )}
      </div>
    </main>
  );
}

function AppTopBar({
  step,
  pseudo,
  onBack,
  onLogout
}: {
  step: Step;
  pseudo: string;
  onBack?: () => void;
  onLogout?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-paper/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button
            aria-label="Retour"
            className="grid size-9 place-items-center rounded-full border border-black/10 bg-white"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-forest">
            SimuVente IA
          </p>
          <h1 className="truncate text-base font-black leading-tight">
            {step === "setup" ? "Entrainement vocal" : pseudo || "Session"}
          </h1>
        </div>
      </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 sm:mt-0 sm:items-center">
        <Link
          href="/progression"
          className="flex min-h-9 flex-1 items-center justify-center rounded-md border border-black/15 bg-white px-3 text-center text-xs font-black text-ink"
        >
          Progression
        </Link>
        <Link
          href="/espace"
          className="flex min-h-9 flex-1 items-center justify-center rounded-md border border-black/15 bg-white px-3 text-center text-xs font-black text-ink"
        >
          Espace
        </Link>
        <Link
          href="/formations"
          className="flex min-h-9 flex-1 items-center justify-center rounded-md border border-black/15 bg-white px-3 text-center text-xs font-black text-ink"
        >
          Formations
        </Link>
        {onLogout && (
          <button
            onClick={onLogout}
            type="button"
            className="min-h-9 flex-1 rounded-md bg-ink px-3 text-xs font-bold text-white"
          >
            Sortir
          </button>
        )}
      </div>
    </header>
  );
}

function SetupScreen({
  pseudo,
  selectedScenarioId,
  setSelectedScenarioId,
  scenarios,
  selectedScenario,
  recommendation,
  selectedDifficulty,
  setSelectedDifficulty,
  recommendedDifficulty,
  selectedMode,
  setSelectedMode,
  selectedFocus,
  setSelectedFocus,
  recommendedFocus,
  error,
  onStart
}: {
  pseudo: string;
  selectedScenarioId: string;
  setSelectedScenarioId: (value: string) => void;
  scenarios: Scenario[];
  selectedScenario: Scenario;
  recommendation: Recommendation | null;
  selectedDifficulty: DifficultyChoice;
  setSelectedDifficulty: (value: DifficultyChoice) => void;
  recommendedDifficulty: ClientDifficulty;
  selectedMode: SessionMode;
  setSelectedMode: (value: SessionMode) => void;
  selectedFocus: FocusChoice;
  setSelectedFocus: (value: FocusChoice) => void;
  recommendedFocus: ServiceKey;
  error: string;
  onStart: () => void;
}) {
  const effectiveDifficulty =
    selectedDifficulty === "auto" ? recommendedDifficulty : selectedDifficulty;
  return (
    <section className="space-y-5 px-4 pb-7 pt-5">
      <div className="rounded-lg bg-ink p-5 text-white shadow-soft">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-citron">
              Prochaine session
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight">
              Choisis le produit vendu
            </h2>
          </div>
          <Sparkles className="shrink-0 text-citron" size={30} />
        </div>

        <p className="text-sm font-bold text-white/80">Connecte en tant que</p>
        <p className="mt-1 text-xl font-black">{pseudo || "…"}</p>
        <p className="mt-3 rounded-md bg-white/10 p-3 text-xs leading-5 text-white/75">
          Depart : le client est deja conseille, satisfait, et hesite entre 2
          ou 3 produits. Objectif : l&apos;aider a choisir puis proposer mensualites
          et protections utiles.
        </p>
        <div className="mt-3 rounded-md bg-white/10 p-3 text-xs leading-5 text-white/75">
          <p className="font-black text-white">
            Format : {maxSellerTurns(selectedMode)} questions/reponses.
          </p>
          <p>
            Tu as {maxSellerTurns(selectedMode)} prises de parole vendeur. A
            chaque tour, capte un mot du client, adapte ta reponse, puis avance
            vers le choix, le budget et les services.
          </p>
        </div>
      </div>

      {recommendation && (
        <Link
          href="/progression"
          className="block rounded-lg bg-ink p-4 text-white shadow-soft"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-citron">
              Ta prochaine etape
            </p>
            <span className="rounded-full bg-citron px-2 py-0.5 text-[0.62rem] font-black uppercase text-ink">
              {recommendation.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold leading-5 text-white/85">
            {recommendation.reason}
          </p>
          <p className="mt-2 text-xs font-bold text-white/55">
            Voir ma progression →
          </p>
        </Link>
      )}

      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => setSelectedScenarioId(scenario.id)}
            className={cx(
              "w-full rounded-lg border p-4 text-left transition",
              selectedScenarioId === scenario.id
                ? "border-ink bg-white shadow-soft"
                : "border-black/10 bg-white/65"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.08em] text-tomato">
                  Produit vendu
                </p>
                <h3 className="mt-1 text-lg font-black leading-snug">
                  {scenario.title}
                </h3>
                <p className="mt-2 text-sm leading-5 text-black/65">
                  Depart apres conseil : choix final, mensualites, Cpay et
                  protections pertinentes.
                </p>
              </div>
              <ChevronRight className="mt-2 shrink-0" size={19} />
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-cobalt/25 bg-white p-4">
        <DiscoveryBriefBody scenario={selectedScenario} />
        <div className="mt-4 rounded-md bg-paper p-3 text-xs font-bold leading-5 text-black/65">
          Reflexe attendu en 5 tours : 1 reformulation d&apos;un signal capte, 1
          lecture en mensualites, 1 proposition Cpay transparente, 1 protection
          utile reliee au risque, 1 micro-closing.
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
          Format de session
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["full", "drill"] as SessionMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSelectedMode(mode)}
              className={cx(
                "rounded-md border px-3 py-2 text-xs font-black transition",
                selectedMode === mode
                  ? "border-ink bg-ink text-white"
                  : "border-black/15 bg-white text-ink"
              )}
            >
              {SESSION_MODE_META[mode].label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-black/60">
          {SESSION_MODE_META[selectedMode].hint}
        </p>

        {selectedMode === "drill" && (
          <div className="mt-3 border-t border-black/10 pt-3">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.08em] text-forest">
              Reflexe a travailler
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedFocus("auto")}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-xs font-black transition",
                  selectedFocus === "auto"
                    ? "border-ink bg-ink text-white"
                    : "border-black/15 bg-white text-ink"
                )}
              >
                Auto · {FOCUS_LABELS[recommendedFocus]}
              </button>
              {FOCUS_CHOICES.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => setSelectedFocus(service)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-xs font-black transition",
                    selectedFocus === service
                      ? "border-ink bg-ink text-white"
                      : "border-black/15 bg-white text-ink"
                  )}
                >
                  {FOCUS_LABELS[service]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
          Difficulte du client
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedDifficulty("auto")}
            className={cx(
              "rounded-full border px-3 py-1.5 text-xs font-black transition",
              selectedDifficulty === "auto"
                ? "border-ink bg-ink text-white"
                : "border-black/15 bg-white text-ink"
            )}
          >
            Auto · {DIFFICULTY_META[recommendedDifficulty].label}
          </button>
          {DIFFICULTY_ORDER.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedDifficulty(level)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-xs font-black transition",
                selectedDifficulty === level
                  ? "border-ink bg-ink text-white"
                  : "border-black/15 bg-white text-ink"
              )}
            >
              {DIFFICULTY_META[level].label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-black/60">
          {DIFFICULTY_META[effectiveDifficulty].hint}
        </p>
      </div>

      {error && <p className="text-sm font-bold text-tomato">{error}</p>}

      <button
        className="flex h-14 w-full items-center justify-center gap-3 rounded-md bg-tomato px-5 text-base font-black text-white shadow-soft active:scale-[0.99]"
        onClick={onStart}
        type="button"
      >
        <Mic size={20} />
        Demarrer la session
      </button>
    </section>
  );
}

function SimulationScreen({
  session,
  scenario,
  status,
  error,
  lastSellerText,
  liveHint,
  sellerDraft,
  setSellerDraft,
  textInput,
  setTextInput,
  clientVoiceEnabled,
  clientVoicePassword,
  clientVoiceError,
  setClientVoicePassword,
  onUnlockClientVoice,
  onValidateSellerDraft,
  onEditSellerDraft,
  onStartRecording,
  onStopRecording,
  onSubmitText,
  onSpeak,
  onFinish
}: {
  session: TrainingSession;
  scenario: Scenario;
  status: Status;
  error: string;
  lastSellerText: string;
  liveHint: LiveHint;
  sellerDraft: string;
  setSellerDraft: (value: string) => void;
  textInput: string;
  setTextInput: (value: string) => void;
  clientVoiceEnabled: boolean;
  clientVoicePassword: string;
  clientVoiceError: string;
  setClientVoicePassword: (value: string) => void;
  onUnlockClientVoice: () => void;
  onValidateSellerDraft: () => void;
  onEditSellerDraft: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitText: (event: FormEvent<HTMLFormElement>) => void;
  onSpeak: (turn?: TranscriptTurn) => void;
  onFinish: () => void;
}) {
  const MAX_SELLER_TURNS = maxSellerTurns(session.mode ?? "full");
  const MAX_CLIENT_TURNS = maxClientTurns(session.mode ?? "full");
  const clientTurn = [...session.transcript]
    .reverse()
    .find((turn) => turn.speaker === "client");
  const sellerTurnsCount = session.transcript.filter(
    (turn) => turn.speaker === "seller"
  ).length;
  const clientTurnsCount = session.transcript.filter(
    (turn) => turn.speaker === "client"
  ).length;
  const remainingSellerTurns = Math.max(0, MAX_SELLER_TURNS - sellerTurnsCount);
  const canAnswer = remainingSellerTurns > 0;
  const hasDraft = Boolean(sellerDraft.trim());
  const statusLabel =
    status === "recording"
      ? "A vous"
      : status === "client"
        ? clientVoiceEnabled
          ? "Le client parle"
          : "Le client repond"
        : status === "analysis"
          ? "Analyse"
          : "Pret";

  return (
    <section className="flex min-h-[calc(100svh-61px)] min-w-0 flex-col overflow-x-hidden px-4 pb-5 pt-4 md:min-h-[819px]">
      <div className="rounded-lg border border-black/10 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-md bg-citron text-2xl font-black text-ink">
            {scenario.department.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
              {statusLabel}
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight">
              {scenario.title}
            </h2>
            <p className="mt-1 text-xs font-bold text-black/55">
              Vendeur {sellerTurnsCount}/{MAX_SELLER_TURNS} - Client{" "}
              {Math.min(clientTurnsCount, MAX_CLIENT_TURNS)}/{MAX_CLIENT_TURNS}
            </p>
            <span className="mt-1 flex flex-wrap gap-1">
              {session.mode === "drill" && (
                <span className="inline-block rounded-full bg-forest px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wide text-white">
                  Drill{session.focusService ? ` · ${FOCUS_LABELS[session.focusService]}` : ""}
                </span>
              )}
              {session.difficulty && (
                <span className="inline-block rounded-full bg-ink px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wide text-white">
                  Client {DIFFICULTY_META[session.difficulty].label}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-paper p-3 text-xs font-bold leading-5 text-black/65">
          {!canAnswer
            ? "Merci pour cette simulation. Tu es alle au bout de l'echange : lance maintenant l'analyse pour voir tes reussites et tes prochains reflexes."
            : remainingSellerTurns === 1
              ? "Derniere reponse avant l'analyse. Prends le temps de conclure clairement et de proposer le service attendu."
              : `Il te reste ${remainingSellerTurns} prise${
                remainingSellerTurns > 1 ? "s" : ""
              } de parole pour proposer mensualites, Cpay et protections utiles.`}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 voice-wave">
          {[18, 32, 46, 30, 20].map((height, index) => (
            <span
              key={`${height}-${index}`}
              className={cx(
                "block w-3 rounded-full",
                status === "recording" || status === "client"
                  ? "bg-tomato"
                  : "bg-black/20"
              )}
              style={{ height }}
            />
          ))}
        </div>

        <blockquote className="mt-5 rounded-md bg-paper p-4 text-lg font-bold leading-7">
          {clientTurn?.text}
        </blockquote>
        {clientVoiceEnabled ? (
          <button
            className="mt-3 flex h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-3 text-sm font-black disabled:opacity-45"
            disabled={!clientTurn}
            onClick={() => onSpeak(clientTurn)}
            type="button"
          >
            <Volume2 size={17} />
            Reecouter
          </button>
        ) : (
          <div className="mt-3 rounded-md border border-black/10 bg-white p-3">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
              Client par ecrit
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={clientVoicePassword}
                onChange={(event) => setClientVoicePassword(event.target.value)}
                placeholder="Mot de passe voix"
                type="password"
                className="h-10 min-w-0 flex-1 rounded-md border border-black/10 bg-paper px-3 text-sm font-semibold outline-none ring-forest focus:ring-4"
              />
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-xs font-black text-white"
                onClick={onUnlockClientVoice}
                type="button"
              >
                <Volume2 size={15} />
                Activer
              </button>
            </div>
            {clientVoiceError && (
              <p className="mt-2 text-xs font-bold text-tomato">
                {clientVoiceError}
              </p>
            )}
          </div>
        )}
      </div>

      {liveHint && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-citron bg-citron/15 p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-forest" />
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-forest">
              {liveHint.tone === "explicit" ? "Indice" : "A surveiller"}
            </p>
            <p className="mt-0.5 text-sm font-bold leading-5 text-ink">
              {liveHint.text}
            </p>
          </div>
        </div>
      )}

      <details className="mt-4 rounded-lg border border-cobalt/25 bg-white p-4">
        <summary className="cursor-pointer list-none text-xs font-black uppercase tracking-[0.08em] text-cobalt">
          Fiche client (rappel des signaux)
        </summary>
        <div className="mt-3">
          <DiscoveryBriefBody scenario={scenario} showTitle={false} />
        </div>
      </details>

      <div className="mt-4 rounded-lg border border-black/10 bg-white p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex h-14 items-center justify-center gap-2 rounded-md bg-tomato px-3 text-sm font-black text-white shadow-soft disabled:opacity-45"
            disabled={status !== "idle" || !canAnswer || hasDraft}
            onClick={onStartRecording}
            type="button"
          >
            <Mic size={20} />
            Parler
          </button>
          <button
            className="flex h-14 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-black text-white shadow-soft disabled:opacity-45"
            disabled={status !== "recording"}
            onClick={onStopRecording}
            type="button"
          >
            <Square size={17} />
            Stop
          </button>
        </div>
        <p className="mt-3 text-center text-xs font-bold leading-5 text-black/60">
          Appuie sur Parler, donne ta reponse complete, puis appuie sur Stop.
          Tu pourras verifier et modifier la phrase captee avant de l&apos;envoyer.
        </p>
      </div>

      <form className="mt-4 flex gap-2" onSubmit={onSubmitText}>
        <input
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder={
            canAnswer
              ? "Ou tester en texte..."
              : `Session limitee a ${MAX_SELLER_TURNS} reponses`
          }
          disabled={!canAnswer || status !== "idle" || hasDraft}
          className="h-12 min-w-0 flex-1 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-forest focus:ring-4"
        />
        <button
          aria-label="Envoyer"
          className="grid h-12 w-12 place-items-center rounded-md bg-forest text-white disabled:opacity-45"
          disabled={status !== "idle" || !canAnswer || hasDraft}
          type="submit"
        >
          <Send size={18} />
        </button>
      </form>

      {error && <p className="mt-3 text-sm font-bold text-tomato">{error}</p>}

      {sellerDraft && (
        <div className="mt-3 rounded-lg border border-forest/25 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
            Verifie ta reponse avant envoi
          </p>
          <textarea
            value={sellerDraft}
            onChange={(event) => setSellerDraft(event.target.value)}
            className="mt-3 min-h-24 w-full rounded-md border border-black/10 bg-paper p-3 text-sm font-bold leading-5 text-ink outline-none ring-forest focus:ring-4"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="h-11 rounded-md border border-black/15 bg-white px-3 text-sm font-black text-ink"
              onClick={onEditSellerDraft}
              type="button"
            >
              Modifier
            </button>
            <button
              className="h-11 rounded-md bg-forest px-3 text-sm font-black text-white"
              onClick={onValidateSellerDraft}
              type="button"
            >
              Valider ma reponse
            </button>
          </div>
        </div>
      )}

      {lastSellerText && !sellerDraft && (
        <div className="mt-3 max-h-44 overflow-y-auto rounded-md border border-black/10 bg-white p-3">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
            Phrase vendeur captee
          </p>
          <p className="mt-2 break-words text-sm font-bold leading-5 text-ink">
            {lastSellerText}
          </p>
        </div>
      )}

      <Transcript turns={session.transcript} />

      <button
        className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-4 text-sm font-black disabled:opacity-50"
        disabled={status !== "idle" || sellerTurnsCount < MAX_SELLER_TURNS}
        onClick={onFinish}
        type="button"
      >
        <BarChart3 size={18} />
        {canAnswer
          ? `Encore ${remainingSellerTurns} reponse${
              remainingSellerTurns > 1 ? "s" : ""
            }`
          : `Analyser mes ${MAX_SELLER_TURNS} reponses`}
      </button>
    </section>
  );
}

const SERVICE_META: Record<string, { label: string; cls: string }> = {
  cpay: { label: "Cpay", cls: "bg-cobalt text-white" },
  gld: { label: "GLD", cls: "bg-forest text-white" },
  estaly: { label: "Estaly", cls: "bg-tomato text-white" },
  choix: { label: "Choix", cls: "bg-ink text-white" }
};

function ServiceChip({ service }: { service: string }) {
  const meta = SERVICE_META[service] ?? SERVICE_META.choix;
  return (
    <span
      className={cx(
        "shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wide",
        meta.cls
      )}
    >
      {meta.label}
    </span>
  );
}

// Fiche client: la decouverte est faite, on donne au vendeur le contexte et les
// signaux deja captes pour qu'il enchaine directement sur les bons services.
function DiscoveryBriefBody({
  scenario,
  showTitle = true
}: {
  scenario: Scenario;
  showTitle?: boolean;
}) {
  const eligible = scenario.serviceEligibility.filter((item) => item.eligible);
  const notEligible = scenario.serviceEligibility.filter((item) => !item.eligible);

  return (
    <>
      {showTitle && (
        <p className="text-xs font-black uppercase tracking-[0.08em] text-cobalt">
          Fiche client — la decouverte est faite
        </p>
      )}
      <p className={cx("text-sm leading-5 text-black/75", showTitle && "mt-2")}>
        {scenario.discoveryRecap}
      </p>

      <p className="mt-4 text-[0.7rem] font-black uppercase tracking-[0.08em] text-forest">
        Ce que le client a deja dit
      </p>
      <ul className="mt-2 space-y-2">
        {scenario.capturedSignals.map((signal) => (
          <li key={signal.clientQuote} className="rounded-md bg-paper p-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold leading-5 text-ink">
                « {signal.clientQuote} »
              </p>
              <ServiceChip service={signal.service} />
            </div>
            <p className="mt-1 text-xs leading-4 text-black/60">{signal.reading}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2">
        <div className="rounded-md bg-forest/5 p-2.5">
          <p className="text-[0.7rem] font-black uppercase tracking-[0.08em] text-forest">
            A viser
          </p>
          <p className="mt-1 text-xs leading-4 text-black/70">
            {eligible
              .map((item) => SERVICE_META[item.service]?.label ?? item.service)
              .join(" · ")}
          </p>
        </div>
        {notEligible.length > 0 && (
          <div className="rounded-md border border-tomato/30 bg-tomato/5 p-2.5">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.08em] text-tomato">
              Ne pas proposer
            </p>
            {notEligible.map((item) => (
              <p key={item.service} className="mt-1 text-xs leading-4 text-black/70">
                <span className="font-black">
                  {SERVICE_META[item.service]?.label ?? item.service}
                </span>{" "}
                — {item.reason}
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const VERDICT_META: Record<
  string,
  { label: string; cls: string; icon: typeof CheckCircle2 }
> = {
  captee: { label: "Captée", cls: "text-forest", icon: CheckCircle2 },
  bonne_abstention: {
    label: "Bonne abstention",
    cls: "text-forest",
    icon: CheckCircle2
  },
  manquee: { label: "Manquée", cls: "text-tomato", icon: XCircle },
  erreur_eligibilite: {
    label: "Erreur éligibilité",
    cls: "text-tomato",
    icon: AlertTriangle
  }
};

// Bloc de feedback DETERMINISTE: ce que le vendeur a capte/rate, calcule en code.
function DiscoveryReviewCard({
  review
}: {
  review: FinalReport["discoveryReview"];
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-black">Signaux captes / manques</h2>
        <span className="shrink-0 text-xs font-black text-black/55">
          {review.capturedCount}/{review.signals.length} captes
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {review.signals.map((signal) => (
          <li key={signal.clientQuote} className="flex items-start gap-2">
            {signal.exploited ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-forest" />
            ) : (
              <XCircle size={16} className="mt-0.5 shrink-0 text-tomato" />
            )}
            <p
              className={cx(
                "min-w-0 flex-1 break-words text-sm leading-5",
                signal.exploited ? "text-ink" : "text-black/55"
              )}
            >
              « {signal.clientQuote} »
            </p>
            <ServiceChip service={signal.service} />
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1.5 border-t border-black/10 pt-3">
        {review.services.map((service) => {
          const meta = VERDICT_META[service.verdict];
          const Icon = meta.icon;
          return (
            <div key={service.service} className="flex items-center gap-2 text-xs">
              <Icon size={14} className={cx("shrink-0", meta.cls)} />
              <span className="font-black">
                {SERVICE_META[service.service]?.label ?? service.service}
              </span>
              <span className={cx("font-bold", meta.cls)}>{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Conseils de progression: deroule possible et reflexes a renforcer.
function ModelDialogueCard({ exchanges }: { exchanges: ModelExchange[] }) {
  const missedCount = exchanges.filter((item) => item.missed).length;

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="flex items-center gap-2">
        <GraduationCap size={18} />
        <h2 className="text-base font-black">Voici mes conseils pour aller plus loin</h2>
      </div>
      <p className="mt-1 text-xs leading-4 text-black/55">
        {missedCount > 0
          ? `${missedCount} rebond${missedCount > 1 ? "s" : ""} que tu as manque${
              missedCount > 1 ? "s" : ""
            }, surligne${missedCount > 1 ? "s" : ""} ci-dessous.`
          : "Tu as suivi ce deroule : voila le modele a garder en tete."}
      </p>

      <ol className="mt-4 space-y-4">
        {exchanges.map((exchange, index) => (
          <li
            key={index}
            className={cx(
              "rounded-md border p-3",
              exchange.missed
                ? "border-tomato/40 bg-tomato/5"
                : "border-black/10 bg-paper"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.08em] text-forest">
                {exchange.note}
              </p>
              {exchange.missed && (
                <span className="rounded-full bg-tomato px-2 py-0.5 text-[0.6rem] font-black uppercase text-white">
                  Rate, a rejouer
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-5 text-black/60">
              Client : « {exchange.client} »
            </p>
            <p className="mt-1 text-sm font-bold leading-5 text-ink">
              Pro : {exchange.expert}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Transcript({ turns }: { turns: TranscriptTurn[] }) {
  return (
    <div className="my-5 max-h-52 min-w-0 overflow-y-auto overflow-x-hidden rounded-lg border border-black/10 bg-white/70 p-3">
      <div className="space-y-3">
        {turns.map((turn) => (
          <p
            key={turn.id}
            className={cx(
              "break-words text-sm leading-5",
              turn.speaker === "seller" ? "text-ink" : "text-black/62"
            )}
          >
            <span className="mr-2 font-black">
              {turn.speaker === "seller" ? "Vous" : "Client"}
            </span>
            {turn.text}
          </p>
        ))}
      </div>
    </div>
  );
}

function ReportScreen({
  report,
  reportId,
  scenario,
  sessionMode,
  focusService,
  onReplay,
  onNew
}: {
  report: FinalReport;
  reportId: string | null;
  scenario: Scenario;
  sessionMode?: SessionMode;
  focusService?: ServiceKey;
  onReplay: (turnIndex: number) => void;
  onNew: () => void;
}) {
  const allSkills = [
    ["Decouverte", report.score.decouverte, 15],
    ["Mensualites & Cpay", report.score.financement, 25],
    ["GLD (garantie)", report.score.garantieExtension, 25],
    ["Estaly / pertinence", report.score.assuranceEsthetisme, 25],
    ["Objections services", report.score.objections, 5],
    ["Closing", report.score.closing, 5]
  ] as const;
  const focusedSkillIndex =
    focusService === "cpay" ? 1 : focusService === "gld" ? 2 : 3;
  const skills =
    sessionMode === "drill" && focusService
      ? [allSkills[focusedSkillIndex]]
      : allSkills;

  return (
    <section className="space-y-5 px-4 pb-7 pt-5">
      <div className="rounded-lg bg-ink p-5 text-white shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.08em] text-citron">
              Rapport final
            </p>
            <p className="mt-2 text-5xl font-black">{report.score.global}</p>
            <p className="text-sm font-bold text-white/65">score global /100</p>
          </div>
          <Trophy className="text-citron" size={48} />
        </div>
        <p className="mt-4 text-sm leading-6 text-white/80">{report.summary}</p>
      </div>

      <div className="space-y-3 rounded-lg border border-black/10 bg-white p-4">
        <h2 className="text-base font-black">Competences</h2>
        {skills.map(([label, value, max]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs font-black">
              <span>{label}</span>
              <span>
                {value}/{max}
              </span>
            </div>
            <div className="h-2 rounded-full bg-black/10">
              <div
                className="h-2 rounded-full bg-forest"
                style={{ width: `${Math.round((value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {report.discoveryReview && (
        <DiscoveryReviewCard review={report.discoveryReview} />
      )}

      <ReportList
        icon={<BadgeCheck size={18} />}
        title="Bien joue"
        items={report.score.strengths}
      />
      <ReportList
        icon={<Sparkles size={18} />}
        title="Priorites - bons reflexes"
        items={report.score.priorities.slice(0, 3)}
      />

      {report.keyMoments.map((moment) => (
        <div
          key={moment.id}
          className="rounded-lg border border-black/10 bg-white p-4"
        >
          <p className="text-xs font-black uppercase tracking-[0.08em] text-tomato">
            Moment cle
          </p>
          <p className="mt-3 text-sm font-bold text-black/60">
            Client: <q>{moment.clientQuote}</q>
          </p>
          <p className="mt-1 text-sm font-bold">
            Vous: <q>{moment.sellerQuote}</q>
          </p>
          <div className="mt-3 rounded-md border border-forest/25 bg-forest/5 p-3">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
              Bien realise
            </p>
            <p className="mt-1 text-sm leading-5 text-black/70">
              {moment.wellDone ||
                "Tu as repondu au client et maintenu l'echange."}
            </p>
          </div>
          <div className="mt-2 rounded-md border border-tomato/25 bg-tomato/5 p-3">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-tomato">
              A ameliorer
            </p>
            <p className="mt-1 text-sm leading-5 text-black/70">
              {moment.improvement || moment.issue}
            </p>
          </div>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.08em] text-forest">
            Ce qu&apos;il fallait capter / comment adapter
          </p>
          <p className="mt-2 text-sm leading-5 text-black/70">
            {moment.betterAnswer}
          </p>
          <button
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cobalt px-4 text-sm font-black text-white"
            onClick={() => onReplay(moment.turnIndex)}
            type="button"
          >
            <RotateCcw size={17} />
            Rejouer ce moment
          </button>
        </div>
      ))}

      {report.discoveryReview && (
        <ModelDialogueCard
          exchanges={buildModelDialogue(scenario, report.discoveryReview)}
        />
      )}

      <div className="rounded-lg border border-black/10 bg-white p-4">
        <h2 className="text-base font-black">A retravailler plus tard</h2>
        <p className="mt-2 text-sm leading-5 text-black/65">
          Ces rappels servent a ancrer les reflexes. Relis la consigne le jour
          indique, puis redis la phrase sans modele avant de refaire une session.
        </p>
        <div className="mt-3 space-y-3">
          {report.spacedPlan.map((item) => (
            <div key={`${item.when}-${item.task}`} className="flex gap-3">
              <span className="w-14 shrink-0 rounded-md bg-paper px-2 py-1 text-center text-xs font-black">
                {item.when}
              </span>
              <p className="text-sm font-semibold leading-5">{item.task}</p>
            </div>
          ))}
        </div>
      </div>

      {reportId && (
        <a
          href={`/api/reports/${reportId}/pdf`}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-cobalt px-4 py-4 text-sm font-black text-white"
        >
          Telecharger le PDF
        </a>
      )}

      <button
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-tomato px-4 py-4 text-sm font-black text-white"
        onClick={onNew}
        type="button"
      >
        <Play size={17} />
        Nouvel entrainement
      </button>
    </section>
  );
}

function ReportList({
  icon,
  title,
  items
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-base font-black">{title}</h2>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm font-semibold leading-5 text-black/72">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
