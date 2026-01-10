'use client';

import { Mail } from 'lucide-react';

interface ScenarioPromptProps {
  title: string;
  scenarioType: string;
  incomingMessage: string;
  senderName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ScenarioPrompt({
  title,
  scenarioType,
  incomingMessage,
  senderName,
  value,
  onChange,
  placeholder = 'Write your response here...',
}: ScenarioPromptProps) {
  return (
    <div className="space-y-4">
      {/* Scenario Header */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-[var(--sky-blue)] text-white text-xs font-medium rounded">
          {scenarioType}
        </span>
        <h3 className="text-lg font-medium text-[var(--charcoal)]">{title}</h3>
      </div>

      {/* Incoming Message */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
          <Mail className="w-4 h-4 text-[var(--gray)]" />
          <span className="text-sm font-medium text-[var(--charcoal)]">
            Incoming message from {senderName}
          </span>
        </div>
        <div className="p-4">
          <p className="text-[var(--charcoal)] whitespace-pre-wrap leading-relaxed">
            {incomingMessage}
          </p>
        </div>
      </div>

      {/* Response Textarea */}
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
          Your Response
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-[var(--charcoal)] placeholder:text-gray-400"
        />
        <p className="mt-1 text-xs text-[var(--gray)]">
          Respond exactly as you would in practice. Don&apos;t overthink it.
        </p>
      </div>
    </div>
  );
}
