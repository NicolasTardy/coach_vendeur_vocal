export type VoiceInputProvider = {
  start(): Promise<void>;
  stop(): Promise<Blob | null>;
};

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
    this.recorder.start();
  }

  async stop() {
    if (!this.recorder) {
      return null;
    }

    const recorder = this.recorder;
    return new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
        resolve(
          new Blob(this.chunks, {
            type: recorder.mimeType || "audio/ogg"
          })
        );
      };
      recorder.stop();
    });
  }
}
