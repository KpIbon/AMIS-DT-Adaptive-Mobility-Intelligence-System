// Embedding utilities for similar-patient matching.
// Used by future pgvector integration; provided as a stub for now.

import OpenAI from "openai";

export async function embedText(
  text: string,
  apiKey = process.env.OPENAI_API_KEY,
): Promise<number[] | null> {
  if (!apiKey) return null;
  const client = new OpenAI({ apiKey });
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0]?.embedding ?? null;
}
