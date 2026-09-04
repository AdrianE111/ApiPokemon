import { Router } from "express";

export const router = Router();

// Endpoint de verificación base
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor PokéAPI listo" });
});