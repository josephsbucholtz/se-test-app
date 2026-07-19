"use server";

import { getRandomSnippet, getSnippet } from "./actions";
import HomeClient from "./home-client";

export default async function Home() {
  const snippet = await getRandomSnippet();

  return (
    <HomeClient snippet={snippet!}/>
  );
}
