import express from "express";
import cors from "cors";
import NotesRoute from "./routes/NotesRoute.js";
import "dotenv/config";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: "http://localhost:5000", 
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());


app.use(NotesRoute);


app.set("view engine", "ejs");


app.use(express.json());
app.get("/", (req, res) => res.render("index"));


app.listen(5000, () => console.log("Server connected"));