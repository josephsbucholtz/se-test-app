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
    <section className="space-y-4 rounded-lg border border-border bg-background p-5">
      <div>
        <h2 className="text-lg font-semibold">AI pseudocode review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your pseudocode for feedback and a score out of 5.
        </p>
      </div>

      <button
        type="button"
        onClick={gradeAnswer}
        disabled={isGrading || !answer.trim()}
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGrading ? "Grading..." : "Grade pseudocode"}
      </button>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold">
              {result.score}/5
            </span>

            <span
              className={
                result.passed
                  ? "rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400"
                  : "rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-700 dark:text-red-400"
              }
            >
              {result.passed ? "Passed" : "Failed"}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Feedback</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {result.feedback}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
