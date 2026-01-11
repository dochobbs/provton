#!/usr/bin/env python3
"""
ProviderTone Local - Extract style profiles from existing clinical data.

Usage:
    providertone analyze-messages --input messages.csv --provider-id dr-smith
    providertone analyze-notes --input notes/ --provider-id dr-smith
    providertone generate-profile --messaging msg.json --documentation doc.json
    providertone extract --messages msg.csv --notes notes/ --provider-id dr-smith
"""

import json
import sys
from pathlib import Path
from datetime import datetime

import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

console = Console()


@click.group()
@click.version_option(version="1.0.0", prog_name="providertone")
def cli():
    """ProviderTone Local - Extract style profiles from existing PHI data."""
    pass


@cli.command()
@click.option("--input", "-i", "input_path", required=True,
              type=click.Path(exists=True),
              help="Path to messages file (CSV, JSON) or directory")
@click.option("--provider-id", "-p", required=True,
              help="Provider identifier to filter by")
@click.option("--output", "-o", required=True,
              type=click.Path(),
              help="Output path for analysis JSON")
@click.option("--sample-size", default=50,
              help="Max messages per category to analyze (default: 50)")
@click.option("--llm", default="claude",
              type=click.Choice(["claude", "local"]),
              help="LLM to use for analysis")
@click.option("--start-date",
              help="Filter messages after this date (YYYY-MM-DD)")
@click.option("--end-date",
              help="Filter messages before this date (YYYY-MM-DD)")
@click.option("--verbose", "-v", is_flag=True,
              help="Verbose output")
def analyze_messages(input_path, provider_id, output, sample_size, llm,
                     start_date, end_date, verbose):
    """Analyze portal messages to extract communication style patterns."""
    from .loaders import load_data
    from .preprocessors import preprocess_messages, sample_messages
    from .preprocessors.message_preprocessor import filter_by_date
    from .analyzers import analyze_messaging_style

    console.print()
    console.print("[bold blue]ProviderTone Local[/] - Message Analysis")
    console.print(f"Provider: [cyan]{provider_id}[/]")
    console.print(f"Input: {input_path}")
    console.print()

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
        transient=True,
    ) as progress:
        # Load data
        task = progress.add_task("Loading messages...", total=None)
        try:
            messages = load_data(input_path, data_type="messages")
        except Exception as e:
            console.print(f"[red]Error loading data:[/] {e}")
            sys.exit(1)
        progress.update(task, description=f"[green]Loaded {len(messages)} messages[/]")

        # Filter by provider
        task = progress.add_task("Filtering by provider...", total=None)
        messages = [m for m in messages if m.get("provider_id") == provider_id]
        if start_date or end_date:
            messages = filter_by_date(messages, start_date, end_date)
        progress.update(task, description=f"[green]Found {len(messages)} messages for {provider_id}[/]")

        if len(messages) == 0:
            console.print(f"[yellow]No messages found for provider {provider_id}[/]")
            sys.exit(1)

        # Preprocess and categorize
        task = progress.add_task("Categorizing messages...", total=None)
        categorized = preprocess_messages(messages)
        progress.update(task, description="[green]Messages categorized[/]")

        # Show category summary
        if verbose:
            console.print()
            _print_category_summary(categorized)

        # Sample
        task = progress.add_task("Sampling messages...", total=None)
        samples = sample_messages(categorized, sample_size)
        total_sampled = sum(len(msgs) for msgs in samples.values())
        progress.update(task, description=f"[green]Sampled {total_sampled} messages[/]")

        # Analyze
        task = progress.add_task("Analyzing patterns (this may take a few minutes)...", total=None)
        try:
            analysis = analyze_messaging_style(samples, llm=llm, verbose=verbose)
        except Exception as e:
            console.print(f"[red]Error during analysis:[/] {e}")
            sys.exit(1)
        progress.update(task, description="[green]Analysis complete[/]")

    # Save results
    _save_json(analysis, output)
    console.print(f"\n[green]Analysis saved to {output}[/]")

    # Show summary
    _print_messaging_summary(analysis)


@cli.command()
@click.option("--input", "-i", "input_path", required=True,
              type=click.Path(exists=True),
              help="Path to notes file or directory")
@click.option("--provider-id", "-p", required=True,
              help="Provider identifier")
@click.option("--output", "-o", required=True,
              type=click.Path(),
              help="Output path for analysis JSON")
@click.option("--note-types", default="progress,visit,consult",
              help="Comma-separated note types to include")
@click.option("--sample-size", default=50,
              help="Max notes per visit type to analyze")
@click.option("--llm", default="claude",
              type=click.Choice(["claude", "local"]))
@click.option("--verbose", "-v", is_flag=True)
def analyze_notes(input_path, provider_id, output, note_types, sample_size, llm, verbose):
    """Analyze clinical notes to extract documentation style patterns."""
    from .loaders import load_data
    from .preprocessors import preprocess_notes, sample_notes
    from .preprocessors.note_preprocessor import filter_by_note_type
    from .analyzers import analyze_documentation_style

    console.print()
    console.print("[bold blue]ProviderTone Local[/] - Documentation Analysis")
    console.print(f"Provider: [cyan]{provider_id}[/]")
    console.print(f"Note types: {note_types}")
    console.print()

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
        transient=True,
    ) as progress:
        # Load data
        task = progress.add_task("Loading notes...", total=None)
        try:
            notes = load_data(input_path, data_type="notes")
        except Exception as e:
            console.print(f"[red]Error loading data:[/] {e}")
            sys.exit(1)
        progress.update(task, description=f"[green]Loaded {len(notes)} notes[/]")

        # Filter by provider
        task = progress.add_task("Filtering by provider...", total=None)
        notes = [n for n in notes if n.get("provider_id") == provider_id]

        # Filter by note type
        type_list = [t.strip() for t in note_types.split(",")]
        notes = filter_by_note_type(notes, type_list)
        progress.update(task, description=f"[green]Found {len(notes)} notes for {provider_id}[/]")

        if len(notes) == 0:
            console.print(f"[yellow]No notes found for provider {provider_id}[/]")
            sys.exit(1)

        # Categorize
        task = progress.add_task("Categorizing by visit type...", total=None)
        categorized = preprocess_notes(notes)
        progress.update(task, description="[green]Notes categorized[/]")

        if verbose:
            console.print()
            _print_category_summary(categorized, "visit type")

        # Sample
        task = progress.add_task("Sampling notes...", total=None)
        samples = sample_notes(categorized, sample_size)
        total_sampled = sum(len(n) for n in samples.values())
        progress.update(task, description=f"[green]Sampled {total_sampled} notes[/]")

        # Analyze
        task = progress.add_task("Analyzing patterns (this may take a few minutes)...", total=None)
        try:
            analysis = analyze_documentation_style(samples, llm=llm, verbose=verbose)
        except Exception as e:
            console.print(f"[red]Error during analysis:[/] {e}")
            sys.exit(1)
        progress.update(task, description="[green]Analysis complete[/]")

    # Save
    _save_json(analysis, output)
    console.print(f"\n[green]Analysis saved to {output}[/]")

    _print_documentation_summary(analysis)


@cli.command("generate-profile")
@click.option("--messaging", "-m",
              type=click.Path(exists=True),
              help="Path to messaging analysis JSON")
@click.option("--documentation", "-d",
              type=click.Path(exists=True),
              help="Path to documentation analysis JSON")
@click.option("--output", "-o", required=True,
              type=click.Path(),
              help="Output path for final profile JSON")
@click.option("--provider-id", "-p",
              help="Provider identifier to include in profile")
@click.option("--redact", is_flag=True,
              help="Automatically redact detected PHI")
def generate_profile(messaging, documentation, output, provider_id, redact):
    """Generate final style profile from analysis results."""
    from .generators import generate_messaging_profile, generate_documentation_profile
    from .generators import export_profile, validate_profile
    from .utils import check_phi, report_phi_findings, redact_phi

    console.print()
    console.print("[bold blue]ProviderTone Local[/] - Profile Generation")
    console.print()

    if not messaging and not documentation:
        console.print("[red]Error:[/] At least one of --messaging or --documentation required")
        sys.exit(1)

    profile = {}

    if messaging:
        console.print(f"Loading messaging analysis: {messaging}")
        msg_analysis = _load_json(messaging)
        profile['messaging'] = generate_messaging_profile(msg_analysis)
        console.print("[green]Messaging profile generated[/]")

    if documentation:
        console.print(f"Loading documentation analysis: {documentation}")
        doc_analysis = _load_json(documentation)
        profile['documentation'] = generate_documentation_profile(doc_analysis)
        console.print("[green]Documentation profile generated[/]")

    # Validate
    try:
        validate_profile(profile)
        console.print("[green]Profile validated successfully[/]")
    except ValueError as e:
        console.print(f"[yellow]Validation warning:[/] {e}")

    # Check for PHI
    findings = check_phi(profile)
    if findings:
        console.print(report_phi_findings(findings))
        if redact:
            profile = redact_phi(profile)
            console.print("[green]PHI automatically redacted[/]")
    else:
        console.print("[green]No potential PHI detected[/]")

    # Export
    export_profile(profile, output, provider_id)
    console.print(f"\n[green]Profile saved to {output}[/]")
    console.print("\nThis profile is compatible with the ProviderTone website and API.")


@cli.command()
@click.option("--messages",
              type=click.Path(exists=True),
              help="Path to messages file")
@click.option("--notes",
              type=click.Path(exists=True),
              help="Path to notes file or directory")
@click.option("--provider-id", "-p", required=True,
              help="Provider identifier")
@click.option("--output", "-o", required=True,
              type=click.Path(),
              help="Output path for final profile JSON")
@click.option("--llm", default="claude",
              type=click.Choice(["claude", "local"]))
@click.option("--sample-size", default=50)
@click.option("--redact", is_flag=True,
              help="Automatically redact detected PHI")
def extract(messages, notes, provider_id, output, llm, sample_size, redact):
    """One-shot extraction: analyze data and generate profile in one command."""
    from .loaders import load_data
    from .preprocessors import preprocess_messages, preprocess_notes
    from .preprocessors import sample_messages, sample_notes
    from .analyzers import analyze_messaging_style, analyze_documentation_style
    from .generators import generate_messaging_profile, generate_documentation_profile
    from .generators import export_profile
    from .utils import check_phi, report_phi_findings, redact_phi

    if not messages and not notes:
        console.print("[red]Error:[/] At least one of --messages or --notes required")
        sys.exit(1)

    console.print()
    console.print("[bold blue]ProviderTone Local[/] - Full Extraction")
    console.print(f"Provider: [cyan]{provider_id}[/]")
    console.print()

    profile = {}

    # Process messages
    if messages:
        console.print("[bold]Processing messages...[/]")
        msg_data = load_data(messages, data_type="messages")
        msg_data = [m for m in msg_data if m.get("provider_id") == provider_id]
        console.print(f"  Found {len(msg_data)} messages")

        if msg_data:
            categorized = preprocess_messages(msg_data)
            samples = sample_messages(categorized, sample_size)
            console.print(f"  Analyzing {sum(len(s) for s in samples.values())} samples...")
            analysis = analyze_messaging_style(samples, llm=llm)
            profile['messaging'] = generate_messaging_profile(analysis)
            console.print("  [green]Messaging profile complete[/]")

    # Process notes
    if notes:
        console.print("[bold]Processing notes...[/]")
        note_data = load_data(notes, data_type="notes")
        note_data = [n for n in note_data if n.get("provider_id") == provider_id]
        console.print(f"  Found {len(note_data)} notes")

        if note_data:
            categorized = preprocess_notes(note_data)
            samples = sample_notes(categorized, sample_size)
            console.print(f"  Analyzing {sum(len(s) for s in samples.values())} samples...")
            analysis = analyze_documentation_style(samples, llm=llm)
            profile['documentation'] = generate_documentation_profile(analysis)
            console.print("  [green]Documentation profile complete[/]")

    if not profile:
        console.print("[red]No data found for this provider[/]")
        sys.exit(1)

    # PHI check
    findings = check_phi(profile)
    if findings:
        console.print(report_phi_findings(findings))
        if redact:
            profile = redact_phi(profile)

    # Export
    export_profile(profile, output, provider_id)
    console.print(f"\n[green]Profile saved to {output}[/]")


# Helper functions

def _save_json(data: dict, path: str) -> None:
    """Save data to JSON file."""
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def _load_json(path: str) -> dict:
    """Load JSON file."""
    with open(path, 'r') as f:
        return json.load(f)


def _print_category_summary(categorized: dict, label: str = "category") -> None:
    """Print summary of categorized data."""
    table = Table(title=f"Messages by {label}")
    table.add_column(label.title(), style="cyan")
    table.add_column("Count", justify="right")

    for cat, items in sorted(categorized.items(), key=lambda x: -len(x[1])):
        table.add_row(cat, str(len(items)))

    console.print(table)


def _print_messaging_summary(analysis: dict) -> None:
    """Print messaging analysis summary."""
    console.print()
    console.print("[bold]Analysis Summary[/]")

    tones = analysis.get('tone_dimensions', {})
    table = Table(title="Tone Dimensions")
    table.add_column("Dimension", style="cyan")
    table.add_column("Score", justify="center")

    for dim in ['warmth', 'directiveness', 'formality', 'certainty', 'thoroughness']:
        score = tones.get(dim, 5)
        if isinstance(score, dict):
            score = score.get('score', 5)
        bar = "█" * int(score) + "░" * (10 - int(score))
        table.add_row(dim.title(), f"{bar} {score}/10")

    console.print(table)

    # Confidence
    confidence = analysis.get('confidence', 0.5)
    console.print(f"\nConfidence: [cyan]{confidence:.0%}[/]")


def _print_documentation_summary(analysis: dict) -> None:
    """Print documentation analysis summary."""
    console.print()
    console.print("[bold]Analysis Summary[/]")

    voice = analysis.get('voice_dimensions', {})
    table = Table(title="Voice Dimensions")
    table.add_column("Dimension", style="cyan")
    table.add_column("Score", justify="center")

    for dim in ['verbosity', 'reasoning_visibility', 'formality', 'certainty_expression']:
        score = voice.get(dim, 5)
        if isinstance(score, dict):
            score = score.get('score', 5)
        bar = "█" * int(score) + "░" * (10 - int(score))
        table.add_row(dim.replace('_', ' ').title(), f"{bar} {score}/10")

    console.print(table)

    confidence = analysis.get('confidence', 0.5)
    console.print(f"\nConfidence: [cyan]{confidence:.0%}[/]")


if __name__ == "__main__":
    cli()
