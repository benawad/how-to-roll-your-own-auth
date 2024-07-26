import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { checkTokens, sendAuthCookies } from "./createAuthTokens";
import { DbUser } from "./db";

// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res, userId: "" }); // no context
type Context = Awaited<
  ReturnType<typeof createContext> & { userId: string; maybeUser?: DbUser }
>;

export const t = initTRPC.context<Context>().create();
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.req.cookies.id && !ctx.req.cookies.rid) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { id, rid } = ctx.req.cookies;

  const { userId, user } = await checkTokens(id, rid);

  ctx.userId = userId;
  if (user) {
    sendAuthCookies(ctx.res, user);
    ctx.maybeUser = user;
  }

  return opts.next(opts);
});
