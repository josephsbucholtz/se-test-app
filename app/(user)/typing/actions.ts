"use server";

import { prisma } from "@/lib/prisma";
import { typing_snippets } from "@prisma/client";

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
