"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QuestionDifficulty } from "@/models/quiz";
import React from "react";

interface QuestionDetail {
  id: string;
  text: string;
  difficulty: number;
  points: number;
  type: "single" | "multiple";
  selectedAnswers: number[];
  correctAnswers: number[];
  options: string[];
  isCorrect: boolean;
  earnedPoints: number;
}

interface GradeWithDetails {
  id: string;
  quizId: string;
  quizName: string;
  score: number;
  totalPossiblePoints: number;
  startedAt: string;
  submittedAt: string;
  questionDetails: QuestionDetail[];
}

export function GradesDisplay() {
  const [grades, setGrades] = useState<GradeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch("/api/grades");
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des notes");
        }
        
        const data = await response.json();
        setGrades(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Fonction pour calculer le niveau de la note
  const getScoreLevel = (score: number, totalPossible: number) => {
    const percentage = (score / totalPossible) * 100;
    if (percentage >= 75) return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (percentage >= 60) return { label: "Bien", color: "bg-blue-100 text-blue-800" };
    if (percentage >= 40) return { label: "Moyen", color: "bg-yellow-100 text-yellow-800" };
    return { label: "À améliorer", color: "bg-red-100 text-red-800" };
  };

  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  // Fonction pour obtenir le texte de difficulté
  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Facile";
      case 2:
        return "Moyen";
      case 3:
        return "Difficile";
      default:
        return "Inconnu";
    }
  };

  const toggleExpandQuiz = (quizId: string) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
    } else {
      setExpandedQuiz(quizId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Calcul du score moyen
  const calculateAverageScore = () => {
    if (grades.length === 0) return "N/A";
    
    const totalScore = grades.reduce((acc, grade) => acc + grade.score, 0);
    const totalPossible = grades.reduce((acc, grade) => acc + grade.totalPossiblePoints, 0);
    
    return `${totalScore}/${totalPossible} (${Math.round((totalScore / totalPossible) * 100)}%)`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mes notes</CardTitle>
        <CardDescription>
          Visualisez vos résultats pour tous les quizz que vous avez complétés.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-gray-500">
            Vous n'avez pas encore complété de quizz.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {grades.length} {grades.length > 1 ? "quizz complétés" : "quizz complété"}
              </div>
              <div className="text-sm font-medium">
                Moyenne générale: {calculateAverageScore()}
              </div>
            </div>
            
            <Table>
              <TableCaption>Liste des notes obtenues aux quizz</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead className="text-right">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => {
                  const scoreLevel = getScoreLevel(grade.score, grade.totalPossiblePoints);
                  const isExpanded = expandedQuiz === grade.id;

                  return (
                    <React.Fragment key={grade.id}>
                      <TableRow 
                        className={isExpanded ? "border-b-0" : ""}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleExpandQuiz(grade.id)}
                      >
                        <TableCell className="font-medium">{grade.quizName}</TableCell>
                        <TableCell>{grade.score}/{grade.totalPossiblePoints}</TableCell>
                        <TableCell>
                          <Badge className={scoreLevel.color}>{scoreLevel.label}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(grade.submittedAt)}</TableCell>
                        <TableCell className="text-right">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={5} className="p-0">
                            <div className="bg-gray-50 p-4">
                              <h4 className="font-medium mb-2">Détail des questions</h4>
                              
                              <div className="grid gap-3">
                                {grade.questionDetails.map((question, index) => (
                                  <div key={question.id.toString()} className="bg-white p-3 rounded border">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Question {index + 1}:</span>
                                          <Badge variant={question.isCorrect ? "default" : "destructive"}>
                                            {question.isCorrect ? 
                                              <CheckCircle className="mr-1 h-3 w-3" /> : 
                                              <XCircle className="mr-1 h-3 w-3" />
                                            }
                                            {question.earnedPoints}/{question.points} pts
                                          </Badge>
                                          <Badge variant="outline">
                                            {getDifficultyText(question.difficulty)}
                                          </Badge>
                                          <Badge variant="outline">
                                            {question.type === "single" ? "Choix unique" : "Choix multiple"}
                                          </Badge>
                                        </div>
                                        <p className="mt-1">{question.text}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-2 space-y-1.5">
                                      {question.options.map((option, optIndex) => {
                                        const isSelected = question.selectedAnswers.includes(optIndex);
                                        const isCorrect = question.correctAnswers.includes(optIndex);
                                        
                                        let bgColor = "";
                                        if (isSelected && isCorrect) bgColor = "bg-green-50";
                                        else if (isSelected && !isCorrect) bgColor = "bg-red-50";
                                        else if (!isSelected && isCorrect) bgColor = "bg-blue-50";
                                        
                                        return (
                                          <div 
                                            key={optIndex} 
                                            className={`flex items-center p-2 rounded ${bgColor}`}
                                          >
                                            {isSelected ? 
                                              (isCorrect ? 
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : 
                                                <XCircle className="h-4 w-4 text-red-600 mr-2" />
                                              ) : 
                                              (isCorrect ?
                                                <CheckCircle className="h-4 w-4 text-blue-600 mr-2 opacity-50" /> :
                                                <span className="w-4 h-4 mr-2"></span>
                                              )
                                            }
                                            <span className={isSelected ? "font-medium" : ""}>
                                              {option}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}