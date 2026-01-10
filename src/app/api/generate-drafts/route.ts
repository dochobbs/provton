import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenarioId, incomingMessage, coldResponses, pairSelections, antiExamples } = body;

    // Build context from previous responses
    const contextParts: string[] = [];

    // Add cold responses as examples
    if (coldResponses.scenario1A) {
      contextParts.push(`Example response to anxious parent: "${coldResponses.scenario1A}"`);
    }
    if (coldResponses.scenario1B) {
      contextParts.push(`Example response to routine request: "${coldResponses.scenario1B}"`);
    }
    if (coldResponses.scenario1C) {
      contextParts.push(`Example response to frustrated patient: "${coldResponses.scenario1C}"`);
    }

    // Add pair selection preferences
    const pairDescriptions: Record<string, { A: string; B: string }> = {
      pair2A: { A: 'warm and thorough', B: 'efficient and concise' },
      pair2B: { A: 'directive and urgent', B: 'collaborative and explanatory' },
      pair2C: { A: 'thorough with context', B: 'brief and actionable' },
      pair2D: { A: 'validating emotions first', B: 'action-oriented' },
      pair2E: { A: 'empathetic but boundaried', B: 'direct about boundaries' },
      pair2F: { A: 'warm and available', B: 'concise and contained' },
    };

    Object.entries(pairSelections).forEach(([pairId, selection]: [string, any]) => {
      if (selection.selected && pairDescriptions[pairId]) {
        const style = selection.selected === 'A'
          ? pairDescriptions[pairId].A
          : pairDescriptions[pairId].B;
        contextParts.push(`Prefers ${style} style for ${pairId.replace('pair2', 'scenario type ')}`);
      }
    });

    // Add anti-examples
    if (antiExamples.forbiddenPhrases) {
      contextParts.push(`Never uses these phrases: ${antiExamples.forbiddenPhrases}`);
    }
    if (antiExamples.closersNeverUsed.length > 0) {
      contextParts.push(`Avoids these closers: ${antiExamples.closersNeverUsed.join(', ')}`);
    }
    if (antiExamples.openersNeverUsed.length > 0) {
      contextParts.push(`Avoids these openers: ${antiExamples.openersNeverUsed.join(', ')}`);
    }
    if (antiExamples.stylisticAversions.length > 0) {
      contextParts.push(`Stylistic aversions: ${antiExamples.stylisticAversions.join(', ')}`);
    }

    const systemPrompt = `You are a medical provider drafting a portal message response. You should write in a professional yet personable style appropriate for patient communication.

Based on the provider's previous responses and preferences, match their communication style:

${contextParts.join('\n')}

Write a response to the incoming patient message that sounds natural and matches this provider's voice. Do not include any preamble or explanation—just write the response as it would appear in the portal message.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Write a response to this incoming portal message:\n\n${incomingMessage}`,
        },
      ],
    });

    const draft = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Error generating draft:', error);
    return NextResponse.json(
      { error: 'Failed to generate draft' },
      { status: 500 }
    );
  }
}
