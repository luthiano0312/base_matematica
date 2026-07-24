import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoDark from "../../assets/logos/logo_dark.svg";
import { Menu, X, Triangle, Compass, HelpCircle, CheckCircle2, Target, BookOpen, LogIn } from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo Institucional com Pirâmide Estilizada */}
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <img src={logoDark} alt="Base Matemática" />
        </Link>

        {/* Navegação Desktop */}
        <nav className="nav-desktop">
          <a href="#objetivo">Objetivo</a>
          <a href="#problema">O Problema</a>
          <a href="#solucao">A Solução</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#publico-alvo">Público-alvo</a>
        </nav>

        {/* Ações no Header */}
        <div className="header-actions">
          <Link to="/login" className="btn-outline">
            entrar
          </Link>

          <button
            type="button"
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Drawer do Menu Mobile */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="logo-link">
                <div className="logo-icon">
                  <Triangle className="w-4 h-4 fill-white stroke-none" />
                </div>
                <span>base <span className="logo-highlight">matemática</span></span>
              </div>
              <button
                type="button"
                className="menu-toggle"
                onClick={closeMenu}
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-nav-links">
              <a href="#objetivo" onClick={closeMenu}>
                <Compass size={18} /> Objetivo
              </a>
              <a href="#problema" onClick={closeMenu}>
                <HelpCircle size={18} /> O Problema
              </a>
              <a href="#solucao" onClick={closeMenu}>
                <CheckCircle2 size={18} /> A Solução
              </a>
              <a href="#como-funciona" onClick={closeMenu}>
                <BookOpen size={18} /> Como funciona
              </a>
              <a href="#publico-alvo" onClick={closeMenu}>
                <Target size={18} /> Público-alvo
              </a>
              <Link to="/questoes" onClick={closeMenu} className="highlight-link">
                <BookOpen size={18} /> Experimente Exercícios
              </Link>
            </nav>

            <div className="mobile-menu-footer">
              <Link to="/login" onClick={closeMenu} className="btn-outline" style={{ width: '100%' }}>
                <LogIn size={16} style={{ marginRight: 6 }} /> Entrar
              </Link>
              <Link to="/cadastro" onClick={closeMenu} className="btn-primary" style={{ width: '100%' }}>
                Começar gratuitamente
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
