import React from 'react';
import { Hero } from '../../components/landing/Hero';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onGoToAdmin: () => void;
  onSelectActivity: (id: string) => void;
  onSelectNews: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onGoToAdmin }) => (
  <Hero onNavigate={onNavigate} onGoToAdmin={onGoToAdmin} />
);
