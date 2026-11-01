import React from 'react';
import { useTranslation } from 'react-i18next';

interface AqiBadgeProps {
  value?: number | null;
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  showCategory?: boolean;
}

export const getAqiColor = (value?: number | null, category?: string) => {
  if (value === null || value === undefined) {
    if (category === 'Good') return '#16a34a';
    if (category === 'Satisfactory') return '#65a30d';
    if (category === 'Moderate') return '#ca8a04';
    if (category === 'Poor') return '#ea580c';
    if (category === 'Very Poor') return '#dc2626';
    if (category === 'Severe') return '#7f1d1d';
    return '#94a3b8'; // Grey for no data
  }
  if (value <= 50) return '#16a34a'; // Good
  if (value <= 100) return '#65a30d'; // Satisfactory
  if (value <= 200) return '#ca8a04'; // Moderate
  if (value <= 300) return '#ea580c'; // Poor
  if (value <= 400) return '#dc2626'; // Very Poor
  return '#7f1d1d'; // Severe
};

export const getAqiCategoryKey = (value?: number | null, category?: string): string => {
  if (category) {
    const lower = category.toLowerCase().replace(' ', '');
    if (lower.includes('good')) return 'aqi.good';
    if (lower.includes('satisfactory')) return 'aqi.satisfactory';
    if (lower.includes('moderate')) return 'aqi.moderate';
    if (lower.includes('verypoor')) return 'aqi.veryPoor';
    if (lower.includes('poor')) return 'aqi.poor';
    if (lower.includes('severe')) return 'aqi.severe';
    if (lower.includes('insufficient')) return 'aqi.insufficient';
  }
  if (value === null || value === undefined) return 'aqi.noData';
  if (value <= 50) return 'aqi.good';
  if (value <= 100) return 'aqi.satisfactory';
  if (value <= 200) return 'aqi.moderate';
  if (value <= 300) return 'aqi.poor';
  if (value <= 400) return 'aqi.veryPoor';
  return 'aqi.severe';
};

export const AqiBadge: React.FC<AqiBadgeProps> = ({
  value,
  category,
  size = 'md',
  showCategory = true,
}) => {
  const { t } = useTranslation();
  const color = getAqiColor(value, category);
  const catKey = getAqiCategoryKey(value, category);
  const label = t(catKey);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full text-white shadow-xs ${sizeClasses}`}
      style={{ backgroundColor: color }}
    >
      {value !== null && value !== undefined ? (
        <span>{value}</span>
      ) : (
        <span>—</span>
      )}
      {showCategory && <span className="opacity-95 font-medium">· {label}</span>}
    </span>
  );
};

