import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { inviteCode, studentId } = await req.json();

        if (!inviteCode || !studentId || studentId.length !== 24) {
            return NextResponse.json(
                { error: "Missing required fields : inviteCode or studentId" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("web-quizz");
        const groups = db.collection("groups");

        const group = await groups.findOne({ inviteCode });

        if (!group) {
            return NextResponse.json(
                { error: "Group not found with this invide code" },
                { status: 404 }
            );
        }

        const studentObjectId = new ObjectId(studentId);

        const alreadyJoined = group.students.some(
            (id: ObjectId) => id.toString() === studentObjectId.toString()
        );

        if(alreadyJoined) {
            return NextResponse.json(
                { error: "You are already a member of this group" },
                { status: 400 }
            );
        }

        await groups.updateOne(
            { _id: group._id },
            {
                $push: { students: studentObjectId as any},
                $set: { updatedAt: new Date() },
            }
        );

        const users = db.collection("users");
        await users.updateOne(
            {_id : studentObjectId},
            {$push: {enrolledGroups : group._id as any}}
        )

        return NextResponse.json(
            { message: "Successfully joined the group" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error joining group:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}