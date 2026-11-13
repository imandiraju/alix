import React from 'react';
import { HelpCircle, Clock, Zap } from 'lucide-react';

export interface QuestionCardProps {
  questionIndex: number;
  totalQuestions: number;
  questionText: string;
  category?: string;
  points?: number;
  timeLimit?: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionIndex,
  totalQuestions,
  questionText,
  category = 'Active Assessment',
  points = 1000,
  timeLimit = 30,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-alix-slate-200 shadow-alix-md p-6 sm:p-8 relative overflow-hidden transition-all">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 border-b border-alix-slate-100">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-alix-violet-100 text-alix-violet-800 text-xs font-bold uppercase tracking-wider">
            Question {questionIndex} of {totalQuestions}
          </span>
          <span className="text-xs font-medium text-alix-slate-500">
            {category}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-alix-slate-500">
          <div className="flex items-center gap-1 text-alix-cyan-600">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLimit}s</span>
          </div>
          <div className="flex items-center gap-1 text-alix-coral-500">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Up to {points} pts</span>
          </div>
        </div>
      </div>

      {/* Main Question Text */}
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-alix-indigo leading-tight">
        {questionText}
      </h2>
    </div>
  );
};

export default QuestionCard;
