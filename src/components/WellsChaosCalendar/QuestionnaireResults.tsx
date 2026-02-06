import { ChevronLeft, User } from 'lucide-react';
import { useState } from 'react';
import type { QuestionnairePack, Question } from '../../content/questionnaires';
import type { Account, EventTheme } from '../../types/wellsChaos';

type Props = {
  pack: QuestionnairePack;
  theme: EventTheme;
  accounts: Account[];
  responses: Record<string, Record<string, unknown>>; // username -> answers
  onBack: () => void;
};

type ViewMode = 'aggregate' | 'per-person';

const QuestionnaireResults = ({ pack, theme, accounts, responses, onBack }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>('aggregate');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const respondents = Object.keys(responses);
  const responseCount = respondents.length;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} pb-24`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl text-gray-500">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="font-bold text-gray-800">{pack.emoji} {pack.title}</h1>
              <p className="text-xs text-gray-500">{responseCount} responses</p>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setViewMode('aggregate'); setSelectedUser(null); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'aggregate'
                  ? `bg-gradient-to-r ${theme.primary} text-white`
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Aggregate
            </button>
            <button
              onClick={() => setViewMode('per-person')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'per-person'
                  ? `bg-gradient-to-r ${theme.primary} text-white`
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Per Person
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {viewMode === 'aggregate' && (
          <>
            {pack.questions.map((q) => (
              <AggregateQuestion key={q.id} question={q} responses={responses} theme={theme} />
            ))}
          </>
        )}

        {viewMode === 'per-person' && !selectedUser && (
          <div className="space-y-2">
            {respondents.map((username) => {
              const account = accounts.find((a) => a.username === username);
              return (
                <button
                  key={username}
                  onClick={() => setSelectedUser(username)}
                  className="w-full bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg border-2 border-purple-200">
                    {account?.customAvatar ? (
                      <img src={account.customAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      account?.defaultAvatar || <User size={20} />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">{account?.name || username}</div>
                    <div className="text-xs text-gray-400">Tap to view answers</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {viewMode === 'per-person' && selectedUser && (
          <>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-sm text-purple-600 font-medium flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Back to people
            </button>
            <h2 className="font-bold text-gray-800">
              {accounts.find((a) => a.username === selectedUser)?.name || selectedUser}'s Answers
            </h2>
            {pack.questions.map((q) => {
              const answer = responses[selectedUser]?.[q.id];
              return (
                <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 mb-1">{q.question}</div>
                  <div className="font-semibold text-gray-800">{formatAnswer(q, answer)}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

function AggregateQuestion({
  question,
  responses,
  theme,
}: {
  question: Question;
  responses: Record<string, Record<string, unknown>>;
  theme: EventTheme;
}) {
  const allAnswers = Object.values(responses)
    .map((r) => r[question.id])
    .filter((a) => a !== undefined);

  if (allAnswers.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm opacity-50">
        <div className="text-sm font-medium text-gray-500">{question.question}</div>
        <div className="text-xs text-gray-400 mt-1">No responses yet</div>
      </div>
    );
  }

  if (question.type === 'single-choice') {
    const counts: Record<string, number> = {};
    allAnswers.forEach((a) => {
      const val = a as string;
      counts[val] = (counts[val] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(counts));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-500 mb-3">{question.question}</div>
        <div className="space-y-2">
          {sorted.map(([value, count]) => {
            const opt = question.options?.find((o) => o.value === value);
            const pct = Math.round((count / allAnswers.length) * 100);
            const isTop = count === maxCount;
            return (
              <div key={value}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className={`${isTop ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                    {opt?.emoji} {opt?.label || value}
                  </span>
                  <span className={`text-xs ${isTop ? 'font-bold' : ''}`}>
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop ? `bg-gradient-to-r ${theme.primary}` : 'bg-gray-300'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* Consensus indicator */}
        {sorted.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Consensus: {sorted[0][1] === allAnswers.length ? 'Unanimous!' : sorted[0][1] > allAnswers.length / 2 ? 'Strong' : 'Mixed'}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (question.type === 'multi-choice') {
    const counts: Record<string, number> = {};
    allAnswers.forEach((a) => {
      const vals = a as string[];
      vals.forEach((v) => {
        counts[v] = (counts[v] || 0) + 1;
      });
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-500 mb-3">{question.question}</div>
        <div className="space-y-2">
          {sorted.map(([value, count]) => {
            const opt = question.options?.find((o) => o.value === value);
            const pct = Math.round((count / allAnswers.length) * 100);
            return (
              <div key={value}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{opt?.emoji} {opt?.label || value}</span>
                  <span className="text-xs">{count}/{allAnswers.length}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${theme.primary} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === 'slider') {
    const values = allAnswers.map((a) => a as number);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-500 mb-3">{question.question}</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-400">Low</div>
            <div className="font-bold text-gray-800">
              {question.unit === '$' ? `$${min}` : `${min}`}
            </div>
          </div>
          <div className={`bg-gradient-to-r ${theme.primary} text-white rounded-lg py-2`}>
            <div className="text-xs opacity-80">Average</div>
            <div className="font-bold text-lg">
              {question.unit === '$' ? `$${Math.round(avg)}` : `${Math.round(avg)}`}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">High</div>
            <div className="font-bold text-gray-800">
              {question.unit === '$' ? `$${max}` : `${max}`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (question.type === 'budget-allocation') {
    const avgAllocations: Record<string, number> = {};
    question.categories?.forEach((cat) => {
      const catValues = allAnswers.map((a) => (a as Record<string, number>)?.[cat.id] || 0);
      avgAllocations[cat.id] = Math.round(catValues.reduce((s, v) => s + v, 0) / catValues.length);
    });

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-500 mb-3">{question.question}</div>
        <div className="space-y-3">
          {question.categories?.map((cat) => {
            const val = avgAllocations[cat.id] || 0;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{cat.emoji} {cat.label}</span>
                  <span className="font-semibold">{val} pts avg</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${theme.primary} rounded-full transition-all duration-500`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

function formatAnswer(q: Question, answer: unknown): string {
  if (answer === undefined) return 'Not answered';

  if (q.type === 'single-choice') {
    const opt = q.options?.find((o) => o.value === answer);
    return opt ? `${opt.emoji || ''} ${opt.label}` : String(answer);
  }

  if (q.type === 'multi-choice') {
    const vals = answer as string[];
    return vals
      .map((v) => {
        const opt = q.options?.find((o) => o.value === v);
        return opt ? `${opt.emoji || ''} ${opt.label}` : v;
      })
      .join(', ');
  }

  if (q.type === 'slider') {
    return q.unit === '$' ? `$${answer}` : `${answer} ${q.unit || ''}`;
  }

  if (q.type === 'budget-allocation') {
    const alloc = answer as Record<string, number>;
    return q.categories
      ?.map((c) => `${c.label}: ${alloc[c.id] || 0}`)
      .join(', ') || '';
  }

  return String(answer);
}

export default QuestionnaireResults;
