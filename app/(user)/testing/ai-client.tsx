"use client";

import { useEffect, useState } from "react";

interface ProblemContext {
  title: string | null;
  description: string | null;
  constraints?: string | null;
  starter_code?: string | null;
}

interface AIClientProps {
  problem: ProblemContext;
  answer: string;
  onGraded?: () => void;
}

interface GradeResult {
  score: number;
  passed: boolean;
  feedback: string;
}

export default function AIClient({ problem, answer, onGraded }: AIClientProps) {
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  // Locks grading after the first successful submission for this problem.
  // Resetting this component (e.g. by changing its `key`) is the only way
  // to unlock it, which happens automatically when a new problem loads.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Cancel confirmation if the user edits their answer.
  useEffect(() => {
    setIsConfirming(false);
  }, [answer]);

  // Cancel confirmation after 5 seconds.
  useEffect(() => {
    if (!isConfirming) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsConfirming(false);
    }, 5_000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isConfirming]);

  async function gradeAnswer() {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setError("Enter your pseudocode before requesting a grade.");
      setResult(null);
      setIsConfirming(false);
      return;
    }

    setIsGrading(true);
    setIsConfirming(false);
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
      setHasSubmitted(true);
      onGraded?.();
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

  function handleGradeClick() {
    if (isGrading || !answer.trim() || hasSubmitted) {
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      setError("");
      return;
    }

    void gradeAnswer();
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleGradeClick}
        disabled={isGrading || !answer.trim() || hasSubmitted}
        aria-describedby={isConfirming ? "grade-confirmation" : undefined}
        className={`inline-flex items-center gap-2 rounded-md border border-border bg-background text-sm font-medium transition-all duration-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 ${
          isConfirming ? "px-5 py-3 shadow-sm" : "px-3 py-2"
        }`}
      >
        {isGrading ? (
          <>
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
            />
            Grading...
          </>
        ) : hasSubmitted ? (
          <>Answer submitted</>
        ) : (
          <>
            Grade pseudocode

            <span className="text-xs font-normal text-muted-foreground">
              powered by Gemini
            </span>

            <span aria-hidden="true">✨</span>
          </>
        )}
      </button>

      {isConfirming && !isGrading && !hasSubmitted && (
        <p
          id="grade-confirmation"
          className="text-xs font-medium text-muted-foreground"
        >
          Click again to confirm
        </p>
      )}

      {hasSubmitted && !isGrading && (
        <p className="text-xs text-muted-foreground">
          You&apos;ve already submitted an answer for this problem. Get the next problem to try another.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {result && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-lg font-semibold">{result.score}/5</span>

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