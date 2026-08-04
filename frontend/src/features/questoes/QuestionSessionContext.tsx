import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Question } from '@/services/types';

export type SessionStats = {
  respondidas: number;
  acertos: number;
  erros: number;
  pontos: number;
};

type QuestionSessionValue = {
  questions: Question[];
  isVisitor: boolean;
  stats: SessionStats;
  hasSession: boolean;
  startSession: (questions: Question[], isVisitor: boolean) => void;
  registerAnswer: (isCorrect: boolean, pointsEarned: number) => void;
  clearSession: () => void;
};

const EMPTY_STATS: SessionStats = { respondidas: 0, acertos: 0, erros: 0, pontos: 0 };

const QuestionSessionContext = createContext<QuestionSessionValue | null>(null);

export function QuestionSessionProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isVisitor, setIsVisitor] = useState(false);
  const [stats, setStats] = useState<SessionStats>(EMPTY_STATS);

  const startSession = (questions: Question[], visitor: boolean) => {
    setQuestions(questions);
    setIsVisitor(visitor);
    setStats(EMPTY_STATS);
  };

  const registerAnswer = (isCorrect: boolean, pointsEarned: number) => {
    setStats((prev) => ({
      respondidas: prev.respondidas + 1,
      acertos: prev.acertos + (isCorrect ? 1 : 0),
      erros: prev.erros + (isCorrect ? 0 : 1),
      pontos: prev.pontos + pointsEarned,
    }));
  };

  const clearSession = () => {
    setQuestions([]);
    setIsVisitor(false);
    setStats(EMPTY_STATS);
  };

  return (
    <QuestionSessionContext.Provider
      value={{
        questions,
        isVisitor,
        stats,
        hasSession: questions.length > 0,
        startSession,
        registerAnswer,
        clearSession,
      }}
    >
      {children}
    </QuestionSessionContext.Provider>
  );
}

export function useQuestionSession(): QuestionSessionValue {
  const context = useContext(QuestionSessionContext);
  if (!context) {
    throw new Error('useQuestionSession deve ser usado dentro de <QuestionSessionProvider>.');
  }
  return context;
}
