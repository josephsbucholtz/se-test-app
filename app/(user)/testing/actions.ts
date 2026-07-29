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