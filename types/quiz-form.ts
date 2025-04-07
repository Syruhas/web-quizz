// types/quiz-form.ts
export interface QuizFormOption {
    id: string;
    text: string;
    isCorrect: boolean;
  }
  
  export interface QuizFormQuestion {
    id: string;
    question: string;
    options: QuizFormOption[];
  }
  
  export interface QuizFormData {
    name: string;
    description?: string;
    groupId: string;
    questions: QuizFormQuestion[];
    settings: {
      shuffleQuestions: boolean;
      shuffleOptions: boolean;
      showResults: boolean;
      attemptsAllowed: number;
    };
  }
  