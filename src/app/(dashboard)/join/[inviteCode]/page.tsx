"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession, SessionProvider } from "next-auth/react";
import { signIn } from "next-auth/react";

type Group = {
    _id: string;
    name: string;
    teacherId: string;
};

function JoinGroupPageInner() {
    const { inviteCode } = useParams<{ inviteCode: string }>();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setloading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (status === "loading") {
            return;
        }
        if (status === "unauthenticated") {
            signIn(undefined,{ callbackUrl: `/join/${inviteCode}` });
            return;
        }

        const fetchGroup = async () => {
            try {
                const res = await fetch(`/api/groups/${inviteCode}`);
                
                if (!res.ok) {
                    toast.error("Failed to fetch group");
                    return;
                }
                const data = await res.json();

                setGroup(data);
            } catch (error) {
                toast.error("Group not found or invalid invite code");
            } finally {
                setloading(false);
            }
        };

        fetchGroup();
    }, [status, inviteCode]);

    const handleJoin = async () => {
        if (!session?.user.id) {
            toast.error("You must be logged in to join a group");
            //signIn(undefined, { callbackUrl: `/join/${inviteCode}` });
            router.push(`/api/auth/signin?callbackUrl=/join/${inviteCode}`);
            return;
        }

        setJoining(true);

        try {
            const res = await fetch(`/api/groups/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studentId: session.user.id,
                    inviteCode,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error("Failed to join group");
                return;
            }

            toast.success("Successfully joined the group");
            // setTimeout(() => {
            //     router.push("/dashboard");
            // }, 1500);
            router.push("/dashboard");
            
        } catch (error) {
            toast.error("Error joining group");
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return <p className="text-center mt-20">Loading group information...</p>;
    }
    if (!group) {
        return <p className="text-center mt-20 text-red-500">Group not found or invalid invite code</p>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="max-w-sm w-full">
                <CardHeader>
                    <CardTitle>Join Group</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>You are about to join the group: <strong>{group.name}</strong></p>
                    <Button onClick={handleJoin} disabled={joining}>
                        {joining ? "Joining..." : "Join Group"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function JoinGroupPage() {
    return (
        <SessionProvider>
            <JoinGroupPageInner />
        </SessionProvider>
    );
}