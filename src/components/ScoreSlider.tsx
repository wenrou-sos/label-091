import { useEffect, useRef, useState } from "react";

interface ScoreSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  showBubble?: boolean;
  disabled?: boolean;
}

export default function ScoreSlider({
  value,
  min = 0,
  max = 10,
  step = 0.1,
  onChange,
  showBubble = true,
  disabled = false,
}: ScoreSliderProps) {
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [dragging]);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full select-none">
      <div
        ref={trackRef}
        className="relative h-8 flex items-center"
        onMouseDown={() => !disabled && setDragging(true)}
        onTouchStart={() => !disabled && setDragging(true)}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="tea-slider relative z-10 w-full disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {showBubble && (
          <div
            className={`pointer-events-none absolute -top-1 transition-all duration-150 ${
              dragging ? "opacity-100 scale-100" : "opacity-80 scale-90"
            }`}
            style={{ left: `calc(${pct}% - 20px)` }}
          >
            <div className="relative px-2 py-0.5 rounded-md bg-leaf-800 text-white text-xs font-semibold shadow-md">
              {value.toFixed(1)}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-leaf-800" />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[10px] text-tea-600 mt-0.5 font-medium">
        <span>0</span>
        <span>一般 5</span>
        <span>优秀 10</span>
      </div>
    </div>
  );
}
