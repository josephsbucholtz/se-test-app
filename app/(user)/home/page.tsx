"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const snippet = {
    title: "Binary Tree Level Order Traversal",
    pattern: "BFS",
    code: `from collections import deque

def level_order(root):
    if not root:
        return []

    queue = deque([root])
    result = []

    while queue:
        node = queue.popleft()

    return result`,
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);

  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRef = useRef<HTMLDivElement>(null);

  // Listen for keystrokes
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      e.preventDefault();

      if (e.key === "Backspace") {
        setTyped((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === "Tab") {
        setTyped((prev) => [...prev, " ", " ", " ", " "]);
        setCurrentIndex((prev) => Math.min(prev + 4, snippet.code.length));
        return;
      }

      if (!(e.key.length === 1 || e.key === "Enter")) return;

      const key = e.key === "Enter" ? "\n" : e.key;

      setTyped((prev) => [...prev, key]);

      setCurrentIndex((prev) => Math.min(prev + 1, snippet.code.length - 1));
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [snippet.code.length]);

  useEffect(() => {
    const active = charRefs.current[currentIndex];
    const caret = caretRef.current;

    if (!active || !caret) return;

    const rect = active.getBoundingClientRect();
    const parentRect = active.parentElement!.getBoundingClientRect();

    caret.style.left = `${rect.left - parentRect.left}px`;
    caret.style.top = `${rect.top - parentRect.top}px`;
    caret.style.height = `${rect.height}px`;
  }, [currentIndex]);

  return (
    <main className="px-4 py-2">
      <h1 className="text-3xl font-bold">{snippet.title}</h1>
      <p className="text-muted-foreground">{snippet.pattern}</p>

      <div className="mt-10 flex justify-center">
        <div className="relative">
          {/* Caret */}
          <div
            ref={caretRef}
            className="absolute w-[2px] bg-yellow-400 transition-all duration-75"
          />

          <pre className="whitespace-pre-wrap font-mono text-xl leading-9">
            {snippet.code.split("").map((char, index) => (
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
      </div>
    </main>
  );
}
