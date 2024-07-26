import React from "react";
import { trpc } from "./utils/trpc";

interface DoStuffProps {}

export const DoStuff: React.FC<DoStuffProps> = ({}) => {
  const { data, error, refetch } = trpc.doThing.useQuery(undefined, {
    enabled: false,
  });

  return (
    <div>
      <div>You are logged in!</div>
      <button
        onClick={() => refetch()}
        className="my-4 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
      >
        Do Thing
      </button>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : null}
      {error ? <div className="text-red-400">{error.message}</div> : null}
    </div>
  );
};
