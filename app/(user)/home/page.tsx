"use server";

import { getSnippet } from "./actions";
import HomeClient from "./home-client";

export default async function Home() {
  const snippet = await getSnippet();

  return (
    <HomeClient snippet={snippet!}/>
  );
}
