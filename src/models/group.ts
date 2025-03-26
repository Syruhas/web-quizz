import { ObjectId } from "mongodb";

export interface Group {
  _id?: ObjectId;
  name: string;
  teacherId: ObjectId;
  students: ObjectId[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  quizzes: ObjectId[];
}
