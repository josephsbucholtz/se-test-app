"use client";

import { useEffect, useRef, useState } from "react";
import { typing_snippets } from "@prisma/client";

import Grade from "./grade";
import {
  getRandomFilteredSnippet,
  type SnippetLanguageFilter,
  type SnippetPatternFilter,
} from "./actions";
import MinimalSelect from "./minimal-select";
import Link from "next/link";

const QUEUE_SIZE = 3;

// Add new options here as the database grows.
const LANGUAGE_OPTIONS: {
  value: SnippetLanguageFilter;
  label: string;
}[] = [
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
];

const PATTERN_OPTIONS: {
  value: SnippetPatternFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "patterns", label: "DSA" },
  { value: "Containers", label: "Containers" },
];

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

  const [language, setLanguage] = useState<SnippetLanguageFilter>("python");
  const [pattern, setPattern] = useState<SnippetPatternFilter>("all");
  const [noMatches, setNoMatches] = useState(false);

  // Whether a filter dropdown menu is currently open.
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [patternMenuOpen, setPatternMenuOpen] = useState(false);

  const snippetQueueRef = useRef<typing_snippets[]>([]);
  const isLoadingNextRef = useRef(false);
  const queueGenerationRef = useRef(0);

  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);

  async function fillQueue(
    nextLanguage: SnippetLanguageFilter,
    nextPattern: SnippetPatternFilter
  ) {
    const generation = queueGenerationRef.current;
    const queue = snippetQueueRef.current;
    const missingCount = QUEUE_SIZE - queue.length;

    if (missingCount <= 0) {
      return;
    }

    const requests = Array.from({ length: missingCount }, () =>
      getRandomFilteredSnippet(nextLanguage, nextPattern)
    );

    const snippets = await Promise.all(requests);

    /*
     * The filters changed while these requests were running.
     * Ignore the outdated results.
     */
    if (generation !== queueGenerationRef.current) {
      return;
    }

    for (const nextSnippet of snippets) {
      if (!nextSnippet) {
        continue;
      }

      /*
       * This check prevents concurrent fillQueue calls from causing the
       * queue to grow beyond QUEUE_SIZE.
       */
      if (snippetQueueRef.current.length >= QUEUE_SIZE) {
        break;
      }

      snippetQueueRef.current.push(nextSnippet);
    }
  }

  function clearQueue() {
    queueGenerationRef.current += 1;
    snippetQueueRef.current = [];
  }

  /*
   * Fill the queue when the component first mounts.
   */
  useEffect(() => {
    void fillQueue(language, pattern);
  }, []);

  function toggleLanguageMenu(open: boolean) {
    setLanguageMenuOpen(open);

    if (open) {
      setPatternMenuOpen(false);
    }
  }

  function togglePatternMenu(open: boolean) {
    setPatternMenuOpen(open);

    if (open) {
      setLanguageMenuOpen(false);
    }
  }

  /*
   * Shared by:
   *
   * - Enter after finishing
   * - Shift + Tab to skip
   * - Language filter changes
   * - Pattern filter changes
   */
  async function loadSnippetWithFilters(
    nextLanguage: SnippetLanguageFilter,
    nextPattern: SnippetPatternFilter
  ) {
    if (isLoadingNextRef.current) {
      return;
    }

    isLoadingNextRef.current = true;

    try {
      /*
       * Use a prefetched snippet first.
       */
      let next = snippetQueueRef.current.shift();

      /*
       * If the queue has not finished filling, fall back to a direct request.
       */
      if (!next) {
        next =
          (await getRandomFilteredSnippet(nextLanguage, nextPattern)) ??
          undefined;
      }

      if (!next) {
        setNoMatches(true);
        return;
      }

      setNoMatches(false);

      charRefs.current = [];

      setCurrentSnippet(next);
      setCurrentIndex(0);
      setTyped([]);
      setFinished(false);
      setStartTime(null);
      setEndTime(null);

      /*
       * Replace the item that was removed from the queue.
       *
       * This is intentionally not awaited so the user can begin typing
       * immediately while the queue refills in the background.
       */
      void fillQueue(nextLanguage, nextPattern);
    } finally {
      isLoadingNextRef.current = false;
    }
  }

  function handleLanguageChange(value: SnippetLanguageFilter) {
    setLanguage(value);
    clearQueue();

    void loadSnippetWithFilters(value, pattern);
  }

  function handlePatternChange(value: SnippetPatternFilter) {
    setPattern(value);
    clearQueue();

    void loadSnippetWithFilters(language, value);
  }

  function reset() {
    charRefs.current = [];

    setCurrentIndex(0);
    setTyped([]);
    setFinished(false);
    setStartTime(null);
    setEndTime(null);
  }

  // Listen for keystrokes.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      /*
       * Pause global keyboard handling while a filter menu is open.
       */
      if (languageMenuOpen || patternMenuOpen) {
        return;
      }

      e.preventDefault();

      if (typed.length === 0) {
        setStartTime(Date.now());
      }

      /*
       * Enter loads the next snippet after the current test is complete.
       */
      if (finished) {
        if (e.key === "Enter") {
          void loadSnippetWithFilters(language, pattern);
        }

        return;
      }

      // Reset the current test.
      if (e.key === "Escape") {
        reset();
        return;
      }

      /*
       * Shift + Tab skips the current snippet.
       *
       * The return is important. Without it, the normal Tab handler below
       * would also insert four spaces into the typed array.
       */
      if (e.key === "Tab" && e.shiftKey) {
        void loadSnippetWithFilters(language, pattern);
        return;
      }

      // Ctrl + Backspace deletes the previous word.
      if (e.key === "Backspace" && e.ctrlKey) {
        setTyped((previousTyped) => {
          const nextTyped = [...previousTyped];

          if (nextTyped.length === 0) {
            return nextTyped;
          }

          /*
           * Delete whitespace immediately before the cursor.
           */
          if (/\s/.test(nextTyped[nextTyped.length - 1])) {
            while (
              nextTyped.length > 0 &&
              /\s/.test(nextTyped[nextTyped.length - 1])
            ) {
              nextTyped.pop();
            }
          } else {
            /*
             * Otherwise, delete the previous word.
             */
            while (
              nextTyped.length > 0 &&
              !/\s/.test(nextTyped[nextTyped.length - 1])
            ) {
              nextTyped.pop();
            }
          }

          setCurrentIndex(nextTyped.length);

          return nextTyped;
        });

        return;
      }

      /*
       * Ignore other keyboard shortcuts.
       */
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (e.key === "Backspace") {
        setTyped((previousTyped) => previousTyped.slice(0, -1));
        setCurrentIndex((previousIndex) => Math.max(previousIndex - 1, 0));

        return;
      }

      /*
       * A normal Tab inserts four spaces.
       */
      if (e.key === "Tab") {
        let nextIndex = currentIndex;
        const autoTyped: string[] = [];

        while ( nextIndex < code.length && (code[nextIndex] === " " || code[nextIndex] === "\t")) {
          autoTyped.push(code[nextIndex]);
          nextIndex++;
        }

        setTyped((previousTyped) => [...previousTyped, ...autoTyped]);
        setCurrentIndex(nextIndex);

        return;
      }

      if (!(e.key.length === 1 || e.key === "Enter")) {
        return;
      }

      if (e.key === "Enter") {
        if (code[currentIndex] !== "\n") {
          return;
        }

        let nextIndex = currentIndex + 1;
        const autoTyped = ["\n"];

        while ( nextIndex < code.length && (code[nextIndex] === " " || code[nextIndex] === "\t")) {
          autoTyped.push(code[nextIndex]);
          nextIndex++;
        }

        setTyped((previousTyped) => [...previousTyped, ...autoTyped]);
        setCurrentIndex(nextIndex);

        if (nextIndex >= code.length) {
          setEndTime(Date.now());
          setFinished(true);
        }

        return;
      }

      // Normal character
      if (e.key.length !== 1) {
        return;
      }

      setTyped((previousTyped) => [...previousTyped, e.key]);

      setCurrentIndex((previousIndex) => {
        const nextIndex = previousIndex + 1;

        if (nextIndex >= code.length) {
          setEndTime(Date.now());
          setFinished(true);

          return code.length;
        }

        return nextIndex;
      });
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    code.length,
    finished,
    typed.length,
    language,
    pattern,
    languageMenuOpen,
    patternMenuOpen,
  ]);

  useEffect(() => {
    const active = charRefs.current[currentIndex];
    const caret = caretRef.current;

    if (!active || !caret) {
      return;
    }

    const rect = active.getBoundingClientRect();
    const parentRect = active.parentElement?.getBoundingClientRect();

    if (!parentRect) {
      return;
    }

    caret.style.left = `${rect.left - parentRect.left}px`;
    caret.style.top = `${rect.top - parentRect.top}px`;
    caret.style.height = `${rect.height}px`;

    // Auto-scroll when the caret nears the bottom of the viewport.
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

  const correct = typed.filter(
    (character, index) => character === code[index]
  ).length;

  const accuracy =
    typed.length === 0 ? 100 : Math.round((correct / typed.length) * 100);

  const wpm = elapsed === 0 ? 0 : ((correct / 5 / elapsed) * 60).toFixed(1);

  return (
    <main className="mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-center gap-2">
        <MinimalSelect
          label="Language"
          value={language}
          options={LANGUAGE_OPTIONS}
          open={languageMenuOpen}
          onOpenChange={toggleLanguageMenu}
          onChange={handleLanguageChange}
        />

        <span className="mt-4 text-muted-foreground/40">|</span>

        <MinimalSelect
          label="Pattern"
          value={pattern}
          options={PATTERN_OPTIONS}
          open={patternMenuOpen}
          onOpenChange={togglePatternMenu}
          onChange={handlePatternChange}
        />

        {noMatches && (
          <span className="text-xs text-destructive">
            No snippets match that combination.
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold">{currentSnippet.title}</h1>

      <p className="text-muted-foreground">{currentSnippet.pattern}</p>

      <div className="mt-10 flex items-center justify-center">
        <div className="relative">
          <div
            ref={caretRef}
            className="absolute w-[2px] bg-yellow-400 transition-all duration-75"
          />

          <pre className="whitespace-pre-wrap font-mono text-3xl leading-9">
            {code.split("").map((character, index) => (
              <span
                key={index}
                ref={(element) => {
                  charRefs.current[index] = element;
                }}
                className={
                  index >= typed.length
                    ? "text-gray-400"
                    : typed[index] === character
                    ? "text-muted-foreground"
                    : "text-red-500 underline decoration-red-500"
                }
              >
                {character}
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
        <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
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