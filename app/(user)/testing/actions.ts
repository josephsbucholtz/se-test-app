"use server";

import { prisma } from "@/lib/prisma";

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
    const tableLength = await prisma.problems_leetcode.count();
 
    if (tableLength <= 1) {
        return prisma.problems_leetcode.findUniqueOrThrow({
            where: {
                id: BigInt(1),
            },
        });
    }
 
    let randomNumber = BigInt(Math.floor(Math.random() * tableLength) + 1);
 
    // Avoid serving the same problem twice in a row when possible.
    while (currentId !== undefined && randomNumber === currentId) {
        randomNumber = BigInt(Math.floor(Math.random() * tableLength) + 1);
    }
 
    const problem = await prisma.problems_leetcode.findUniqueOrThrow({
        where: {
            id: randomNumber,
        },
    });
 
    return problem;
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