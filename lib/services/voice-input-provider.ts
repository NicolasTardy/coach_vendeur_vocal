export type VoiceInputResult = {
  audio: Blob | null;
  text: string;
};

export type VoiceInputProvider = {
  start(): Promise<void>;
  stop(): Promise<VoiceInputResult>;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: {
    [index: number]: {
      transcript: string;
    };
  };
};

type SpeechRecognitionEventLike = Event & {
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = Event & {
  error?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  abort(): void;
  start(): void;
  stop(): void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function canUseMediaRecorder() {
  return (
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof window.MediaRecorder !== "undefined"
  );
}

export function canUseSpeechRecognition() {
  return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

export class BrowserMediaRecorderProvider implements VoiceInputProvider {
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];

  async start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    const mimeType = [
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm"
    ].find((type) => MediaRecorder.isTypeSupported(type));

    this.recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined
    );
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };
    this.recorder.start(250);
  }

  async stop() {
    if (!this.recorder) {
      return { audio: null, text: "" };
    }

    const recorder = this.recorder;
    return new Promise<VoiceInputResult>((resolve) => {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
        resolve({
          audio: new Blob(this.chunks, {
            type: recorder.mimeType || "audio/ogg"
          }),
          text: ""
        });
      };
      window.setTimeout(() => recorder.stop(), 750);
    });
  }
}

export class BrowserSpeechRecognitionProvider implements VoiceInputProvider {
  private recognition: SpeechRecognitionLike | null = null;
  private transcript = "";
  private timeoutId: number | null = null;

  async start() {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error("Speech recognition unavailable");
    }

    this.transcript = "";
    this.recognition = new SpeechRecognition();
    this.recognition.lang = "fr-FR";
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.onresult = (event) => {
      const parts: string[] = [];

      for (let index = 0; index < event.results.length; index += 1) {
        const text = event.results[index]?.[0]?.transcript;

        if (text) {
          parts.push(text);
        }
      }

      this.transcript = parts.join(" ").trim();
    };
    this.recognition.onerror = () => undefined;
    this.recognition.start();
  }

  async stop() {
    if (!this.recognition) {
      return { audio: null, text: this.transcript };
    }

    const recognition = this.recognition;

    return new Promise<VoiceInputResult>((resolve) => {
      const finish = () => {
        if (this.timeoutId) {
          window.clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }

        this.recognition = null;
        resolve({ audio: null, text: this.transcript });
      };

      recognition.onend = finish;
      recognition.onerror = finish;
      this.timeoutId = window.setTimeout(finish, 2200);

      try {
        recognition.stop();
      } catch {
        recognition.abort();
        finish();
      }
    });
  }
}
