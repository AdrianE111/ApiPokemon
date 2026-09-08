# Servidor Pokédex API

Backend universitario construido con Node.js, Express 5 y TypeScript. Consume PokéAPI, transforma sus respuestas y expone datos sencillos para el frontend de la Pokédex.

## Tecnologías

- Node.js 18 o superior.
- Express 5.
- TypeScript con modo estricto.
- `tsx` para ejecutar el servidor durante el desarrollo.
- `fetch` y `AbortSignal` nativos de Node.js.
- `cors` para permitir peticiones desde el frontend local.

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/AdrianE111/ApiPokemon.git
   ```

2. Entrar al proyecto:

   ```bash
   cd ApiPokemon
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

## Ejecución

Iniciar el servidor en modo de desarrollo:

```bash
npm run dev
```

El backend quedará disponible en `http://localhost:3000`. La terminal debe permanecer abierta mientras se realizan las pruebas.

Para comprobar TypeScript sin generar archivos:

```bash
npx tsc --noEmit
```

## Endpoints

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Comprueba que el servidor está funcionando. |
| GET | `/api/pokemon/:nombre` | Busca un Pokémon por nombre y devuelve sus datos principales. |
| GET | `/api/pokemon` | Devuelve el catálogo disponible en PokéAPI con sus datos principales. |

### Pokémon individual

Ejemplo: `GET /api/pokemon/pikachu`

```json
{
  "id": 25,
  "nombre": "pikachu",
  "imagen": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  "tipos": ["electric"]
}
```

### Catálogo de Pokémon

`GET /api/pokemon` devuelve un arreglo. Cada elemento contiene:

```json
{
  "id": 1,
  "nombre": "bulbasaur",
  "imagen": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  "tipos": ["grass", "poison"]
}
```

La cantidad puede cambiar cuando PokéAPI actualice su catálogo. La primera petición consulta los detalles en grupos de 20 y guarda el resultado en memoria. Las peticiones posteriores reutilizan esa caché mientras el servidor continúe ejecutándose.

## Pruebas en Postman

Primero ejecuta `npm run dev`. En Postman selecciona el método **GET**, pega uno de estos enlaces y presiona **Send**:

- [Comprobar servidor — GET /api/health](http://localhost:3000/api/health)
- [Buscar Pikachu — GET /api/pokemon/pikachu](http://localhost:3000/api/pokemon/pikachu)
- [Buscar Ditto — GET /api/pokemon/ditto](http://localhost:3000/api/pokemon/ditto)
- [Buscar Charizard — GET /api/pokemon/charizard](http://localhost:3000/api/pokemon/charizard)
- [Probar Pokémon inexistente — GET /api/pokemon/pikachuXYZ](http://localhost:3000/api/pokemon/pikachuXYZ)
- [Consultar catálogo completo — GET /api/pokemon](http://localhost:3000/api/pokemon)

Resultados esperados:

| Prueba | Status esperado | Qué revisar |
| --- | ---: | --- |
| Health | 200 | `status` debe ser `ok`. |
| Pikachu, Ditto o Charizard | 200 | Debe incluir `id`, `nombre`, `imagen` y `tipos`. |
| `pikachuXYZ` | 404 | Debe devolver un objeto JSON con el campo `error`. |
| Catálogo | 200 | Debe devolver un arreglo y cada elemento debe incluir los cuatro campos. |

## Manejo de errores

| Status | Situación |
| ---: | --- |
| 404 | El Pokémon solicitado no existe. |
| 502 | PokéAPI respondió con un error o no fue posible establecer la conexión. |
| 504 | PokéAPI tardó más de cinco segundos en responder. |
| 500 | Ocurrió un error inesperado en el backend. |

Los errores se devuelven como JSON con un mensaje en el campo `error`. El servidor permanece activo después de responder un error.

## Arquitectura

```text
Petición HTTP
    ↓
src/routes.ts
    ↓
src/controllers/pokemon.controller.ts
    ↓
PokéAPI
    ↓
Transformación de datos
    ↓
Respuesta JSON
```

Las rutas definen las direcciones disponibles. Los controladores realizan las consultas, transforman los datos y manejan los errores.

## Estructura

```text
ApiPokemon/
├── src/
│   ├── controllers/
│   │   └── pokemon.controller.ts
│   ├── routes.ts
│   └── server.ts
├── .gitignore
├── CLAUDE.md
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

## Conexión con el frontend

El frontend se ejecuta de forma separada y consume este backend mediante HTTP. CORS permite durante el desarrollo el origen `http://localhost:5173`.

```text
Frontend React (localhost:5173)
    ↓ HTTP
Backend Express (localhost:3000)
    ↓ fetch
PokéAPI
```

## Decisión tecnológica

Se eligió Express con TypeScript porque permite crear una API sencilla, compartir el lenguaje con el frontend y detectar errores de tipos durante el desarrollo. Se utiliza `fetch` nativo para evitar una dependencia HTTP adicional.
