import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import './Hero.css';

export const Hero: React.FC = () => {
	return (
		<section className="hero-section">
			{/* Símbolos matemáticos em segundo plano */}
			<span className="hero-symbol symbol-1" aria-hidden="true">∫</span>
			<span className="hero-symbol symbol-2" aria-hidden="true">∑</span>
			<span className="hero-symbol symbol-3" aria-hidden="true">√</span>

			<div className="hero-container">
				<div className="hero-badge">
					<Sparkles size={16} /> Plataforma 100% Gratuita
				</div>

				<h1 className="hero-title">
					Construa sua base em matemática{' '}
					<span className="hero-title-highlight">aprendendo na prática</span>
				</h1>

				<p className="hero-subtitle">
					Uma plataforma de ensino gamificado que ajuda alunos do ensino médio a dominarem a matemática resolvendo exercícios.
				</p>

				<div className="hero-actions">
					<Link to="/cadastro" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
						começe gratuitamente <ArrowRight size={18} />
					</Link>
				</div>
			</div>
		</section>
	);
};
