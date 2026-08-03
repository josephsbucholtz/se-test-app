"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, typing_snippets } from "@prisma/client";

export async function getSnippet(uid: number) {
    const snippet = await prisma.typing_snippets.findUnique({
        where: {
            id: uid,
        },
    });

    return snippet;
}

export async function getRandomSnippet() {
  const result = await prisma.$queryRaw<typing_snippets[]>`
    SELECT *
    FROM typing_snippets
    OFFSET floor(random() * (SELECT count(*) FROM typing_snippets))
    LIMIT 1
  `;

  if (!result[0]) {
    throw new Error("No snippet found");
  }

  return result[0];
}

// "all" means "don't filter on this column".
export type SnippetLanguageFilter = "python" | "cpp";
export type SnippetPatternFilter = "all" | "patterns" | "Containers";
 
/**
 * Returns one random snippet matching both filters (AND'd together).
 * Passing "all" for either filter skips that condition entirely, so
 * language="all" + pattern="containers" returns any language's
 * container snippets, and language="python" + pattern="all" returns
 * any Python snippet.
 */
export async function getRandomFilteredSnippet(
  language: SnippetLanguageFilter = "python",
  pattern: SnippetPatternFilter = "all",
) {
  const where: Prisma.typing_snippetsWhereInput = {};
 
  where.language = language;

  if (pattern !== "all") {
    where.pattern = pattern;
  } 
  if (pattern === "patterns") {
    where.pattern = {
      not: "Containers",
    };
  }
 
  const matchCount = await prisma.typing_snippets.count({ where });
 
  if (matchCount === 0) {
    return null;
  }
 
  const randomOffset = Math.floor(Math.random() * matchCount);
 
  const [snippet] = await prisma.typing_snippets.findMany({
    where,
    skip: randomOffset,
    take: 1,
  });
 
  return snippet ?? null;
}
