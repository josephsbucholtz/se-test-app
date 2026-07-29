import "dotenv/config";

import { prisma } from "@/lib/prisma";

type LeetCodeResponse = {
  data?: {
    question?: {
      codeSnippets?: {
        lang: string;
        langSlug: string;
        code: string;
      }[];
    };
  };
  errors?: {
    message: string;
  }[];
};

function getProblemSlug(problemUrl: string) {
  const url = new URL(problemUrl);
  const match = url.pathname.match(/\/problems\/([^/]+)/);

  if (!match?.[1]) {
    throw new Error(`Invalid LeetCode URL: ${problemUrl}`);
  }

  return match[1];
}

async function getPython3StarterCode(problemUrl: string) {
  const titleSlug = getProblemSlug(problemUrl);

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: problemUrl,
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({
      operationName: "questionEditorData",
      variables: {
        titleSlug,
      },
      query: `
        query questionEditorData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            codeSnippets {
              lang
              langSlug
              code
            }
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${problemUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const result = (await response.json()) as LeetCodeResponse;

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join(", "),
    );
  }

  const snippets = result.data?.question?.codeSnippets ?? [];

  const python3 = snippets.find(
    (snippet) =>
      snippet.langSlug.toLowerCase() === "python3" ||
      snippet.lang.toLowerCase() === "python3" ||
      snippet.lang.toLowerCase() === "python 3",
  );

  if (!python3) {
    throw new Error(
      `Python 3 starter code was not found for ${problemUrl}`,
    );
  }

  return python3.code;
}

async function fillStarterCode() {
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
    },
  });

  console.log(`Found ${problems.length} problems.`);

  let updated = 0;
  let failed = 0;

  for (const problem of problems) {
    if (!problem.url) continue;

    try {
      console.log(`Fetching: ${problem.url}`);

      const starterCode = await getPython3StarterCode(problem.url);

      await prisma.problems_leetcode.update({
        where: {
          id: problem.id,
        },
        data: {
          starter_code: starterCode,
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
  await fillStarterCode();
}

main()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
