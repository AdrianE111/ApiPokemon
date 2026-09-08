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
      res.status(404).json({ error: "¡El Pokémon salvaje no apareció en la hierba alta!" });
      return;
    }

    // 2. PokéAPI con error de servicio (502)
    if (!respuesta.ok) {
      res.status(502).json({ error: "El Centro Pokémon está fuera de servicio temporalmente" });
      return;
    }

    const pokemon = (await respuesta.json()) as PokemonRespuesta;

    res.json({
      id: pokemon.id,
      nombre: pokemon.name,
      imagen: pokemon.sprites.front_default,
      tipos: pokemon.types.map((elemento) => elemento.type.name),
    });
  } catch (err: unknown) {
    // 3. Timeout (504)
    if (err instanceof Error && err.name === "TimeoutError") {
      res.status(504).json({ error: "¡Un Snorlax salvaje está bloqueando el camino y tardó demasiado!" });
      return;
    }

    // 4. Error de red al consultar PokéAPI (502)
    if (err instanceof Error && err.name === "TypeError" && err.message.includes("fetch")) {
      res.status(502).json({ error: "La señal del Pokédex no pudo conectar con la red de Silph S.A." });
      return;
    }

    // 5. Error interno del backend (500)
    res.status(500).json({ error: "¡El Pokédex está tan confuso que se hirió a sí mismo!" });
  }
}

interface ListaPokemonRespuesta {
  results: { name: string }[];
}

interface PokemonLista {
  id: number;
  nombre: string;
  imagen: string | null;
  tipos: string[];
}

let cacheListaPokemon: PokemonLista[] | null = null;

export async function obtenerListaPokemon(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    // Evita repetir más de mil consultas cada vez que el frontend recarga.
    if (cacheListaPokemon) {
      res.json(cacheListaPokemon);
      return;
    }

    // PokéAPI acepta un límite alto para devolver el catálogo completo.
    const respuesta = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000", {
      signal: AbortSignal.timeout(5000),
    });

    if (respuesta.status === 404) {
      res.status(404).json({ error: "¡No se encontraron registros en el Pokédex regional!" });
      return;
    }

    if (!respuesta.ok) {
      res.status(502).json({ error: "El Centro Pokémon está fuera de servicio temporalmente" });
      return;
    }

    const lista = (await respuesta.json()) as ListaPokemonRespuesta;

    const detalles: PokemonRespuesta[] = [];

    // Consultar veinte detalles a la vez y conservar el orden de la lista.
    for (let inicio = 0; inicio < lista.results.length; inicio += 20) {
      const grupo = lista.results.slice(inicio, inicio + 20);
      const respuestas = await Promise.all(
        grupo.map((pokemon) =>
          fetch(
            `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemon.name)}`,
            { signal: AbortSignal.timeout(5000) },
          ),
        ),
      );

      // No entregar una lista incompleta si falla alguno de sus detalles.
      if (respuestas.some((detalle) => !detalle.ok)) {
        res.status(502).json({ error: "El Centro Pokémon está fuera de servicio temporalmente" });
        return;
      }

      const detallesGrupo = await Promise.all(
        respuestas.map(async (detalle) => (await detalle.json()) as PokemonRespuesta),
      );
      detalles.push(...detallesGrupo);
    }

    cacheListaPokemon = detalles.map((pokemon) => ({
      id: pokemon.id,
      nombre: pokemon.name,
      imagen: pokemon.sprites.front_default,
      tipos: pokemon.types.map((elemento) => elemento.type.name),
    }));

    res.json(cacheListaPokemon);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "TimeoutError") {
      res.status(504).json({ error: "¡Un Snorlax salvaje está bloqueando el camino y tardó demasiado!" });
      return;
    }

    if (err instanceof Error && err.name === "TypeError" && err.message.includes("fetch")) {
      res.status(502).json({ error: "La señal del Pokédex no pudo conectar con la red de Silph S.A." });
      return;
    }

    res.status(500).json({ error: "¡El Pokédex está tan confuso que se hirió a sí mismo!" });
  }
}
