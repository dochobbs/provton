import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const messagingAnalysisPrompt = `You are analyzing a medical provider's communication style based on their responses to a structured interrogation. Your goal is to produce an accurate, nuanced style profile that will be used to generate portal message drafts in their voice.

Analyze all inputs and produce a STYLE PROFILE with the following JSON structure:

{
  "surfacePatterns": {
    "greetings": "Description of their greeting pattern with 2-3 examples",
    "closings": "Description of their closing pattern with 2-3 examples",
    "lengthTendency": "short/medium/long and variation by message type",
    "paragraphStructure": "How they break up content",
    "punctuationPatterns": "Exclamation points, ellipses, dashes usage"
  },
  "toneDimensions": {
    "warmth": { "score": 1-10, "description": "Brief behavioral description" },
    "certainty": { "score": 1-10, "description": "Brief behavioral description" },
    "directiveness": { "score": 1-10, "description": "Brief behavioral description" },
    "formality": { "score": 1-10, "description": "Brief behavioral description" },
    "thoroughness": { "score": 1-10, "description": "Brief behavioral description" }
  },
  "negativeConstraints": {
    "neverUsePhrases": ["phrase 1", "phrase 2"],
    "neverUsePatterns": ["pattern 1", "pattern 2"],
    "avoid": ["thing to minimize 1", "thing to minimize 2"]
  },
  "judgmentPatterns": {
    "uncertaintyHandling": "How they express clinical uncertainty",
    "escalationStyle": "When triaging up, directive or collaborative",
    "decliningRequests": "How they say no",
    "emotionalResponsiveness": "Acknowledge emotions or address clinical content directly",
    "afterHoursApproach": "Do they adjust tone/length for late messages"
  },
  "signatureMoves": ["Distinctive pattern 1", "Distinctive pattern 2", "Pattern 3"],
  "voiceSummary": "3-4 sentence prose summary of this provider's voice",
  "exampleFragments": ["Example phrase 1", "Example phrase 2", "Example phrase 3"]
}

Be specific and concrete—avoid generic descriptors. Ground everything in evidence from the interrogation data. Return ONLY valid JSON, no markdown or explanation.`;

const documentationAnalysisPrompt = `You are analyzing a medical provider's clinical documentation style based on their responses to a structured interrogation. Your goal is to produce an accurate, nuanced style profile that will be used to generate clinical notes in their voice.

Analyze all inputs and produce a DOCUMENTATION STYLE PROFILE with the following JSON structure:

{
  "structurePatterns": {
    "overallFormat": "Description of their preferred note structure (SOAP, problem-oriented, etc.)",
    "hpiStyle": "How they construct HPIs - narrative vs. templated, verbose vs. concise",
    "assessmentStyle": "Diagnosis only, diagnosis + rationale, differential-focused, etc.",
    "planStyle": "Numbered by problem, action-oriented, detailed vs. brief"
  },
  "voiceDimensions": {
    "verbosity": { "score": 1-10, "description": "Brief behavioral description" },
    "clinicalReasoning": { "score": 1-10, "description": "How much reasoning is shown in notes" },
    "formality": { "score": 1-10, "description": "Brief behavioral description" },
    "templateReliance": { "score": 1-10, "description": "How much they rely on vs. customize templates" },
    "detailLevel": { "score": 1-10, "description": "Comprehensive vs. focused documentation" }
  },
  "negativeConstraints": {
    "neverUsePhrases": ["phrase 1", "phrase 2"],
    "patternsAvoided": ["pattern 1", "pattern 2"],
    "styleAversions": ["thing to minimize 1", "thing to minimize 2"]
  },
  "documentationPatterns": {
    "uncertaintyHandling": "How they document diagnostic uncertainty",
    "sensitiveTopics": "How they document sensitive information",
    "patientQuotes": "Do they use direct patient quotes and how",
    "openNotesAwareness": "How patient-facing notes affect documentation"
  },
  "signatureMoves": ["Distinctive pattern 1", "Distinctive pattern 2", "Pattern 3"],
  "voiceSummary": "3-4 sentence prose summary of this provider's documentation voice",
  "exampleFragments": ["Example phrase 1", "Example phrase 2", "Example phrase 3"]
}

Be specific and concrete—avoid generic descriptors. Ground everything in evidence from the interrogation data. Return ONLY valid JSON, no markdown or explanation.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { track, profile } = body;

    let inputData = '';

    if (track === 'messaging') {
      inputData = `## COLD-GENERATED RESPONSES

**Scenario 1A (Anxious parent, acute symptoms):**
${profile.coldResponses.scenario1A || 'Not provided'}

**Scenario 1B (Routine adult, medication):**
${profile.coldResponses.scenario1B || 'Not provided'}

**Scenario 1C (Frustrated patient, results):**
${profile.coldResponses.scenario1C || 'Not provided'}

## CONTRASTIVE PAIR SELECTIONS

**Pair 2A (Reassurance):** Selected ${profile.pairSelections.pair2A.selected || 'None'}
Edits made: ${profile.pairSelections.pair2A.edits || 'None'}

**Pair 2B (Triage-up):** Selected ${profile.pairSelections.pair2B.selected || 'None'}
Edits made: ${profile.pairSelections.pair2B.edits || 'None'}

**Pair 2C (Medication detail):** Selected ${profile.pairSelections.pair2C.selected || 'None'}
Edits made: ${profile.pairSelections.pair2C.edits || 'None'}

**Pair 2D (Mental health):** Selected ${profile.pairSelections.pair2D.selected || 'None'}
Edits made: ${profile.pairSelections.pair2D.edits || 'None'}

**Pair 2E (Admin/scheduling):** Selected ${profile.pairSelections.pair2E.selected || 'None'}
Edits made: ${profile.pairSelections.pair2E.edits || 'None'}

**Pair 2F (After-hours):** Selected ${profile.pairSelections.pair2F.selected || 'None'}
Edits made: ${profile.pairSelections.pair2F.edits || 'None'}

## ANTI-EXAMPLES

**Forbidden phrases:**
${profile.antiExamples.forbiddenPhrases || 'None specified'}

**Closers never used:**
${profile.antiExamples.closersNeverUsed.join(', ') || 'None specified'}

**Openers never used:**
${profile.antiExamples.openersNeverUsed.join(', ') || 'None specified'}

**Stylistic aversions:**
${profile.antiExamples.stylisticAversions.join(', ') || 'None specified'}

**Pet peeves:**
${profile.antiExamples.petPeeves || 'None specified'}

## EDIT CAPTURE

**Scenario 4A — Original draft:**
${profile.editCapture.scenario4A.original || 'Not provided'}

**Scenario 4A — Provider's edited version:**
${profile.editCapture.scenario4A.edited || 'Not provided'}

**Scenario 4B — Original draft:**
${profile.editCapture.scenario4B.original || 'Not provided'}

**Scenario 4B — Provider's edited version:**
${profile.editCapture.scenario4B.edited || 'Not provided'}

**Scenario 4C — Original draft:**
${profile.editCapture.scenario4C.original || 'Not provided'}

**Scenario 4C — Provider's edited version:**
${profile.editCapture.scenario4C.edited || 'Not provided'}

## VALUES CALIBRATION

**Uncertainty:** ${profile.values.uncertainty}/10
**Length:** ${profile.values.length}/10
**Warmth:** ${profile.values.warmth}/10
**Directive style:** ${profile.values.directiveStyle}/10
**Declining requests approach:** ${profile.values.decliningRequests || 'Not specified'}
**Emotional patients approach:** ${profile.values.emotionalPatient || 'Not specified'}
**After-hours philosophy:** ${profile.values.afterHours || 'Not specified'}
**Uncertainty handling:** ${profile.values.uncertaintyHandling || 'Not specified'}
**Communication philosophy:** ${profile.values.philosophy || 'Not specified'}`;
    } else {
      // Documentation track
      inputData = `## STRUCTURE PREFERENCES

**Overall Structure:** ${profile.structure?.overallStructure || 'Not specified'}
**Plan Organization:** ${profile.structure?.planOrganization || 'Not specified'}
**Assessment Style:** ${profile.structure?.assessmentStyle || 'Not specified'}
**HPI Construction:** ${profile.structure?.hpiConstruction || 'Not specified'}
**Physical Exam Style:** ${profile.structure?.physicalExamStyle || 'Not specified'}
**Template Usage Preference:** ${profile.structure?.templateUsage || 5}/10

## COLD-GENERATED DOCUMENTATION

**HPI — Pediatric Acute Visit:**
${profile.coldResponses?.hpiPediatricAcute || 'Not provided'}

**HPI — Adult Chronic Disease:**
${profile.coldResponses?.hpiAdultChronic || 'Not provided'}

**A/P — Pediatric Well Child:**
${profile.coldResponses?.apPediatricWellChild || 'Not provided'}

**A/P — Diagnostic Uncertainty:**
${profile.coldResponses?.apDiagnosticUncertainty || 'Not provided'}

**A/P — Mental Health:**
${profile.coldResponses?.apMentalHealth || 'Not provided'}

## CONTRASTIVE PAIR SELECTIONS

**Pair 3A (HPI Verbosity):** Selected ${profile.pairSelections?.pair3A?.selected || 'None'}
Edits made: ${profile.pairSelections?.pair3A?.edits || 'None'}

**Pair 3B (Assessment Reasoning):** Selected ${profile.pairSelections?.pair3B?.selected || 'None'}
Edits made: ${profile.pairSelections?.pair3B?.edits || 'None'}

**Pair 3C (Plan Specificity):** Selected ${profile.pairSelections?.pair3C?.selected || 'None'}
Edits made: ${profile.pairSelections?.pair3C?.edits || 'None'}

**Pair 3D (Documenting Uncertainty):** Selected ${profile.pairSelections?.pair3D?.selected || 'None'}
Edits made: ${profile.pairSelections?.pair3D?.edits || 'None'}

**Pair 3E (Physical Exam Detail):** Selected ${profile.pairSelections?.pair3E?.selected || 'None'}
Edits made: ${profile.pairSelections?.pair3E?.edits || 'None'}

**Pair 3F (Counseling Documentation):** Selected ${profile.pairSelections?.pair3F?.selected || 'None'}
Edits made: ${profile.pairSelections?.pair3F?.edits || 'None'}

## ANTI-EXAMPLES

**Forbidden phrases:**
${profile.antiExamples?.forbiddenPhrases || 'None specified'}

**Patterns avoided:**
${profile.antiExamples?.patternsAvoided?.join(', ') || 'None specified'}

**Style aversions:**
${profile.antiExamples?.styleAversions?.join(', ') || 'None specified'}

**Documentation pet peeves:**
${profile.antiExamples?.documentationPetPeeves || 'None specified'}

## EDIT CAPTURE

**Scenario 5A — Original draft:**
${profile.editCapture?.scenario5A?.original || 'Not provided'}

**Scenario 5A — Provider's edited version:**
${profile.editCapture?.scenario5A?.edited || 'Not provided'}

**Scenario 5B — Original draft:**
${profile.editCapture?.scenario5B?.original || 'Not provided'}

**Scenario 5B — Provider's edited version:**
${profile.editCapture?.scenario5B?.edited || 'Not provided'}

**Scenario 5C — Original draft:**
${profile.editCapture?.scenario5C?.original || 'Not provided'}

**Scenario 5C — Provider's edited version:**
${profile.editCapture?.scenario5C?.edited || 'Not provided'}

## VALUES CALIBRATION

**Verbosity:** ${profile.values?.verbosity || 5}/10
**Clinical Reasoning Visibility:** ${profile.values?.reasoningVisibility || 5}/10
**Medicolegal Awareness:** ${profile.values?.medicolegalAwareness || 5}/10
**Template Flexibility:** ${profile.values?.templateFlexibility || 5}/10
**Billing Considerations:** ${profile.values?.billingConsiderations || 5}/10
**Patient Quote Usage:** ${profile.values?.patientQuoteUsage || 'Not specified'}
**Open Notes Awareness:** ${profile.values?.openNotesAwareness || 'Not specified'}
**Uncertainty Documentation:** ${profile.values?.uncertaintyDocumentation || 'Not specified'}
**Sensitive Info Handling:** ${profile.values?.sensitiveInfoHandling || 'Not specified'}
**Documentation Philosophy:** ${profile.values?.documentationPhilosophy || 'Not specified'}

## SPECIALTY

**Practice Type:** ${profile.specialty?.practiceType || 'Not specified'}
**Growth Doc Style:** ${profile.specialty?.growthDocStyle || 'Not specified'}
**Development Doc Style:** ${profile.specialty?.developmentDocStyle || 'Not specified'}
**Anticipatory Guidance Doc:** ${profile.specialty?.anticipatoryGuidanceDoc || 'Not specified'}`;
    }

    const analysisPrompt = track === 'documentation' ? documentationAnalysisPrompt : messagingAnalysisPrompt;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: analysisPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this provider's communication style and generate their style profile:\n\n${inputData}`,
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    let styleProfile;
    try {
      styleProfile = JSON.parse(content);
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        styleProfile = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse style profile from response');
      }
    }

    return NextResponse.json({ profile: styleProfile });
  } catch (error) {
    console.error('Error generating profile:', error);
    return NextResponse.json(
      { error: 'Failed to generate profile' },
      { status: 500 }
    );
  }
}
