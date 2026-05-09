import Link from "next/link";

export function Brand({ small = false }: { small?: boolean }) {
  const markSize = small ? 22 : 26;
  return (
    <Link
      href="/"
      className="brand brand-lockup"
      style={{ fontSize: small ? 17 : 19, gap: small ? 8 : 10 }}
    >
      <CollegeMark size={markSize} />
      <span>College Grad Analyst</span>
    </Link>
  );
}

// Mortarboard with amber tassel — ported from college-shared.jsx CollegeMark.
function CollegeMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size * (56 / 64)}
      viewBox="0 0 64 56"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 26 Q16 40 22 42 L42 42 Q48 40 48 26 Z" fill="#E8ECF2" />
      <path d="M32 6 L58 18 L32 30 L6 18 Z" fill="#E8ECF2" />
      <circle cx="32" cy="18" r="1.6" fill="#0E1116" />
      <path
        d="M32 18 Q44 18 49 25"
        fill="none"
        stroke="#E6B450"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="49" cy="27" r="2.2" fill="#E6B450" />
      <path
        d="M47 29 L47 38 M49 29 L49 39 M51 29 L51 38"
        stroke="#E6B450"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <g>
        <path
          d="M48 22 q10 8 10 18"
          fill="none"
          stroke="#E6B450"
          strokeWidth="2"
        />
        <circle cx={58} cy={42} r={4} fill="#E6B450" />
        <circle cx={58} cy={42} r={2} fill="#0E1116" />
      </g>
    </svg>
  );
}
