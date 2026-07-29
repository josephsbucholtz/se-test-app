"use client";

import { useEffect, useRef, useState } from "react";
import { typing_snippets } from "@prisma/client";
import Grade from "./grade";
import { getRandomSnippet } from "./actions";

export default function TypingClient({
  snippet,
}: {
  snippet: typing_snippets;
}) {
  const [currentSnippet, setCurrentSnippet] = useState(snippet);
  const code = currentSnippet.code || "";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);

  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);

  async function loadNextSnippet() {
    if (loadingNext) return;

    setLoadingNext(true);

    try {
      const next = await getRandomSnippet();

      charRefs.current = [];

      setCurrentSnippet(next);
      setCurrentIndex(0);
      setTyped([]);
      setFinished(false);
      setStartTime(null);
      setEndTime(null);
    } finally {
      setLoadingNext(false);
    }
  }

  function reset() {
    charRefs.current = [];
    setCurrentIndex(0);
    setTyped([]);
    setFinished(false);
    setStartTime(null);
    setEndTime(null);
  }

  // Listen for keystrokes
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault();

      if (typed.length === 0) {
        setStartTime(Date.now());
      }

      if (finished) {
        if (e.key === "Enter") {
          loadNextSnippet();
        }

        return;
      }

      // RESET ON ESCAPE FOR THE TIME BEING
      if (e.key === "Escape") {
        reset();
        return;
      }

      //Shift + Tab to skip this snippet
      if (e.key === "Tab" && e.shiftKey) {
        loadNextSnippet();
      }

      //Backspace + Ctrl to delete previous word
      if (e.key === "Backspace" && e.ctrlKey) {
        setTyped((prev) => {
          const next = [...prev];

          if (next.length === 0) return next;

          if (/\s/.test(next[next.length - 1])) {
            while (next.length > 0 && /\s/.test(next[next.length - 1])) {
              next.pop();
            }
          } else {
            // Otherwise delete the previous word.
            while (next.length > 0 && !/\s/.test(next[next.length - 1])) {
              next.pop();
            }
          }

          setCurrentIndex(next.length);

          return next;
        });

        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        setTyped((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === "Tab") {
        setTyped((prev) => [...prev, " ", " ", " ", " "]);
        setCurrentIndex((prev) => Math.min(prev + 4, code.length));
        return;
      }

      if (!(e.key.length === 1 || e.key === "Enter")) return;

      const key = e.key === "Enter" ? "\n" : e.key;

      setTyped((prev) => [...prev, key]);

      setCurrentIndex((prev) => {
        const next = prev + 1;

        if (next >= code.length) {
          setEndTime(Date.now());
          setFinished(true);
          return code.length;
        }

        return next;
      });
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code.length, finished, typed.length, loadingNext]);

  useEffect(() => {
    const active = charRefs.current[currentIndex];
    const caret = caretRef.current;

    if (!active || !caret) return;

    const rect = active.getBoundingClientRect();
    const parentRect = active.parentElement!.getBoundingClientRect();

    caret.style.left = `${rect.left - parentRect.left}px`;
    caret.style.top = `${rect.top - parentRect.top}px`;
    caret.style.height = `${rect.height}px`;

    // Auto-scroll when the caret nears the bottom of the viewport
    const buffer = 300;
    const viewportHeight = window.innerHeight;

    if (rect.bottom > viewportHeight - buffer) {
      window.scrollBy({
        top: rect.bottom - (viewportHeight - buffer * 2),
        behavior: "smooth",
      });
    } else if (rect.top < buffer) {
      window.scrollBy({
        top: rect.top - buffer,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  const elapsed = startTime && endTime ? (endTime - startTime) / 1000 : 0;

  const correct = typed.filter((c, i) => c === code[i]).length;

  const accuracy =
    typed.length === 0 ? 100 : Math.round((correct / typed.length) * 100);

  const wpm = elapsed === 0 ? 0 : ((correct / 5 / elapsed) * 60).toFixed(1);

return (
  <main className="mx-auto max-w-4xl py-8">
    <h1 className="text-3xl font-bold">{currentSnippet.title}</h1>
    <p className="text-muted-foreground">{currentSnippet.pattern}</p>

    <div className="mt-10 flex justify-center items-center">
      <div className="relative">
        {/* Caret */}
        <div
          ref={caretRef}
          className="absolute w-[2px] bg-yellow-400 transition-all duration-75"
        />

        <pre className="whitespace-pre-wrap font-mono text-3xl leading-9">
          {code.split("").map((char, index) => (
            <span
              key={index}
              ref={(el) => {
                charRefs.current[index] = el;
              }}
              className={
                index >= typed.length
                  ? "text-gray-400"
                  : typed[index] === char
                  ? "text-muted-foreground"
                  : "text-red-500 underline decoration-red-500"
              }
            >
              {char}
            </span>
          ))}
        </pre>
      </div>
      {finished && (
        <Grade
          wpm={wpm.toString()}
          accuracy={accuracy}
          time={elapsed.toFixed(2)}
        />
      )}
    </div>
    <div className="fixed right-12 top-1/3 hidden -translate-y-1/2 opacity-60 transition-opacity hover:opacity-100 lg:block">
      <h2 className="text-center mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        Shortcuts
      </h2>

      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <kbd className="rounded border px-2 py-1 text-xs">Shift</kbd>
            <span>+</span>
            <kbd className="rounded border px-2 py-1 text-xs">Tab</kbd>
          </div>

          <span className="text-left">Next snippet</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <kbd className="rounded border px-2 py-1 text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="rounded border px-2 py-1 text-xs">Backspace</kbd>
          </div>

          <span>Delete previous word</span>
        </div>

        <div className="flex items-center gap-3">
          <kbd className="rounded border px-2 py-1 text-xs">Esc</kbd>

          <span>Reset test</span>
        </div>
      </div>
    </div>
  </main>
);
}
