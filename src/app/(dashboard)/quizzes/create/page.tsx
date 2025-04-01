import { NewQuizForm } from "@/components/new-quiz-form";

export default function NewQuizPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
      <NewQuizForm />
    </div>
  );
}
