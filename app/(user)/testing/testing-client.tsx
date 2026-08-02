"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import type { problems_leetcode } from "@prisma/client";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getNextRandomProblem } from "./actions";
import AIClient from "./ai-client";

type TestingClientProps = {
  problem: problems_leetcode;
};

function getDifficultyClasses(difficulty: string | null | undefined) {
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

export default function TestingClient({ problem: initialProblem }: TestingClientProps) {
  const [problem, setProblem] = useState(initialProblem);
  const [answer, setAnswer] = useState("");
  // Locked once the current answer has been graded; unlocked when a new problem loads.
  const [isLocked, setIsLocked] = useState(false);
  const [isLoadingNext, startNextTransition] = useTransition();

  function handleNextProblem() {
    startNextTransition(async () => {
      const nextProblem = await getNextRandomProblem(problem.id);
      setProblem(nextProblem);
      setAnswer("");
      setIsLocked(false);
    });
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-background text-foreground pb-16">
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

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNextProblem}
                  disabled={isLoadingNext}
                  className="ml-auto gap-1.5"
                >
                  {isLoadingNext ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
                      />
                      Loading...
                    </>
                  ) : (
                    <>
                      Next problem
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
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
                      "No description has been provided for this problem."
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
                <section className="w-full border-b border-border px-4 pt-2">
                  <pre className="w-full overflow-x-auto bg-muted/40 p-5 font-mono text-sm leading-6">
                    <code className="whitespace-pre">
                      {problem.starter_code}
                    </code>
                  </pre>
                </section>
              )}

              <section className="w-full space-y-2 px-8 py-4">
                <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    💡Before you submit: 
                  </p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>State pattern / approach (1 point)</li>
                    <li>Explain your algorithm in clear pseudocode. (2 points)</li>
                    <li>State the expected <strong>time and space complexity</strong> e.g. (O(n)). (2 points)</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="pseudocode"
                    className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Pseudocode
                  </label>

                  <textarea
                    id="pseudocode"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Write your pseudocode here..."
                    rows={14}
                    maxLength={10_000}
                    disabled={isLocked || isLoadingNext}
                    className="w-full resize-y rounded-md border border-border bg-background p-2 font-mono text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="text-right text-xs text-muted-foreground">
                    {answer.length.toLocaleString()} / 10,000 characters
                  </p>
                </div>

                <AIClient
                  key={problem.id}
                  problem={problem}
                  answer={answer}
                  onGraded={() => setIsLocked(true)}
                />
              </section>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </main>
  );
}