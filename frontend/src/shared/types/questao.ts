export type Conteudo = {
  id: string;
  nome: string;
};

export type Topico = {
  id: string;
  nome: string;
  content_id: string;
};

export type TipoQuestao = 'multipla-escolha' | 'certo-errado' | 'dissertativa';
