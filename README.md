# ClubVTG — AI Virtual Try-On

AI-powered virtual try-on that lets users upload their photo and see themselves wearing garments from a catalog. Built with Next.js 15 and OpenAI GPT-Image-1.5.

## How it works

1. User browses the garment catalog
2. Selects a garment and uploads a personal photo
3. The AI generates a realistic image of the user wearing the selected garment
4. Result is streamed progressively via SSE

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **AI**: OpenAI GPT-Image-1.5 (`/v1/images/edits` with multi-reference images)
- **Image processing**: sharp (server-side resize validation)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              Root layout
│   ├── page.tsx                Garment catalog
│   ├── error.tsx               Global error boundary
│   ├── loading.tsx             Global loading state
│   ├── globals.css             Tailwind v4 theme
│   ├── garment/[id]/
│   │   ├── page.tsx            Garment detail (Server Component)
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   └── api/tryon/
│       └── route.ts            SSE streaming endpoint
├── components/
│   ├── GarmentCard.tsx         Catalog card
│   ├── GarmentTryOnSection.tsx Upload + result orchestrator
│   ├── ImageUploader.tsx       File upload + client-side resize
│   └── ResultViewer.tsx        Before/after image navigator
└── lib/
    ├── types.ts                Shared types (TryOnStatus, SSE events)
    ├── utils.ts                cn() utility
    ├── prompts.ts              AI prompt constants
    ├── garments.ts             Mock garment catalog
    └── ai/
        └── gpt-image.ts       OpenAI GPT-Image-1.5 client
```

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:

```
OPENAI_API_KEY=your_key_here
```

> GPT-Image-1.5 may require [API Organization Verification](https://platform.openai.com/settings/organization/general).

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without an API key, the app runs in simulation mode (placeholder images with delays).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
