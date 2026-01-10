'use client';

import { MessageSquare, FileText, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout';
import { useProfile } from '@/context/ProfileContext';

interface TrackCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: number;
  estimatedTime: string;
  href: string;
  isCompleted: boolean;
  currentStep: number;
}

function TrackCard({
  title,
  description,
  icon,
  steps,
  estimatedTime,
  href,
  isCompleted,
  currentStep,
}: TrackCardProps) {
  const hasStarted = currentStep > 1;

  return (
    <Link
      href={href}
      className="block p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-[var(--mid-blue)] transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[var(--mid-blue)] group-hover:bg-[var(--mid-blue)] group-hover:text-white transition-colors">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-medium text-[var(--charcoal)]">{title}</h3>
            {isCompleted && (
              <CheckCircle2 className="w-5 h-5 text-[var(--lime-green)]" />
            )}
          </div>
          <p className="text-[var(--gray)] mb-4">{description}</p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--gray)]">{steps} steps</span>
            <span className="flex items-center gap-1 text-[var(--gray)]">
              <Clock className="w-4 h-4" />
              {estimatedTime}
            </span>
          </div>

          {/* Progress or CTA */}
          <div className="mt-4 flex items-center justify-between">
            {hasStarted && !isCompleted ? (
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[var(--mid-blue)]">In progress</span>
                  <span className="text-[var(--gray)]">Step {currentStep} of {steps}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--orange)] rounded-full transition-all"
                    style={{ width: `${((currentStep - 1) / (steps - 1)) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <span className="flex items-center gap-2 text-[var(--mid-blue)] font-medium group-hover:text-[var(--deep-blue)]">
                {isCompleted ? 'Review' : 'Start'} <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
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

  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-[var(--mid-blue)] mb-4">
          Capture Your Communication Style
        </h1>
        <p className="text-lg text-[var(--gray)] max-w-2xl mx-auto">
          Help us understand how you communicate with patients and document care.
          Your responses will be used to train AI to match your unique voice.
        </p>
      </div>

      {/* Track Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <TrackCard
          title="Portal Messages"
          description="Capture your style for patient portal communication, including appointment follow-ups, test results, and general inquiries."
          icon={<MessageSquare className="w-6 h-6" />}
          steps={6}
          estimatedTime="15-20 min"
          href="/messaging/step-1"
          isCompleted={messagingCompleted}
          currentStep={state.messagingStep}
        />

        <TrackCard
          title="Clinical Documentation"
          description="Capture your style for clinical notes, including HPI, assessment, plan, and visit documentation."
          icon={<FileText className="w-6 h-6" />}
          steps={7}
          estimatedTime="20-25 min"
          href="/documentation/step-1"
          isCompleted={documentationCompleted}
          currentStep={state.documentationStep}
        />
      </div>

      {/* Instructions */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h2 className="text-lg font-medium text-[var(--deep-blue)] mb-3">
            How This Works
          </h2>
          <ul className="space-y-2 text-[var(--charcoal)]">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-[var(--mid-blue)] text-white rounded-full flex items-center justify-center text-sm">1</span>
              <span>Answer questions and write sample responses exactly as you would in practice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-[var(--mid-blue)] text-white rounded-full flex items-center justify-center text-sm">2</span>
              <span>Review and edit AI-generated drafts to match your voice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-[var(--mid-blue)] text-white rounded-full flex items-center justify-center text-sm">3</span>
              <span>Calibrate your preferences on style dimensions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-[var(--mid-blue)] text-white rounded-full flex items-center justify-center text-sm">4</span>
              <span>Review your generated style profile and make corrections</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Completion Status */}
      {(messagingCompleted || documentationCompleted) && (
        <div className="mt-8 text-center">
          <Link
            href="/summary"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--lime-green)] text-white rounded-lg font-medium hover:bg-[var(--apple-green)] transition-colors"
          >
            <CheckCircle2 className="w-5 h-5" />
            View Your Profile Summary
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
