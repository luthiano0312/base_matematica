import type { TipoQuestao } from '../types/questao';

export const TIPOS_QUESTAO: { id: TipoQuestao; label: string }[] = [
  { id: 'multipla-escolha', label: 'Múltipla escolha' },
  { id: 'certo-errado', label: 'Certo ou errado' },
  { id: 'dissertativa', label: 'Dissertativa' },
];

export const DIFICULDADES = ['Qualquer', 'Fácil', 'Médio', 'Difícil', 'Progressão'] as const;
