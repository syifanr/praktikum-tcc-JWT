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


app.use(cors({
  origin: [
    "http://localhost:5501",
    "https://fe-notessyifa-dot-fit-crow-450802-e0.uc.r.appspot.com",
    "https://notes-syifa194-797713225706.us-central1.run.app",
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use(NotesRoute);

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


