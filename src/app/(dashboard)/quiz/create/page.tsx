"use client"
import { NewQuizForm } from "@/components/new-quiz-form";
import { useEffect } from "react";

export default function CreateQuizPage() {
  useEffect(() => {
    const handleBeforeUnload = (e: {
      returnValue: string; preventDefault: () => void; 
}) => {
      const confirmationMessage =
        "It looks like you have been editing something. If you leave before saving, your changes will be lost.";

      e.preventDefault();
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="w-full m-2">
      <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
        Create New Quiz
      </h2>
      <NewQuizForm />
    </div>
  );
}
