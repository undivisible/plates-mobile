import { pipeline, TextStreamer } from "@huggingface/transformers";
import { query } from "~/modules/talk";

function search() {
  
}

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX",
  { dtype: "q4f16" }
);

// Define the list of messages
interface Message {
  role: string;
  content: string;
}

const messages: Message[] = [
    {content: query, role: "user"}
];

// Create text streamer
const streamer = new TextStreamer(generator.tokenizer, {
  skip_prompt: true,
  // callback_function: (text: string) => { }, // Optional callback function
});

// Generate a response
const output = await generator(messages, { max_new_tokens: 512, do_sample: false, streamer });

// Log the generated text
// @ts-ignore
export const final = (output[0]?.generated_text?.at(-1)?.content);
