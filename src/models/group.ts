import { ObjectId } from "mongodb";

export interface Group {
  _id?: ObjectId;
  name: string;
  description?: string;
  ownerId: ObjectId;
  members: ObjectId[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  quizzes: ObjectId[];
}
