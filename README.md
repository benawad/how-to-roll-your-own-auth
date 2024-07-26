### How to roll your own auth

This repo is a companion to this YouTube video: https://youtu.be/CcrgG5MjGOk

1. Discord OAUTH with passport.js

```
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
```

2. JWTs

```
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
```

3. Cookies

```
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
```

### How to deploy server to VPS

Get a VPS if you don't already have one: (Hostinger)[https://hostinger.com/benawad] use code BENAWAD at checkout for additional savings (SPONSORED)

0. Save yourself some hassle and setup passwordless ssh into your VPS: https://www.hostinger.com/tutorials/how-to-setup-passwordless-ssh/
1. Install Dokku on your VPS https://dokku.com/docs/getting-started/installation/ (I like to use this for zero-downtime deployments)
   - The latest version of Ubuntu that Dokku works with is 22.04 (you can change versions in Hostinger's dashboard)
2. Create an app `dokku apps:create api`
3. Create database https://dokku.com/docs/deployment/application-deployment/?h=postgresql#create-the-backing-services
4. Link database `dokku postgres:link pg api`
5. Create Docker image on your computer `docker build -t example/auth:1 . --platform=linux`
6. Send Docker image to VPS `docker image save example/auth:1 | ssh root@123.23.21.31 docker load`
7. Tag image in your VPS `docker tag example/auth:1 dokku/api:latest`
8. Deploy `dokku deploy api latest`
   - This will fail
9. Set environment variables `dokku config:set api FRONTEND_URL=https://example.com ACCESS_TOKEN_SECRET=hj890duj01jd9012j0dj9021390132 REFRESH_TOKEN_SECRET=q90wej9201je091212903291308 DISCORD_SECRET_ID=asdj902j1d0921 DISCORD_CLIENT_ID=129032180312 DOMAIN=example.com`
   - This should redeploy the app and it should work

### Custom domain

1. Setup DNS so your domain points to the VPS
2. Setup https on your VPS using letsencrypt dokku plugin: https://github.com/dokku/dokku-letsencrypt
   - You will need to set your domain first: `dokku domains:set api api.example.com`

### VPS Security

https://www.hostinger.com/tutorials/vps-security

### Frontend deployment

I like to use (Cloudflare pages)[https://pages.cloudflare.com/]

### Debugging cookies

https://github.com/benawad/how-to-debug-cookies
