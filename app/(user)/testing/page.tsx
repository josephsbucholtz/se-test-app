"use server"

import { getProblem, getRandomProblem } from "./actions";
import TestingClient from "./testing-client";

export default async function Testing() {
  const problem = await getProblem();

  const randomProblem = await getRandomProblem();
  if (!randomProblem) {
    return (
      <div>
        <h1 className="text-6xl absolute items-center text-center top-1/2 right-1/2">
          Error: Issue with loading next problem. Please try again.
        </h1>
      </div>
    );
  }

  return (
    <TestingClient problem={randomProblem} />
  );
}
