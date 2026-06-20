"use client";

import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  CircleStop,
  Mic,
  Play,
  Volume2,
  RotateCcw,
  Send,
  Sparkles,
  Trophy
} from "lucide-react";
import type { ReactNode } from "react";
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  BrowserMediaRecorderProvider,
  BrowserSpeechRecognitionProvider,
  canUseMediaRecorder,
  canUseSpeechRecognition,
  type VoiceInputProvider
} from "@/lib/services/voice-input-provider";
import { scenarios } from "@/lib/scenarios";
import type { FinalReport, Scenario, TrainingSession, TranscriptTurn } from "@/lib/types";
import { cx } from "@/lib/utils";

type Step = "setup" | "simulation" | "report";
type Status = "idle" | "recording" | "client" | "analysis";

export default function Home() {
  const [step, setStep] = useState<Step>("setup");
  const [pseudo, setPseudo] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0].id);
  const [difficulty, setDifficulty] = useState("all");
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState("");
  const recorderRef = useRef<VoiceInputProvider | null>(null);

  const filteredScenarios = useMemo(() => {
    return difficulty === "all"
      ? scenarios
      : scenarios.filter((scenario) => scenario.difficulty === difficulty);
  }, [difficulty]);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];

  async function startSession() {
    setError("");

    if (pseudo.trim().length < 2) {
      setError("Choisis un pseudo de 2 caracteres minimum.");
      return;
    }

    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pseudo: pseudo.trim(),
        scenarioId: selectedScenarioId
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
      ? new BrowserMediaRecorderProvider()
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
    await sendTurn(result?.audio ?? null, result?.text ?? "");
  }

  async function submitText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = textInput.trim();

    if (!text) {
      return;
    }

    setTextInput("");
    setStatus("client");
    await sendTurn(null, text);
  }

  async function sendTurn(audio: Blob | null, text: string) {
    if (!session) {
      return;
    }

    const formData = new FormData();
    if (audio) {
      formData.append("audio", audio, "seller.webm");
    }
    if (text) {
      formData.append("text", text);
    }

    const response = await fetch(`/api/sessions/${session.id}/turn`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setStatus("idle");
      setError("Le tour n'a pas pu etre traite.");
      return;
    }

    const data = (await response.json()) as {
      session: TrainingSession;
      clientTurn?: TranscriptTurn;
    };
    setSession(data.session);
    playClientVoice(data.clientTurn ?? data.session.transcript.at(-1));
    setStatus("idle");
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
    };
    setReport(data.report);
    setSession(data.session);
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
    setSession(data.session);
    setReport(null);
    setStep("simulation");
  }

  return (
    <main className="noise min-h-svh p-0 text-ink md:py-6">
      <div className="phone-shell bg-paper">
        <AppTopBar
          step={step}
          pseudo={pseudo}
          onBack={step === "setup" ? undefined : () => setStep("setup")}
        />

        {step === "setup" && (
          <SetupScreen
            pseudo={pseudo}
            setPseudo={setPseudo}
            selectedScenarioId={selectedScenarioId}
            setSelectedScenarioId={setSelectedScenarioId}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            scenarios={filteredScenarios}
            selectedScenario={selectedScenario}
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
            textInput={textInput}
            setTextInput={setTextInput}
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
            onReplay={replayMoment}
            onNew={() => {
              setSession(null);
              setReport(null);
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
  onBack
}: {
  step: Step;
  pseudo: string;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-paper/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
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
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-forest">
            SimuVente IA
          </p>
          <h1 className="text-base font-black leading-tight">
            {step === "setup" ? "Entrainement vocal" : pseudo || "Session"}
          </h1>
        </div>
      </div>
      <div className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
        Mobile
      </div>
    </header>
  );
}

function SetupScreen({
  pseudo,
  setPseudo,
  selectedScenarioId,
  setSelectedScenarioId,
  difficulty,
  setDifficulty,
  scenarios,
  selectedScenario,
  error,
  onStart
}: {
  pseudo: string;
  setPseudo: (value: string) => void;
  selectedScenarioId: string;
  setSelectedScenarioId: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  scenarios: Scenario[];
  selectedScenario: Scenario;
  error: string;
  onStart: () => void;
}) {
  return (
    <section className="space-y-5 px-4 pb-7 pt-5">
      <div className="rounded-lg bg-ink p-5 text-white shadow-soft">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-citron">
              Prochaine session
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight">
              Client reel, feedback direct
            </h2>
          </div>
          <Sparkles className="shrink-0 text-citron" size={30} />
        </div>

        <label className="block text-sm font-bold text-white/80" htmlFor="pseudo">
          Pseudo anonyme
        </label>
        <input
          id="pseudo"
          value={pseudo}
          maxLength={24}
          onChange={(event) => setPseudo(event.target.value)}
          placeholder="ex: Nova42"
          className="mt-2 h-12 w-full rounded-md border border-white/15 bg-white px-4 text-base font-bold text-ink outline-none ring-citron focus:ring-4"
        />
      </div>

      <SegmentedControl
        value={difficulty}
        onChange={setDifficulty}
        options={[
          ["all", "Tous"],
          ["beginner", "Debutant"],
          ["intermediate", "Confirme"],
          ["advanced", "Expert"]
        ]}
      />

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
                  {scenario.department}
                </p>
                <h3 className="mt-1 text-lg font-black leading-snug">
                  {scenario.title}
                </h3>
                <p className="mt-2 text-sm leading-5 text-black/65">
                  {scenario.clientPersona}
                </p>
              </div>
              <ChevronRight className="mt-2 shrink-0" size={19} />
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-forest">
          Session selectionnee
        </p>
        <p className="mt-2 text-sm leading-5 text-black/70">
          Budget {selectedScenario.budget}. Objectif:{" "}
          {selectedScenario.expectedSkills.slice(0, 2).join(", ")}.
        </p>
      </div>

      {error && <p className="text-sm font-bold text-tomato">{error}</p>}

      <button
        className="flex h-14 w-full items-center justify-center gap-3 rounded-md bg-tomato px-5 text-base font-black text-white shadow-soft active:scale-[0.99]"
        onClick={onStart}
        type="button"
      >
        <Mic size={20} />
        Demarrer un entrainement vocal
      </button>
    </section>
  );
}

function SimulationScreen({
  session,
  scenario,
  status,
  error,
  textInput,
  setTextInput,
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
  textInput: string;
  setTextInput: (value: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitText: (event: FormEvent<HTMLFormElement>) => void;
  onSpeak: (turn?: TranscriptTurn) => void;
  onFinish: () => void;
}) {
  const clientTurn = [...session.transcript]
    .reverse()
    .find((turn) => turn.speaker === "client");
  const statusLabel =
    status === "recording"
      ? "A vous"
      : status === "client"
        ? "Le client parle"
        : status === "analysis"
          ? "Analyse"
          : "Pret";

  return (
    <section className="flex min-h-[calc(100svh-61px)] flex-col px-4 pb-5 pt-4 md:min-h-[819px]">
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
          </div>
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
        <button
          className="mt-3 flex h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-3 text-sm font-black disabled:opacity-45"
          disabled={!clientTurn}
          onClick={() => onSpeak(clientTurn)}
          type="button"
        >
          <Volume2 size={17} />
          Reecouter
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        {status === "recording" ? (
          <button
            aria-label="Arreter l'enregistrement"
            className="grid size-24 place-items-center rounded-full bg-ink text-white shadow-soft"
            onClick={onStopRecording}
            type="button"
          >
            <CircleStop size={34} />
          </button>
        ) : (
          <button
            aria-label="Parler au client"
            className="grid size-24 place-items-center rounded-full bg-tomato text-white shadow-soft disabled:opacity-55"
            disabled={status !== "idle"}
            onClick={onStartRecording}
            type="button"
          >
            <Mic size={34} />
          </button>
        )}
      </div>

      <form className="mt-4 flex gap-2" onSubmit={onSubmitText}>
        <input
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder="Ou tester en texte..."
          className="h-12 min-w-0 flex-1 rounded-md border border-black/10 bg-white px-3 text-sm font-semibold outline-none ring-forest focus:ring-4"
        />
        <button
          aria-label="Envoyer"
          className="grid h-12 w-12 place-items-center rounded-md bg-forest text-white disabled:opacity-45"
          disabled={status !== "idle"}
          type="submit"
        >
          <Send size={18} />
        </button>
      </form>

      {error && <p className="mt-3 text-sm font-bold text-tomato">{error}</p>}

      <Transcript turns={session.transcript} />

      <button
        className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-4 text-sm font-black disabled:opacity-50"
        disabled={status !== "idle" || session.transcript.length < 4}
        onClick={onFinish}
        type="button"
      >
        <BarChart3 size={18} />
        Terminer et analyser
      </button>
    </section>
  );
}

function Transcript({ turns }: { turns: TranscriptTurn[] }) {
  return (
    <div className="my-5 max-h-52 overflow-y-auto rounded-lg border border-black/10 bg-white/70 p-3">
      <div className="space-y-3">
        {turns.map((turn) => (
          <p
            key={turn.id}
            className={cx(
              "text-sm leading-5",
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
  onReplay,
  onNew
}: {
  report: FinalReport;
  onReplay: (turnIndex: number) => void;
  onNew: () => void;
}) {
  const skills = [
    ["Accueil", report.score.accueil, 10],
    ["Decouverte", report.score.decouverte, 15],
    ["Reformulation", report.score.reformulation, 10],
    ["Produit", report.score.argumentationProduit, 15],
    ["Services", report.score.argumentationServices, 15],
    ["Credit", report.score.financement, 10],
    ["Garantie", report.score.garantieExtension, 10],
    ["Estaly", report.score.assuranceEsthetisme, 10],
    ["Objections", report.score.objections, 15],
    ["Closing", report.score.closing, 10],
    ["Relation", report.score.relationnel, 10]
  ] as const;

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

      <ReportList
        icon={<BadgeCheck size={18} />}
        title="Bien joue"
        items={report.score.strengths}
      />
      <ReportList
        icon={<Sparkles size={18} />}
        title="Priorites"
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
          <p className="mt-3 text-sm leading-5 text-black/70">
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

      <div className="rounded-lg border border-black/10 bg-white p-4">
        <h2 className="text-base font-black">Reactivation</h2>
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

function SegmentedControl({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div className="grid grid-cols-4 rounded-lg border border-black/10 bg-white p-1">
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          className={cx(
            "h-10 rounded-md px-2 text-xs font-black",
            value === optionValue ? "bg-ink text-white" : "text-black/60"
          )}
          onClick={() => onChange(optionValue)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
