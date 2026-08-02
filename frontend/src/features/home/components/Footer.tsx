import { Link } from 'react-router-dom';
import type { MouseEvent } from 'react';
import './Footer.css';

export function Footer() {
  const handleTermosClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Termos de Uso em breve.');
  };

  const handlePrivacidadeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Política de Privacidade em breve.');
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Coluna 1: Quem somos */}
          <div>
            <h4 className="footer-col-title">Quem somos</h4>
            <p className="footer-col-text">
              O Base Matemática é um projeto social de educação matemática, criado para tornar o aprendizado mais acessível para jovens do ensino médio. Acreditamos que matemática não precisa causar medo — e estamos construindo essa base junto com você.
            </p>
          </div>

          {/* Coluna 2: A equipe */}
          <div>
            <h4 className="footer-col-title">Nossa equipe</h4>
            <p className="footer-col-text">
              Somos uma equipe de 9 pessoas — desenvolvedores e produtores de conteúdo — trabalhando de forma voluntária para levar educação matemática de qualidade a mais estudantes.
            </p>
          </div>

          {/* Coluna 3: Navegação */}
          <div>
            <h4 className="footer-col-title">Navegue</h4>
            <ul className="footer-nav-list">
              <li><a href="#objetivo">Objetivo do projeto</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#publico-alvo">Público-alvo</a></li>
              <li><Link to="/questoes">Experimente alguns exercícios</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Legal */}
          <div>
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-nav-list">
              <li><a href="#termos" onClick={handleTermosClick}>Termos de Uso</a></li>
              <li><a href="#privacidade" onClick={handlePrivacidadeClick}>Política de Privacidade</a></li>
            </ul>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="footer-bottom">
          <p>© 2026 Base Matemática. Projeto social de educação matemática.</p>
        </div>
      </div>
    </footer>
  );
}
