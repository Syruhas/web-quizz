"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface GradeWithDetails {
  id: string;
  score: number;
  quizId: string;
  quizTitle: string;
  createdAt: string;
}

export function GradesDisplay() {
  const [grades, setGrades] = useState<GradeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 60) return { label: "Bien", color: "bg-blue-100 text-blue-800" };
    if (score >= 40) return { label: "Moyen", color: "bg-yellow-100 text-yellow-800" };
    return { label: "À améliorer", color: "bg-red-100 text-red-800" };
  };

  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
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
                Moyenne générale: {(grades.reduce((acc, grade) => acc + grade.score, 0) / grades.length).toFixed(1)}%
              </div>
            </div>
            
            <Table>
              <TableCaption>Liste des notes obtenues aux quizz</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => {
                  const scoreLevel = getScoreLevel(grade.score);
                  return (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.quizTitle}</TableCell>
                      <TableCell>{grade.score}%</TableCell>
                      <TableCell>
                        <Badge className={scoreLevel.color}>{scoreLevel.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatDate(grade.createdAt)}</TableCell>
                    </TableRow>
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