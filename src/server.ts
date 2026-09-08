import express from "express";
import cors from "cors";
import { router } from "./routes.js";

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173" }));

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});