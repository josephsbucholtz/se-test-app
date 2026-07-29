"use client";

import { useState } from "react";

interface ProblemContext {
  title: string | null;
  description: string | null;
  constraints?: string | null;
  starter_code?: string | null;
}

interface AIClientProps {
  problem: ProblemContext;
  answer: string;
}

interface GradeResult {
  score: number;
  passed: boolean;
  feedback: string;
}

export default function AIClient({ problem, answer }: AIClientProps) {
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  async function gradeAnswer() {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setError("Enter your pseudocode before requesting a grade.");
      setResult(null);
      return;
    }

    setIsGrading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem: {
            title: problem.title,
            description: problem.description,
            constraints: problem.constraints,
            starterCode: problem.starter_code,
          },
          answer: trimmedAnswer,
        }),
      });

      const data: GradeResult | { error: string } = await response.json();

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "The answer could not be graded.",
        );
      }

      setResult(data as GradeResult);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while grading your answer.",
      );
    } finally {
      setIsGrading(false);
    }
  }

return (
  <div className="space-y-1">
    <button
      type="button"
      onClick={gradeAnswer}
      disabled={isGrading || !answer.trim()}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isGrading ? (
        <>
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Grading...
        </>
      ) : (
        <>
          Grade pseudocode
          <span className="text-xs font-normal text-muted-foreground">
            powered by Gemini
          </span>
          <span>✨</span>
        </>
      )}
    </button>

    {error && (
      <p className="text-sm text-destructive">
        {error}
      </p>
    )}

    {result && (
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-lg font-semibold">
            {result.score}/5
          </span>

          <span
            className={
              result.passed
                ? "rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400"
                : "rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400"
            }
          >
            {result.passed ? "Passed" : "Needs Work"}
          </span>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          {result.feedback}
        </p>
      </div>
    )}
  </div>
);
}
