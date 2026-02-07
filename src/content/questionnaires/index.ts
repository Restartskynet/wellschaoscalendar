import parkAdventures from './v2/park-adventures.json';
import diningDreams from './v2/dining-dreams.json';
import comfortPlanning from './v2/comfort-planning.json';
import budgetStyle from './v2/budget-style.json';
import magicalMoments from './v2/magical-moments.json';

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
  parkAdventures as QuestionnairePack,
  diningDreams as QuestionnairePack,
  comfortPlanning as QuestionnairePack,
  budgetStyle as QuestionnairePack,
  magicalMoments as QuestionnairePack,
];

export const getQuestionnaire = (slug: string): QuestionnairePack | undefined => {
  return QUESTIONNAIRE_PACKS.find((q) => q.slug === slug);
};
