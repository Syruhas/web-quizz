import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "teacher" | "student";
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "teacher" | "student";
  }
}
