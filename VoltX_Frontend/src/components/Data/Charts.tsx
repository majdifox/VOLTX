import React from "react";
import { THEME } from "../../config/theme";

interface ProgressChartProps {
  data: {
    label: string;
    value: number;
    maxValue: number;
    color?: string;
  }[];
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
  showPercentages?: boolean;
  height?: string;
  className?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  orientation = 'horizontal',
  showValues = true,
  showPercentages = true,
  height = '300px',
  className = ""
}) => {
  const getPercentage = (value: number, maxValue: number): number => {
    return Math.round((value / maxValue) * 100);
  };

  const getBarColor = (index: number, customColor?: string): string => {
    if (customColor) return customColor;

    const colors = [
      THEME.colors.primary,
      THEME.colors.secondary,
      THEME.colors.success,
      THEME.colors.warning,
      THEME.colors.danger
    ];

    return colors[index % colors.length];
  };

  if (orientation === 'vertical') {
    return (
      <div className={`${className}`} style={{ height }}>
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const percentage = getPercentage(item.value, item.maxValue);
            const barColor = getBarColor(index, item.color);

            return (
              <div key={item.label} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center mb-2">
                  {showValues && (
                    <span className="text-sm font-medium text-gray-600 mb-1">
                      {item.value.toLocaleString()}
                    </span>
                  )}
                  {showPercentages && (
                    <span className="text-xs text-gray-500">
                      {percentage}%
                    </span>
                  )}
                </div>

                <div className="w-full bg-gray-200 rounded-t-md flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md transition-all duration-500 ease-out"
                    style={{
                      height: `${percentage}%`,
                      backgroundColor: barColor,
                      minHeight: '4px'
                    }}
                  />
                </div>

                <span className="text-xs text-gray-700 text-center mt-2 font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((item, index) => {
        const percentage = getPercentage(item.value, item.maxValue);
        const barColor = getBarColor(index, item.color);

        return (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {showValues && (
                  <span>{item.value.toLocaleString()}</span>
                )}
                {showPercentages && (
                  <span>({percentage}%)</span>
                )}
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: barColor
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Donut Chart Component for circular progress
interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  size?: number;
  thickness?: number;
  showLabels?: boolean;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  thickness = 20,
  showLabels = true,
  className = ""
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = center - thickness / 2;

  let currentAngle = 0;

  const getColor = (index: number, customColor?: string): string => {
    if (customColor) return customColor;

    const colors = [
      THEME.colors.primary,
      THEME.colors.secondary,
      THEME.colors.success,
      THEME.colors.warning,
      THEME.colors.danger
    ];

    return colors[index % colors.length];
  };

  const createPath = (value: number, startAngle: number): string => {
    const percentage = value / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArc = angle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={thickness}
          />

          {/* Data segments */}
          {data.map((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const strokeDasharray = `${(percentage * 2 * Math.PI * radius)} ${2 * Math.PI * radius}`;
            const strokeDashoffset = -(currentAngle / 360) * 2 * Math.PI * radius;

            const color = getColor(index, item.color);

            // Update current angle for next segment
            currentAngle += angle;

            return (
              <circle
                key={item.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
                transform={`rotate(-90 ${center} ${center})`}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="ml-6 space-y-2">
          {data.map((item, index) => {
            const color = getColor(index, item.color);
            const percentage = Math.round((item.value / total) * 100);

            return (
              <div key={item.label} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700">
                  {item.label} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};