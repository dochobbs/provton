# Local Style Profile Extraction from Existing Notes

**Document Version:** 1.0
**Date:** January 10, 2026
**Status:** Implementation Ready
**Security Classification:** PHI-Safe Local Processing

---

## Executive Summary

### The Problem

The web-based interrogation requires providers to write fresh examples. But providers already have years of notes and messages that perfectly demonstrate their style. We need to extract style profiles from this existing data.

**Constraints:**
- PHI cannot leave organizational infrastructure
- Cannot upload notes to a website
- Must run locally or within secure environment
- Output must match website's JSON profile format

### The Solution

A Python CLI toolkit that:
1. Runs entirely on local machine or within org's secure infrastructure
2. Processes exported notes/messages from EHR
3. Uses Claude API (with BAA) for analysis - PHI never stored by Anthropic
4. Generates identical StyleProfile JSON to the website
5. Optionally works with local LLMs for fully air-gapped environments

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     LOCAL PROFILE EXTRACTION PIPELINE                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ EHR EXPORT      │     │ DATA LOADER     │     │ PREPROCESSOR    │
│                 │     │                 │     │                 │
│ • CSV export    │────▶│ • Parse formats │────▶│ • Filter by     │
│ • JSON export   │     │ • Validate      │     │   provider      │
│ • FHIR bundle   │     │ • Deduplicate   │     │ • Categorize    │
│ • Text files    │     │                 │     │   by type       │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ANALYSIS ENGINE                                    │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ BATCH SAMPLER   │  │ PATTERN         │  │ AGGREGATOR      │             │
│  │                 │  │ EXTRACTOR       │  │                 │             │
│  │ • Strategic     │─▶│                 │─▶│ • Merge batch   │             │
│  │   sampling      │  │ • Claude API    │  │   insights      │             │
│  │ • Cover all     │  │   (with BAA)    │  │ • Resolve       │             │
│  │   message types │  │   OR            │  │   conflicts     │             │
│  │ • Representative│  │ • Local LLM     │  │ • Score         │             │
│  │   examples      │  │                 │  │   confidence    │             │
│  └─────────────────┘  └─────────────────┘  └────────┬────────┘             │
│                                                      │                      │
└──────────────────────────────────────────────────────┼──────────────────────┘
                                                       │
                        ┌──────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROFILE GENERATOR                                    │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ MESSAGING       │  │ DOCUMENTATION   │  │ JSON EXPORTER   │             │
│  │ PROFILE         │  │ PROFILE         │  │                 │             │
│  │                 │  │                 │  │ • Website-      │             │
│  │ • surfacePatterns│ │ • structuralPat │  │   compatible    │             │
│  │ • toneDimensions │ │ • voiceDimension│  │   format        │             │
│  │ • negativeConstr │ │ • standardPhras │  │ • PHI-free      │             │
│  │ • judgmentPatt  │  │ • visitTypeVar  │  │   output        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
                                          ┌─────────────────────┐
                                          │ STYLE PROFILE JSON  │
                                          │ (Same as website)   │
                                          └─────────────────────┘
```

---

## File Structure

```
providertone-local/
├── README.md                           # Setup and usage guide
├── requirements.txt                    # Python dependencies
├── setup.py                            # Package installation
├── .env.example                        # Environment template
│
├── src/
│   ├── __init__.py
│   ├── cli.py                          # Main CLI entry point
│   │
│   ├── loaders/
│   │   ├── __init__.py
│   │   ├── base.py                     # Abstract loader
│   │   ├── csv_loader.py               # CSV format
│   │   ├── json_loader.py              # JSON format
│   │   ├── fhir_loader.py              # FHIR bundles
│   │   └── text_loader.py              # Plain text files
│   │
│   ├── preprocessors/
│   │   ├── __init__.py
│   │   ├── message_preprocessor.py     # Portal message prep
│   │   ├── note_preprocessor.py        # Clinical note prep
│   │   └── categorizer.py              # Message/note type detection
│   │
│   ├── analyzers/
│   │   ├── __init__.py
│   │   ├── sampler.py                  # Strategic sampling
│   │   ├── messaging_analyzer.py       # Message pattern extraction
│   │   ├── documentation_analyzer.py   # Note pattern extraction
│   │   └── aggregator.py               # Combine batch results
│   │
│   ├── generators/
│   │   ├── __init__.py
│   │   ├── messaging_profile.py        # Generate messaging StyleProfile
│   │   ├── documentation_profile.py    # Generate DocumentationStyleProfile
│   │   └── exporter.py                 # JSON export
│   │
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── claude_client.py            # Anthropic API client
│   │   ├── local_client.py             # Local LLM (Ollama, etc.)
│   │   └── prompts/
│   │       ├── messaging_analysis.txt
│   │       ├── documentation_analysis.txt
│   │       ├── pattern_extraction.txt
│   │       └── profile_synthesis.txt
│   │
│   └── utils/
│       ├── __init__.py
│       ├── phi_detector.py             # Detect PHI in outputs
│       └── validation.py               # Schema validation
│
├── scripts/
│   ├── export_from_elation.py          # Elation-specific export helper
│   ├── export_from_epic.py             # Epic-specific export helper
│   └── batch_process.py                # Process multiple providers
│
├── tests/
│   ├── test_loaders.py
│   ├── test_analyzers.py
│   ├── test_generators.py
│   └── fixtures/
│       ├── sample_messages.csv
│       └── sample_notes.json
│
└── output/                             # Generated profiles (gitignored)
    └── .gitkeep
```

---

## Installation & Setup

### Requirements

```txt
# requirements.txt
anthropic>=0.25.0
click>=8.0.0
pydantic>=2.0.0
pandas>=2.0.0
python-dotenv>=1.0.0
rich>=13.0.0              # Pretty CLI output
tiktoken>=0.5.0           # Token counting
jsonschema>=4.0.0         # Profile validation

# Optional: Local LLM support
# ollama>=0.1.0
# llama-cpp-python>=0.2.0
```

### Environment Setup

```bash
# .env.example
ANTHROPIC_API_KEY=sk-ant-...

# Optional: For Elation API integration
ELATION_API_KEY=...
ELATION_PRACTICE_ID=...

# Optional: Local LLM
LOCAL_LLM_ENDPOINT=http://localhost:11434
LOCAL_LLM_MODEL=llama3:70b
```

### Installation

```bash
# Clone or copy to secure environment
cd providertone-local

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install package
pip install -e .

# Verify installation
providertone --help
```

---

## CLI Usage

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
  --note-types "progress,visit,consult" \
  --output analysis/notes.json

# Generate combined profile
providertone generate-profile \
  --messaging analysis/messages.json \
  --documentation analysis/notes.json \
  --output profiles/dr-smith-profile.json

# One-shot: analyze and generate
providertone extract \
  --messages messages.csv \
  --notes notes/ \
  --provider-id "dr-smith" \
  --output profiles/dr-smith-profile.json
```

### Advanced Options

```bash
# Use local LLM instead of Claude API
providertone analyze-messages \
  --input messages.csv \
  --provider-id "dr-smith" \
  --llm local \
  --local-model "llama3:70b"

# Specify sample size (default: 50 per category)
providertone analyze-notes \
  --input notes/ \
  --sample-size 100 \
  --provider-id "dr-smith"

# Filter by date range
providertone analyze-messages \
  --input messages.csv \
  --provider-id "dr-smith" \
  --start-date 2024-01-01 \
  --end-date 2024-12-31

# Verbose output for debugging
providertone analyze-messages \
  --input messages.csv \
  --provider-id "dr-smith" \
  --verbose \
  --show-samples
```

---

## Input Formats

### Portal Messages CSV

```csv
message_id,provider_id,patient_id,direction,sent_at,subject,body
msg001,dr-smith,pt123,outbound,2024-06-15T10:30:00Z,RE: Fever question,"Hi Sarah,

I understand how worrying it is when Emma has a fever..."
msg002,dr-smith,pt456,outbound,2024-06-15T14:22:00Z,RE: Medication refill,"Hello John,

I've sent your lisinopril refill to Walgreens..."
```

### Clinical Notes JSON

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
        "physical_exam": "TMs - R bulging, erythematous...",
        "assessment": "Right acute otitis media",
        "plan": "Amoxicillin 80mg/kg/day..."
      }
    }
  ]
}
```

### Plain Text Directory

```
notes/
├── 2024-06-15_pt789_acute.txt
├── 2024-06-15_pt012_chronic.txt
├── 2024-06-16_pt345_wellchild.txt
└── ...
```

Each file contains the full note text. Metadata extracted from filename or first lines.

---

## Core Implementation

### 1. CLI Entry Point (`src/cli.py`)

```python
#!/usr/bin/env python3
"""
ProviderTone Local - Extract style profiles from existing notes and messages.
"""

import click
from pathlib import Path
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

from .loaders import load_data
from .preprocessors import preprocess_messages, preprocess_notes
from .analyzers import analyze_messaging_style, analyze_documentation_style
from .generators import generate_profile, export_profile

console = Console()


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """ProviderTone Local - Extract style profiles from existing PHI data."""
    pass


@cli.command()
@click.option("--input", "-i", required=True, type=click.Path(exists=True),
              help="Path to messages file (CSV, JSON) or directory")
@click.option("--provider-id", "-p", required=True, help="Provider identifier")
@click.option("--output", "-o", required=True, type=click.Path(),
              help="Output path for analysis JSON")
@click.option("--sample-size", default=50, help="Messages per category to analyze")
@click.option("--llm", default="claude", type=click.Choice(["claude", "local"]),
              help="LLM to use for analysis")
@click.option("--start-date", help="Filter messages after this date (YYYY-MM-DD)")
@click.option("--end-date", help="Filter messages before this date (YYYY-MM-DD)")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output")
def analyze_messages(input, provider_id, output, sample_size, llm,
                     start_date, end_date, verbose):
    """Analyze portal messages to extract communication style patterns."""

    console.print(f"[bold blue]ProviderTone Local[/] - Message Analysis")
    console.print(f"Provider: {provider_id}")
    console.print(f"Input: {input}")
    console.print()

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        # Load data
        task = progress.add_task("Loading messages...", total=None)
        messages = load_data(input, data_type="messages")
        progress.update(task, description=f"Loaded {len(messages)} messages")

        # Filter by provider
        task = progress.add_task("Filtering by provider...", total=None)
        messages = [m for m in messages if m.get("provider_id") == provider_id]
        messages = filter_by_date(messages, start_date, end_date)
        progress.update(task, description=f"Found {len(messages)} messages for {provider_id}")

        # Preprocess and categorize
        task = progress.add_task("Categorizing messages...", total=None)
        categorized = preprocess_messages(messages)
        progress.update(task, description="Messages categorized by type")

        if verbose:
            print_category_summary(categorized)

        # Sample strategically
        task = progress.add_task("Sampling messages...", total=None)
        samples = sample_messages(categorized, sample_size)
        progress.update(task, description=f"Sampled {sum(len(s) for s in samples.values())} messages")

        # Analyze with LLM
        task = progress.add_task("Analyzing patterns (this may take a few minutes)...", total=None)
        analysis = analyze_messaging_style(samples, llm=llm)
        progress.update(task, description="Analysis complete")

    # Save results
    save_analysis(analysis, output)
    console.print(f"\n[green]✓[/] Analysis saved to {output}")

    # Show summary
    print_analysis_summary(analysis)


@cli.command()
@click.option("--input", "-i", required=True, type=click.Path(exists=True),
              help="Path to notes file or directory")
@click.option("--provider-id", "-p", required=True, help="Provider identifier")
@click.option("--output", "-o", required=True, type=click.Path(),
              help="Output path for analysis JSON")
@click.option("--note-types", default="progress,visit,consult",
              help="Comma-separated note types to include")
@click.option("--sample-size", default=50, help="Notes per category to analyze")
@click.option("--llm", default="claude", type=click.Choice(["claude", "local"]))
@click.option("--verbose", "-v", is_flag=True)
def analyze_notes(input, provider_id, output, note_types, sample_size, llm, verbose):
    """Analyze clinical notes to extract documentation style patterns."""

    console.print(f"[bold blue]ProviderTone Local[/] - Documentation Analysis")
    console.print(f"Provider: {provider_id}")
    console.print(f"Note types: {note_types}")
    console.print()

    # Similar implementation to analyze_messages...
    # Load, filter, categorize, sample, analyze, save
    pass


@cli.command()
@click.option("--messaging", "-m", type=click.Path(exists=True),
              help="Path to messaging analysis JSON")
@click.option("--documentation", "-d", type=click.Path(exists=True),
              help="Path to documentation analysis JSON")
@click.option("--output", "-o", required=True, type=click.Path(),
              help="Output path for final profile JSON")
def generate_profile(messaging, documentation, output):
    """Generate final style profile from analysis results."""

    console.print(f"[bold blue]ProviderTone Local[/] - Profile Generation")

    if not messaging and not documentation:
        console.print("[red]Error:[/] At least one of --messaging or --documentation required")
        return

    profile = {}

    if messaging:
        console.print(f"Loading messaging analysis: {messaging}")
        msg_analysis = load_json(messaging)
        profile["messaging"] = synthesize_messaging_profile(msg_analysis)

    if documentation:
        console.print(f"Loading documentation analysis: {documentation}")
        doc_analysis = load_json(documentation)
        profile["documentation"] = synthesize_documentation_profile(doc_analysis)

    # Validate against schema
    validate_profile(profile)

    # Check for PHI leakage
    check_phi_in_output(profile)

    # Export
    export_profile(profile, output)
    console.print(f"\n[green]✓[/] Profile saved to {output}")
    console.print("\nThis profile is compatible with the ProviderTone website and API.")


@cli.command()
@click.option("--messages", type=click.Path(exists=True))
@click.option("--notes", type=click.Path(exists=True))
@click.option("--provider-id", "-p", required=True)
@click.option("--output", "-o", required=True, type=click.Path())
@click.option("--llm", default="claude", type=click.Choice(["claude", "local"]))
def extract(messages, notes, provider_id, output, llm):
    """One-shot extraction: analyze data and generate profile."""

    console.print(f"[bold blue]ProviderTone Local[/] - Full Extraction")
    console.print(f"Provider: {provider_id}")

    # Run full pipeline
    # ... combines analyze_messages, analyze_notes, generate_profile
    pass


if __name__ == "__main__":
    cli()
```

### 2. Message Analyzer (`src/analyzers/messaging_analyzer.py`)

```python
"""
Analyze portal messages to extract communication style patterns.
"""

from typing import Dict, List, Any
from ..llm import get_llm_client


def analyze_messaging_style(
    categorized_samples: Dict[str, List[Dict]],
    llm: str = "claude"
) -> Dict[str, Any]:
    """
    Analyze sampled messages to extract style patterns.

    Args:
        categorized_samples: Messages grouped by type (anxious, routine, etc.)
        llm: Which LLM to use ("claude" or "local")

    Returns:
        Analysis dictionary with extracted patterns
    """
    client = get_llm_client(llm)

    # Analyze each category separately
    category_analyses = {}
    for category, messages in categorized_samples.items():
        if not messages:
            continue

        category_analyses[category] = analyze_category(
            messages=messages,
            category=category,
            client=client
        )

    # Aggregate across categories
    aggregated = aggregate_analyses(category_analyses)

    return aggregated


def analyze_category(
    messages: List[Dict],
    category: str,
    client: Any
) -> Dict[str, Any]:
    """Analyze a single category of messages."""

    # Format messages for prompt
    formatted = format_messages_for_prompt(messages)

    prompt = f"""Analyze these portal messages from a healthcare provider.
All messages are of type: {category}

Extract the following patterns:

1. SURFACE PATTERNS
- How do they greet patients? (exact phrases)
- How do they sign off? (exact phrases)
- Typical message length (short/medium/long)
- Paragraph structure
- Punctuation patterns (exclamation points, ellipses, etc.)

2. TONE PATTERNS
- Warmth level (1-10) with evidence
- Directiveness (1-10) with evidence
- Formality (1-10) with evidence
- How do they express clinical uncertainty?
- How do they handle emotional content?

3. DISTINCTIVE PHRASES
- List 5-10 phrases this provider uses frequently
- List any phrases they seem to deliberately avoid

4. CATEGORY-SPECIFIC PATTERNS
For {category} messages specifically, how does this provider:
- Open the conversation?
- Address the patient's concern?
- Provide next steps?
- Close the message?

Here are the messages:

{formatted}

Respond with a JSON object containing your analysis."""

    response = client.analyze(prompt)
    return parse_category_analysis(response)


def format_messages_for_prompt(messages: List[Dict]) -> str:
    """Format messages for inclusion in prompt."""
    formatted_parts = []

    for i, msg in enumerate(messages, 1):
        formatted_parts.append(f"""
--- Message {i} ---
Date: {msg.get('sent_at', 'Unknown')}
Subject: {msg.get('subject', 'No subject')}

{msg.get('body', msg.get('content', ''))}
""")

    return "\n".join(formatted_parts)


def aggregate_analyses(category_analyses: Dict[str, Dict]) -> Dict[str, Any]:
    """Combine analyses from different categories into unified patterns."""

    # Collect all greeting patterns
    all_greetings = []
    all_closings = []
    all_phrases = []
    tone_scores = {
        'warmth': [],
        'directiveness': [],
        'formality': [],
        'thoroughness': [],
        'certainty': []
    }

    for category, analysis in category_analyses.items():
        if 'surface_patterns' in analysis:
            all_greetings.extend(analysis['surface_patterns'].get('greetings', []))
            all_closings.extend(analysis['surface_patterns'].get('closings', []))

        if 'distinctive_phrases' in analysis:
            all_phrases.extend(analysis['distinctive_phrases'].get('frequent', []))

        if 'tone_patterns' in analysis:
            for tone, scores in tone_scores.items():
                if tone in analysis['tone_patterns']:
                    scores.append(analysis['tone_patterns'][tone])

    # Deduplicate and rank by frequency
    greetings = rank_by_frequency(all_greetings)
    closings = rank_by_frequency(all_closings)
    phrases = rank_by_frequency(all_phrases)

    # Average tone scores
    averaged_tones = {
        tone: sum(scores) / len(scores) if scores else 5
        for tone, scores in tone_scores.items()
    }

    return {
        'surface_patterns': {
            'greetings': greetings[:5],
            'closings': closings[:5],
            'length_tendency': determine_length_tendency(category_analyses),
        },
        'tone_dimensions': averaged_tones,
        'distinctive_phrases': phrases[:10],
        'category_patterns': category_analyses,
        'confidence': calculate_confidence(category_analyses),
    }


def rank_by_frequency(items: List[str]) -> List[str]:
    """Rank items by how often they appear."""
    from collections import Counter
    counts = Counter(items)
    return [item for item, _ in counts.most_common()]
```

### 3. Documentation Analyzer (`src/analyzers/documentation_analyzer.py`)

```python
"""
Analyze clinical notes to extract documentation style patterns.
"""

from typing import Dict, List, Any
from ..llm import get_llm_client


def analyze_documentation_style(
    categorized_samples: Dict[str, List[Dict]],
    llm: str = "claude"
) -> Dict[str, Any]:
    """
    Analyze sampled clinical notes to extract documentation patterns.

    Args:
        categorized_samples: Notes grouped by visit type (acute, chronic, etc.)
        llm: Which LLM to use

    Returns:
        Analysis dictionary with extracted patterns
    """
    client = get_llm_client(llm)

    # Analyze each visit type
    visit_type_analyses = {}
    for visit_type, notes in categorized_samples.items():
        if not notes:
            continue

        visit_type_analyses[visit_type] = analyze_note_category(
            notes=notes,
            visit_type=visit_type,
            client=client
        )

    # Analyze individual note sections
    section_analyses = analyze_note_sections(categorized_samples, client)

    # Aggregate
    aggregated = aggregate_documentation_analyses(
        visit_type_analyses,
        section_analyses
    )

    return aggregated


def analyze_note_category(
    notes: List[Dict],
    visit_type: str,
    client: Any
) -> Dict[str, Any]:
    """Analyze notes of a specific visit type."""

    formatted = format_notes_for_prompt(notes)

    prompt = f"""Analyze these clinical notes from a healthcare provider.
All notes are from: {visit_type} visits

Extract the following patterns:

1. STRUCTURAL PATTERNS
- Overall note organization (SOAP, problem-oriented, other)
- How they construct the HPI (narrative, bullet points, templated)
- Assessment section style (diagnosis only, diagnosis + rationale, differential)
- Plan organization (numbered, by category, free text)
- Physical exam documentation style (comprehensive, focused, pertinent only)

2. VOICE PATTERNS
- Verbosity level (1-10) with evidence
- Clinical reasoning visibility (1-10) - how much thinking is shown
- Formality (1-10)
- Certainty expression (1-10) - confident vs hedging
- Defensiveness (1-10) - medicolegal awareness

3. STANDARD PHRASINGS
- How do they typically open HPIs? (exact phrases)
- Transition phrases they use
- Assessment language patterns
- Plan language patterns
- Safety net / return precaution phrases

4. DISTINCTIVE PATTERNS
- Unique documentation habits
- Phrases they use frequently
- Patterns they seem to avoid

Here are the notes:

{formatted}

Respond with a JSON object containing your analysis."""

    response = client.analyze(prompt)
    return parse_documentation_analysis(response)


def analyze_note_sections(
    all_notes: Dict[str, List[Dict]],
    client: Any
) -> Dict[str, Any]:
    """Analyze specific sections (HPI, Assessment, Plan) across all notes."""

    # Extract all HPIs
    all_hpis = []
    all_assessments = []
    all_plans = []

    for notes in all_notes.values():
        for note in notes:
            content = note.get('content', {})
            if isinstance(content, dict):
                if content.get('hpi'):
                    all_hpis.append(content['hpi'])
                if content.get('assessment'):
                    all_assessments.append(content['assessment'])
                if content.get('plan'):
                    all_plans.append(content['plan'])

    section_analyses = {}

    if all_hpis:
        section_analyses['hpi'] = analyze_section(
            all_hpis[:30], 'HPI', client
        )

    if all_assessments:
        section_analyses['assessment'] = analyze_section(
            all_assessments[:30], 'Assessment', client
        )

    if all_plans:
        section_analyses['plan'] = analyze_section(
            all_plans[:30], 'Plan', client
        )

    return section_analyses


def analyze_section(
    sections: List[str],
    section_type: str,
    client: Any
) -> Dict[str, Any]:
    """Analyze a specific note section type."""

    formatted = "\n\n---\n\n".join(sections)

    prompt = f"""Analyze these {section_type} sections from clinical notes.

Extract:
1. Common opening phrases (list 3-5)
2. Structural pattern (how they organize this section)
3. Level of detail (brief, moderate, comprehensive)
4. Distinctive phrases unique to this provider
5. Language patterns (active vs passive, first person vs third person, etc.)

{section_type} sections:

{formatted}

Respond with JSON."""

    response = client.analyze(prompt)
    return parse_section_analysis(response)


def format_notes_for_prompt(notes: List[Dict]) -> str:
    """Format clinical notes for inclusion in prompt."""
    formatted_parts = []

    for i, note in enumerate(notes, 1):
        content = note.get('content', {})

        if isinstance(content, dict):
            note_text = f"""
Chief Complaint: {note.get('chief_complaint', 'Not specified')}

HPI:
{content.get('hpi', 'Not documented')}

Physical Exam:
{content.get('physical_exam', 'Not documented')}

Assessment:
{content.get('assessment', 'Not documented')}

Plan:
{content.get('plan', 'Not documented')}
"""
        else:
            note_text = str(content)

        formatted_parts.append(f"""
--- Note {i} ({note.get('visit_type', 'Unknown type')}) ---
Date: {note.get('created_at', 'Unknown')}

{note_text}
""")

    return "\n".join(formatted_parts)
```

### 4. Profile Generator (`src/generators/messaging_profile.py`)

```python
"""
Generate website-compatible MessagingStyleProfile from analysis.
"""

from typing import Dict, Any


def synthesize_messaging_profile(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert raw analysis into website-compatible StyleProfile format.

    Args:
        analysis: Raw analysis from messaging_analyzer

    Returns:
        StyleProfile dict matching website schema exactly
    """

    surface = analysis.get('surface_patterns', {})
    tones = analysis.get('tone_dimensions', {})
    phrases = analysis.get('distinctive_phrases', [])
    category_patterns = analysis.get('category_patterns', {})

    # Build surface patterns
    surface_patterns = {
        'greetings': format_greeting_description(surface.get('greetings', [])),
        'closings': format_closing_description(surface.get('closings', [])),
        'lengthTendency': surface.get('length_tendency', 'medium'),
        'paragraphStructure': infer_paragraph_structure(analysis),
        'punctuationPatterns': infer_punctuation_patterns(analysis),
    }

    # Build tone dimensions (with descriptions)
    tone_dimensions = {}
    for tone_name in ['warmth', 'certainty', 'directiveness', 'formality', 'thoroughness']:
        score = round(tones.get(tone_name, 5))
        tone_dimensions[tone_name] = {
            'score': max(1, min(10, score)),
            'description': generate_tone_description(tone_name, score, analysis)
        }

    # Build negative constraints
    negative_constraints = {
        'neverUsePhrases': extract_avoided_phrases(analysis),
        'neverUsePatterns': extract_avoided_patterns(analysis),
        'avoid': extract_general_avoidances(analysis),
    }

    # Build judgment patterns
    judgment_patterns = {
        'uncertaintyHandling': extract_uncertainty_pattern(analysis),
        'escalationStyle': extract_escalation_pattern(category_patterns),
        'decliningRequests': extract_decline_pattern(category_patterns),
        'emotionalResponsiveness': extract_emotional_pattern(category_patterns),
        'afterHoursApproach': extract_after_hours_pattern(category_patterns),
    }

    # Build signature moves
    signature_moves = extract_signature_moves(analysis)

    # Build voice summary
    voice_summary = generate_voice_summary(analysis)

    # Build example fragments (PHI-free versions)
    example_fragments = sanitize_example_fragments(phrases[:10])

    return {
        'surfacePatterns': surface_patterns,
        'toneDimensions': tone_dimensions,
        'negativeConstraints': negative_constraints,
        'judgmentPatterns': judgment_patterns,
        'signatureMoves': signature_moves,
        'voiceSummary': voice_summary,
        'exampleFragments': example_fragments,
    }


def format_greeting_description(greetings: list) -> str:
    """Format greeting list into natural description."""
    if not greetings:
        return "Professional greeting"

    if len(greetings) == 1:
        return f'Uses "{greetings[0]}"'

    examples = '", "'.join(greetings[:3])
    return f'Varies greetings, commonly: "{examples}"'


def format_closing_description(closings: list) -> str:
    """Format closing list into natural description."""
    if not closings:
        return "Professional sign-off"

    if len(closings) == 1:
        return f'Signs off with "{closings[0]}"'

    examples = '", "'.join(closings[:3])
    return f'Closing varies: "{examples}"'


def generate_tone_description(tone: str, score: int, analysis: Dict) -> str:
    """Generate natural language description of tone dimension."""

    descriptions = {
        'warmth': {
            (1, 3): "Clinical and reserved, focuses on facts over feelings",
            (4, 6): "Balanced warmth, professional but personable",
            (7, 10): "Highly warm and empathetic, prioritizes emotional connection"
        },
        'certainty': {
            (1, 3): "Frequently hedges, emphasizes uncertainty",
            (4, 6): "Appropriately confident with clear limitations",
            (7, 10): "Projects strong confidence, direct statements"
        },
        'directiveness': {
            (1, 3): "Collaborative, offers options and suggestions",
            (4, 6): "Balanced guidance with patient autonomy",
            (7, 10): "Clearly directive, tells patients what to do"
        },
        'formality': {
            (1, 3): "Casual and conversational",
            (4, 6): "Professional but approachable",
            (7, 10): "Formal and clinical"
        },
        'thoroughness': {
            (1, 3): "Brief and to the point",
            (4, 6): "Adequate detail for context",
            (7, 10): "Comprehensive, addresses multiple angles"
        }
    }

    for (low, high), desc in descriptions.get(tone, {}).items():
        if low <= score <= high:
            return desc

    return f"Moderate {tone}"


def generate_voice_summary(analysis: Dict) -> str:
    """Generate 3-4 sentence prose summary of provider's voice."""

    tones = analysis.get('tone_dimensions', {})
    surface = analysis.get('surface_patterns', {})

    warmth = tones.get('warmth', 5)
    directiveness = tones.get('directiveness', 5)
    formality = tones.get('formality', 5)
    length = surface.get('length_tendency', 'medium')

    # Build summary sentences
    sentences = []

    # Warmth + formality combo
    if warmth >= 7 and formality <= 4:
        sentences.append("This provider communicates with notable warmth and approachability.")
    elif warmth >= 7:
        sentences.append("This provider balances professionalism with genuine warmth.")
    elif warmth <= 3:
        sentences.append("This provider maintains a clinical, factual communication style.")
    else:
        sentences.append("This provider communicates in a balanced, professional manner.")

    # Directiveness
    if directiveness >= 7:
        sentences.append("They give clear, direct guidance and are comfortable telling patients what to do.")
    elif directiveness <= 3:
        sentences.append("They prefer collaborative decision-making and presenting options rather than directives.")

    # Length
    if length == 'short':
        sentences.append("Messages tend to be concise and action-oriented.")
    elif length == 'long':
        sentences.append("Messages are thorough, often providing detailed context and explanation.")

    # Signature element
    phrases = analysis.get('distinctive_phrases', [])
    if phrases:
        sentences.append(f'Distinctive phrasings include variations of "{phrases[0]}".')

    return " ".join(sentences[:4])


def sanitize_example_fragments(phrases: list) -> list:
    """Remove any potential PHI from example phrases."""
    sanitized = []

    # Patterns that might contain PHI
    phi_patterns = [
        r'\b[A-Z][a-z]+\b(?:\s+[A-Z][a-z]+)?',  # Names
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',  # Dates
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # Phone numbers
    ]

    for phrase in phrases:
        # Generic replacements
        clean = phrase
        clean = re.sub(r'\b(Mrs?\.?|Ms\.?|Dr\.?)\s+[A-Z][a-z]+', '[Name]', clean)
        clean = re.sub(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b', '[Name]', clean)

        # Only include if it still makes sense
        if len(clean) > 10 and '[Name]' not in clean:
            sanitized.append(phrase)
        elif '[Name]' in clean:
            sanitized.append(clean)

    return sanitized[:10]
```

### 5. LLM Client (`src/llm/claude_client.py`)

```python
"""
Claude API client for analysis.
"""

import os
from anthropic import Anthropic


class ClaudeClient:
    """Client for Claude API analysis."""

    def __init__(self):
        self.client = Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )
        self.model = "claude-sonnet-4-5-20250514"

    def analyze(self, prompt: str) -> str:
        """Send analysis prompt to Claude and get response."""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            system="""You are analyzing healthcare provider communication patterns.
Your goal is to extract style patterns that can be used to generate content in their voice.

Important:
- Be specific and evidence-based
- Quote exact phrases when relevant
- Provide numerical scores with justification
- Respond with valid JSON only"""
        )

        return response.content[0].text

    def batch_analyze(self, prompts: list) -> list:
        """Analyze multiple prompts (with rate limiting)."""
        import time

        results = []
        for i, prompt in enumerate(prompts):
            if i > 0:
                time.sleep(1)  # Rate limiting
            results.append(self.analyze(prompt))

        return results


def get_llm_client(llm_type: str = "claude"):
    """Factory function to get appropriate LLM client."""

    if llm_type == "claude":
        return ClaudeClient()
    elif llm_type == "local":
        from .local_client import LocalLLMClient
        return LocalLLMClient()
    else:
        raise ValueError(f"Unknown LLM type: {llm_type}")
```

### 6. PHI Detection (`src/utils/phi_detector.py`)

```python
"""
Detect and flag potential PHI in output.
"""

import re
from typing import List, Tuple


PHI_PATTERNS = [
    # Names (common patterns)
    (r'\b(Mr|Mrs|Ms|Dr|Miss)\.?\s+[A-Z][a-z]+', 'name'),
    (r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b', 'potential_name'),

    # Dates
    (r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b', 'date'),
    (r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b', 'date'),

    # Phone numbers
    (r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', 'phone'),
    (r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}\b', 'phone'),

    # Email addresses
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'email'),

    # SSN
    (r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b', 'ssn'),

    # MRN patterns
    (r'\b(MRN|mrn)[:\s]*\d+\b', 'mrn'),

    # Ages with context
    (r'\b\d{1,3}[-\s]?(year|yr|y/?o|yo)[-\s]?old\b', 'age_with_context'),

    # Addresses
    (r'\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b', 'address'),
]


def check_phi_in_output(profile: dict) -> List[Tuple[str, str, str]]:
    """
    Check profile for potential PHI leakage.

    Returns:
        List of (field_path, matched_text, phi_type) tuples
    """
    findings = []

    def check_value(value, path):
        if isinstance(value, str):
            for pattern, phi_type in PHI_PATTERNS:
                matches = re.findall(pattern, value, re.IGNORECASE)
                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0]
                    findings.append((path, match, phi_type))
        elif isinstance(value, list):
            for i, item in enumerate(value):
                check_value(item, f"{path}[{i}]")
        elif isinstance(value, dict):
            for key, val in value.items():
                check_value(val, f"{path}.{key}")

    check_value(profile, "profile")

    return findings


def report_phi_findings(findings: List[Tuple[str, str, str]]) -> str:
    """Generate human-readable PHI finding report."""

    if not findings:
        return "No potential PHI detected in output."

    report_lines = [
        "⚠️  POTENTIAL PHI DETECTED IN OUTPUT",
        "=" * 50,
        "",
        "Review and redact the following before sharing:",
        ""
    ]

    for path, text, phi_type in findings:
        report_lines.append(f"  [{phi_type.upper()}] at {path}")
        report_lines.append(f"    Found: \"{text}\"")
        report_lines.append("")

    report_lines.extend([
        "=" * 50,
        "Run with --redact to automatically remove PHI",
    ])

    return "\n".join(report_lines)


def redact_phi(profile: dict) -> dict:
    """
    Automatically redact detected PHI from profile.

    Returns:
        Profile with PHI replaced by placeholders
    """
    import copy
    redacted = copy.deepcopy(profile)

    def redact_value(value):
        if isinstance(value, str):
            result = value
            for pattern, phi_type in PHI_PATTERNS:
                if phi_type in ['name', 'potential_name']:
                    result = re.sub(pattern, '[NAME]', result, flags=re.IGNORECASE)
                elif phi_type == 'date':
                    result = re.sub(pattern, '[DATE]', result, flags=re.IGNORECASE)
                elif phi_type == 'phone':
                    result = re.sub(pattern, '[PHONE]', result, flags=re.IGNORECASE)
                elif phi_type == 'email':
                    result = re.sub(pattern, '[EMAIL]', result, flags=re.IGNORECASE)
                elif phi_type == 'ssn':
                    result = re.sub(pattern, '[SSN]', result, flags=re.IGNORECASE)
                elif phi_type == 'mrn':
                    result = re.sub(pattern, '[MRN]', result, flags=re.IGNORECASE)
                elif phi_type == 'address':
                    result = re.sub(pattern, '[ADDRESS]', result, flags=re.IGNORECASE)
            return result
        elif isinstance(value, list):
            return [redact_value(item) for item in value]
        elif isinstance(value, dict):
            return {key: redact_value(val) for key, val in value.items()}
        return value

    return redact_value(redacted)
```

---

## Prompts

### Messaging Analysis Prompt (`src/llm/prompts/messaging_analysis.txt`)

```
You are analyzing portal messages from a healthcare provider to extract their unique communication style.

CONTEXT:
- These are real messages sent to patients through an EHR patient portal
- Your analysis will be used to generate AI drafts that match this provider's voice
- Focus on patterns, not content

ANALYZE THE FOLLOWING MESSAGES:

{messages}

EXTRACT AND RETURN AS JSON:

{
  "surface_patterns": {
    "greetings": ["list of greeting phrases used"],
    "closings": ["list of sign-off phrases used"],
    "length_tendency": "short|medium|long",
    "typical_paragraph_count": number,
    "uses_bullet_points": boolean,
    "punctuation_notes": "description of punctuation habits"
  },
  "tone_dimensions": {
    "warmth": {
      "score": 1-10,
      "evidence": "quote or description supporting score"
    },
    "directiveness": {
      "score": 1-10,
      "evidence": "quote or description"
    },
    "formality": {
      "score": 1-10,
      "evidence": "quote or description"
    },
    "certainty": {
      "score": 1-10,
      "evidence": "quote or description"
    },
    "thoroughness": {
      "score": 1-10,
      "evidence": "quote or description"
    }
  },
  "distinctive_phrases": {
    "frequent": ["phrases used multiple times"],
    "signature": ["unique phrases that characterize this provider"],
    "avoided": ["phrases conspicuously absent that others might use"]
  },
  "behavioral_patterns": {
    "acknowledges_emotions": boolean,
    "provides_education": boolean,
    "sets_clear_expectations": boolean,
    "uses_patient_name": boolean,
    "asks_follow_up_questions": boolean
  },
  "message_type_variations": {
    "description": "how style varies by message type if noticeable"
  }
}

Be specific. Quote exact phrases. Base all scores on evidence from the messages.
```

### Documentation Analysis Prompt (`src/llm/prompts/documentation_analysis.txt`)

```
You are analyzing clinical notes from a healthcare provider to extract their documentation style.

CONTEXT:
- These are real clinical notes from an EHR
- Your analysis will be used to generate AI drafts that match this provider's documentation voice
- Focus on structure, phrasing patterns, and style choices

ANALYZE THE FOLLOWING NOTES:

{notes}

EXTRACT AND RETURN AS JSON:

{
  "structural_patterns": {
    "overall_organization": "SOAP|problem-oriented|narrative|other",
    "hpi_style": {
      "format": "narrative|bullet|templated|mixed",
      "typical_length": "brief|moderate|comprehensive",
      "includes_pertinent_negatives": boolean,
      "includes_context": boolean
    },
    "assessment_style": {
      "format": "diagnosis_only|with_rationale|differential_focused",
      "certainty_language": "description of how certainty is expressed",
      "typical_length": "brief|moderate|detailed"
    },
    "plan_style": {
      "organization": "numbered|categorized|free_text",
      "specificity": "general|moderate|highly_specific",
      "includes_contingencies": boolean
    },
    "physical_exam_style": {
      "format": "comprehensive|focused|pertinent_only",
      "documentation_of_normals": "full|selective|minimal"
    }
  },
  "voice_dimensions": {
    "verbosity": {
      "score": 1-10,
      "evidence": "description"
    },
    "reasoning_visibility": {
      "score": 1-10,
      "evidence": "how much clinical thinking is documented"
    },
    "formality": {
      "score": 1-10,
      "evidence": "description"
    },
    "certainty_expression": {
      "score": 1-10,
      "evidence": "description"
    },
    "patient_centeredness": {
      "score": 1-10,
      "evidence": "use of patient quotes, patient perspective"
    },
    "defensiveness": {
      "score": 1-10,
      "evidence": "medicolegal language, documentation of discussions"
    }
  },
  "standard_phrasings": {
    "hpi_openings": ["exact phrases used to start HPIs"],
    "transition_phrases": ["phrases used between sections"],
    "assessment_language": ["phrases for expressing diagnoses"],
    "plan_language": ["phrases for expressing plans"],
    "safety_net_phrases": ["return precaution language"]
  },
  "distinctive_patterns": {
    "signature_moves": ["unique documentation habits"],
    "consistent_inclusions": ["elements always included"],
    "avoided_patterns": ["things this provider doesn't do"]
  },
  "visit_type_variations": {
    "acute": "how acute visit notes differ",
    "chronic": "how chronic follow-up notes differ",
    "well_visit": "how well visit notes differ"
  }
}

Be specific. Quote exact phrases. Base all observations on evidence from the notes.
```

---

## Example Usage Session

```bash
# 1. Export messages from Elation (or use existing export)
$ ls data/
messages_2024.csv
notes_2024/

# 2. Analyze messages
$ providertone analyze-messages \
    --input data/messages_2024.csv \
    --provider-id "dr-smith-123" \
    --output analysis/dr-smith-messages.json \
    --verbose

ProviderTone Local - Message Analysis
Provider: dr-smith-123
Input: data/messages_2024.csv

✓ Loaded 1,247 messages
✓ Found 892 messages for dr-smith-123
✓ Messages categorized by type

Category Summary:
  anxious/urgent:     127 messages
  routine/refill:     312 messages
  results/lab:        98 messages
  scheduling/admin:   203 messages
  mental_health:      45 messages
  other:              107 messages

✓ Sampled 286 messages (50 per category)
✓ Analyzing patterns... (this took 2m 34s)
✓ Analysis saved to analysis/dr-smith-messages.json

Analysis Summary:
  Warmth Score:        8/10 (highly empathetic)
  Directiveness:       6/10 (balanced guidance)
  Typical Length:      medium (2-3 paragraphs)
  Signature Greeting:  "Hi [Name],"
  Signature Closing:   "Take care, Dr. Smith"

# 3. Analyze notes
$ providertone analyze-notes \
    --input data/notes_2024/ \
    --provider-id "dr-smith-123" \
    --note-types "progress,visit" \
    --output analysis/dr-smith-notes.json

ProviderTone Local - Documentation Analysis
Provider: dr-smith-123
Note types: progress, visit

✓ Loaded 634 notes
✓ Found 521 notes for dr-smith-123
✓ Notes categorized by visit type
✓ Sampled 187 notes
✓ Analyzing patterns...
✓ Analysis saved to analysis/dr-smith-notes.json

# 4. Generate combined profile
$ providertone generate-profile \
    --messaging analysis/dr-smith-messages.json \
    --documentation analysis/dr-smith-notes.json \
    --output profiles/dr-smith-profile.json

ProviderTone Local - Profile Generation

Loading messaging analysis: analysis/dr-smith-messages.json
Loading documentation analysis: analysis/dr-smith-notes.json

⚠️  PHI Check Results:
  No potential PHI detected in output.

✓ Profile saved to profiles/dr-smith-profile.json

This profile is compatible with the ProviderTone website and API.

# 5. View the profile
$ cat profiles/dr-smith-profile.json | python -m json.tool | head -50
{
  "exportedAt": "2026-01-10T15:30:00.000Z",
  "messaging": {
    "generatedProfile": {
      "surfacePatterns": {
        "greetings": "Uses first name greeting: \"Hi Sarah,\" \"Hi John,\"",
        "closings": "Warm sign-off: \"Take care, Dr. Smith\"",
        ...
      },
      ...
    }
  },
  "documentation": {
    ...
  }
}
```

---

## Security Considerations

### PHI Handling

1. **Data stays local** - No PHI uploaded to external services except Anthropic API with BAA
2. **Anthropic BAA** - Ensure BAA is in place before using Claude API with PHI
3. **Output sanitization** - Final profile is checked for PHI before export
4. **Optional local LLM** - For fully air-gapped environments

### Recommendations

1. Run on encrypted disk
2. Delete intermediate analysis files after profile generation
3. Audit log of what was processed
4. Clear output of PHI detection results

---

## Next Steps for Implementation

1. **Phase 1: Core CLI** (Priority)
   - [ ] Basic CLI structure with Click
   - [ ] CSV and JSON loaders
   - [ ] Message categorizer
   - [ ] Claude API client

2. **Phase 2: Analysis Engine**
   - [ ] Messaging analyzer
   - [ ] Documentation analyzer
   - [ ] Aggregation logic

3. **Phase 3: Profile Generation**
   - [ ] Profile synthesizers
   - [ ] PHI detection
   - [ ] JSON export with validation

4. **Phase 4: Polish**
   - [ ] Rich CLI output
   - [ ] Progress indicators
   - [ ] Error handling
   - [ ] Local LLM support

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-10 | Initial specification |
