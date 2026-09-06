import type { Request, Response } from "express";

interface PokemonRespuesta {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
  types: {
    type: {
      name: string;
    };
  }[];
}

export async function obtenerPokemon(
  req: Request<{ nombre: string }>,
  res: Response,
): Promise<void> {
  try {
    const nombre = req.params.nombre.trim().toLowerCase();

    const respuesta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nombre)}`,
      { signal: AbortSignal.timeout(5000) },
    );

    // 1. Pokémon inexistente (404)
    if (respuesta.status === 404) {
      res.status(404).json({ error: "No lo encontré" });
      return;
    }

    // 2. PokéAPI con error de servicio (502)
    if (!respuesta.ok) {
      res.status(502).json({ error: "No se pudo consultar PokéAPI" });
      return;
    }

 
    const pokemon = (await respuesta.json()) as PokemonRespuesta;

    res.json({
      id: pokemon.id,
      nombre: pokemon.name,
      imagen: pokemon.sprites.front_default,
      tipos: pokemon.types.map((elemento) => elemento.type.name),
    });
  } catch (err: any) {
    // 3. Timeout (504)
    if (err.name === "TimeoutError") {
      res.status(504).json({ error: "PokéAPI tardó demasiado en responder" });
      return;
    }

    // 4. Error de red al consultar PokéAPI (502)
    if (err.name === "TypeError" && err.message?.includes("fetch")) {
      res.status(502).json({ error: "No se pudo consultar PokéAPI" });
      return;
    }

    // 5. Error interno del backend (500)
    res.status(500).json({ error: "Ocurrió un error interno" });
  }
}

interface ListaPokemonRespuesta {
  results: { name: string }[];
}

export async function obtenerListaPokemon(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const respuesta = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20", {
      signal: AbortSignal.timeout(5000),
    });

    if (respuesta.status === 404) {
      res.status(404).json({ error: "No lo encontré" });
      return;
    }

    if (!respuesta.ok) {
      res.status(502).json({ error: "No se pudo consultar PokéAPI" });
      return;
    }

    const lista = (await respuesta.json()) as ListaPokemonRespuesta;

    res.json(lista.results.map((pokemon) => ({ nombre: pokemon.name })));
  } catch (err: any) {
    if (err.name === "TimeoutError") {
      res.status(504).json({ error: "PokéAPI tardó demasiado en responder" });
      return;
    }

    if (err.name === "TypeError" && err.message?.includes("fetch")) {
      res.status(502).json({ error: "No se pudo consultar PokéAPI" });
      return;
    }

    res.status(500).json({ error: "Ocurrió un error interno" });
  }
}