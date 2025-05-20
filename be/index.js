import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import NotesRoute from "./routes/NotesRoute.js";
import "dotenv/config";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// Routes API
app.use(NotesRoute);

// Route untuk halaman utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "fe", "register.html"));
});

// (Opsional) Route ke halaman login dan register
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "fe", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "fe", "register.html"));
});

// Serve static files dari folder fe (pindah ke bawah)
app.use(express.static(path.join(__dirname, "fe")));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
