"use server";

import { prisma } from "@/lib/prisma";

export async function getSnippet(uid: number) {
    const snippet = await prisma.typing_snippets.findUnique({
        where: {
            id: uid,
        },
    });

    return snippet;
}

export async function getRandomSnippet() {
    const tableLength = await prisma.typing_snippets.count(); 
    let randomNumber = Math.floor(Math.random() * tableLength); 

    const snippet = await prisma.typing_snippets.findUniqueOrThrow({
        where: {
            id: randomNumber + 1, 
        },
    });

    return snippet;
}
