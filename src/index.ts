import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { userRouter } from "./routes/user";

const app = express();
const { PORT } = process.env;
const logStream = fs.createWriteStream(
  path.join(__dirname, "..", "access.log"),
  {
    flags: "a",
  }
);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined", { stream: logStream }));

app.get("/", (req, res) => {
  res.send("Ok");
});

app.use("/user", userRouter);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
