# InmoCollab

Plataforma de colaboración inmobiliaria para agencias en la Costa Blanca (España). Permite gestionar propiedades de obra nueva, registrar clientes, programar visitas y hacer seguimiento de actividad con protección de comisiones.

## Arquitectura

Monorepo con dos servicios:

```
InmoCollab/
├── frontend/       # Vite + React 18 SPA
├── backend/        # Express + Prisma + PostgreSQL
└── docs/           # Documentación comercial (.docx, .pptx, .pdf, .xlsx)
```

### Frontend (`/frontend`)
- **Stack**: Vite 6, React 18, React Router v7, lucide-react
- **Idiomas**: ES/EN (i18n propio en `src/i18n/translations.js`)
- **API client**: `src/lib/api.js` — usa `VITE_API_URL` (build-time)
- **Auth**: JWT en localStorage, hook `useAuth` con AuthProvider
- **Páginas**: Landing, Login, Dashboard, Properties, PropertyDetail, Clients, Visits, Activity, Legal, Contact
- **Build**: `npm run build` → `dist/`

### Backend (`/backend`)
- **Stack**: Express 4, Prisma 6 (ORM), bcryptjs, JWT
- **DB**: PostgreSQL (5 modelos: User, Property, Client, Visit, Activity, ContactRequest)
- **Rutas API**: `/api/auth`, `/api/properties`, `/api/clients`, `/api/visits`, `/api/activity`, `/api/contact`, `/api/health`
- **Auth middleware**: JWT Bearer token en `src/middleware/auth.js`
- **CORS**: controlado por env `FRONTEND_URL`
- **Seed**: `node prisma/seed.js` (propiedades demo)

## Infraestructura de producción

| Componente | Plataforma | URL |
|-----------|-----------|-----|
| Frontend | Cloudflare Pages | https://inmocollab.pages.dev |
| Backend API | Railway (Dockerfile) | https://inmocollab-production.up.railway.app |
| PostgreSQL | Railway | Interna (ref: `${{Postgres.DATABASE_URL}}`) |

### Railway
- **Proyecto**: `imaginative-ambition` (proyecto ID: `a69f2555-8adb-499c-b4c3-454cd350a3b4`)
- **Backend service**: `InmoCollab` — Builder: Dockerfile, Root Dir: `/backend`
- **Frontend service**: `perceptive-imagination` — Builder: Dockerfile, Root Dir: `/frontend` (backup, URL principal es Cloudflare)
- **Env vars backend**: `DATABASE_URL`, `JWT_SECRET`, `PORT=3001`, `FRONTEND_URL=https://inmocollab.pages.dev`
- **Autodeploy**: push a `main` → rebuild automático en Railway

### Cloudflare Pages
- **Proyecto**: `inmocollab` → `inmocollab.pages.dev`
- **Deploy**: `npx wrangler pages deploy dist --project-name inmocollab --branch main`
- **Importante**: Cloudflare Pages sirve estáticos, requiere build local con `VITE_API_URL=https://inmocollab-production.up.railway.app npm run build` antes de deploy

### GitHub
- **Repo**: `mariatomasa/InmoCollab` (privado)
- **Auth**: gh CLI con device flow

## Desarrollo local

```bash
# Backend
cd backend
cp .env.example .env  # editar DATABASE_URL con postgres local
npm install
npx prisma db push
npm run db:seed
npm run dev

# Frontend
cd frontend
npm install
VITE_API_URL=http://localhost:3001 npm run dev
```

## Deploy

```bash
# Backend: push a main (Railway autodeploy)
git add . && git commit -m "..." && git push

# Frontend Cloudflare: build y deploy manual
cd frontend
VITE_API_URL=https://inmocollab-production.up.railway.app npm run build
npx wrangler pages deploy dist --project-name inmocollab --branch main
```

## Modos de comunicación

Este proyecto tiene dos usuarios con perfiles muy distintos:

- **Modo María (por defecto)**: María es la propietaria del negocio, con más de 15 años de experiencia en el sector inmobiliario pero sin conocimientos técnicos. Cuando hables con ella:
  - NO uses jerga técnica (nada de deploy, commit, backend, frontend, API, endpoints, JWT, etc.)
  - Traduce TODO a lenguaje de negocio: "la web", "la base de datos", "el servidor", "subir los cambios", "la parte que ven los usuarios", "la parte que gestiona los datos"
  - Céntrate en el impacto de negocio, no en la implementación
  - Si necesitas mencionar algo técnico, explícalo con una analogía sencilla
  - Trátala como la experta inmobiliaria que es

- **Modo Ricardo / Modo técnico**: Ricardo es el marido de María y quien gestiona la infraestructura tecnológica. Cuando se active este modo (el usuario dirá "modo técnico", "modo Ricardo", o similar):
  - Usa toda la terminología técnica necesaria
  - Habla de arquitectura, código, deploys, etc. sin restricciones
  - Vuelve al modo María cuando se indique ("modo María", "modo normal", o similar)

Por defecto, siempre se arranca en **Modo María**.

## Notas técnicas importantes

- **Prisma postinstall**: `package.json` del backend tiene `"postinstall": "prisma generate"`. El Dockerfile DEBE copiar `prisma/` ANTES de `npm ci`.
- **VITE_API_URL**: Variable de build-time (se bake en el bundle). No funciona como env var en runtime.
- **PORT en Railway**: El frontend Dockerfile usa `${PORT:-3000}` para respetar el puerto que Railway asigna.
- **CORS**: El backend solo acepta requests del origin definido en `FRONTEND_URL`.
