import React from 'react';
// import GlassCard from './GlassCard';
import Container from "./Container";

interface MetricCardProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: undefined | number | string;
  unit?: string;
  color?: string;
}

export default function MetriCard({
  icon: Icon,
  label,
  value,
  unit = '',
  color = 'text-blue-400',
}: MetricCardProps) {
  return (
    <Container className="text-center flex justify-center group">
      <div className="flex flex-col items-center space-y-3">
        <div
          className={`
            p-3 rounded-full bg-white/10 ${color}
            group-hover:scale-110 transition-transform duration-300
          `}
        >
          <Icon size={24} />
        </div>
        <div>
          <p className="text-white/70 text-sm">{label}</p>
          <p className="text-white text-xl font-bold">
            {value}
            <span className="text-sm font-normal">{unit}</span>
          </p>
        </div>
      </div>
    </Container>
  );
}
