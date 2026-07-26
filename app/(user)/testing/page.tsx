"use server"

import { getProblem } from "./actions";
import TestingClient from "./testing-client";

export default async function Testing() {
  const problem = await getProblem();

  return (
    <TestingClient problem={problem} />
  );
}
