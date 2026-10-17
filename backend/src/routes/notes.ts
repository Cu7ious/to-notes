import { Router, Request, Response } from "express";
import Note, { NoteType } from "../models/Note";

const router = Router();

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unexpected error");

const userIdFrom = (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Token is invalid" });
    return;
  }
  return userId;
};

// Create a new note
router.post("/", async (req: Request, res: Response) => {
  const userId = userIdFrom(req, res);
  if (!userId) return;

  const { title, content }: NoteType = req.body;

  const note = new Note({ title, content, userId });
  try {
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

// Get all notes
router.get("/", async (req: Request, res: Response) => {
  const userId = userIdFrom(req, res);
  if (!userId) return;

  try {
    const notes = await Note.find({ userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

// Get a single note by ID
router.get("/:id", async (req: Request, res: Response) => {
  const userId = userIdFrom(req, res);
  if (!userId) return;

  try {
    const note = await Note.findOne({ _id: req.params.id, userId });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

// Update a note by ID
router.put("/:id", async (req: Request, res: Response) => {
  const userId = userIdFrom(req, res);
  if (!userId) return;

  const { title, content }: NoteType = req.body;
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, userId }, { title, content }, { new: true });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

// Delete a note by ID
router.delete("/:id", async (req: Request, res: Response) => {
  const userId = userIdFrom(req, res);
  if (!userId) return;

  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

export default router;
