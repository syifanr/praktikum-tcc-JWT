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
  origin: [
    "http://localhost:5501", // local dev
    "https://fe-notessyifa-dot-fit-crow-450802-e0.uc.r.appspot.com", // FE deploy
    "https://notes-syifa194-797713225706.us-central1.run.app", // backend sendiri 
  ],
  credentials: true,
}));


  app.use(cookieParser());
  app.use(express.json());

  // Routes API
  app.use(NotesRoute);

 const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

