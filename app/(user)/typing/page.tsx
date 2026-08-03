"use server";

import { getRandomSnippet, getSnippet } from "./actions";
import HomeClient from "./typing-client";

export default async function Typing() {
  const snippet = await getRandomSnippet();

  return (
    <HomeClient snippet={snippet}/>
  );
}
