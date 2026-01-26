import React from "react";
import { Card, CardBody } from "../UI";
import { THEME } from "../../config/theme";
import { formatters } from "../../utils/formatters";

interface StatItemProps {
  label: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
}

interface StatsCardProps {
  title?: string;
  stats: StatItemProps[];
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  change,
  icon,
  color = 'primary',
  trend = 'neutral'
}) => {
  const getColorClasses = (colorKey: string) => {
    switch (colorKey) {
      case 'secondary':
        return {
          bg: `bg-[${THEME.colors.secondary}]/10`,
          text: `text-[${THEME.colors.secondary}]`,
          border: `border-[${THEME.colors.secondary}]/20`
        };
      case 'success':
        return {
          bg: `bg-[${THEME.colors.success}]/10`,
          text: `text-[${THEME.colors.success}]`,
          border: `border-[${THEME.colors.success}]/20`
        };
      case 'warning':
        return {
          bg: `bg-[${THEME.colors.warning}]/10`,
          text: `text-[${THEME.colors.warning}]`,
          border: `border-[${THEME.colors.warning}]/20`
        };
      case 'danger':
        return {
          bg: `bg-[${THEME.colors.danger}]/10`,
          text: `text-[${THEME.colors.danger}]`,
          border: `border-[${THEME.colors.danger}]/20`
        };
      default:
        return {
          bg: `bg-[${THEME.colors.primary}]/10`,
          text: `text-[${THEME.colors.primary}]`,
          border: `border-[${THEME.colors.primary}]/20`
        };
    }
  };

  const colorClasses = getColorClasses(color);

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7m0 0H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10m0 0h10" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses.bg} ${colorClasses.border}`}>
      <div className="flex items-center justify-between mb-2">
        {icon && (
          <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
            {icon}
          </div>
        )}
        {change !== undefined && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>

      <div>
        <div className={`text-2xl font-bold ${colorClasses.text}`}>
          {formatValue(value)}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {label}
        </div>
      </div>
    </div>
  );
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  stats,
  variant = 'default',
  className = ""
}) => {
  const getGridCols = () => {
    const count = stats.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    if (count === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  const renderCompactStats = () => (
    <div className={`grid ${getGridCols()} gap-3`}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          {stat.icon && (
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {stat.icon}
            </div>
          )}
          <div className="flex-1">
            <div className="text-lg font-semibold text-gray-900">
              {formatters.formatNumber(Number(stat.value))}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
          {stat.change !== undefined && (
            <div className={`text-sm font-medium ${
              stat.trend === 'up' ? 'text-green-600' :
              stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderDefaultStats = () => (
    <div className={`grid ${getGridCols()} gap-4`}>
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );

  const renderDetailedStats = () => (
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            {stat.icon && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {stat.icon}
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-gray-900">
                {formatters.formatNumber(Number(stat.value))}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          </div>

          {stat.change !== undefined && (
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stat.trend === 'up' ? 'bg-green-100 text-green-800' :
                stat.trend === 'down' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderStats = () => {
    switch (variant) {
      case 'compact':
        return renderCompactStats();
      case 'detailed':
        return renderDetailedStats();
      default:
        return renderDefaultStats();
    }
  };

  if (variant === 'compact') {
    return (
      <div className={className}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        {renderStats()}
      </div>
    );
  }

  return (
    <Card variant="default" className={className}>
      {title && (
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        </CardBody>
      )}
      <CardBody className={title ? "pt-0" : ""}>
        {renderStats()}
      </CardBody>
    </Card>
  );
};