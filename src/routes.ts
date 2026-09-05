import { Router } from "express";
import { obtenerPokemon } from "./controllers/pokemon.controller.js";

export const router = Router();

// Endpoint de verificación base
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor PokéAPI listo" });
});

router.get("/pokemon/:nombre", obtenerPokemon);
