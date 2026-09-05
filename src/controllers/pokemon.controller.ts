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
  const nombre = req.params.nombre.trim().toLowerCase();
  const respuesta = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nombre)}`,
  );

  if (!respuesta.ok) {
    throw new Error(`PokéAPI respondió con estado ${respuesta.status}`);
  }

  const pokemon = (await respuesta.json()) as PokemonRespuesta;

  res.json({
    id: pokemon.id,
    nombre: pokemon.name,
    imagen: pokemon.sprites.front_default,
    tipos: pokemon.types.map((elemento) => elemento.type.name),
  });
}
