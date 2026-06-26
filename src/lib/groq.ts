import { Groq } from "groq-sdk";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/HTTP_STATUS.js";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const MODEL = "openai/gpt-oss-20b";

export const askGroq = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_completion_tokens: 600,
    });

    return completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    logger.error({ err }, "Groq request failed");
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "AI service is temporarily unavailable");
  }
};
