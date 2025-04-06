import { ObjectId } from "mongodb";

export interface Grade {
    id: ObjectId;
    score: number;
    quizzId: ObjectId;
    studentId: ObjectId;
}