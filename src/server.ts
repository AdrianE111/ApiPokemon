import express from "express";
import { router } from "./routes.js";

const app = express();
const PORT = 3000;

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});