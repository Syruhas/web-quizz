import { LoginForm } from "@/components/login-form"
import { auth } from '@/auth';
import { redirect } from "next/navigation";

export default async function LoginPage() {

  const session = await auth();

  if (session){
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </div>
  )
}
