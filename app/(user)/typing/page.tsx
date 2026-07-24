"use server";

import { getRandomSnippet, getSnippet } from "./actions";
import HomeClient from "./typing-client";

export default async function Typing() {
  const snippet = await getRandomSnippet();
  //Get Topological Sort
  const setsnippet = await getSnippet(17);

  return (
    <HomeClient snippet={snippet}/>
  );
}
