# Pokédex API - Compound Engineering

## 1. Matriz de Decisión de Arquitectura Backend

| Criterio | Express + TypeScript (Elegido) | Flask (Python) | Spring Boot (Java) |
| :--- | :--- | :--- | :--- |
| **Simplicidad de Setup** | **Alta**: Configuración directa con `tsx`, sin herramientas pesadas ni boilerplate innecesario. | **Alta**: Fácil de iniciar, pero requiere configuración de entornos virtuales independientes. | **Baja**: Exige configuración compleja de Gradle/Maven, arquetipos y contenedores JVM. |
| **Unificación de Stack** | **Total**: Comparte el mismo lenguaje (TypeScript) y definiciones de tipos con el frontend React. | **Nula**: Introduce un segundo lenguaje en el proyecto, complicando el mantenimiento en equipo. | **Nula**: Requiere mantener un ecosistema Java separado de la aplicación cliente. |
| **Curva de Aprendizaje** | **Mínima**: Sintaxis estándar de JavaScript/TypeScript conocida por todos los integrantes. | **Baja/Media**: Sintaxis limpia, pero distinta gestión de asincronía y paquetes. | **Media/Alta**: Curva pronunciada por inyección de dependencias y tipado rígido. |
| **Rendimiento I/O** | **Alto**: Asincronía nativa y eficiente con `Promise.all` y `fetch` integrado en Node.js. | **Medio**: Limitado por el GIL a menos que se recurra a frameworks ASGI (FastAPI). | **Alto**: Alto rendimiento multihilo a costa de un consumo superior de memoria RAM. |

## 2. Respuestas a las 3 Preguntas de Revisión

1. **¿Cuál fue la decisión más difícil?**
   Resolver el consumo concurrente del catálogo completo. Consultar todos los detalles al mismo tiempo podía saturar la conexión o provocar bloqueos por límite de solicitudes en PokéAPI, mientras que hacerlo de forma secuencial resultaba demasiado lento. La solución fue procesar los detalles en lotes de 20 mediante `Promise.all` y guardar el resultado en una caché en memoria, equilibrando el tiempo de respuesta y la cantidad de peticiones simultáneas.

2. **¿Qué alternativas descartó?**
   * **Axios u otras librerías HTTP externas:** Se descartaron para mantener las dependencias al mínimo, aprovechando que Node.js incluye `fetch` y `AbortSignal` de forma nativa.
   * **Frameworks en otros lenguajes (Flask / Spring Boot):** Se descartaron para evitar la fragmentación técnica y asegurar que todo el equipo trabajara bajo el mismo ecosistema TypeScript.

3. **¿De qué está menos segura?**
   De la variabilidad en los tiempos de respuesta de PokéAPI durante la primera carga del catálogo completo. Esta incertidumbre se redujo con un límite de 5000 ms por petición mediante `AbortSignal.timeout(5000)`, manejo explícito de `TimeoutError` con código HTTP 504, consultas en lotes de 20 y caché en memoria para las cargas posteriores.
