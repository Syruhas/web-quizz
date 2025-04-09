"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Group } from "@/models/group";
import { GroupCard } from "@/components/group-card";
import { GroupForm } from "@/components/group-form";

export function GroupList() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchGroups = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      let endpoint = "";
      
      if (session.user.role === "teacher") {
        endpoint = `/api/groups?teacherId=${session.user.id}`;
      } else if (session.user.role === "student") {
        endpoint = `/api/groups/student/${session.user.id}`;
      }
      
      const response = await fetch(endpoint);
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
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups();
    }
  }, [session]);

  const handleCreateGroup = () => {
    setShowForm(true);
  };

  const handleGroupCreated = async () => {
    setShowForm(false);
    await fetchGroups();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading groups...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">
        {session?.user?.role === "teacher" ? "Your Groups" : "Enrolled Groups"}
      </h2>
      
      {showForm ? (
        <div className="mb-8">
          <GroupForm onGroupCreated={handleGroupCreated} />
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groups.map((group) => (
            <GroupCard key={group._id?.toString()} group={group} />
          ))}

          {session?.user?.role === "teacher" && (
            <GroupCard isCreateCard onCreateClick={handleCreateGroup} />
          )}
          
          {groups.length === 0 && !showForm && (
            <p className="col-span-full text-center text-gray-500 py-8">
              {session?.user?.role === "teacher" 
                ? "You haven't created any groups yet." 
                : "You are not enrolled in any groups yet."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Ajout du composant Button au même fichier pour éviter des erreurs d'importation
// Normalement il devrait déjà être importé depuis @/components/ui/button
function Button({ 
  children, 
  variant = "default", 
  className = "", 
  onClick 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "outline"; 
  className?: string; 
  onClick?: () => void 
}) {
  return (
    <button 
      className={`px-4 py-2 rounded-md ${
        variant === "outline" 
          ? "border border-gray-300 hover:bg-gray-50" 
          : "bg-blue-500 text-white hover:bg-blue-600"
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}