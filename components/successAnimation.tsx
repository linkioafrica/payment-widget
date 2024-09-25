import { useEffect, useState } from "react";

export const SuccessAnimation = ({ classes }: any) => {
  const [showCheck, setShowCheck] = useState(false);

  // After 1-2 seconds, show the checkmark
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowCheck(true);
    }, 500); // Delay of .5 seconds

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`${classes}`}>
      <svg
        width="120"
        height="120"
        viewBox="0 0 148 148"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask
          id="mask0_210_33118"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="148"
          height="148"
          mask-type="alpha"
        >
          <circle
            cx="74"
            cy="74"
            r="66.9479"
            fill="url(#paint0_linear_210_33118)"
            stroke="url(#paint1_linear_210_33118)"
            strokeWidth="14.1042"
          />
        </mask>
        <g mask="url(#mask0_210_33118)">
          <circle
            cx="74"
            cy="74"
            r="68.95"
            fill="url(#paint2_linear_210_33118)"
            stroke="url(#paint3_linear_210_33118)"
            strokeWidth="10.1"
          />

          {/* Checkmark Path */}
          <path
            className={`checkmark ${showCheck ? "show" : ""}`}
            d="M69.5632 94.9717C65.8968 98.6117 59.9802 98.6117 56.3137 94.9717L40.5355 79.3069C38.7571 77.5413 38.7571 74.6652 40.5355 72.8996C42.2958 71.152 45.1364 71.152 46.8967 72.8996L62.9385 88.826L101.013 51.0254C102.773 49.2778 105.614 49.2778 107.374 51.0254C109.153 52.791 109.153 55.6671 107.374 57.4327L69.5632 94.9717Z"
            fill="white"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_210_33118"
            x1="74"
            y1="0"
            x2="74"
            y2="148"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1B73F2" />
            <stop offset="1" stopColor="#0038FF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_210_33118"
            x1="74"
            y1="0"
            x2="74"
            y2="148"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0C3B97" />
            <stop offset="0.994792" stopColor="#DBF2FF" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_210_33118"
            x1="74"
            y1="0"
            x2="74"
            y2="148"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4A9FED" />
            <stop offset="1" stopColor="#0259D6" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_210_33118"
            x1="74"
            y1="0"
            x2="74"
            y2="148"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0259D6" />
            <stop offset="0.994792" stopColor="#DBF6FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
