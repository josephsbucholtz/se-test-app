"use server";

import { prisma } from "@/lib/prisma";
import { problems_leetcode } from "@prisma/client";

export async function getProblem() {
    const problem = await prisma.problems_leetcode.findUniqueOrThrow({
        where: {
            id: 1,
        },
    });

    return problem;
}

export async function getRandomProblem() {
    const tableLength = await prisma.problems_leetcode.count(); 
    let randomNumber = Math.floor(Math.random() * tableLength); 

    const problem = await prisma.problems_leetcode.findUniqueOrThrow({
        where: {
            id: randomNumber + 1,
        },
    });

    return problem;
}

export async function getNextRandomProblem(currentId?: bigint) {
  const result = await prisma.$queryRaw<problems_leetcode[]>`
    SELECT *
    FROM problems_leetcode
    WHERE id != ${currentId ?? -1}
    OFFSET floor(random() * (SELECT count(*) FROM problems_leetcode WHERE id != ${currentId ?? -1}))
    LIMIT 1
  `;

  if (result[0]) {
    return result[0];
  }

  // Fallback: only one row exists total (or currentId filter left nothing)
  return prisma.problems_leetcode.findFirstOrThrow();
}

export async function getRandomProblemDifficulty(diff: string) {
    const tableLength = await prisma.problems_leetcode.count(); 
    let randomNumber = Math.floor(Math.random() * tableLength); 

    const problem = await prisma.problems_leetcode.findUniqueOrThrow({
        where: {
            id: randomNumber + 1,
            difficulty: diff,
        },
        
    });

    return problem;
}