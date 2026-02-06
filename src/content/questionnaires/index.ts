import parkPriorities from './park-priorities.json';
import foodPreferences from './food-preferences.json';
import travelComfort from './travel-comfort.json';

export type KnowledgeCard = {
  title: string;
  content: string;
};

export type QuestionOption = {
  value: string;
  label: string;
  emoji?: string;
};

export type BudgetCategory = {
  id: string;
  label: string;
  emoji?: string;
};

export type Question = {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'slider' | 'budget-allocation' | 'ranking';
  question: string;
  knowledgeCard?: KnowledgeCard;
  options?: QuestionOption[];
  // Slider props
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  labels?: { min: string; max: string };
  // Budget allocation props
  categories?: BudgetCategory[];
  total?: number;
};

export type QuestionnairePack = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  questions: Question[];
};

export const QUESTIONNAIRE_PACKS: QuestionnairePack[] = [
  parkPriorities as QuestionnairePack,
  foodPreferences as QuestionnairePack,
  travelComfort as QuestionnairePack,
];

export const getQuestionnaire = (slug: string): QuestionnairePack | undefined => {
  return QUESTIONNAIRE_PACKS.find((q) => q.slug === slug);
};
