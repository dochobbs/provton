# ProviderTone

## Overview
ProviderTone by Elation Health is a Next.js application that helps capture communication styles for healthcare providers. It trains AI to match a provider's unique voice for patient portal messages and clinical documentation.

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
  - `api/` - API routes for AI generation (generate-drafts, generate-profile)
  - `documentation/` - 7-step flow for clinical documentation style capture
  - `messaging/` - 6-step flow for portal messaging style capture
  - `summary/` - Summary page for captured preferences
- `src/components/` - Reusable React components
  - `inputs/` - Form input components
  - `layout/` - Layout and container components
- `src/context/` - React context providers
- `src/data/` - Scenario data for documentation and messaging
- `src/types/` - TypeScript type definitions
- `public/` - Static assets

## Tech Stack
- Next.js 16.1.1 with App Router
- React 19.2.3
- TypeScript
- Tailwind CSS 4
- Anthropic AI SDK for AI features

## Development
The app runs on port 5000:
```bash
npm run dev
```

## Deployment
Configured for autoscale deployment:
- Build: `npm run build`
- Run: `npm run start`
