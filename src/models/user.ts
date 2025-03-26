import { ObjectId } from "mongodb";

export type UserRole = "teacher" | "student";

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  password: string
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher extends User {
  role: "teacher";
  groups: ObjectId[]; // References to groups they created
}

export interface Student extends User {
  role: "student";
  enrolledGroups: ObjectId[]; // References to groups they're part of
}