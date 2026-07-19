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

export async function getRandomSnippet() {
    const dblength = await prisma.typing_snippets.count(); // Get the total number of snippets in the database
    let randomNumber = Math.floor(Math.random() * dblength); // Generate a random number between 0 and dblength - 1

    const snippet = await prisma.typing_snippets.findUniqueOrThrow({
        where: {
            id: randomNumber + 1, // Add 1 to the random number to get a valid ID (assuming IDs start from 1)
        },
    });

    return snippet;
}
