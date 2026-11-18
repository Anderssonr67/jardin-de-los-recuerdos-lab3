# El Jardín de los Recuerdos

Un jardín digital para guardar momentos importantes como flores. Cada recuerdo tiene una categoría, una fecha y una emoción; puedes crearlo, buscarlo, editarlo o eliminarlo.

## Enlaces públicos

- Sitio desplegado: https://el-jardin-de-los-recuerdos.vercel.app
- Repositorio: https://github.com/Anderssonr67/jardin-de-los-recuerdos-lab3

## Funcionalidades

- CRUD de recuerdos con SQLite mediante SQL.js.
- Persistencia local entre visitas usando `localStorage`.
- Búsqueda por título y descripción, y filtro por categoría.
- Diseño adaptable con una ilustración original de jardín nocturno.

> Los recuerdos se guardan en el navegador donde se crean; no se sincronizan entre dispositivos.

## Tecnologías

- TypeScript y Vite
- SQL.js (SQLite/WebAssembly)
- CSS

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run build
```

Los archivos de producción se generan en `dist/`.

## Desplegar en Vercel

1. Sube este repositorio a GitHub.
2. En Vercel, importa el repositorio.
3. Usa `npm run build` como comando de compilación y `dist` como directorio de salida.
4. Despliega y prueba crear, editar, borrar y recargar un recuerdo desde la URL pública.
