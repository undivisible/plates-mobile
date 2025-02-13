import { pipeline } from "@huggingface/transformers";
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
  const generator = await pipeline("summarization", "onnx-community/T5");
  const summary = await generator(text, { max_new_tokens: 512, do_sample: false });
  return summary[0].summary_text;
}

async function search(query: string): Promise<string> {
  const apiKey = "AIzaSyAhhqXAR-v2gJJorP6xKBywS6g0ia5L6V0";
  const searchEngineId = "31e96f50d042941f0";

  const links = await getFirstTenSearchResults(apiKey, searchEngineId, query);
  const pageContents = await Promise.all(links.map(fetchEssentialContent));

  const combinedText = pageContents.join(" ").slice(0, 5000);
  const summary = await summarizeContent(combinedText);
  return const final = await finalTextGeneration(summary + "&nbsp" + prompt);
}

async function finalTextGeneration(query: string): Promise<string> {
  const generator = await pipeline(
    "text-generation",
    "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX",
    { dtype: "quantized" },
  );

  const messages = [
    { role: "user", content: query},
  ];

  const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
  })

  const output = await generator(messages, { max_new_tokens: 512, do_sample: false, streamer });
  return output[0].generated_text.at(-1).content;
}


