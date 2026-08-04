import type { DificuldadeFiltro, TipoQuestao } from '../types/questao';

export const TIPOS_QUESTAO: { id: TipoQuestao; label: string }[] = [
  { id: 'multipla-escolha', label: 'Múltipla escolha' },
  { id: 'certo-errado', label: 'Certo ou errado' },
  { id: 'dissertativa', label: 'Dissertativa' },
];

export const DIFICULDADES = ['Qualquer', 'Fácil', 'Médio', 'Difícil', 'Progressão'] as const;

export const DIFICULDADE_API: Record<Exclude<DificuldadeFiltro, 'Progressão'>, string | undefined> = {
  Qualquer: undefined,
  Fácil: 'easy',
  Médio: 'medium',
  Difícil: 'hard',
};

export const TIPO_API: Record<TipoQuestao, 'multiple_choice' | 'true_false' | 'essay'> = {
  'multipla-escolha': 'multiple_choice',
  'certo-errado': 'true_false',
  dissertativa: 'essay',
};
