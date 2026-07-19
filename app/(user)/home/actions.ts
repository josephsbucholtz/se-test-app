"use server";

import { prisma } from "@/lib/prisma";

export async function getSnippet() {
  const snippet = await prisma.typing_snippets.findUniqueOrThrow({
    where: {
      id: 7,
    },
  });

  return snippet;
}
