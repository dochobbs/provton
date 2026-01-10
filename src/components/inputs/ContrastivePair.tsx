'use client';

import { Mail, Check, Edit3 } from 'lucide-react';
import { useState } from 'react';

interface ContrastivePairProps {
  title: string;
  pairType: string;
  incomingMessage: string;
  optionA: string;
  optionB: string;
  selected: 'A' | 'B' | null;
  edits: string | null;
  onSelect: (option: 'A' | 'B') => void;
  onEdit: (edits: string | null) => void;
}

export function ContrastivePair({
  title,
  pairType,
  incomingMessage,
  optionA,
  optionB,
  selected,
  edits,
  onSelect,
  onEdit,
}: ContrastivePairProps) {
  const [showEditor, setShowEditor] = useState(edits !== null);

  const handleOptionSelect = (option: 'A' | 'B') => {
    onSelect(option);
    // Pre-fill editor with selected option if user wants to edit
    if (showEditor) {
      onEdit(option === 'A' ? optionA : optionB);
    }
  };

  const toggleEditor = () => {
    if (!showEditor && selected) {
      // Pre-fill with selected option
      onEdit(selected === 'A' ? optionA : optionB);
    } else if (showEditor) {
      onEdit(null);
    }
    setShowEditor(!showEditor);
  };

  return (
    <div className="space-y-4 pb-6 border-b border-gray-200 last:border-0">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-[var(--deep-blue)] text-white text-xs font-medium rounded">
          {pairType}
        </span>
        <h3 className="text-lg font-medium text-[var(--charcoal)]">{title}</h3>
      </div>

      {/* Incoming Message */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
          <Mail className="w-4 h-4 text-[var(--gray)]" />
          <span className="text-sm font-medium text-[var(--charcoal)]">Incoming message</span>
        </div>
        <div className="p-4">
          <p className="text-[var(--charcoal)] whitespace-pre-wrap leading-relaxed text-sm">
            {incomingMessage}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Option A */}
        <button
          onClick={() => handleOptionSelect('A')}
          className={`
            text-left p-4 rounded-lg border-2 transition-all
            ${selected === 'A'
              ? 'border-[var(--mid-blue)] bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-[var(--charcoal)]">Option A</span>
            {selected === 'A' && (
              <span className="w-5 h-5 bg-[var(--mid-blue)] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--gray)] whitespace-pre-wrap">{optionA}</p>
        </button>

        {/* Option B */}
        <button
          onClick={() => handleOptionSelect('B')}
          className={`
            text-left p-4 rounded-lg border-2 transition-all
            ${selected === 'B'
              ? 'border-[var(--mid-blue)] bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-[var(--charcoal)]">Option B</span>
            {selected === 'B' && (
              <span className="w-5 h-5 bg-[var(--mid-blue)] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--gray)] whitespace-pre-wrap">{optionB}</p>
        </button>
      </div>

      {/* Edit Option */}
      {selected && (
        <div className="mt-4">
          <button
            onClick={toggleEditor}
            className="flex items-center gap-2 text-sm text-[var(--mid-blue)] hover:text-[var(--deep-blue)] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>{showEditor ? 'Cancel editing' : 'Edit to match your style'}</span>
          </button>

          {showEditor && (
            <div className="mt-3">
              <textarea
                value={edits || ''}
                onChange={(e) => onEdit(e.target.value)}
                placeholder="Make any edits to better match how you'd write this..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)]"
              />
              <p className="mt-1 text-xs text-[var(--gray)]">
                Even small tweaks help us learn your style.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
