import { processContent } from './plates-engine';

interface TranscriptionConfig {
  apiKey?: string;
  useLocalModel?: boolean;
  language?: string;
}

export class AudioTranscription {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private transcription = '';
  private onUpdate: (text: string) => void;
  private config: TranscriptionConfig;

  constructor(
    onUpdate: (text: string) => void,
    config: TranscriptionConfig = {}
  ) {
    this.onUpdate = onUpdate;
    this.config = {
      useLocalModel: false,
      language: 'en',
      ...config
    };
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
        this.processAudio();
      };
      
      this.mediaRecorder.start(1000); // Process every second
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.mediaRecorder = null;
    }
    return this.transcription;
  }

  private async processAudio() {
    if (this.audioChunks.length === 0) return;
    
    const audioBlob = new Blob(this.audioChunks);
    this.audioChunks = [];
    
    try {
      const text = await this.transcribeAudio(audioBlob);
      this.transcription += text + ' ';
      this.onUpdate(this.transcription);
    } catch (error) {
      console.error('Transcription error:', error);
    }
  }

  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (this.config.useLocalModel) {
      return this.transcribeWithTransformers(audioBlob);
    } else {
      return this.transcribeWithAPI(audioBlob);
    }
  }

  private async transcribeWithAPI(audioBlob: Blob): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('API key required for cloud transcription');
    }
    
    // Implementation for API transcription
    // This would call a speech-to-text API like Whisper API
    return 'API transcription result';
  }

  private async transcribeWithTransformers(audioBlob: Blob): Promise<string> {
    // Implementation for local transformers.js model
    // This would use a local speech-to-text model
    return 'Local model transcription result';
  }

  async sendToPlatesEngine() {
    if (!this.transcription) return null;
    
    const processedText = await processContent(
      this.transcription,
      [] // No quotes for audio transcription
    );
    
    return processedText;
  }
}