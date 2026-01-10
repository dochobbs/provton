// Step 1: Cold Generation Scenarios
export const coldScenarios = [
  {
    id: 'scenario1A',
    title: 'Pediatric: Anxious Parent with Acute Symptoms',
    scenarioType: 'Peds: Anxious + Acute',
    senderName: 'Sarah',
    incomingMessage: `Hi Dr. [Name],

I'm really worried about Emma (4yo). She's had a fever of 102-103 for three days now. We've been giving Tylenol and Motrin but it keeps coming back. She's drinking okay but not eating much and just wants to lay on the couch. No rash or anything but she did say her throat hurts. I called the nurse line and they said to message you. Should we come in? I'm sorry to bother you but I just have a bad feeling.

Thank you,
Sarah`,
  },
  {
    id: 'scenario1B',
    title: 'Family Medicine: Routine Medication Request',
    scenarioType: 'FM: Routine + Medication',
    senderName: 'Robert Chen',
    incomingMessage: `Hello,

I need a refill on my lisinopril 10mg. I take it for blood pressure. Also I've been having some leg cramps at night lately, not sure if that's related or not. My pharmacy is Walgreens on Main St.

Thanks,
Robert Chen`,
  },
  {
    id: 'scenario1C',
    title: 'Family Medicine: Frustrated Patient About Results',
    scenarioType: 'FM: Frustrated + Results',
    senderName: 'Michelle Torres',
    incomingMessage: `I got a message saying my labs were "reviewed" but nobody told me what they actually showed. I took time off work for that blood draw and I've been waiting a week. My last doctor always called me with results. Can someone please just tell me if something is wrong? This is really frustrating.

- Michelle Torres`,
  },
];

// Step 2: Contrastive Pairs
export const contrastivePairs = [
  {
    id: 'pair2A',
    title: 'Reassurance: Warm vs. Efficient',
    pairType: 'Reassurance',
    incomingMessage: `My 2 year old fell off the couch onto carpet yesterday. She cried for a minute then was fine and has been acting normal since. No bump or bruise. But I just read about brain bleeds online and now I can't stop worrying. Should I bring her in?`,
    optionA: `Thanks for reaching out. I completely understand the worry—head injuries are scary, and the internet doesn't help! Based on what you're describing, this sounds very reassuring: brief crying that resolved quickly, normal behavior since, no visible injury. Those are all good signs.

No need for a visit unless you notice vomiting, unusual sleepiness, difficulty walking, or behavior that seems "off" to you. Trust your gut—you know her best.

Call us if anything changes or if you just need reassurance. That's what we're here for.`,
    optionB: `What you're describing—brief crying, normal behavior since, no visible injury—is reassuring. No evaluation needed unless she develops vomiting, excessive sleepiness, balance problems, or behavior changes.

Reach out if anything changes.`,
  },
  {
    id: 'pair2B',
    title: 'Triage-Up: Directive vs. Collaborative',
    pairType: 'Triage-Up',
    incomingMessage: `My husband (58) has been having chest tightness on and off for two days, mostly when he walks up stairs. He says it's probably just muscle strain from shoveling snow last week. He doesn't want to go to the ER. Should we just schedule an appointment?`,
    optionA: `I need him to go to the ER now, or call 911 if the discomfort is present right now.

Chest tightness with exertion in a 58-year-old requires immediate evaluation—this is exactly how cardiac problems present. It may well turn out to be musculoskeletal, but that's a diagnosis we make after ruling out the serious stuff, not before.

Please don't wait for an office appointment. Let me know once he's been evaluated.`,
    optionB: `I'm concerned about what you're describing. Chest tightness with exertion—like climbing stairs—is something we take seriously, especially at 58. It could be musculoskeletal, but we'd want to rule out cardiac causes first, and that really needs to happen in an ER where they can do an EKG and labs right away.

I know he's reluctant, but I'd strongly encourage an ER visit today. Would it help if I called and talked to him directly?`,
  },
  {
    id: 'pair2C',
    title: 'Medication/Clinical Detail: Thorough vs. Concise',
    pairType: 'Medication Detail',
    incomingMessage: `Started the Zoloft a week ago like we discussed. I feel kind of weird—jittery, trouble sleeping, and maybe a little more anxious? Is this normal or should I stop taking it?`,
    optionA: `What you're experiencing is common in the first 1-2 weeks of starting Zoloft and usually settles down. The medication is activating your system before the calming effects kick in—it's not a sign that it's wrong for you.

Don't stop abruptly. Try taking it in the morning if you're not already (helps with sleep), and give it another week or two. If symptoms are really bothersome, we can discuss a temporary dose reduction.

Most people feel these early side effects fade significantly by week 3-4. Check in with me in two weeks, or sooner if things feel worse rather than better.`,
    optionB: `That's a normal adjustment period—jitteriness and sleep changes are common the first 1-2 weeks and typically fade. Take it in the morning if you're not already. Don't stop without talking to me first.

Check in at 2 weeks. Message sooner if you feel worse.`,
  },
  {
    id: 'pair2D',
    title: 'Mental Health: Validating vs. Action-Oriented',
    pairType: 'Mental Health',
    incomingMessage: `I don't know if this is worth messaging about, but I've been feeling really down for the past month. Not enjoying things I usually like, tired all the time even though I'm sleeping. I keep telling myself to snap out of it but nothing's changing. I feel stupid even bringing this up.`,
    optionA: `I'm really glad you brought this up—it's not stupid at all, and it took courage to send this message. What you're describing sounds like it could be depression, which is a medical condition, not a character flaw or something you can just "snap out of."

Feeling down for a month, loss of enjoyment, fatigue despite sleep—these are classic symptoms, and they're very treatable. You did the right thing reaching out.

Can we schedule a visit to talk more? I'd like to understand what's going on and discuss options. There's no pressure to decide anything in advance.`,
    optionB: `This is absolutely worth messaging about. What you're describing—persistent low mood, loss of interest, fatigue—sounds like depression, which is common and treatable.

Let's schedule a visit to talk through it and discuss options. Are you available this week?`,
  },
  {
    id: 'pair2E',
    title: 'Admin/Scheduling: Accommodating vs. Boundary-Setting',
    pairType: 'Admin',
    incomingMessage: `I need a letter for work saying I was sick last week. I didn't come in for an appointment because I couldn't afford the copay, but my boss is threatening to fire me if I don't have a doctor's note. Can you please just write something? I really need this job.`,
    optionA: `I understand you're in a tough spot, and I'm sorry about the financial stress. Unfortunately, I can't write a note confirming illness for a time when I didn't evaluate you—that would be documenting something I can't verify, which puts both of us in a difficult position.

What I can do: if you're still not feeling well, we could schedule a visit (we can discuss payment options) and I can document what I find. Or, if you've recovered, I could write a general note confirming you're now cleared to work.

Would either of those help? I want to support you within what's appropriate.`,
    optionB: `I'm not able to write a note for an illness I didn't evaluate—I can only document what I've actually assessed.

If you're still unwell, let's get you in for a visit and we can work out payment. If you've recovered, I can write a return-to-work clearance. Let me know which makes sense for your situation.`,
  },
  {
    id: 'pair2F',
    title: 'After-Hours/Boundary: Available vs. Contained',
    pairType: 'After-Hours',
    incomingMessage: `Sorry for the late message. My son (7) threw up once about an hour ago but seems fine now, no fever. He ate a lot of Halloween candy. Probably nothing but wanted to check if we should do anything.`,
    optionA: `No worries about the timing. One episode of vomiting after a candy binge is almost certainly just that—too much sugar. If he's acting fine now, no fever, keeping down sips of water, just let him rest.

Watch for repeated vomiting, fever, or if he seems "off" tomorrow. Otherwise, no need to do anything.

Hope you both get some sleep!`,
    optionB: `Most likely the candy. One vomit, no fever, acting fine = just watch for now. Sips of water, rest.

Message in the morning if he's still vomiting or seems unwell.`,
  },
];

// Step 3: Anti-Examples Options
export const closerOptions = [
  { id: 'take-care', label: 'Take care!' },
  { id: 'best', label: 'Best,' },
  { id: 'let-us-know', label: 'Let us know if you have any questions!' },
  { id: 'warmly', label: 'Warmly,' },
  { id: 'thanks', label: 'Thanks!' },
  { id: 'hope-helps', label: 'Hope this helps!' },
  { id: 'talk-soon', label: 'Talk soon,' },
  { id: 'feel-better', label: 'Feel better!' },
  { id: 'sincerely', label: 'Sincerely,' },
  { id: 'great-day', label: 'Have a great day!' },
  { id: 'yours-health', label: 'Yours in health,' },
  { id: 'here-for-you', label: "As always, we're here for you." },
];

export const openerOptions = [
  { id: 'thanks-reaching', label: 'Thanks for reaching out!' },
  { id: 'great-question', label: 'Great question!' },
  { id: 'sorry-hear', label: "I'm so sorry to hear that." },
  { id: 'thank-message', label: 'Thank you for your message.' },
  { id: 'hi-there', label: 'Hi there!' },
  { id: 'good-morning', label: 'Good morning/afternoon!' },
  { id: 'hope-finds-well', label: 'I hope this message finds you well.' },
  { id: 'thanks-patience', label: 'Thanks for your patience.' },
  { id: 'no-worries', label: 'No worries!' },
  { id: 'of-course', label: 'Of course!' },
];

export const stylisticAversionOptions = [
  { id: 'exclamation-clinical', label: 'Exclamation points in clinical contexts' },
  { id: 'we-for-i', label: 'Using "we" when you mean "I"' },
  { id: 'i-for-we', label: 'Using "I" when you could say "we"' },
  { id: 'completely-understand', label: 'Phrases like "I completely understand"' },
  { id: 'overly-formal', label: 'Overly formal language' },
  { id: 'overly-casual', label: 'Overly casual language' },
  { id: 'emojis', label: 'Emojis of any kind' },
  { id: 'starting-so', label: 'Starting sentences with "So,"' },
  { id: 'just', label: 'Using "just" (e.g., "just wanted to check in")' },
  { id: 'feel-free', label: 'Saying "feel free to"' },
  { id: 'jargon', label: 'Medical jargon without explanation' },
  { id: 'over-explaining', label: 'Over-explaining simple things' },
  { id: 'bullet-points', label: 'Bullet points in messages' },
  { id: 'one-sentence-para', label: 'One-sentence paragraphs' },
];

// Step 4: Edit Capture Scenarios
export const editScenarios = [
  {
    id: 'scenario4A',
    title: 'Pediatric: Developmental Concern',
    scenarioDescription: 'Parent worried about 18-month-old not talking yet, asking about autism',
    incomingMessage: `Hi, I'm worried about my 18-month-old. He's not really saying any words yet, just babbling. My sister's kid was talking in sentences by this age. The internet says this could be autism. Should we be concerned?`,
  },
  {
    id: 'scenario4B',
    title: 'Family Medicine: Chronic Disease Management',
    scenarioDescription: 'Adult patient with diabetes asking about rising blood sugar levels',
    incomingMessage: `My blood sugar has been running higher than usual the past few weeks—mostly 150s-170s fasting when it's usually around 120. I haven't changed my diet really. My A1c was 7.1 last time. Should I adjust my metformin or come in?`,
  },
  {
    id: 'scenario4C',
    title: 'Mixed: Sensitive Decline',
    scenarioDescription: 'Parent requesting ADHD medication for teenager without proper evaluation',
    incomingMessage: `My daughter is 16 and she wants to get tested for ADHD. She says she can't focus in school. Honestly I think she's just on her phone too much and doesn't want to put in the effort. Can we just get her the medication so she'll try harder? Her grades are suffering.`,
  },
];

// Step 5: Values Calibration
export const sliderQuestions = [
  {
    id: 'uncertainty',
    label: 'When you\'re not 100% certain about something, you tend to:',
    leftLabel: 'Project confidence',
    rightLabel: 'Acknowledge uncertainty explicitly',
  },
  {
    id: 'length',
    label: 'In general, you prefer messages that are:',
    leftLabel: 'Shorter, even if follow-up needed',
    rightLabel: 'Thorough, anticipating questions',
  },
  {
    id: 'warmth',
    label: 'Your default tone is:',
    leftLabel: 'Warm and personal',
    rightLabel: 'Efficient and clinical',
  },
  {
    id: 'directiveStyle',
    label: 'When giving recommendations, you tend to be:',
    leftLabel: 'Direct and prescriptive',
    rightLabel: 'Collaborative and options-based',
  },
];

export const situationQuestions = [
  {
    id: 'decliningRequests',
    question: 'A patient asks for something you\'re not going to provide (e.g., inappropriate antibiotic, controlled substance, unnecessary test). How do you typically handle this?',
    options: [
      { id: 'explain', label: 'Explain my reasoning in detail so they understand' },
      { id: 'brief-no', label: 'Keep it brief—a clear "no" with minimal elaboration' },
      { id: 'redirect', label: 'Redirect to what I can do instead' },
      { id: 'validate-first', label: 'Validate their concern first, then decline' },
      { id: 'depends', label: 'Depends entirely on the specific situation' },
    ],
  },
  {
    id: 'emotionalPatient',
    question: 'When a patient or parent is clearly anxious or distressed in their message, you:',
    options: [
      { id: 'acknowledge-first', label: 'Acknowledge the emotion explicitly before addressing the clinical question' },
      { id: 'address-clinical', label: 'Address the clinical question directly—that\'s what they actually need' },
      { id: 'mix', label: 'A mix, depending on how distressed they seem' },
      { id: 'reassure-first', label: 'Try to reassure first, clinical content second' },
    ],
  },
  {
    id: 'afterHours',
    question: 'Your philosophy on after-hours portal messages:',
    options: [
      { id: 'respond-always', label: 'I respond when I see them, regardless of time' },
      { id: 'wait-business', label: 'I wait until business hours unless it\'s urgent' },
      { id: 'triage', label: 'I triage—quick answers now, complex ones can wait' },
    ],
  },
  {
    id: 'uncertaintyHandling',
    question: 'A patient asks a clinical question where you genuinely don\'t know the answer. You typically:',
    options: [
      { id: 'say-unsure', label: 'Say I\'m not sure and will look into it' },
      { id: 'best-assessment', label: 'Give my best assessment with appropriate caveats' },
      { id: 'refer', label: 'Refer to someone who would know' },
      { id: 'avoid-committing', label: 'Avoid committing to anything uncertain in writing' },
    ],
  },
];

// Messaging Track Steps
export const messagingSteps = [
  { number: 1, title: 'Cold Generation', shortTitle: 'Write' },
  { number: 2, title: 'Contrastive Pairs', shortTitle: 'Choose' },
  { number: 3, title: 'Anti-Examples', shortTitle: 'Avoid' },
  { number: 4, title: 'Edit Capture', shortTitle: 'Refine' },
  { number: 5, title: 'Values Calibration', shortTitle: 'Calibrate' },
  { number: 6, title: 'Summary', shortTitle: 'Review' },
];
