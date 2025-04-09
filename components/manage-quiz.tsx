"use client";

import { Plus, Router} from "lucide-react";
import { Quiz, QuizSettings } from "@/models/quiz";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
    return (
      <Card
        className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <div className="space-y-2">
          <h3 className="font-semibold truncate">{quiz.name}</h3>
          <p className="text-sm text-muted-foreground">
            {quiz.questions.length} questions
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                quiz.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : quiz.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {quiz.status}
            </span>
          </div>
        </div>
      </Card>
    );
  }


export function NewQuizCard({ onClick }: { onClick: () => void }) {
  return (
    <Card 
      className="p-6 border-dashed hover:border-primary/50 transition-colors cursor-pointer h-full flex items-center justify-center"
      onClick={onClick}
    >
      <div className="text-center">
        <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <span className="text-muted-foreground">Create New Quiz</span>
      </div>
    </Card>
  );
}


export function QuizCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
      </div>
    </Card>
  );
}

interface Group {
    _id: string;
    name: string;
  }
  
export function QuizDetailView({ quiz }: { quiz: Quiz }) {
    const { data: session } = useSession();
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [groups, setGroups] = useState<Group[]>([]);
    const [settings, setSettings] = useState<QuizSettings>({
        startDate: undefined,
        endDate: undefined,
        timeLimit: 0,
        shuffleQuestions: false,
        shuffleOptions: false,
        showResults: true,
        attemptsAllowed: 1,
        passingScore: 60,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchGroups() {
            if (!session?.user?.id) return;

            setIsLoading(true);
            try {
                const response = await fetch(`/api/groups?teacherId=${session.user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setGroups(data);
                } else {
                    toast.error("Failed to fetch groups");
                }
            } catch (error) {
                console.error("Error fetching groups:", error);
                toast.error("An error occurred while fetching groups");
            } finally {
                setIsLoading(false);
            }
        }

        fetchGroups();
    }, [session?.user?.id]);

    if (!session || !session.user) return null;

    const handleAssignQuiz = async () => {
        if (!selectedGroup) {
        toast.error("Please select a group");
        return;
        }

        setIsLoading(true);

        const promise = fetch("/api/quiz/assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quizId: quiz._id,
                groupId: selectedGroup,
                settings: settings
                }),
          }).then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "Registration failed");
            }
            return data;
        });
        
        toast.promise(promise, {
            loading: 'Assigning the quiz',
            success: (data) => {
              return 'Quiz sucessfully assigned';
            },
            error: (err) => {
              return err.message || 'Something went wrong';
            },
          });
      
          try {
            await promise;
          } finally {
            setIsLoading(false);
          }
    };

    return (
        <div className="space-y-6 max-w-3xl">
        <Card>
            <CardHeader>
            <CardTitle>{quiz.name}</CardTitle>
            <CardDescription>
                {quiz.questions.length} questions in this quiz
            </CardDescription>
            </CardHeader>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Assign Quiz to Group</CardTitle>
            <CardDescription>
                Configure settings and assign this quiz to a group
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Select Group</Label>
                <Select
                value={selectedGroup}
                onValueChange={setSelectedGroup}
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                    {groups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                        {group.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {settings.startDate ? (
                        format(settings.startDate, "PPP")
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={settings.startDate}
                        onSelect={(date) =>
                        setSettings({ ...settings, startDate: date })
                        }
                    />
                    </PopoverContent>
                </Popover>
                </div>

                <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {settings.endDate ? (
                        format(settings.endDate, "PPP")
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={settings.endDate}
                        onSelect={(date) =>
                        setSettings({ ...settings, endDate: date })
                        }
                    />
                    </PopoverContent>
                </Popover>
                </div>

                <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input
                    type="number"
                    min="0"
                    value={settings.timeLimit || ""}
                    onChange={(e) =>
                    setSettings({
                        ...settings,
                        timeLimit: parseInt(e.target.value) || 0,
                    })
                    }
                />
                </div>

                <div className="space-y-2">
                <Label>Attempts Allowed</Label>
                <Input
                    type="number"
                    min="1"
                    value={settings.attemptsAllowed}
                    onChange={(e) =>
                    setSettings({
                        ...settings,
                        attemptsAllowed: parseInt(e.target.value) || 1,
                    })
                    }
                />
                </div>

                <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.passingScore || ""}
                    onChange={(e) =>
                    setSettings({
                        ...settings,
                        passingScore: parseInt(e.target.value) || 0,
                    })
                    }
                />
                </div>

                <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch
                    checked={settings.shuffleQuestions}
                    onCheckedChange={(checked) =>
                        setSettings({ ...settings, shuffleQuestions: checked })
                    }
                    />
                    <Label>Shuffle Questions</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                    checked={settings.shuffleOptions}
                    onCheckedChange={(checked) =>
                        setSettings({ ...settings, shuffleOptions: checked })
                    }
                    />
                    <Label>Shuffle Options</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                    checked={settings.showResults}
                    onCheckedChange={(checked) =>
                        setSettings({ ...settings, showResults: checked })
                    }
                    />
                    <Label>Show Results After Completion</Label>
                </div>
                </div>
            </div>

            <Button
                className="w-full"
                onClick={handleAssignQuiz}
                disabled={isLoading}
            >
                {isLoading ? "Assigning..." : "Assign Quiz"}
            </Button>
            </CardContent>
        </Card>
        </div>
    );
}