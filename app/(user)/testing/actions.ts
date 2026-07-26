"use server";

import { prisma } from "@/lib/prisma";

export async function getProblem() {
    const problem = await prisma.problems.findUnique({
        where: {
            id: 1,
        },
    });

    return problem;
}