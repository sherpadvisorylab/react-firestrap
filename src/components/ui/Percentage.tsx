import React from "react";
import { UIProps } from '../..';
import { useTheme } from "../../Theme";
import { Wrapper } from "./GridSystem";

type ColorType = "info" | "success" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark";
type ShapeType = "bar" | "circle";

interface BasePercentageProps {
  progress: number;
  type: ColorType;
  className: string;
  thickness: number;
  showText: boolean;
  background: ColorType;
  size: number;
}

interface CircleOptions {
  fontSize: number;
}

interface PercentageBarProps extends BasePercentageProps {}

interface PercentageCircleProps extends BasePercentageProps {
  options: CircleOptions;
}

interface PercentageProps extends UIProps {
  val?: number;
  max?: number;
  min?: number;
  shape?: ShapeType;
  type?: ColorType;
  background?: ColorType;
  thickness?: number;
  showText?: boolean;
  size?: number;
  circleOptions?: CircleOptions;
}

const DEFAULT_CIRCLE_OPTIONS: CircleOptions = {
  fontSize: 18
};

const DEFAULT_THICKNESS = 10;
const DEFAULT_SIZE = 100;

const PercentageBar: React.FC<PercentageBarProps> = ({ 
  progress, 
  type, 
  className, 
  thickness,
  showText,
  background,
  size
}) => {
  return (
    <div 
      className={`progress ${className}`} 
      style={{ 
        height: `${thickness}px`,
        width: `${size}%`,
        backgroundColor: `var(--bs-${background})`
      }}
    >
      <div
        className={`progress-bar bg-${type}`}
        role="progressbar"
        style={{ width: `${progress}%` }}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {showText && `${progress}%`}
      </div>
    </div>
  );
};

const PercentageCircle: React.FC<PercentageCircleProps> = ({ 
  progress, 
  type, 
  thickness, 
  options, 
  className,
  showText,
  background,
  size
}) => {
  const { fontSize } = options;
  const radius = size / 2;
  const normalizedRadius = radius - thickness / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference * ((100 - progress) / 100);
  const startAngle = -90;

  return (
    <span className={className}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          fill="none"
          className="opacity-25"
          stroke={`var(--bs-${background})`}
          strokeWidth={thickness}
        />
        {/* Progress circle */}
        <circle
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          fill="none"
          stroke={`var(--bs-${type})`}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transform: `rotate(${startAngle}deg)`, transformOrigin: 'center' }}
        />
        {showText && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fw-bold"
            fontSize={fontSize}
            fill={`var(--bs-${background})`}
          >
            {`${progress}%`}
          </text>
        )}
      </svg>
    </span>
  );
};

const Percentage = ({
  val = 0,
  max = 100,
  min = 0,
  shape = "bar",
  type = "primary",
  background = "secondary",
  thickness = DEFAULT_THICKNESS,
  showText = true,
  size = DEFAULT_SIZE,
  circleOptions = DEFAULT_CIRCLE_OPTIONS,
  pre = undefined,
  post = undefined,
  wrapClass = undefined,
  className = undefined
}: PercentageProps) => {
  const theme = useTheme("percentage");
  const progress = Math.round(Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100)));
  const finalClassName = className || theme.Percentage?.className || '';

  return (
    <Wrapper className={wrapClass || theme.Percentage?.wrapClass}>
      {pre}
      {shape === "bar" ? (
        <PercentageBar
          progress={progress}
          type={type}
          thickness={thickness}
          showText={showText}
          background={background}
          size={size}
          className={finalClassName}
        />
      ) : (
        <PercentageCircle
          progress={progress}
          type={type}
          thickness={thickness}
          showText={showText}
          background={background}
          size={size}
          options={circleOptions}
          className={finalClassName}
        />
      )}
      {post}
    </Wrapper>
  );
};

export default Percentage;
