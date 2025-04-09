import { auth } from '@/auth';
import { redirect } from "next/navigation";
import { GradesDisplay } from "@/components/grades-display"

export default async function GradesPage() {
    const session = await auth();

    if (!session){
      redirect("/login");
    }

    return (
    <div className="container mx-auto py-0 px-0">
      <h1 className="text-2xl font-bold mb-6">Mes résultats</h1>
      <GradesDisplay />
    </div>
);
}