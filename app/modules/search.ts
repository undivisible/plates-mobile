import { pipeline, TextStreamer } from "@huggingface/transformers";
import { JSDOM } from "jsdom";
import { prompt } from "~/modules/talk";

interface SearchResultItem {
  kind: string;
  title: string;
  link: string;
  snippet: string;
}

interface SearchResponse {
  kind: string;
  items?: SearchResultItem[];
}

async function getFirstTenSearchResults(apiKey: string, searchEngineId: string, query: string): Promise<string[]> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}&start=1&num=10`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: SearchResponse = await response.json();
    return data.items ? data.items.map((item) => item.link) : [];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
}

async function fetchEssentialContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const mainContent = document.querySelector("article, main, .content, #content");
    return mainContent ? mainContent.textContent || "" : "";
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return "";
  }
}

async function summarizeContent(text: string): Promise<string> {
  const generator = await pipeline("summarization", "onnx-community/granite-3.0-2b-instruct");
  const summary = await generator(text, { max_new_tokens: 512, do_sample: false } as any);
  return (summary[0] as any).summary_text;
}

async function search(query: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!apiKey || !searchEngineId) {
    throw new Error("API Key or Search Engine ID is not set in environment variables.");
  }

  const links = await getFirstTenSearchResults(apiKey, searchEngineId, query);
  const pageContents = await Promise.all(links.map(fetchEssentialContent));

  const combinedText = pageContents.join(" ");
  const summary = await summarizeContent(combinedText);
  return await finalTextGeneration(summary + " " + prompt);
}

async function finalTextGeneration(query: string): Promise<string> {
  const generator = await pipeline(
      "text-generation",
      "onnx-community/granite-3.0-2b-instruct", 
      { dtype: "q4f16", device: "webgpu" }
  );
  const finalGenerationPrompt = "Final Answer: " + query;
  const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
  });

  const output = await generator(finalGenerationPrompt, {
      max_new_tokens: 2048,
      temperature: 0.7,
      do_sample: false,
      eos_token_id: generator.tokenizer.eos_token_id,
      repetition_penalty: 1.1,
      streamer
  });
  return (output[0] as any).generated_text;
}

export { search };
