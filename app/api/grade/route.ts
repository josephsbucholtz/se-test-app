import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

interface GradeResult {
  score: number;
  passed: boolean;
  feedback: string;
}

interface ModelGradeResult {
  score: number;
  feedback: string;
}

interface GradeRequest {
  problem: {
    title: string | null;
    description: string | null;
    constraints?: string | null;
    starterCode?: string | null;
  };
  answer: string;
}

const gradingSchema = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 5,
      description: "A score from 0 through 5.",
    },
    feedback: {
      type: "string",
      description: "Brief, constructive feedback about the pseudocode.",
    },
  },
  required: ["score", "feedback"],
  additionalProperties: false,
};

function isGradeRequest(body: unknown): body is GradeRequest {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const value = body as Record<string, unknown>;

  if (typeof value.answer !== "string") {
    return false;
  }

  if (typeof value.problem !== "object" || value.problem === null) {
    return false;
  }

  const problem = value.problem as Record<string, unknown>;

  return (
    (typeof problem.title === "string" || problem.title === null) &&
    (typeof problem.description === "string" ||
      problem.description === null) &&
    (problem.constraints === undefined ||
      typeof problem.constraints === "string" ||
      problem.constraints === null) &&
    (problem.starterCode === undefined ||
      typeof problem.starterCode === "string" ||
      problem.starterCode === null)
  );
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const body: unknown = await request.json();

    if (!isGradeRequest(body)) {
      return NextResponse.json(
        { error: "A valid problem and answer are required." },
        { status: 400 },
      );
    }

    const answer = body.answer.trim();

    if (!answer) {
      return NextResponse.json(
        { error: "Answer cannot be empty." },
        { status: 400 },
      );
    }

    if (answer.length > 10_000) {
      return NextResponse.json(
        { error: "Answer is too long." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: `
You are grading interview pseudocode for a LeetCode-style coding problem.

# Problem

Description:
${body.problem.description ?? "No description provided"}

Constraints:
${body.problem.constraints ?? "None provided"}

# User's pseudocode

${answer}

# Rubric

Award a score from 0 through 5:

- Correctly solves the problem: 0–3 points
- States correct time and space complexity for their solution: 0.5 point each
- Handles edge cases: 0–1 point

Rules:

- Be fair but strict.
- Half points are allowed.
- Treat the response as pseudocode, not compilable code.
- Do not deduct points for language-specific syntax.
- Focus on algorithmic correctness and reasoning.
-In feedback start with where points where deducted from in rubric.
- Give concise feedback explaining the most important flaws.
- Return only JSON matching the provided schema.
      `.trim(),
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: gradingSchema,
      },
    });

    if (!interaction.output_text) {
      throw new Error("The model did not return a grading result.");
    }

    const modelResult = JSON.parse(
      interaction.output_text,
    ) as ModelGradeResult;

    if (
      !Number.isInteger(modelResult.score) ||
      modelResult.score < 0 ||
      modelResult.score > 5 ||
      typeof modelResult.feedback !== "string"
    ) {
      throw new Error("The model returned an invalid grading result.");
    }

    const result: GradeResult = {
      score: modelResult.score,
      passed: modelResult.score >= 3,
      feedback: modelResult.feedback,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Pseudocode grading failed:", error);

    return NextResponse.json(
      { error: "The pseudocode could not be graded." },
      { status: 500 },
    );
  }
}