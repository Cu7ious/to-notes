import mongoose, { Schema, Types } from "mongoose";

export interface NoteType {
  id: string;
  title: string;
  content: string;
  userId: Types.ObjectId;
}

const noteSchema = new mongoose.Schema<NoteType>({
  title: { type: String, required: true },
  content: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Note = mongoose.model<NoteType>("Note", noteSchema);

export default Note;
