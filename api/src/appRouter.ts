import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createContext, t } from "./trpc";
import { __prod__ } from "./constants";
import { Express } from "express";
import { doThingQuery } from "./modules/doThing";
import { meQuery } from "./modules/me";

export const appRouter = t.router({ doThing: doThingQuery, me: meQuery });

export function addTrpc(app: Express) {
  app.use(
    "/trpc",
    cors({
      maxAge: __prod__ ? 86400 : undefined,
      credentials: true,
      origin: process.env.FRONTEND_URL,
    }),
    cookieParser(),
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
}

export type AppRouter = typeof appRouter;
