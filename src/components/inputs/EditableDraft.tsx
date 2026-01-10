'use client';

import { RefreshCw, Loader2 } from 'lucide-react';

interface EditableDraftProps {
  title: string;
  scenarioDescription: string;
  aiDraft: string;
  userEdits: string;
  onUserEditsChange: (edits: string) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function EditableDraft({
  title,
  scenarioDescription,
  aiDraft,
  userEdits,
  onUserEditsChange,
  onRegenerate,
  isRegenerating = false,
}: EditableDraftProps) {
  return (
    <div className="space-y-4 pb-6 border-b border-gray-200 last:border-0">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-[var(--charcoal)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--gray)]">{scenarioDescription}</p>
      </div>

      {/* Side by side comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* AI Draft (left) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[var(--charcoal)]">
              AI-Generated Draft
            </label>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-1 text-xs text-[var(--mid-blue)] hover:text-[var(--deep-blue)] transition-colors disabled:opacity-50"
              >
                {isRegenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span>Regenerate</span>
              </button>
            )}
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[200px]">
            {isRegenerating ? (
              <div className="flex items-center justify-center h-full text-[var(--gray)]">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Generating...</span>
              </div>
            ) : (
              <p className="text-sm text-[var(--charcoal)] whitespace-pre-wrap">
                {aiDraft}
              </p>
            )}
          </div>
        </div>

        {/* User Edits (right) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--charcoal)]">
            Your Edited Version
          </label>
          <textarea
            value={userEdits}
            onChange={(e) => onUserEditsChange(e.target.value)}
            placeholder="Edit the AI draft to match your voice and style..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)] min-h-[200px]"
          />
          <p className="text-xs text-[var(--gray)]">
            Adjust phrasing, add your personal touches, or rewrite entirely.
          </p>
        </div>
      </div>
    </div>
  );
}
