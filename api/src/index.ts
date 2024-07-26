import "dotenv-safe/config";
import Express from "express";
import passport from "passport";
import { Strategy } from "passport-discord-auth";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { DbUser, db } from "./db";
import path from "path";
import { eq } from "drizzle-orm";
import { usersTable } from "./schema";
import { sendAuthCookies } from "./createAuthTokens";
import { addTrpc } from "./appRouter";
import { __prod__ } from "./constants";

async function main() {
  await migrate(db, {
    migrationsFolder: path.join(__dirname, "../drizzle"),
  });

  const app = Express();

  if (__prod__) {
    // you need this if you have nginx or another proxy in front
    // dokku uses nginx
    app.set("trust proxy", 1);
  }

  addTrpc(app);

  app.use(passport.initialize() as any);

  passport.use(
    new Strategy(
      {
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_SECRET_ID!,
        callbackUrl: `${process.env.API_URL}/auth/discord/callback`,
        scope: ["identify"],
      },

      async (_accessToken, _refreshToken, profile, done) => {
        // 1. grab id
        const discordId = profile._json.id as string;

        // 2. db lookup
        let user = await db.query.users.findFirst({
          where: eq(usersTable.discordId, discordId),
        });

        // 3. create user if not exists
        if (!user) {
          [user] = await db
            .insert(usersTable)
            .values({
              discordId,
            })
            .returning();
        }

        // 4. return user
        done(null, user);
      }
    ) as any
  );

  app.get(
    "/auth/discord",
    passport.authenticate("discord", { session: false })
  );
  app.get(
    "/auth/discord/callback",
    passport.authenticate("discord", {
      session: false,
    }),
    (req, res) => {
      sendAuthCookies(res, req.user as DbUser);
      res.redirect(process.env.FRONTEND_URL!);
    }
  );

  app.listen(process.env.PORT || 4000, () => {
    console.log("Server started at http://localhost:4000");
  });
}

main();
