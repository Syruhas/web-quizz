import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest){
        try {
            const { name, teacherId } = await req.json();

            if(!name || !teacherId){
                return NextResponse.json(
                    { error: "Missing required fields" },
                    { status: 400 }
                );
            }
            if(!ObjectId.isValid(teacherId)){
                return NextResponse.json(
                    { error: "Invalid teacher ID" },
                    { status: 400 }
                );
            }

            const client = await clientPromise;
            const db = client.db("web-quizz");
            const groups = db.collection("groups");
            const inviteCode = nanoid(8);
            const newGroup = {
                name,
                teacherId: new ObjectId(teacherId),
                students: [],
                inviteCode,
                createdAt: new Date(),
                updatedAt: new Date(),
                quizzes: [],
            };
            const result = await groups.insertOne(newGroup);

            return NextResponse.json(
                { message: "Group created successfully", groupId: result.insertedId, inviteCode },
                { status: 201 }
            );
        } catch (error) {
            console.error("Group creation error:", error);
            return NextResponse.json(
                { error: "Internal server error" },
                { status: 500 }
            );
        }
}

export async function GET(req: NextRequest){
    try {
        const teacherId = req.nextUrl.searchParams.get("teacherId");

        if(!teacherId || !ObjectId.isValid(teacherId)){
            return NextResponse.json(
                { error: "Invalid teacher ID" },
                { status: 400 }
            );
        }
        
        const client = await clientPromise;
        const db = client.db("web-quizz");
        const groups = db.collection("groups");

        
        const results = await groups.find({ teacherId: new ObjectId(teacherId) }).toArray();

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Group retrieval error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

