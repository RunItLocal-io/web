// What each model we track is for, for the /model pages. Sizes and speeds come from estimate.ts;
// this adds the facts people search for: who made it, the license, and what it's good and bad at.

import { LOCAL_MODELS, modelSlug } from "./estimate";

export type ModelInfo = {
  maker: string;
  params: string;
  released: string;
  license: string;
  context: string;
  about: string;
  goodFor: string[];
  skip: string[];
};

export const MODEL_INFO: Record<string, ModelInfo> = {
  "qwen3:4b": {
    maker: "Alibaba (Qwen)", params: "4B, dense", released: "April 2025", license: "Apache 2.0", context: "32K tokens",
    about: "The smallest Qwen3 worth running. It has the same thinking mode as its bigger siblings, so it can reason step by step when you ask, and it fits on almost anything, including laptops with no graphics card.",
    goodFor: ["Fast chat on old or low-memory machines", "Summarizing and rewriting short text", "Classifying and extracting data in scripts", "A draft model for speculative decoding"],
    skip: ["Long, careful coding work", "Facts it has to remember rather than look up"],
  },
  "qwen3:8b": {
    maker: "Alibaba (Qwen)", params: "8B, dense", released: "April 2025", license: "Apache 2.0", context: "32K tokens, 128K with YaRN",
    about: "The default first model for most people. Good enough at writing, chat and light code to be useful every day, and small enough to run fast on an 8 GB card.",
    goodFor: ["Everyday chat and writing help", "Light coding questions", "Local assistants and home automation", "Thinking mode for step-by-step answers"],
    skip: ["Big refactors across many files", "Anything where a wrong fact is costly"],
  },
  "gemma3:12b": {
    maker: "Google DeepMind", params: "12B, dense", released: "March 2025", license: "Gemma Terms of Use", context: "128K tokens",
    about: "Google's mid-size open model, and the smallest one here that reads images. Strong at writing and at languages other than English.",
    goodFor: ["Describing and asking questions about images and screenshots", "Writing and translation in many languages", "Long documents, thanks to the 128K context"],
    skip: ["Hard reasoning and math, where Qwen3 14B does better", "Projects that need a standard open-source license: Gemma has its own terms"],
  },
  "qwen3:14b": {
    maker: "Alibaba (Qwen)", params: "14B, dense", released: "April 2025", license: "Apache 2.0", context: "32K tokens, 128K with YaRN",
    about: "The point where a local model starts to feel smart. Noticeably better than 8B at reasoning and code, and it still fits a 12 GB card.",
    goodFor: ["Coding help and code review", "Reasoning through problems with thinking mode", "Tool calling and simple agents", "Best pick for 12 GB cards"],
    skip: ["Cards with 8 GB or less: it won't fit with room for context"],
  },
  "gpt-oss:20b": {
    maker: "OpenAI", params: "21B total, 3.6B active (mixture of experts)", released: "August 2025", license: "Apache 2.0", context: "128K tokens",
    about: "OpenAI's smaller open-weight model. Only a few billion parameters work on each token, so it runs far faster than its size suggests, and its reasoning is strong for a model that fits in 16 GB.",
    goodFor: ["Reasoning, with an adjustable effort level", "Tool calling and agents", "Fast answers on 16 GB cards and Macs"],
    skip: ["Image input: it is text only", "Creative writing, where it can sound flat"],
  },
  "gemma3:27b": {
    maker: "Google DeepMind", params: "27B, dense", released: "March 2025", license: "Gemma Terms of Use", context: "128K tokens",
    about: "Google's largest Gemma 3. Reads images, writes well, and handles many languages. It needs a 24 GB card to run with room for context.",
    goodFor: ["Image understanding with a smarter model", "Polished writing and translation", "Long documents"],
    skip: ["Speed: as a dense 27B it is slower than the MoE models of similar size"],
  },
  "qwen3:30b": {
    maker: "Alibaba (Qwen)", params: "30B total, 3B active (mixture of experts)", released: "April 2025", license: "Apache 2.0", context: "32K tokens, 128K with YaRN",
    about: "The best speed for its smarts on this list. It knows about as much as a 30B model but reads only 3B of weights per token, so it is fast even on older cards, if they have the memory to hold it.",
    goodFor: ["Fast, capable chat on 24 GB cards", "Coding help at small-model speed", "Running on used data-center cards like the P100"],
    skip: ["Cards under 24 GB: all 30B have to fit, even though few are used per token"],
  },
  "qwen3:32b": {
    maker: "Alibaba (Qwen)", params: "32B, dense", released: "April 2025", license: "Apache 2.0", context: "32K tokens, 128K with YaRN",
    about: "The strongest dense model that fits on one 24 GB card. Slower than the 30B MoE, but more careful on hard problems and long answers.",
    goodFor: ["Serious coding work", "Long, detailed answers and reports", "Hard reasoning with thinking mode"],
    skip: ["Slower cards: as a dense model it reads all 20 GB per token"],
  },
  "llama3.3:70b": {
    maker: "Meta", params: "70B, dense", released: "December 2024", license: "Llama 3.3 Community License", context: "128K tokens",
    about: "Meta's big open model, close to cloud models from a year or two ago. It needs about 45 GB, so two 24 GB cards or a Mac with 64 GB or more.",
    goodFor: ["General knowledge and writing quality", "Following detailed instructions", "Multilingual chat"],
    skip: ["Single consumer cards: it won't fit", "Speed on Macs, where it runs at a few tokens per second"],
  },
  "gpt-oss:120b": {
    maker: "OpenAI", params: "117B total, 5.1B active (mixture of experts)", released: "August 2025", license: "Apache 2.0", context: "128K tokens",
    about: "OpenAI's largest open-weight model. It needs about 65 GB to load, but with few active parameters it is surprisingly quick once loaded, which makes it a favorite on big-memory Macs.",
    goodFor: ["The strongest reasoning you can run at home", "Agents and tool calling", "Big-memory Macs and multi-GPU rigs"],
    skip: ["Anything under 64 GB of memory", "Image input: it is text only"],
  },
  "qwen3:235b": {
    maker: "Alibaba (Qwen)", params: "235B total, 22B active (mixture of experts)", released: "April 2025", license: "Apache 2.0", context: "32K tokens, 128K with YaRN",
    about: "The largest Qwen3. It needs about 145 GB to load, so it is a model for multi-GPU rigs and the biggest Macs, but with 22B active parameters it runs at a usable speed once it fits.",
    goodFor: ["Hard coding and reasoning on a multi-GPU rig", "Thinking mode on long problems", "A step up when gpt-oss 120B isn't enough"],
    skip: ["Anything under about 150 GB of memory", "Image input: it is text only"],
  },
  "deepseek-r1:671b": {
    maker: "DeepSeek", params: "671B total, 37B active (mixture of experts)", released: "January 2025", license: "MIT", context: "128K tokens",
    about: "The full DeepSeek R1, not one of the small distilled versions that share its name. It needs over 400 GB at 4-bit, so it takes a server-class rig, such as five 96 GB cards.",
    goodFor: ["The deepest step-by-step reasoning you can run yourself", "Math and hard coding problems", "Teams with a big multi-GPU server"],
    skip: ["Any single GPU or Mac: it won't fit", "Quick answers: it thinks at length before replying"],
  },
};

export function modelFromSlug(s: string) {
  return LOCAL_MODELS.find(m => modelSlug(m) === s.toLowerCase()) ?? null;
}
