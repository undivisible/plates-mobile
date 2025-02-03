import { Observable } from '@nativescript/core';
import { pipeline } from '@huggingface/transformers';

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
        console.log('Loading Whisper model...');
        this.model = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
        console.log('Model loaded!');
    }

    async start() {
        this.audioContext = new (window.AudioContext || window.AudioContext)();
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = this.audioContext.createMediaStreamSource(this.stream);

        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        this.processor.onaudioprocess = async (event) => {
            const inputBuffer = event.inputBuffer.getChannelData(0);
            const audioArray = Array.from(inputBuffer);

            const transcription = await this.model(audioArray);
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
