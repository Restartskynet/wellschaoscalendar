import { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle2, Circle, BarChart3 } from 'lucide-react';
import { QUESTIONNAIRE_PACKS } from '../../content/questionnaires';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { saveQuestionnaireResponse } from '../../lib/supabaseData';
import { useAuth } from '../../providers/AuthProvider';
import type { Account, EventTheme } from '../../types/wellsChaos';
import QuestionnaireEngine from './QuestionnaireEngine';
import QuestionnaireResults from './QuestionnaireResults';

type QuestionnairesPageProps = {
  currentUser: Account;
  accounts: Account[];
  theme: EventTheme;
  onFocusModeChange?: (active: boolean) => void;
};

// In-memory response store (also Supabase-backed when connected)
type ResponseStore = Record<string, Record<string, unknown>>;
const globalResponses: Record<string, ResponseStore> = {};

const QuestionnairesPage = ({ currentUser, accounts, theme, onFocusModeChange }: QuestionnairesPageProps) => {
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<string | null>(null);
  const [viewingResults, setViewingResults] = useState<string | null>(null);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  const isAdmin = currentUser.role === 'admin';
  const supabaseMode = isSupabaseConfigured();
  const auth = useAuth();

  // Notify parent when focus mode should change
  useEffect(() => {
    onFocusModeChange?.(activeQuestionnaire !== null);
    return () => { onFocusModeChange?.(false); };
  }, [activeQuestionnaire, onFocusModeChange]);

  const handleComplete = (slug: string, answers: Record<string, unknown>) => {
    // Store answers per user per questionnaire (local)
    if (!globalResponses[slug]) globalResponses[slug] = {};
    globalResponses[slug][currentUser.username] = answers;
    setCompletedSlugs((prev) => new Set([...prev, slug]));
    setActiveQuestionnaire(null);

    // Persist to Supabase if configured
    if (supabaseMode && auth.user) {
      saveQuestionnaireResponse(slug, auth.user.id, answers, true).catch(() => {});
    }
  };

  if (activeQuestionnaire) {
    const pack = QUESTIONNAIRE_PACKS.find((q) => q.slug === activeQuestionnaire);
    if (!pack) return null;

    return (
      <QuestionnaireEngine
        pack={pack}
        theme={theme}
        currentUser={currentUser}
        existingAnswers={globalResponses[activeQuestionnaire]?.[currentUser.username] as Record<string, unknown> | undefined}
        onComplete={(answers) => handleComplete(activeQuestionnaire, answers)}
        onBack={() => setActiveQuestionnaire(null)}
      />
    );
  }

  if (viewingResults && isAdmin) {
    const pack = QUESTIONNAIRE_PACKS.find((q) => q.slug === viewingResults);
    if (!pack) return null;

    return (
      <QuestionnaireResults
        pack={pack}
        theme={theme}
        accounts={accounts}
        responses={globalResponses[viewingResults] || {}}
        onBack={() => setViewingResults(null)}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} pb-24`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
            Questionnaires
          </h1>
          <p className="text-xs text-gray-400">Help us plan the perfect trip!</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {/* Progress overview */}
        <div className={`bg-gradient-to-r ${theme.primary} rounded-2xl p-5 text-white`}>
          <div className="text-sm opacity-90 mb-1">Your Progress</div>
          <div className="text-2xl font-bold">
            {completedSlugs.size} / {QUESTIONNAIRE_PACKS.length} completed
          </div>
          <div className="mt-3 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(completedSlugs.size / QUESTIONNAIRE_PACKS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questionnaire list */}
        {QUESTIONNAIRE_PACKS.map((pack) => {
          const isCompleted = completedSlugs.has(pack.slug);
          const hasResponses = Object.keys(globalResponses[pack.slug] || {}).length > 0;

          return (
            <div key={pack.slug} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <button
                onClick={() => setActiveQuestionnaire(pack.slug)}
                className="w-full p-4 text-left flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-3xl flex-shrink-0">{pack.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{pack.title}</span>
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{pack.description}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {pack.questions.length} questions
                    {isCompleted && ' — Tap to update your answers'}
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
              </button>

              {/* Admin results button */}
              {isAdmin && hasResponses && (
                <button
                  onClick={() => setViewingResults(pack.slug)}
                  className="w-full px-4 py-3 border-t border-gray-100 flex items-center gap-2 text-sm text-purple-600 font-medium hover:bg-purple-50 transition-colors"
                >
                  <BarChart3 size={16} />
                  View Results ({Object.keys(globalResponses[pack.slug] || {}).length} responses)
                </button>
              )}
            </div>
          );
        })}

        {/* Info card */}
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <div className="text-sm text-purple-700">
            <span className="font-semibold">Why questionnaires?</span> Your answers help Ben & Marie plan park days, dining, and schedules that work for everyone.
            Results are only visible to trip admins.
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairesPage;
