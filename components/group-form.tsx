"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useSession } from "next-auth/react";

export function GroupForm({ onGroupCreated }: { onGroupCreated?: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState("");

  const teacherId = session?.user?.id;

  if (!teacherId || session?.user?.role !== "teacher") {
    return <div className="text-red-500">You must be logged in as a teacher to create a group.</div>;
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          teacherId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create group");
      } else {
        toast.success("Group created successfully");
        setGroupName("");
        onGroupCreated?.();
      }
    } catch (error) {
      toast.error("Error while creating group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a new group</CardTitle>
        <CardDescription>
          Enter a name for your new group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateGroup}>
          <div className="grid gap-3">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name here"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}