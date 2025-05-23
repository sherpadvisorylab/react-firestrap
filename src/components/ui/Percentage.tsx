import React from "react";

interface PercentageProps {
  val?: number;
  max?: number;
  min?: number;
  styleType?: "rounded" | "progress";
}

const Percentage = ({
  val = 0,
  max = 100,
  min = 0,
  styleType = "rounded",
}: PercentageProps) => {
  const clampedProgress = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
  const progress = Math.round(clampedProgress);
  const color = "#4db8ff";

  if (styleType === "progress") {
    return (
      <div className="position-relative w-100">
        <div className="progress">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progress}%`, backgroundColor: color }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="position-absolute top-50 start-50 translate-middle text-center fw-bold">
          {`${progress}%`}
        </div>
      </div>
    );
  }

  // Rounded style
  const radius = 35;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div
      className="d-flex justify-content-center align-items-center position-relative"
      style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
    >
      <svg width={radius * 2} height={radius * 2}>
        <circle
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          fill="none"
          stroke="#e6e6e6"
          strokeWidth={strokeWidth}
        />
        <circle
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90)"
          transformOrigin="50% 50%"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fw-bold text-dark"
          fontSize="20"
        >
          {`${progress}%`}
        </text>
      </svg>
    </div>
  );
};

export default Percentage;
