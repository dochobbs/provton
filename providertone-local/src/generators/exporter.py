"""
Export profiles to JSON format.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional


def export_profile(
    profile: Dict[str, Any],
    output_path: str,
    provider_id: Optional[str] = None
) -> None:
    """
    Export profile to JSON file in website-compatible format.

    Args:
        profile: Profile dictionary with 'messaging' and/or 'documentation' keys
        output_path: Path to output JSON file
        provider_id: Optional provider identifier to include
    """
    export_data = {
        'exportedAt': datetime.now().isoformat(),
        'exportedBy': 'providertone-local',
        'version': '1.0.0',
    }

    if provider_id:
        export_data['providerId'] = provider_id

    if 'messaging' in profile:
        export_data['messaging'] = {
            'completedAt': datetime.now().isoformat(),
            'generatedProfile': profile['messaging'],
            'userCorrections': None,
        }

    if 'documentation' in profile:
        export_data['documentation'] = {
            'completedAt': datetime.now().isoformat(),
            'generatedProfile': profile['documentation'],
            'userCorrections': None,
        }

    # Ensure output directory exists
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    # Write JSON
    with open(output, 'w') as f:
        json.dump(export_data, f, indent=2)


def validate_profile(profile: Dict[str, Any]) -> bool:
    """
    Validate profile structure matches expected schema.

    Args:
        profile: Profile dictionary to validate

    Returns:
        True if valid

    Raises:
        ValueError: If profile is invalid
    """
    if 'messaging' in profile:
        validate_messaging_profile(profile['messaging'])

    if 'documentation' in profile:
        validate_documentation_profile(profile['documentation'])

    if 'messaging' not in profile and 'documentation' not in profile:
        raise ValueError("Profile must contain 'messaging' and/or 'documentation'")

    return True


def validate_messaging_profile(profile: Dict[str, Any]) -> None:
    """Validate messaging profile structure."""
    required_keys = [
        'surfacePatterns',
        'toneDimensions',
        'negativeConstraints',
        'judgmentPatterns',
        'signatureMoves',
        'voiceSummary',
    ]

    for key in required_keys:
        if key not in profile:
            raise ValueError(f"Messaging profile missing required key: {key}")

    # Validate tone dimensions
    tone_keys = ['warmth', 'certainty', 'directiveness', 'formality', 'thoroughness']
    for tone in tone_keys:
        if tone not in profile['toneDimensions']:
            raise ValueError(f"Messaging profile missing tone dimension: {tone}")

        tone_data = profile['toneDimensions'][tone]
        if not isinstance(tone_data, dict) or 'score' not in tone_data:
            raise ValueError(f"Invalid tone dimension format for: {tone}")


def validate_documentation_profile(profile: Dict[str, Any]) -> None:
    """Validate documentation profile structure."""
    required_keys = [
        'structuralPatterns',
        'voiceDimensions',
        'negativeConstraints',
        'standardPhrasings',
        'visitTypeVariations',
        'signatureMoves',
        'voiceSummary',
    ]

    for key in required_keys:
        if key not in profile:
            raise ValueError(f"Documentation profile missing required key: {key}")


def load_profile(path: str) -> Dict[str, Any]:
    """
    Load profile from JSON file.

    Args:
        path: Path to JSON file

    Returns:
        Profile dictionary
    """
    with open(path, 'r') as f:
        return json.load(f)


def merge_profiles(
    existing: Dict[str, Any],
    new: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Merge new profile data into existing profile.

    Args:
        existing: Existing profile
        new: New profile data to merge

    Returns:
        Merged profile
    """
    result = existing.copy()

    if 'messaging' in new:
        result['messaging'] = new['messaging']

    if 'documentation' in new:
        result['documentation'] = new['documentation']

    result['exportedAt'] = datetime.now().isoformat()

    return result
