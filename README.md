# La Décima

Aplicación web de fidelidad para negocios locales, construida con Next.js App Router, TypeScript, Tailwind CSS y Supabase.

## Desarrollo local

```bash
npm run dev
```

Abre `la-decima.vercel.app` para ver la aplicación. Para validar el proyecto:

```bash
npm run lint
npm run build
```

## Supabase

1. Copia `.env.example` a `.env.local`.
2. Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los datos del proyecto Supabase.
3. Las claves administrativas y de billeteras se incorporarán cuando se implementen esos módulos. No publiques secretos en el repositorio.

Los clientes de navegador y servidor están en `lib/supabase/`. Las migraciones locales se guardan en `supabase/migrations/`.

## Organización

- `app/`: rutas públicas, autenticación, panel y API.
- `components/`: componentes de interfaz agrupados por área.
- `features/`: lógica de dominio para clubes, miembros, sellos, billetera y analítica.
- `lib/`: clientes e infraestructura compartida.
- `services/`, `hooks/`, `types/`: servicios, hooks y tipos compartidos.
- `supabase/`: configuración, semillas y migraciones.
- `public/`: recursos estáticos.

Las carpetas de los módulos están preparadas; sus páginas, acciones y esquema de base de datos se implementarán a medida que avance el producto.
