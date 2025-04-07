    import { NextRequest, NextResponse } from "next/server";
    import bcrypt from "bcryptjs";
    import clientPromise from "@/lib/db";
    import { User, UserRole } from "@/models/user";

    export async function POST(req: NextRequest) {
    try {
        const { email, password, name, role } = await req.json();

        // Basic validation
        if (!email || !password || !name || !role) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
        }

        // Validate role
        if (role !== "teacher" && role !== "student") {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("web-quizz");
        const users = db.collection<User>("users");

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
        return NextResponse.json(
            { error: "Email already registered" },
            { status: 400 }
        );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser: User & { password: string } = {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(role === "teacher" ? { groups: [] } : { enrolledGroups: [] }),
        };

        await users.insertOne(newUser);

        // Return success response (excluding password)
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(
        { message: "User created successfully", user: userWithoutPassword },
        { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
        );
    }
    }
