import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();

  return (
    <div>
      {session ? (
        <div>
          <p>Welcome, {session.user?.name}</p>
          <p>Email: {session.user?.email}</p>
          <p>Role: {session.user?.role}</p>
          {/* Only display necessary session information */}
        </div>
      ) : (
        <p>Not signed in</p>
      )}
    </div>
  );
}
