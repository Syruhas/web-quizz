import { RegisterForm } from "@/components/register-form"
import { redirect } from "next/navigation";
import { auth } from "@/auth"; 

export default async function RegisterPage() {

  const session = await auth();
  
  if (session){
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  )
}

export { RegisterPage }