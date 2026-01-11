# ProviderTone Local

Extract provider style profiles from existing clinical notes and portal messages. Runs entirely on your local machine - PHI never leaves your infrastructure.

**Status:** v1.0.0 - Initial Release | January 2026

## Overview

ProviderTone Local analyzes your existing clinical documentation to generate style profiles compatible with the ProviderTone website and API. Instead of completing an interrogation wizard, providers can leverage years of existing notes and messages.

**Key Features:**
- Runs 100% locally - PHI stays on your infrastructure
- Supports CSV, JSON, and text file exports from any EHR
- Uses Claude API (with BAA) or local LLMs for air-gapped environments
- Outputs website-compatible JSON style profiles
- Built-in PHI detection and automatic redaction
- Rich CLI with progress indicators and summaries

## Quick Start

```bash
# 1. Clone and install
cd providertone-local
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .

# 2. Set up API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Run extraction
providertone extract \
  --messages exports/messages.csv \
  --notes exports/notes/ \
  --provider-id dr-smith \
  --output profiles/dr-smith.json
```

## Installation

### Requirements
- Python 3.9+
- Anthropic API key (or local LLM for air-gapped)

### Steps

```bash
# Clone the repository
git clone https://github.com/your-org/providertone.git
cd providertone/providertone-local

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install CLI tool
pip install -e .

# Verify installation
providertone --help
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Required: Anthropic API key
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Custom API endpoint
# ANTHROPIC_BASE_URL=https://api.anthropic.com

# Optional: For local LLM (air-gapped environments)
# LOCAL_LLM_ENDPOINT=http://localhost:11434
# LOCAL_LLM_MODEL=llama3:70b
```

## Usage

### Basic Commands

```bash
# Analyze portal messages
providertone analyze-messages \
  --input messages.csv \
  --provider-id "dr-smith" \
  --output analysis/messages.json

# Analyze clinical notes
providertone analyze-notes \
  --input notes/ \
  --provider-id "dr-smith" \
  --output analysis/notes.json

# Generate combined profile
providertone generate-profile \
  --messaging analysis/messages.json \
  --documentation analysis/notes.json \
  --output profiles/dr-smith.json

# One-shot: analyze and generate in one command
providertone extract \
  --messages messages.csv \
  --notes notes/ \
  --provider-id "dr-smith" \
  --output profiles/dr-smith.json
```

### Advanced Options

```bash
# Use local LLM (air-gapped mode)
providertone analyze-messages \
  --input messages.csv \
  --provider-id "dr-smith" \
  --llm local \
  --output analysis/messages.json

# Specify sample size
providertone analyze-notes \
  --input notes/ \
  --provider-id "dr-smith" \
  --sample-size 100 \
  --output analysis/notes.json

# Filter by date range
providertone analyze-messages \
  --input messages.csv \
  --provider-id "dr-smith" \
  --start-date 2024-01-01 \
  --end-date 2024-12-31 \
  --output analysis/messages.json

# Auto-redact PHI from output
providertone generate-profile \
  --messaging analysis/messages.json \
  --output profiles/dr-smith.json \
  --redact

# Verbose output
providertone analyze-messages \
  --input messages.csv \
  --provider-id "dr-smith" \
  --verbose \
  --output analysis/messages.json
```

## Input Formats

### Portal Messages (CSV)

```csv
message_id,provider_id,patient_id,direction,sent_at,subject,body
msg001,dr-smith,pt123,outbound,2024-06-15T10:30:00Z,RE: Fever question,"Hi Sarah, I understand..."
msg002,dr-smith,pt456,outbound,2024-06-15T14:22:00Z,RE: Refill request,"Hello John, I've sent..."
```

### Portal Messages (JSON)

```json
{
  "messages": [
    {
      "message_id": "msg001",
      "provider_id": "dr-smith",
      "patient_id": "pt123",
      "direction": "outbound",
      "sent_at": "2024-06-15T10:30:00Z",
      "subject": "RE: Fever question",
      "body": "Hi Sarah, I understand..."
    }
  ]
}
```

### Clinical Notes (JSON)

```json
{
  "notes": [
    {
      "note_id": "note001",
      "provider_id": "dr-smith",
      "patient_id": "pt789",
      "note_type": "progress_note",
      "visit_type": "acute",
      "created_at": "2024-06-15T09:00:00Z",
      "chief_complaint": "Ear pain",
      "content": {
        "hpi": "2-year-old female presents with...",
        "physical_exam": "TMs - R bulging...",
        "assessment": "Right acute otitis media",
        "plan": "Amoxicillin 80mg/kg/day..."
      }
    }
  ]
}
```

### Clinical Notes (CSV)

```csv
note_id,provider_id,patient_id,note_type,visit_type,created_at,chief_complaint,hpi,physical_exam,assessment,plan
note001,dr-smith,pt789,progress_note,acute,2024-06-15,Ear pain,"2yo presents...","TMs bulging...","AOM","Amoxicillin..."
```

### Plain Text Directory

```
notes/
├── 2024-06-15_pt789_acute.txt
├── 2024-06-15_pt012_chronic.txt
└── 2024-06-16_pt345_wellchild.txt
```

Each file contains the full note text. Metadata can be in YAML header:

```text
---
provider_id: dr-smith
patient_id: pt789
visit_type: acute
---

Chief Complaint: Ear pain

HPI: 2-year-old female presents with...
```

## Output Format

The generated profile is compatible with the ProviderTone website:

```json
{
  "exportedAt": "2024-06-15T15:30:00.000Z",
  "exportedBy": "providertone-local",
  "version": "1.0.0",
  "providerId": "dr-smith",
  "messaging": {
    "completedAt": "2024-06-15T15:30:00.000Z",
    "generatedProfile": {
      "surfacePatterns": { ... },
      "toneDimensions": { ... },
      "negativeConstraints": { ... },
      "judgmentPatterns": { ... },
      "signatureMoves": [ ... ],
      "voiceSummary": "...",
      "exampleFragments": [ ... ]
    }
  },
  "documentation": {
    "completedAt": "2024-06-15T15:30:00.000Z",
    "generatedProfile": {
      "structuralPatterns": { ... },
      "voiceDimensions": { ... },
      "standardPhrasings": { ... },
      "visitTypeVariations": { ... },
      "signatureMoves": [ ... ],
      "voiceSummary": "..."
    }
  }
}
```

## PHI Safety

### Automatic Detection

The tool automatically scans output for potential PHI:
- Names (Mr./Mrs./Dr. patterns)
- Dates
- Phone numbers
- Email addresses
- SSNs
- MRNs
- Addresses

### Redaction

Use `--redact` to automatically replace detected PHI:

```bash
providertone generate-profile \
  --messaging analysis.json \
  --output profile.json \
  --redact
```

### Best Practices

1. **Run on encrypted disk** - Use FileVault/BitLocker
2. **Delete intermediate files** - Remove analysis JSONs after profile generation
3. **Review output** - Always review before sharing
4. **Use BAA** - Ensure Anthropic BAA is in place before using Claude API

## Local LLM Support

For fully air-gapped environments, use a local LLM via Ollama:

```bash
# Start Ollama
ollama serve

# Pull a model
ollama pull llama3:70b

# Run analysis with local LLM
providertone extract \
  --messages messages.csv \
  --provider-id dr-smith \
  --llm local \
  --output profile.json
```

Configure in `.env`:

```bash
LOCAL_LLM_ENDPOINT=http://localhost:11434
LOCAL_LLM_MODEL=llama3:70b
```

## Troubleshooting

### "No messages found for provider"

Check that `provider_id` in your data matches the `--provider-id` argument exactly.

### "Could not connect to local LLM"

Ensure Ollama is running: `ollama serve`

### "Rate limit exceeded"

The tool includes delays between API calls. For large datasets, consider:
- Reducing `--sample-size`
- Running during off-peak hours
- Using local LLM

### "PHI detected in output"

Review the findings and either:
- Use `--redact` for automatic redaction
- Manually review and edit the output file

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black src/

# Lint
ruff src/
```

## License

MIT License - See LICENSE file
