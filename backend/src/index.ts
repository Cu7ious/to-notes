import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import notesRouter from "./routes/notes";
import authRoutes from "./routes/auth";
import authenticateToken from "./middleware/auth";

dotenv.config({ path: ".env.dev" });

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

app.use("/api/notes", authenticateToken, notesRouter);
app.use("/", (req, res) => {
  res.json({ status: "Healthy" });
});

// Connect to MongoDB
if (!MONGO_URL) {
  console.error("Missing MONGO_URL environment variable");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET environment variable");
  process.exit(1);
}

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
