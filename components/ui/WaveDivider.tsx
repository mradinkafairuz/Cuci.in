type WaveDividerProps = {
  topColor: string;
  bottomColor: string;
  flip?: boolean;
  className?: string;
};

export function WaveDivider({
  topColor,
  bottomColor,
  flip = false,
  className = "",
}: WaveDividerProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 block h-[82px] w-full ${flip ? "scale-y-[-1]" : ""} ${className}`}
    >
      <rect width="1440" height="100" fill={topColor} />
      <path
        d="M0 48C180 75 330 86 510 69C700 51 768 24 963 33C1138 41 1290 72 1440 48V100H0V48Z"
        fill={bottomColor}
      />
    </svg>
  );
}
