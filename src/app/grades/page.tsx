import { auth } from '@/auth';
import { redirect } from "next/navigation";
import { GradesDisplay } from "@/components/grades-display"
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from 'sonner';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });
  
  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

export default async function GradesPage() {
    const session = await auth();

    if (!session){
      redirect("/login");
    }

    return (
  <div className="min-h-screen">
    <SidebarProvider>
      <AppSidebar />
      <main className="md:pl-64 pt-0">
        <SidebarTrigger />
        <div className="container mx-auto py-0 px-0">
          <h1 className="text-2xl font-bold mb-6">Mes résultats</h1>
          <GradesDisplay />
        </div>
      </main>
    </SidebarProvider>
    <Toaster richColors position="top-center" />
  </div>
);
}