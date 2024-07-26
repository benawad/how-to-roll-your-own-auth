import type { Config } from "drizzle-kit";
export default {
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "postgresql://postgres:postgres@localhost:5432/auth-example",
  },
} satisfies Config;
