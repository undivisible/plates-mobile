import { Observable } from '@nativescript/core';
import { pipeline } from '@huggingface/transformers';

export let prompt: string = '';

export class Talk extends Observable {
    private audioContext!: AudioContext;
    private processor!: ScriptProcessorNode;
    private stream!: MediaStream;
    private model: any;

    constructor() {
        super();
        this.initModel();
    }

    async initModel() {
        this.model = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
    }

    async start() {
        this.audioContext = new AudioContext();
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = this.audioContext.createMediaStreamSource(this.stream);

        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        this.processor.onaudioprocess = async (event) => {
            const inputBuffer = event.inputBuffer.getChannelData(0);
            const audioArray = Array.from(inputBuffer);

            const transcription = await this.model(audioArray);
            prompt = transcription.text;
            this.notify({ eventName: 'transcription', object: this, transcription: transcription.text });
        };
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
