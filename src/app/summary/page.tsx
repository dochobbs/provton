'use client';

import { Download, MessageSquare, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout';
import { useProfile } from '@/context/ProfileContext';

export default function SummaryPage() {
  const { state, isLoaded } = useProfile();

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-[var(--gray)]">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const messagingCompleted = !!state.messagingProfile.completedAt;
  const documentationCompleted = !!state.documentationProfile.completedAt;
  const messagingProfile = state.messagingProfile.generatedProfile;
  const documentationProfile = state.documentationProfile.generatedProfile;

  const downloadProfile = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      messaging: messagingCompleted
        ? {
            completedAt: state.messagingProfile.completedAt,
            generatedProfile: state.messagingProfile.generatedProfile,
            userCorrections: state.messagingProfile.userCorrections,
            rawResponses: {
              coldResponses: state.messagingProfile.coldResponses,
              pairSelections: state.messagingProfile.pairSelections,
              antiExamples: state.messagingProfile.antiExamples,
              editCapture: state.messagingProfile.editCapture,
              values: state.messagingProfile.values,
            },
          }
        : null,
      documentation: documentationCompleted
        ? {
            completedAt: state.documentationProfile.completedAt,
            generatedProfile: state.documentationProfile.generatedProfile,
            userCorrections: state.documentationProfile.userCorrections,
            rawResponses: {
              structure: state.documentationProfile.structure,
              coldResponses: state.documentationProfile.coldResponses,
              pairSelections: state.documentationProfile.pairSelections,
              antiExamples: state.documentationProfile.antiExamples,
              editCapture: state.documentationProfile.editCapture,
              values: state.documentationProfile.values,
              specialty: state.documentationProfile.specialty,
            },
          }
        : null,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provider-style-profile-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!messagingCompleted && !documentationCompleted) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-3xl font-light text-[var(--mid-blue)] mb-4">
            No Profiles Completed Yet
          </h1>
          <p className="text-[var(--gray)] mb-8">
            Complete at least one track to view your style profile summary.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--orange)] text-white rounded-lg font-medium hover:bg-[var(--bright-orange)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Home
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-[var(--mid-blue)] mb-2">
          Your Style Profile Summary
        </h1>
        <p className="text-[var(--gray)]">
          Review your captured communication style across all completed tracks.
        </p>
      </div>

      {/* Download Button */}
      <div className="text-center mb-8">
        <button
          onClick={downloadProfile}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--lime-green)] text-white rounded-lg font-medium hover:bg-[var(--apple-green)] transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Full Profile (JSON)
        </button>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Messaging Profile */}
        {messagingCompleted && messagingProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-l-4 border-[var(--sky-blue)] bg-gray-50 px-6 py-4 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-[var(--mid-blue)]" />
              <div>
                <h2 className="text-xl font-medium text-[var(--charcoal)]">
                  Portal Messages Style
                </h2>
                <p className="text-sm text-[var(--gray)]">
                  Completed {new Date(state.messagingProfile.completedAt!).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Voice Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-[var(--deep-blue)] mb-2">
                  Voice Summary
                </h3>
                <p className="text-[var(--charcoal)]">{messagingProfile.voiceSummary}</p>
              </div>

              {/* Tone Dimensions */}
              <div>
                <h3 className="font-medium text-[var(--charcoal)] mb-3">
                  Tone Dimensions
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {Object.entries(messagingProfile.toneDimensions).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--charcoal)] capitalize">
                          {key}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[var(--mid-blue)] text-white rounded">
                          {value.score}/10
                        </span>
                      </div>
                      <p className="text-xs text-[var(--gray)]">{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Moves */}
              <div>
                <h3 className="font-medium text-[var(--charcoal)] mb-3">
                  Signature Patterns
                </h3>
                <ul className="space-y-1">
                  {messagingProfile.signatureMoves.map((move, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[var(--lime-green)] flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--charcoal)]">{move}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* User Corrections */}
              {state.messagingProfile.userCorrections && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Your Corrections</h3>
                  <p className="text-sm text-yellow-700">
                    {state.messagingProfile.userCorrections}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documentation Profile */}
        {documentationCompleted && documentationProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-l-4 border-[var(--deep-blue)] bg-gray-50 px-6 py-4 flex items-center gap-3">
              <FileText className="w-6 h-6 text-[var(--mid-blue)]" />
              <div>
                <h2 className="text-xl font-medium text-[var(--charcoal)]">
                  Clinical Documentation Style
                </h2>
                <p className="text-sm text-[var(--gray)]">
                  Completed{' '}
                  {new Date(state.documentationProfile.completedAt!).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Voice Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-[var(--deep-blue)] mb-2">
                  Documentation Voice Summary
                </h3>
                <p className="text-[var(--charcoal)]">{documentationProfile.voiceSummary}</p>
              </div>

              {/* Voice Dimensions */}
              <div>
                <h3 className="font-medium text-[var(--charcoal)] mb-3">
                  Documentation Tendencies
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {Object.entries(documentationProfile.voiceDimensions).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[var(--charcoal)] capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-[var(--mid-blue)] text-white rounded">
                            {value.score}/10
                          </span>
                        </div>
                        <p className="text-xs text-[var(--gray)]">{value.description}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Signature Moves */}
              <div>
                <h3 className="font-medium text-[var(--charcoal)] mb-3">
                  Signature Patterns
                </h3>
                <ul className="space-y-1">
                  {documentationProfile.signatureMoves.map((move, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[var(--lime-green)] flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--charcoal)]">{move}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example Fragments */}
              <div>
                <h3 className="font-medium text-[var(--charcoal)] mb-3">
                  Phrases That Sound Like You
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {documentationProfile.exampleFragments
                    .slice(0, 5)
                    .map((fragment, index) => (
                      <p
                        key={index}
                        className="text-sm text-[var(--charcoal)] font-mono border-l-2 border-[var(--mid-blue)] pl-2 mb-2 last:mb-0"
                      >
                        {fragment}
                      </p>
                    ))}
                </div>
              </div>

              {/* User Corrections */}
              {state.documentationProfile.userCorrections && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Your Corrections</h3>
                  <p className="text-sm text-yellow-700">
                    {state.documentationProfile.userCorrections}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--mid-blue)] hover:text-[var(--deep-blue)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </AppLayout>
  );
}
