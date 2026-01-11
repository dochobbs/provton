"""
Detect and flag potential PHI in output.
"""

import re
import copy
from typing import List, Tuple, Dict, Any


# PHI detection patterns
PHI_PATTERNS = [
    # Names (common patterns)
    (r'\b(Mr|Mrs|Ms|Dr|Miss)\.?\s+[A-Z][a-z]+', 'name'),
    (r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b(?!\s+(Street|St|Avenue|Ave|Road|Rd))', 'potential_name'),

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
    (r'\b(MRN|mrn|Medical Record)[:\s#]*\d+\b', 'mrn'),
    (r'\b(Patient ID|PatientID|PID)[:\s#]*\d+\b', 'patient_id'),

    # DOB
    (r'\b(DOB|Date of Birth|Birth Date)[:\s]*\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b', 'dob'),

    # Addresses
    (r'\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct)\b', 'address'),
]


def check_phi(data: Any) -> List[Tuple[str, str, str]]:
    """
    Check data structure for potential PHI.

    Args:
        data: Dictionary, list, or string to check

    Returns:
        List of (path, matched_text, phi_type) tuples
    """
    findings = []
    _check_value(data, "", findings)
    return findings


def _check_value(value: Any, path: str, findings: List[Tuple[str, str, str]]) -> None:
    """Recursively check value for PHI."""
    if isinstance(value, str):
        for pattern, phi_type in PHI_PATTERNS:
            matches = re.findall(pattern, value, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0]
                # Filter out false positives
                if not _is_false_positive(match, phi_type):
                    findings.append((path, match, phi_type))

    elif isinstance(value, list):
        for i, item in enumerate(value):
            _check_value(item, f"{path}[{i}]", findings)

    elif isinstance(value, dict):
        for key, val in value.items():
            _check_value(val, f"{path}.{key}" if path else key, findings)


def _is_false_positive(match: str, phi_type: str) -> bool:
    """Check if match is likely a false positive."""
    # Common medical terms that look like names
    medical_terms = {
        'Take Care', 'Best Regards', 'Thank You', 'Follow Up',
        'Well Child', 'Physical Exam', 'Chief Complaint',
        'Medical History', 'Family History', 'Social History',
    }

    if phi_type == 'potential_name':
        # Check against common phrases
        if match in medical_terms:
            return True
        # Very short matches are often false positives
        if len(match) < 5:
            return True

    return False


def redact_phi(data: Any) -> Any:
    """
    Redact detected PHI from data structure.

    Args:
        data: Data to redact

    Returns:
        Copy of data with PHI replaced by placeholders
    """
    if isinstance(data, str):
        result = data
        for pattern, phi_type in PHI_PATTERNS:
            placeholder = f'[{phi_type.upper()}]'
            result = re.sub(pattern, placeholder, result, flags=re.IGNORECASE)
        return result

    elif isinstance(data, list):
        return [redact_phi(item) for item in data]

    elif isinstance(data, dict):
        return {key: redact_phi(val) for key, val in data.items()}

    else:
        return data


def report_phi_findings(findings: List[Tuple[str, str, str]]) -> str:
    """
    Generate human-readable PHI finding report.

    Args:
        findings: List of (path, matched_text, phi_type) tuples

    Returns:
        Formatted report string
    """
    if not findings:
        return "No potential PHI detected in output."

    lines = [
        "",
        "WARNING: POTENTIAL PHI DETECTED IN OUTPUT",
        "=" * 50,
        "",
        "Review and redact the following before sharing:",
        ""
    ]

    # Group by type
    by_type: Dict[str, List[Tuple[str, str]]] = {}
    for path, text, phi_type in findings:
        if phi_type not in by_type:
            by_type[phi_type] = []
        by_type[phi_type].append((path, text))

    for phi_type, items in sorted(by_type.items()):
        lines.append(f"  [{phi_type.upper()}]")
        for path, text in items[:5]:  # Limit to 5 per type
            lines.append(f"    at {path}: \"{text}\"")
        if len(items) > 5:
            lines.append(f"    ... and {len(items) - 5} more")
        lines.append("")

    lines.extend([
        "=" * 50,
        "Run with --redact to automatically remove PHI",
        ""
    ])

    return "\n".join(lines)


def sanitize_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize profile by removing/redacting potential PHI.

    This is more aggressive than redact_phi - it removes
    example fragments that might contain PHI.

    Args:
        profile: Profile to sanitize

    Returns:
        Sanitized copy of profile
    """
    sanitized = copy.deepcopy(profile)

    def sanitize_strings(obj: Any) -> Any:
        if isinstance(obj, str):
            # Redact PHI patterns
            result = obj
            for pattern, phi_type in PHI_PATTERNS:
                result = re.sub(pattern, f'[{phi_type.upper()}]', result, flags=re.IGNORECASE)
            return result
        elif isinstance(obj, list):
            return [sanitize_strings(item) for item in obj]
        elif isinstance(obj, dict):
            return {k: sanitize_strings(v) for k, v in obj.items()}
        return obj

    return sanitize_strings(sanitized)
