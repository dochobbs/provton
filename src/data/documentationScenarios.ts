// Step 1: Structure Preferences
export const structureOptions = {
  overallStructure: [
    { id: 'soap', label: 'Classic SOAP (Subjective, Objective, Assessment, Plan)' },
    { id: 'problem-oriented', label: 'Problem-oriented (each problem gets its own A/P)' },
    { id: 'integrated-ap', label: 'Integrated A/P (assessment and plan combined per problem)' },
    { id: 'narrative', label: 'Narrative style (more prose, less rigid structure)' },
    { id: 'template-heavy', label: 'Template-heavy (mostly structured data, minimal free text)' },
    { id: 'hybrid', label: 'Hybrid (custom mix)' },
  ],
  planOrganization: [
    { id: 'numbered-problem', label: 'Numbered list by problem' },
    { id: 'bulleted-problem', label: 'Bulleted list by problem' },
    { id: 'numbered-action', label: 'Numbered by action type (meds, labs, imaging, referrals, counseling)' },
    { id: 'prose', label: 'Prose paragraphs' },
    { id: 'mixed', label: 'Mixed—depends on complexity' },
  ],
  assessmentStyle: [
    { id: 'diagnosis-only', label: 'Diagnosis list only (e.g., "1. Acute otitis media, left 2. Viral URI")' },
    { id: 'diagnosis-rationale', label: 'Diagnosis + brief rationale per problem' },
    { id: 'narrative-paragraph', label: 'Narrative paragraph synthesizing clinical reasoning' },
    { id: 'differential-reasoning', label: 'Differential list with reasoning for working diagnosis' },
    { id: 'minimal', label: 'Minimal—I focus on the Plan' },
    { id: 'varies', label: 'Varies significantly by visit type' },
  ],
  hpiConstruction: [
    { id: 'chronological', label: 'Chronological narrative ("Three days ago, patient developed...")' },
    { id: 'problem-focused', label: 'Problem-focused ("Patient presents with fever. Onset 3 days ago...")' },
    { id: 'template', label: 'Template with fill-in elements' },
    { id: 'patient-quotes', label: 'Mostly patient quotes with attribution' },
    { id: 'brief', label: 'Brief—just essential facts, minimal prose' },
    { id: 'detailed', label: 'Detailed—thorough documentation of full history' },
  ],
  physicalExamStyle: [
    { id: 'comprehensive', label: 'Comprehensive template with normals documented' },
    { id: 'focused', label: 'Focused exam—only document systems examined' },
    { id: 'pertinent', label: 'Pertinent positives and negatives only' },
    { id: 'detailed-narrative', label: 'Detailed narrative descriptions' },
    { id: 'minimal', label: 'Minimal—brief normals, detail only abnormalities' },
    { id: 'mixed', label: 'Mixed based on visit type' },
  ],
};

// Step 2: Cold Generation Scenarios
export const docColdScenarios = [
  {
    id: 'hpiPediatricAcute',
    title: 'HPI — Pediatric Acute Visit',
    scenarioType: 'HPI',
    context: `4-year-old female presents with 3 days of fever (max 103°F), decreased appetite, sore throat, and mild cough. Mom reports she's been "clingy" and more tired than usual. No rash, no vomiting/diarrhea. Drinking adequately. Tylenol and Motrin providing temporary relief. Older sibling had strep last week. No known drug allergies. Immunizations up to date.`,
    placeholder: 'Write your HPI for this visit...',
  },
  {
    id: 'hpiAdultChronic',
    title: 'HPI — Adult Chronic Disease',
    scenarioType: 'HPI',
    context: `58-year-old male with T2DM (diagnosed 6 years ago), HTN, and hyperlipidemia presenting for routine follow-up. A1c last visit was 7.8%, now 8.2%. Home glucoses running 140-180 fasting, higher post-prandially. Patient admits to dietary lapses over holidays. Currently on metformin 1000mg BID and lisinopril 20mg daily. No hypoglycemic episodes. Denies polyuria, polydipsia, vision changes, numbness/tingling. Weight up 4 lbs since last visit.`,
    placeholder: 'Write your HPI for this visit...',
  },
  {
    id: 'apPediatricWellChild',
    title: 'Assessment & Plan — Pediatric Well Child',
    scenarioType: 'A/P',
    context: `15-month well child check. Development on track—walking, 5-6 words, points to objects. Growth 50th percentile weight, 60th height. Eating table foods well, whole milk transition complete. Sleeping through the night. Parents have no concerns. Exam normal. Due for Hib, PCV13, and Hep A vaccines today.`,
    placeholder: 'Write your Assessment & Plan for this visit...',
  },
  {
    id: 'apDiagnosticUncertainty',
    title: 'Assessment & Plan — Diagnostic Uncertainty',
    scenarioType: 'A/P',
    context: `42-year-old female with 2 weeks of fatigue, intermittent low-grade temps (99-100°F), mild joint aches (symmetric, small joints of hands), and a faint malar rash she noticed last week. No oral ulcers, hair loss, or Raynaud's. No recent illness. Family history notable for aunt with lupus. Exam shows subtle erythema over cheeks sparing nasolabial folds, no synovitis on joint exam but mild tenderness at MCPs bilaterally. You're concerned about possible early SLE but differential includes viral syndrome, early RA, other CTD.`,
    placeholder: 'Write your Assessment & Plan for this visit...',
  },
  {
    id: 'apMentalHealth',
    title: 'Assessment & Plan — Mental Health',
    scenarioType: 'A/P',
    context: `16-year-old male brought in by parents for "not being himself" for past 2 months. Grades dropped from As/Bs to Cs/Ds. Sleeping 10-12 hours but still tired. Quit soccer team. Spending more time alone in room. Eating less. On interview alone, patient endorses feeling "empty" most days, anhedonia, difficulty concentrating. Denies suicidal ideation, self-harm, substance use. PHQ-A score 16 (moderate-severe). No prior mental health history.`,
    placeholder: 'Write your Assessment & Plan for this visit...',
  },
];

// Step 3: Contrastive Pairs
export const docContrastivePairs = [
  {
    id: 'pair3A',
    title: 'HPI Verbosity',
    pairType: 'HPI Style',
    description: 'Same clinical scenario, two documentation styles',
    optionA: `Mother reports that Emma developed fever three days ago, with temperatures ranging from 101-103°F measured axillary. Fever has been responsive to alternating acetaminophen 160mg and ibuprofen 100mg every 3-4 hours but consistently returns. On day 2, Emma began complaining of sore throat and has been reluctant to eat solid foods, though she continues to drink fluids adequately—mother estimates 4-5 sippy cups of water and diluted juice daily. She has had a mild dry cough, primarily at night, without associated respiratory distress or wheezing per mother. No rhinorrhea, no rash, no vomiting or diarrhea. Mother notes Emma has been "clingier than usual" and wanting to be held more. Sleep has been fragmented due to fever. Of note, Emma's 7-year-old brother was diagnosed with strep pharyngitis 6 days ago and completed a course of amoxicillin.`,
    optionB: `4 y/o F w/ 3 days fever (101-103°F), sore throat, decreased PO intake, mild cough. Drinking adequately. No rash, no vomiting/diarrhea, no respiratory distress. Acetaminophen/ibuprofen providing temporary relief. Sibling diagnosed with strep 6 days ago.`,
    optionALabel: 'Detailed narrative',
    optionBLabel: 'Concise, essential facts',
  },
  {
    id: 'pair3B',
    title: 'Assessment Reasoning',
    pairType: 'Assessment Style',
    description: 'Same clinical scenario (possible SLE case), two styles',
    optionA: `ASSESSMENT:
42-year-old female presenting with constellation of fatigue, arthralgias, low-grade fevers, and malar rash concerning for possible early systemic lupus erythematosus.

Differential diagnosis:
1. Systemic lupus erythematosus — Most concerning given malar rash with nasolabial sparing, symmetric small joint involvement, constitutional symptoms, and positive family history. Will require serologic workup.
2. Viral syndrome with post-viral arthralgias — Could explain constitutional symptoms and arthralgias, though rash pattern less typical and duration of 2 weeks argues against simple viral illness.
3. Early rheumatoid arthritis — Symmetric small joint involvement is consistent, but absence of synovitis and presence of malar rash make this less likely.
4. Other connective tissue disease (MCTD, Sjögren's) — Less likely given presentation but will be considered based on serologic results.`,
    optionB: `ASSESSMENT:
1. Fatigue, arthralgias, malar rash — concerning for early SLE given clinical picture and family history. Viral syndrome and early RA on differential but less likely given rash pattern and absence of synovitis.`,
    optionALabel: 'Differential-focused',
    optionBLabel: 'Working diagnosis with brief rationale',
  },
  {
    id: 'pair3C',
    title: 'Plan Specificity',
    pairType: 'Plan Style',
    description: 'Same scenario, two plan styles',
    optionA: `PLAN:
1. Labs: CBC with differential, CMP, ESR, CRP, ANA with reflex to dsDNA and Smith antibodies, C3/C4 complement levels, UA with microscopy
2. Patient to call for results in 5-7 days or sooner if results critical
3. Return visit in 2 weeks to review results and reassess symptoms
4. Discussed differential diagnosis including possibility of lupus; patient understands this is preliminary evaluation
5. Precautions: seek care sooner for worsening joint swelling, new rash, fever >101, chest pain, shortness of breath
6. Will refer to rheumatology pending serologic results
7. Photoprotection counseling given pending workup—advised daily sunscreen and sun-protective clothing`,
    optionB: `PLAN:
1. SLE workup: ANA, dsDNA, CBC, CMP, ESR/CRP, C3/C4, UA
2. RTC 2 weeks to review results
3. Rheumatology referral if serology positive
4. Discussed differential and plan; patient understands
5. Advised sun precautions pending workup`,
    optionALabel: 'Highly specific',
    optionBLabel: 'Action-oriented, less granular',
  },
  {
    id: 'pair3D',
    title: 'Documenting Uncertainty',
    pairType: 'Uncertainty',
    description: 'Two approaches to same uncertain situation',
    optionA: `Clinical picture is somewhat atypical and definitive diagnosis cannot be established today. While symptoms are suggestive of early SLE, negative serology would not fully exclude the diagnosis, and clinical monitoring would be warranted regardless of initial results. I discussed with the patient that this evaluation is preliminary and our understanding may evolve with additional data.`,
    optionB: `Findings most consistent with early SLE pending confirmatory serology. Will proceed with workup and reassess based on results.`,
    optionALabel: 'Explicit uncertainty',
    optionBLabel: 'Confident working assessment',
  },
  {
    id: 'pair3E',
    title: 'Physical Exam — Level of Detail',
    pairType: 'Physical Exam',
    description: 'Same well child exam, two styles',
    optionA: `PHYSICAL EXAM:
Vitals: Temp 98.6°F, HR 110, RR 24, BP not obtained, Weight 10.2 kg (50th %ile), Length 78 cm (60th %ile), HC 47 cm (55th %ile)
General: Well-appearing, interactive, age-appropriate stranger anxiety, makes good eye contact
HEENT: Normocephalic, atraumatic. Anterior fontanelle closed. TMs clear bilaterally with normal light reflex and mobility. Conjunctivae clear. Nasal mucosa pink, no discharge. Oropharynx clear, no erythema, 8 teeth present with no caries
Neck: Supple, no lymphadenopathy
Cardiovascular: Regular rate and rhythm, no murmurs, femoral pulses 2+ bilaterally
Respiratory: Clear to auscultation bilaterally, no increased work of breathing
Abdomen: Soft, non-tender, non-distended, no hepatosplenomegaly, no masses
GU: Normal external female genitalia, Tanner I
Musculoskeletal: Full ROM all extremities, no hip click, symmetric leg lengths
Skin: No rashes, no birthmarks, no bruising
Neuro: Age-appropriate tone and strength, walking independently, pincer grasp present`,
    optionB: `PHYSICAL EXAM:
Vitals: Wt 10.2 kg (50%), Len 78 cm (60%), HC 47 cm (55%)
General: Well-appearing, interactive, developmentally appropriate
HEENT: TMs clear, oropharynx normal
CV: RRR, no murmur
Lungs: CTA bilaterally
Abdomen: Soft, NT, ND
Skin: No concerning lesions
Neuro/Development: Walking, pincer grasp, 5-6 words per parent`,
    optionALabel: 'Comprehensive documentation',
    optionBLabel: 'Focused, abnormal-oriented',
  },
  {
    id: 'pair3F',
    title: 'Counseling Documentation',
    pairType: 'Counseling',
    description: 'Two approaches to documenting anticipatory guidance',
    optionA: `ANTICIPATORY GUIDANCE:
Discussed the following topics with parents:
- Nutrition: Continued whole milk 16-20 oz daily, variety of table foods, avoid choking hazards (grapes, hot dogs, nuts, popcorn), no juice recommended
- Development: Encouraged reading daily, limit screen time to video chat only per AAP guidelines, encourage independent play
- Safety: Reviewed car seat positioning (rear-facing until age 2), supervision around water, medication/poison storage, sunscreen use
- Sleep: Discussed continued importance of consistent bedtime routine, aim for 11-14 hours total including naps
- Dental: Encouraged twice daily brushing with smear of fluoride toothpaste, first dental visit if not yet established

Parents had no questions. Verbalized understanding.`,
    optionB: `Anticipatory guidance provided re: nutrition, safety, development, sleep appropriate for age. Parents had no concerns.`,
    optionALabel: 'Detailed',
    optionBLabel: 'Summary',
  },
];

// Step 4: Anti-Examples
export const docPatternsAvoidedOptions = [
  { id: 'copy-forward', label: 'Copy-forward without meaningful updates' },
  { id: 'documenting-unexamined', label: "Documenting normal findings you didn't actually examine" },
  { id: 'denies-unasked', label: 'Using "denies" when patient wasn\'t specifically asked' },
  { id: 'excessive-abbrev', label: 'Excessive abbreviations' },
  { id: 'too-long', label: 'Overly long notes for simple visits' },
  { id: 'too-brief', label: "Overly brief notes that don't capture reasoning" },
  { id: 'exact-quotes', label: 'Documenting exact quotes from patients' },
  { id: 'third-person', label: 'Third-person language ("This provider recommends...")' },
  { id: 'first-person', label: 'First-person language ("I recommend...")' },
  { id: 'passive-voice', label: 'Passive voice ("The patient was counseled...")' },
  { id: 'negative-ros', label: 'Documenting "negative review of systems" without specifics' },
  { id: 'robotic-template', label: 'Template language that sounds robotic' },
  { id: 'excessive-hedging', label: 'Excessive hedging ("possible," "cannot rule out")' },
  { id: 'overconfident', label: 'Overconfident language without appropriate uncertainty' },
  { id: 'bullets-assessment', label: 'Bullet points in assessment narrative' },
  { id: 'spelling-out-obvious', label: 'Spelling out obvious clinical reasoning' },
  { id: 'patient-no-name', label: 'Using "patient" instead of name/pronouns' },
  { id: 'jargon-no-explain', label: 'Medical jargon without plain language equivalent' },
];

export const docStyleAversionOptions = [
  { id: 'all-caps', label: 'All caps for headers' },
  { id: 'incomplete-sentences', label: 'Incomplete sentences' },
  { id: 'run-on', label: 'Run-on sentences' },
  { id: 'parentheticals', label: 'Heavy use of parentheticals' },
  { id: 'numbered-everything', label: 'Numbered lists for everything' },
  { id: 'long-paragraphs', label: 'Long unbroken paragraphs' },
  { id: 'telegraphic', label: 'Telegraphic style (dropping articles: "Pt reports fever")' },
  { id: 'overly-formal', label: 'Overly formal/academic tone' },
  { id: 'overly-casual', label: 'Overly casual tone' },
  { id: 'smart-quotes', label: 'Smart quotes or special characters' },
  { id: 'bold-italics', label: 'Bold or italics for emphasis' },
  { id: 'underlining', label: 'Underlining' },
];

// Step 5: Edit Capture Scenarios
export const docEditScenarios = [
  {
    id: 'scenario5A',
    title: 'Pediatric Acute Visit — Complete Note',
    scenarioDescription: '2-year-old with viral symptoms (runny nose, cough, low-grade fever)',
    context: `2-year-old male with 2 days of runny nose, cough, and low-grade fever (100.5°F). Eating and drinking okay. No respiratory distress. Sleeping more than usual. No sick contacts known. Exam: mild clear rhinorrhea, mildly erythematous posterior pharynx, TMs clear, lungs clear, no increased work of breathing.`,
  },
  {
    id: 'scenario5B',
    title: 'Adult Chronic Disease Follow-up — Complete Note',
    scenarioDescription: '62-year-old with HTN, T2DM, hypothyroidism for routine follow-up with suboptimal BP',
    context: `62-year-old female with HTN, T2DM, and hypothyroidism for routine follow-up. BP today 148/92, was 138/86 last visit. Taking lisinopril 10mg daily as prescribed. Recent A1c 7.4% (stable). TSH normal. Patient reports occasional headaches, worse in morning. No chest pain, visual changes, or edema. Weight stable. You're considering uptitrating lisinopril.`,
  },
  {
    id: 'scenario5C',
    title: 'Mental Health Visit — Complete Note',
    scenarioDescription: '34-year-old with GAD on sertraline for follow-up',
    context: `34-year-old female established patient with generalized anxiety disorder on sertraline 100mg daily, presenting for follow-up. Reports anxiety "better but not gone"—less panic, still ruminates at night, affecting sleep. PHQ-9: 6 (mild). GAD-7: 10 (moderate). Tolerating medication well, no side effects. Interested in adding therapy. You discuss options including dose increase vs. adding therapy vs. both.`,
  },
];

// Step 6: Values Calibration
export const docSliderQuestions = [
  {
    id: 'verbosity',
    label: 'In general, your notes tend to be:',
    leftLabel: 'Concise/efficient',
    rightLabel: 'Thorough/comprehensive',
  },
  {
    id: 'reasoningVisibility',
    label: 'How much clinical reasoning do you include in your notes?',
    leftLabel: 'Minimal—document decisions, not process',
    rightLabel: 'Extensive—show your thinking',
  },
  {
    id: 'medicolegalAwareness',
    label: 'How much does medicolegal thinking influence your documentation?',
    leftLabel: 'I document clinically, not defensively',
    rightLabel: 'I document with legal review in mind',
  },
  {
    id: 'templateFlexibility',
    label: 'How much do you modify templates vs. use them as-is?',
    leftLabel: 'Use templates with minimal modification',
    rightLabel: 'Heavily customize every note',
  },
  {
    id: 'billingConsiderations',
    label: 'How much does billing/coding influence your documentation?',
    leftLabel: 'Document clinically, billing follows',
    rightLabel: 'Actively document to support appropriate billing',
  },
];

export const docSituationQuestions = [
  {
    id: 'patientQuoteUsage',
    question: 'How often do you include direct patient quotes in notes?',
    options: [
      { id: 'frequently', label: 'Frequently—captures their experience in their words' },
      { id: 'sometimes', label: 'Sometimes—when their phrasing is clinically significant' },
      { id: 'rarely', label: 'Rarely—I paraphrase instead' },
      { id: 'almost-never', label: 'Almost never' },
    ],
  },
  {
    id: 'openNotesAwareness',
    question: 'How does patient access to notes (Open Notes) affect your documentation?',
    options: [
      { id: 'significantly', label: 'Significantly—I write knowing patients will read' },
      { id: 'somewhat', label: 'Somewhat—I avoid jargon when possible' },
      { id: 'minimally', label: 'Minimally—I write for clinical purposes, patients can ask questions' },
      { id: 'not-applicable', label: "Not applicable—my system doesn't have open notes" },
    ],
  },
  {
    id: 'uncertaintyDocumentation',
    question: "When you're diagnostically uncertain, you typically:",
    options: [
      { id: 'explicit', label: 'Document the uncertainty explicitly' },
      { id: 'working-dx', label: 'Present working diagnosis with differential' },
      { id: 'defer-labels', label: 'Document what I know, defer diagnostic labels' },
      { id: 'depends', label: 'Depends on the situation' },
    ],
  },
  {
    id: 'sensitiveInfoHandling',
    question: 'For sensitive topics (mental health, substance use, domestic violence, STIs), you:',
    options: [
      { id: 'same', label: 'Document as I would any clinical information' },
      { id: 'careful', label: 'Document carefully with awareness of who might access the record' },
      { id: 'specific-patterns', label: 'Use specific documentation patterns for sensitive info' },
      { id: 'discuss-patient', label: 'Discuss with patient how they want it documented' },
    ],
  },
];

// Step 7: Specialty
export const practiceTypeOptions = [
  { id: 'pediatrics', label: 'Pediatrics only' },
  { id: 'family-medicine', label: 'Family medicine (all ages)' },
  { id: 'peds-adolescent', label: 'Pediatrics + adolescent/young adult' },
  { id: 'other', label: 'Other' },
];

export const pedsGrowthOptions = [
  { id: 'percentiles-only', label: 'Percentiles only' },
  { id: 'percentiles-zscores', label: 'Percentiles with z-scores' },
  { id: 'percentiles-trend', label: 'Percentiles with trend commentary' },
  { id: 'plot-reference', label: 'Plot reference, brief note' },
  { id: 'bmi-always', label: 'BMI/weight-for-length always included' },
];

export const pedsDevelopmentOptions = [
  { id: 'screening-only', label: 'Screening tool reference only (e.g., "ASQ passed")' },
  { id: 'milestone-checklist', label: 'Milestone checklist' },
  { id: 'narrative', label: 'Narrative description' },
  { id: 'parent-report', label: 'Parent report summary' },
  { id: 'detailed-exam', label: 'Detailed developmental exam' },
];

export const pedsAnticipGuidanceOptions = [
  { id: 'detailed-topics', label: 'Detailed topic list with content' },
  { id: 'topics-brief', label: 'Topics discussed, brief' },
  { id: 'age-appropriate', label: '"Age-appropriate anticipatory guidance provided"' },
  { id: 'only-concerns', label: 'Only document if concerns raised' },
];

// Documentation Track Steps
export const documentationSteps = [
  { number: 1, title: 'Structure Preferences', shortTitle: 'Structure' },
  { number: 2, title: 'Cold Generation', shortTitle: 'Write' },
  { number: 3, title: 'Contrastive Pairs', shortTitle: 'Choose' },
  { number: 4, title: 'Anti-Examples', shortTitle: 'Avoid' },
  { number: 5, title: 'Edit Capture', shortTitle: 'Refine' },
  { number: 6, title: 'Values Calibration', shortTitle: 'Calibrate' },
  { number: 7, title: 'Summary', shortTitle: 'Review' },
];
