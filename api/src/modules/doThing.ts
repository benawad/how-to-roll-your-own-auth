import { protectedProcedure } from "../trpc";

export const doThingQuery = protectedProcedure.query(async ({ ctx }) => {
  console.log("The current user id is ", ctx.userId);
  return { ok: true };
});
