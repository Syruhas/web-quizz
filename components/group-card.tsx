"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, CopyIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Group } from "@/models/group";
import { User } from "@/models/user";

type GroupCardProps = {
  group?: Group;
  isCreateCard?: boolean;
  onCreateClick?: () => void;
};

export function GroupCard({ group, isCreateCard, onCreateClick }: GroupCardProps) {
  const { data: session } = useSession();
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  
  // Charger les détails des étudiants et du professeur si nécessaire
  useEffect(() => {
    console.log("useEffect triggered", session?.user?.role);
    if (group) {
      // Si c'est le professeur qui visualise, récupérer les détails des étudiants
      if (session?.user?.role === "teacher" && 
          session?.user?.id && 
          group.teacherId.toString() === session.user.id) {
        fetchStudents();
      }
      
      // Si c'est un étudiant qui visualise, récupérer le nom du professeur
      if (session?.user?.role === "student") {
        fetchTeacherName();
      }
    }
  }, [group, session]);
  
  // Récupérer les détails des étudiants
  const fetchStudents = async () => {
    if (!group?.students || group.students.length === 0) return;
    
    try {
      const studentIds = group.students.map(id => id.toString());
      const response = await fetch(`/api/groups/student?ids=${studentIds.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };
  
  // Récupérer le nom du professeur
  const fetchTeacherName = async () => {
    if (!group?.teacherId) return;
    
    try {
      const response = await fetch(`/api/users/${group.teacherId.toString()}`);
      if (response.ok) {
        const teacher = await response.json();
        setTeacherName(teacher.name);
      }
      else{
        setTeacherName("Unknown");
      }
    } catch (error) {
      console.error("Error fetching teacher:", error);
      setTeacherName("Unknown2");
    }
  };
  
  // Si c'est la carte pour créer un nouveau groupe
  if (isCreateCard) {
    return (
      <Card className="w-64 h-64 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={onCreateClick}>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <PlusIcon className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-lg font-medium text-gray-600">Create new group</p>
        </CardContent>
      </Card>
    );
  }

  // Si pas de groupe, ne rien afficher
  if (!group) return null;

  const isTeacher = session?.user?.role === "teacher" && 
                    session?.user?.id && 
                    group.teacherId.toString() === session.user.id;
  
  // Copier le lien d'invitation
  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${group.inviteCode}`);
    toast.success("Invite link copied to clipboard");
  };

  // Si c'est un étudiant, afficher uniquement le nom du professeur
  if (session?.user?.role === "student") {
    return (
      <Card className="w-64">
        <CardHeader>
          <CardTitle className="text-lg">{group.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Teacher: {teacherName === null ? "Loading..." : teacherName || "Unknown"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Si c'est un professeur, afficher la liste des élèves et un bouton pour copier le lien
  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="text-lg">{group.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center">
          <UsersIcon className="h-4 w-4 mr-2" />
          <span 
            className="text-sm text-blue-500 cursor-pointer" 
            onClick={() => setShowStudents(!showStudents)}
          >
            {group.students?.length || 0} students
          </span>
        </div>
        
        {showStudents && students.length > 0 && (
          <ul className="text-sm ml-6 list-disc">
            {students.map((student) => (
              <li key={student._id?.toString()}>{student.name}</li>
            ))}
          </ul>
        )}
        
        {showStudents && (!students || students.length === 0) && (
          <p className="text-sm text-gray-500 ml-6">No students yet</p>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={copyInviteLink}
        >
          <CopyIcon className="h-4 w-4" />
          Copy Invite Link
        </Button>
      </CardFooter>
    </Card>
  );
}