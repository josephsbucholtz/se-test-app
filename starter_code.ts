import "dotenv/config";

import { prisma } from "@/lib/prisma";
import { getProblem } from "./app/(user)/testing/actions";


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

      let text = problem?.description.split("Constraints:\n")
      const descriptionFix = text.at(0);

      await prisma.problems_leetcode.update({
        where: {
          id: problem.id,
        },
        data: {
          description : descriptionFix,
        },
      });

      updated += 1;

      console.log(
        `Updated: ${problem.title ?? problem.url}`,
      );
    } catch (error) {
      failed += 1;

      console.error(
        `Failed: ${problem.title ?? problem.url}`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(`Finished. Updated: ${updated}, Failed: ${failed}`);
}

async function main() {
  fillConstraints();

}

main()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
