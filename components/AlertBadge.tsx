import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Infinity } from 'lucide-react';
import { AlertLevel } from '../types';

interface AlertBadgeProps {
  date?: string;
  noExpiry?: boolean;
  type?: 'text' | 'badge';
}

export const getAlertLevel = (dateString?: string, noExpiry?: boolean): AlertLevel => {
  if (noExpiry || !dateString) return 'info';
  
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'critical';
  if (diffDays <= 30) return 'warning';
  return 'normal';
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({ date, noExpiry, type = 'badge' }) => {
  const level = getAlertLevel(date, noExpiry);

  const config = {
    normal: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 size={14} />,
      text: 'Válido'
    },
    warning: {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Clock size={14} />,
      text: 'Expira em breve'
    },
    critical: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <AlertCircle size={14} />,
      text: 'Vencido'
    },
    info: {
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <Infinity size={14} />,
      text: 'Sem Vencimento'
    }
  };

  const style = config[level];

  if (type === 'text') {
    return (
      <span className={`flex items-center gap-1.5 font-medium ${style.color.split(' ')[1]}`}>
        {style.icon}
        {noExpiry || !date ? 'Sem Vencimento' : new Date(date).toLocaleDateString('pt-BR')}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.color}`}>
      {style.icon}
      {style.text}
    </span>
  );
};
