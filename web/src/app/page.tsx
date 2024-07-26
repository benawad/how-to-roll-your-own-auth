"use client";

import { DoStuff } from "./DoStuff";
import { LoginButton } from "./LoginButton";
import { trpc } from "./utils/trpc";

export const runtime = "edge";

function Home() {
  const { data, error, isLoading } = trpc.me.useQuery();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {isLoading ? "Loading..." : data?.user ? <DoStuff /> : <LoginButton />}
      {error ? <div className="text-red-400">{error.message}</div> : null}
    </main>
  );
}

export default trpc.withTRPC(Home);
