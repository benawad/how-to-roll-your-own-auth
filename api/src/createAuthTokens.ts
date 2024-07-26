import * as jwt from "jsonwebtoken";
import { DbUser, db } from "./db";
import { Response } from "express";
import { __prod__ } from "./constants";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { usersTable } from "./schema";

export type RefreshTokenData = {
  userId: string;
  refreshTokenVersion?: number;
};

export type AccessTokenData = {
  userId: string;
};

const createAuthTokens = (
  user: DbUser
): { refreshToken: string; accessToken: string } => {
  const refreshToken = jwt.sign(
    { userId: user.id, refreshTokenVersion: user.refreshTokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "30d",
    }
  );

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "15min",
    }
  );

  return { refreshToken, accessToken };
};

// __prod__ is a boolean that is true when the NODE_ENV is "production"
const cookieOpts = {
  httpOnly: true,
  secure: __prod__,
  sameSite: "lax",
  path: "/",
  domain: __prod__ ? `.${process.env.DOMAIN}` : "",
  maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
} as const;

export const sendAuthCookies = (res: Response, user: DbUser) => {
  const { accessToken, refreshToken } = createAuthTokens(user);
  res.cookie("id", accessToken, cookieOpts);
  res.cookie("rid", refreshToken, cookieOpts);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("id", cookieOpts);
  res.clearCookie("rid", cookieOpts);
};

export const checkTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  try {
    // verify
    const data = <AccessTokenData>(
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
    );

    // get userId from token data
    return {
      userId: data.userId,
    };
  } catch {
    // token is expired or signed with a different secret
    // so now check refresh token
  }

  if (!refreshToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // 1. verify refresh token
  let data;
  try {
    data = <RefreshTokenData>(
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!)
    );
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // 2. get user
  const user = await db.query.users.findFirst({
    where: eq(usersTable.id, data.userId),
  });

  // 3.check refresh token version
  if (!user || user.refreshTokenVersion !== data.refreshTokenVersion) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  await db.update(usersTable).set({
    refreshTokenVersion: sql`${usersTable.refreshTokenVersion} + 1`,
  });

  return {
    userId: data.userId,
    user,
  };
};
