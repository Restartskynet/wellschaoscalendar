import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Info, X, Sparkles } from 'lucide-react';
import type { QuestionnairePack, Question } from '../../content/questionnaires';
import type { Account, EventTheme } from '../../types/wellsChaos';

type Props = {
  pack: QuestionnairePack;
  theme: EventTheme;
  currentUser: Account;
  existingAnswers?: Record<string, unknown>;
  onComplete: (answers: Record<string, unknown>) => void;
  onBack: () => void;
};

const QuestionnaireEngine = ({ pack, theme, currentUser, existingAnswers, onComplete, onBack }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>(existingAnswers || {});
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const question = pack.questions[currentIndex];
  const progress = ((currentIndex + 1) / pack.questions.length) * 100;
  const hasAnswer = answers[question.id] !== undefined;

  const setAnswer = (value: unknown) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const goNext = () => {
    if (currentIndex < pack.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowKnowledge(false);
    } else {
      setIsComplete(true);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowKnowledge(false);
    }
  };

  const handleFinish = () => {
    onComplete(answers);
  };

  // Completion screen with celebration
  if (isComplete) {
    const celebrationEmojis = ['🎉', '✨', '🏰', '🎢', '🌟', '🎆', '🧙', '🦋'];
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center p-4 overflow-hidden relative`}>
        {/* Floating celebration emojis */}
        {celebrationEmojis.map((emoji, i) => (
          <div
            key={i}
            className="absolute text-3xl animate-bounce pointer-events-none"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${15 + (i * 17) % 60}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${1.5 + (i % 3) * 0.5}s`,
              opacity: 0.6,
            }}
          >
            {emoji}
          </div>
        ))}
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in relative z-10">
          <div className="text-6xl mb-4">
            <Sparkles size={48} className="mx-auto text-yellow-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You're all set! 🎉</h2>
          <p className="text-gray-500 mb-2">
            Thanks, {currentUser.name}! Your answers will help make this trip amazing.
          </p>
          <p className="text-sm text-purple-600 font-medium mb-6">
            {pack.questions.length} questions answered — you're a planning superstar!
          </p>
          <button
            onClick={handleFinish}
            className={`w-full py-4 rounded-xl font-semibold text-lg text-white bg-gradient-to-r ${theme.primary} shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
          >
            Save & Return ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} pb-24`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl text-gray-500">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-500">
              {currentIndex + 1} / {pack.questions.length}
            </span>
            <div className="w-8" />
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${theme.primary} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Question — key triggers animation on question change */}
        <div key={question.id} className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{question.question}</h2>
            {question.knowledgeCard && (
              <button
                onClick={() => setShowKnowledge(!showKnowledge)}
                className="text-sm text-purple-600 font-medium flex items-center gap-1 hover:text-purple-700"
              >
                <Info size={14} />
                {showKnowledge ? 'Hide info' : 'Learn more'}
              </button>
            )}
          </div>

          {/* Knowledge Card */}
          {showKnowledge && question.knowledgeCard && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 animate-fade-in">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-purple-800 text-sm">{question.knowledgeCard.title}</h3>
                <button onClick={() => setShowKnowledge(false)} className="text-purple-400 hover:text-purple-600">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-purple-700 leading-relaxed">{question.knowledgeCard.content}</p>
            </div>
          )}

          {/* Answer area */}
          {renderQuestion(question, answers[question.id], setAnswer, theme)}
        </div>
      </div>

      {/* Navigation — z-50 so it's above everything; safe-area padding for iOS */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-50" data-testid="questionnaire-nav">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            disabled={!hasAnswer}
            data-testid="questionnaire-next"
            className={`flex-1 py-3 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              hasAnswer
                ? `bg-gradient-to-r ${theme.primary} text-white shadow-md hover:shadow-lg`
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {currentIndex === pack.questions.length - 1 ? (
              <>
                <Check size={20} />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function renderQuestion(
  q: Question,
  currentAnswer: unknown,
  setAnswer: (v: unknown) => void,
  theme: EventTheme
) {
  switch (q.type) {
    case 'single-choice':
      return (
        <div className="space-y-2">
          {q.options?.map((opt) => {
            const isSelected = currentAnswer === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setAnswer(opt.value)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
                  isSelected
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                    : 'bg-white border-2 border-gray-100 hover:border-purple-200 text-gray-700'
                }`}
              >
                {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                <span className="font-medium text-sm">{opt.label}</span>
                {isSelected && <Check size={18} className="ml-auto" />}
              </button>
            );
          })}
        </div>
      );

    case 'multi-choice': {
      const selected = (currentAnswer as string[]) || [];
      return (
        <div className="space-y-2">
          {q.options?.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => {
                  const newSelected = isSelected
                    ? selected.filter((v) => v !== opt.value)
                    : [...selected, opt.value];
                  setAnswer(newSelected.length > 0 ? newSelected : undefined);
                }}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
                  isSelected
                    ? 'bg-purple-50 border-2 border-purple-300 text-purple-700'
                    : 'bg-white border-2 border-gray-100 hover:border-purple-200 text-gray-700'
                }`}
              >
                {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                <span className="font-medium text-sm">{opt.label}</span>
                {isSelected && <Check size={18} className="ml-auto text-purple-600" />}
              </button>
            );
          })}
          <p className="text-xs text-gray-400 text-center mt-2">Select all that apply</p>
        </div>
      );
    }

    case 'slider': {
      const value = (currentAnswer as number) ?? q.min ?? 0;
      return (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-gray-800">
              {q.unit === '$' ? `$${value}` : `${value} ${q.unit || ''}`}
            </span>
            {value === q.max && <span className="text-gray-400">+</span>}
          </div>
          <input
            type="range"
            min={q.min}
            max={q.max}
            step={q.step}
            value={value}
            onChange={(e) => setAnswer(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{q.labels?.min}</span>
            <span>{q.labels?.max}</span>
          </div>
        </div>
      );
    }

    case 'budget-allocation': {
      const allocations = (currentAnswer as Record<string, number>) || {};
      const total = q.total || 100;
      const spent = Object.values(allocations).reduce((sum, v) => sum + v, 0);
      const remaining = total - spent;

      return (
        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <div className="text-center">
            <span className={`text-sm font-medium ${remaining === 0 ? 'text-green-600' : remaining < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {remaining === 0 ? 'Perfect!' : remaining > 0 ? `${remaining} points remaining` : `${Math.abs(remaining)} points over!`}
            </span>
          </div>
          {q.categories?.map((cat) => {
            const catValue = allocations[cat.id] || 0;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {cat.emoji} {cat.label}
                  </span>
                  <span className="text-sm font-bold text-gray-800">{catValue}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={total}
                  step={5}
                  value={catValue}
                  onChange={(e) => {
                    const newAllocations = { ...allocations, [cat.id]: parseInt(e.target.value) };
                    setAnswer(newAllocations);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            );
          })}
          {remaining === 0 && (
            <div className="text-center text-green-600 text-xs font-medium">All points allocated!</div>
          )}
        </div>
      );
    }

    default:
      return <div className="text-gray-400 text-sm">Unsupported question type</div>;
  }
}

export default QuestionnaireEngine;
