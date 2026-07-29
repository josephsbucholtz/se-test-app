import "dotenv/config";

import { prisma } from "@/lib/prisma";

async function addExponent() {
  const problems = await prisma.problems_leetcode.findMany({
    where: {
      url: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      constraints: true,
    },
  });

  console.log(`Found ${problems.length} problems.`);

  let updated = 0;
  let failed = 0;

  for (const problem of problems) {
    if (!problem.constraints) continue;

    try {
      const superscript: Record<string, string> = {
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
      };

      const newConstraint = problem.constraints.replace(
        /10([2-9])(?!\d)/g,
        (_, exp) => `10${superscript[exp]}`
      );

      await prisma.problems_leetcode.update({
        where: {
          id: problem.id,
        },
        data: {
          constraints: newConstraint,
        },
      });

      updated += 1;

      console.log(`Updated: ${problem.title ?? problem.url}`);
    } catch (error) {
      failed += 1;

      console.error(
        `Failed: ${problem.title ?? problem.url}`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log(`Finished. Updated: ${updated}, Failed: ${failed}`);
}

async function fillConstraints() {
  const problems = await prisma.problems_leetcode.findMany({
    where: {
      url: {
        not: null,
      },
    },
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
    },
  });

  console.log(`Found ${problems.length} problems.`);

  let updated = 0;
  let failed = 0;

  for (const problem of problems) {
    if (!problem.description) continue;

    try {
      console.log(`Fetching: ${problem.url}`);

      let text = problem?.description.split("Constraints:\n");
      const descriptionFix = text.at(0);

      await prisma.problems_leetcode.update({
        where: {
          id: problem.id,
        },
        data: {
          description: descriptionFix,
        },
      });

      updated += 1;

      console.log(`Updated: ${problem.title ?? problem.url}`);
    } catch (error) {
      failed += 1;

      console.error(
        `Failed: ${problem.title ?? problem.url}`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log(`Finished. Updated: ${updated}, Failed: ${failed}`);
}

async function main() {
  addExponent();
}

main()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
