"use server"

import { getProblem, getRandomProblem } from "./actions";
import TestingClient from "./testing-client";

export default async function Testing() {
  const problem = await getProblem();

  const randomProblem = await getRandomProblem();

  return (
    <TestingClient problem={randomProblem} />
  );
}
