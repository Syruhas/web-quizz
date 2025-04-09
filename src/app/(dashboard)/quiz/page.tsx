import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export default async function Quiz() {
  const session = await auth();

  return (
    <div>
      {session ? (
        <div>
          <p>Welcome to your quiz page</p>
          {/* Only display necessary session information */}
        </div>
      ) : (
        <p>Not signed in</p>
      )}
    </div>
  );
}