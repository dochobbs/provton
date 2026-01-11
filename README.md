# ProviderTone

AI-powered style profile generation for healthcare providers. Capture your unique communication voice and documentation style to enable AI systems that sound authentically like you.

## Overview

ProviderTone helps healthcare providers create detailed style profiles through two methods:

1. **Web Application** - Interactive interrogation wizard that guides providers through examples and questions to extract their communication patterns
2. **Local CLI Tool** - Extract profiles from existing clinical notes and portal messages (PHI stays on your infrastructure)

## Project Structure

```
providertone/
├── app/                    # Next.js web application
├── components/             # React components
├── lib/                    # Shared utilities
├── providertone-local/     # Python CLI for local profile extraction
└── docs/                   # Specifications and plans
```

## Web Application

The Next.js web application provides an interactive wizard for providers to create their style profiles.

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Features

- Interactive messaging style interrogation
- Documentation style capture
- Real-time profile preview
- JSON export compatible with AI systems
- Demo playground for testing generated profiles

## ProviderTone Local (CLI)

For organizations that need to extract profiles from existing clinical data without uploading PHI.

### Quick Start

```bash
cd providertone-local

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install
pip install -r requirements.txt
pip install -e .

# Configure API key
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Run extraction
providertone extract \
  --messages exports/messages.csv \
  --notes exports/notes/ \
  --provider-id dr-smith \
  --output profiles/dr-smith.json
```

### Features

- Runs 100% locally - PHI never leaves your infrastructure
- Supports CSV, JSON, and text file exports from any EHR
- Uses Claude API (with BAA) or local LLMs for air-gapped environments
- Outputs website-compatible JSON style profiles
- Built-in PHI detection and automatic redaction

See [providertone-local/README.md](./providertone-local/README.md) for full documentation.

## Style Profile Format

Both tools generate profiles in the same JSON format:

```json
{
  "exportedAt": "2026-01-11T12:00:00.000Z",
  "providerId": "dr-smith",
  "messaging": {
    "generatedProfile": {
      "surfacePatterns": { ... },
      "toneDimensions": { ... },
      "negativeConstraints": { ... },
      "judgmentPatterns": { ... },
      "signatureMoves": [ ... ],
      "voiceSummary": "..."
    }
  },
  "documentation": {
    "generatedProfile": {
      "structuralPatterns": { ... },
      "voiceDimensions": { ... },
      "standardPhrasings": { ... },
      "visitTypeVariations": { ... }
    }
  }
}
```

## Use Cases

- **AI Draft Generation** - Enable AI to write portal messages in the provider's voice
- **Documentation Assistance** - Generate clinical notes matching provider style
- **Quality Consistency** - Maintain voice across AI-assisted communications
- **Training Data** - Create examples for fine-tuning models

## Technology Stack

### Web Application
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Vercel deployment

### Local CLI
- Python 3.9+
- Click (CLI framework)
- Anthropic SDK (Claude API)
- Rich (terminal UI)
- Pandas (data processing)

## Development

### Web Application

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # Run linter
```

### Local CLI

```bash
cd providertone-local
source .venv/bin/activate

pip install -e ".[dev]"   # Install with dev dependencies
pytest                     # Run tests
black src/                 # Format code
ruff src/                  # Lint
```

## Documentation

- [Local Profile Extraction Spec](./docs/plans/2026-01-10-local-profile-extraction.md)
- [Style Profile Integration Plan](./docs/plans/2026-01-10-style-profile-integration-plan.md)
- [Demo Playground Feature](./docs/plans/2026-01-10-demo-playground-feature.md)

## License

MIT License
