"use client";

import { FormEvent, useMemo, useState } from "react";
import type { problems } from "@prisma/client";
import {
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type TestingClientProps = {
  problem: problems;
};

type Result = "correct" | "incorrect" | null;

function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function getAcceptedPatterns(pattern: string | null) {
  if (!pattern) return [];

  return pattern
    .split(/[,/|;]/)
    .map(normalizeAnswer)
    .filter(Boolean);
}

function getDifficultyClasses(
  difficulty: problems["difficulty"],
) {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    case "medium":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";

    case "hard":
      return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function renderInlineCode(text: string) {
  return text.split("`").map((part, index) => {
    const isCode = index % 2 === 1;

    if (!isCode) {
      return part;
    }

    return (
      <code
        key={index}
        className="mx-1 inline rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
      >
        {part}
      </code>
    );
  });
}

export default function TestingClient({
  problem,
}: TestingClientProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [attempts, setAttempts] = useState(0);

  const acceptedPatterns = useMemo(
    () => getAcceptedPatterns(problem.pattern),
    [problem.pattern],
  );

  const checkAnswer = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedAnswer = normalizeAnswer(answer);

    if (!normalizedAnswer) return;

    const isCorrect = acceptedPatterns.some(
      (pattern) =>
        normalizedAnswer === pattern ||
        normalizedAnswer.includes(pattern) ||
        pattern.includes(normalizedAnswer),
    );

    setAttempts((current) => current + 1);
    setResult(isCorrect ? "correct" : "incorrect");
  };

  const resetAnswer = () => {
    setAnswer("");
    setResult(null);
    setAttempts(0);
  };

return (
  <main className="h-screen w-full overflow-hidden bg-background text-foreground">
    <div className="grid h-full w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="min-h-0 w-full border-b border-border lg:border-b-0 lg:border-r">
        <ScrollArea className="h-full w-full">
          <div className="w-full py-6 lg:px-12 xl:px-16">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={getDifficultyClasses(problem.difficulty)}
              >
                {problem.difficulty ?? "Unknown"}
              </Badge>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              {problem.title ?? "Untitled problem"}
            </h1>

            <Separator className="my-6" />

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h2>

              <div className="whitespace-pre-wrap text-[15px] leading-7">
                {renderInlineCode(
                  problem.description ??
                    "No description has been provided for this problem.",
                )}
              </div>
            </section>

            {problem.constraints && (
              <>
                <Separator className="my-7" />

                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Constraints
                  </h2>

                  <div className="whitespace-pre-wrap text-[15px] leading-7">
                    {renderInlineCode(problem.constraints)}
                  </div>
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </section>

      <aside className="min-h-0 w-full bg-muted/20">
        <ScrollArea className="h-full w-full">
          <div className="flex min-h-full w-full flex-col">
            {problem.starter_code && (
              <section className="w-full border-b border-border px-4 py-7">
                <h2 className="mb-3 px-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Starter code
                </h2>

                <pre className="min-h-5 w-full overflow-x-auto rounded-md border border-border bg-muted/40 p-5 font-mono text-sm leading-6">
                  <code className="whitespace-pre">{problem.starter_code}</code>
                </pre>
              </section>
            )}

            <section className="w-full px-8 py-8">
              <form onSubmit={checkAnswer} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="pattern-answer"
                    className="text-sm font-medium"
                  >
                    Pattern or topic
                  </label>

                  <Input
                    id="pattern-answer"
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value);

                      if (result) {
                        setResult(null);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        resetAnswer();
                      }
                    }}
                    placeholder="e.g. sliding window"
                    autoComplete="off"
                    autoFocus
                    className="h-11 w-full bg-background"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!answer.trim()}
                >
                  Check answer
                </Button>
              </form>

              <div className="mt-6 min-h-24" aria-live="polite">
                {result === "correct" && (
                  <div className="flex gap-3 border-l-2 border-emerald-500 py-1 pl-4">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />

                    <div>
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">
                        Correct
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        This problem uses{" "}
                        <span className="font-medium text-foreground">
                          {problem.pattern}
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                )}

                {result === "incorrect" && (
                  <div className="flex gap-3 border-l-2 border-red-500 py-1 pl-4">
                    <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />

                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        Not quite
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Review the input structure, required output, and
                        repeated operations. Then try another pattern.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="mt-auto flex w-full items-center justify-between border-t border-border px-8 py-3 text-xs text-muted-foreground">
              <span>Attempts: {attempts}</span>

              <div className="flex items-center gap-3">
                <span>
                  <kbd className="font-mono">Enter</kbd> submit
                </span>

                <span>
                  <kbd className="font-mono">Esc</kbd> reset
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </div>
  </main>
);
}
