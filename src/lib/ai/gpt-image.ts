/**
 * OpenAI GPT-Image-1.5 API Client Wrapper
 */

import { TRYON_PROMPT } from "@/lib/prompts";

interface OpenAiImageData {
  b64_json?: string;
}

interface OpenAiImageResponse {
  data?: OpenAiImageData[];
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface GptOnlyTryOnRequest {
  userImage: ArrayBuffer;
  garmentImage: ArrayBuffer;
  orientation?: "portrait" | "landscape" | "square";
}

export async function tryOnWithGptImageOnly(req: GptOnlyTryOnRequest): Promise<string> {
  if (!OPENAI_API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=60";
  }

  const userBlob = new Blob([req.userImage], { type: "image/jpeg" });
  const garmentBlob = new Blob([req.garmentImage], { type: "image/jpeg" });

  const sizeMap = {
    portrait: "1024x1536",
    landscape: "1536x1024",
    square: "1024x1024",
  } as const;
  const size = sizeMap[req.orientation ?? "portrait"];

  const formData = new FormData();
  formData.append("image[]", userBlob, "user.jpg");
  formData.append("image[]", garmentBlob, "garment.jpg");
  formData.append("prompt", TRYON_PROMPT);
  formData.append("model", "gpt-image-1.5");
  formData.append("n", "1");
  formData.append("size", size);
  formData.append("quality", "high");
  formData.append("output_format", "jpeg");
  formData.append("input_fidelity", "high");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} ${errText}`);
  }

  const data = await response.json() as OpenAiImageResponse;
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI API did not return b64_json image data.");

  return `data:image/jpeg;base64,${b64}`;
}
