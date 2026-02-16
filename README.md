# phiacta-web

The web frontend for **Phiacta** -- a structured knowledge platform for science. Built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXTAUTH_SECRET` | Auth session secret | -- |
| `NEXTAUTH_URL` | Canonical app URL | `http://localhost:3000` |

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # Reusable React components
  lib/           # API client, types, utilities
```

## Docker

```bash
docker build -t phiacta-web .
docker run -p 3000:3000 phiacta-web
```

## License

GPL-3.0
