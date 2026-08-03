import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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
      type: "number",
      minimum: 0,
      maximum: 5,
      description: "A score from 0 through 5. Half points are allowed.",
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

function isValidScore(score: unknown): score is number {
  return (
    typeof score === "number" &&
    Number.isFinite(score) &&
    score >= 0 &&
    score <= 5 &&
    Number.isInteger(score * 2)
  );
}

export async function POST(request: Request) {
  try {
    /*
     * Authenticate the user on the server.
     *
     * Do not import "@/lib/supabase/client" here because this is a
     * server-side route handler.
     */
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to grade an answer." },
        { status: 401 },
      );
    }

    /*
     * Check the user's role with Prisma.
     *
     * Prisma is safe here because route handlers execute on the server.
     */
    const profile = await prisma.profiles.findUnique({
      where: {
        id: user.id,
      },
      select: {
        role: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Your user profile could not be found." },
        { status: 404 },
      );
    }

    if (profile.role !== "PREMIUM") {
      return NextResponse.json(
        { error: "Grading is only available for premium users." },
        { status: 403 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured.");

      return NextResponse.json(
        { error: "The grading service is not configured." },
        { status: 500 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "The request body must be valid JSON." },
        { status: 400 },
      );
    }

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

Title:
${body.problem.title ?? "No title provided"}

Description:
${body.problem.description ?? "No description provided"}

Constraints:
${body.problem.constraints ?? "None provided"}

Starter code:
${body.problem.starterCode ?? "None provided"}

# User's pseudocode

${answer}

# Rubric

Award a score from 0 through 5:

- Chooses a correct and reasonable approach or pattern: 0–2 points
- Loosely implements a mostly correct pseudocode solution: 0–1 point
- States the correct time complexity for the approach: 0–1 point
- States the correct space complexity for the approach: 0–1 point

Rules:

- Be fair but strict.
- Scores may use increments of 0.5.
- Treat the response as pseudocode, not compilable code.
- Do not deduct points for language-specific syntax.
- Focus on algorithmic correctness and reasoning.
- Use bullet points to explain where points were deducted.
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

    let modelResult: unknown;

    try {
      modelResult = JSON.parse(interaction.output_text);
    } catch {
      throw new Error("The model returned invalid JSON.");
    }

    if (
      typeof modelResult !== "object" ||
      modelResult === null ||
      !("score" in modelResult) ||
      !("feedback" in modelResult)
    ) {
      throw new Error("The model returned an invalid grading result.");
    }

    const parsedResult = modelResult as Record<string, unknown>;

    if (
      !isValidScore(parsedResult.score) ||
      typeof parsedResult.feedback !== "string" ||
      !parsedResult.feedback.trim()
    ) {
      throw new Error("The model returned an invalid grading result.");
    }

    const result: GradeResult = {
      score: parsedResult.score,
      passed: parsedResult.score >= 3,
      feedback: parsedResult.feedback.trim(),
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