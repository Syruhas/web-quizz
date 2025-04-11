import { auth } from '@/auth';
import { redirect } from "next/navigation";
import { QuizDisplay } from '@/components/quiz-display';
import { Geist, Geist_Mono } from "next/font/google";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });
  
  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

export default async function QuizPage() {
    const session = await auth();

    if (!session){
      redirect("/login");
    }

    return (
    <div className="container mx-auto py-0 px-0">
      <h1 className="text-2xl font-bold mb-6">Mes Quiz</h1>
      <QuizDisplay />
    </div>
);
}