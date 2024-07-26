declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_CLIENT_ID: string;
      DISCORD_SECRET_ID: string;
      REFRESH_TOKEN_SECRET: string;
      ACCESS_TOKEN_SECRET: string;
      FRONTEND_URL: string;
    }
  }
}

export {}
