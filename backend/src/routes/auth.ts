import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

const router = express.Router();

const isDuplicateKey = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

// Register route
router.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    if (isDuplicateKey(error)) {
      res.status(409).json({ message: "Username taken" });
      return;
    }
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login route
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = (await User.findOne({ username })) as IUser;
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

export default router;
