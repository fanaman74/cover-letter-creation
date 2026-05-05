export function Scene({ height = 280 }: { height?: number }) {
  return (
    <svg viewBox="0 0 1600 380" preserveAspectRatio="xMidYMid slice"
         style={{ display: 'block', width: '100%', height }}>
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fbe9c4"/>
          <stop offset="1" stopColor="#f3ead8"/>
        </linearGradient>
        <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.7" fill="#2a2218" opacity="0.18"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="1600" height="380" fill="url(#sky)"/>
      <g className="bob-slow">
        <circle cx="1280" cy="100" r="58" fill="#f5d572" stroke="#2a2218" strokeWidth="2.5"/>
        <circle cx="1280" cy="100" r="58" fill="url(#dots)"/>
        {[0,1,2,3,4,5,6,7].map(i => {
          const a = (i / 8) * Math.PI * 2;
          const x1 = 1280 + Math.cos(a) * 72, y1 = 100 + Math.sin(a) * 72;
          const x2 = 1280 + Math.cos(a) * 92, y2 = 100 + Math.sin(a) * 92;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a2218" strokeWidth="2.5" strokeLinecap="round"/>;
        })}
      </g>
      <g className="float-cloud" style={{ animationDuration: '80s' }}>
        <g transform="translate(120 90)">
          <ellipse cx="0" cy="0" rx="44" ry="16" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
          <ellipse cx="22" cy="-8" rx="22" ry="14" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
          <ellipse cx="-18" cy="-6" rx="18" ry="12" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
        </g>
      </g>
      <g className="float-cloud" style={{ animationDuration: '120s', animationDelay: '-30s' }}>
        <g transform="translate(550 60)">
          <ellipse cx="0" cy="0" rx="50" ry="14" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
          <ellipse cx="22" cy="-7" rx="20" ry="10" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
        </g>
      </g>
      <path d="M-50 250 L 180 130 L 320 200 L 440 100 L 600 220 L 760 140 L 920 230 L 1080 150 L 1240 240 L 1420 160 L 1650 250 L 1650 380 L -50 380 Z"
            fill="#b9c8b3" stroke="#2a2218" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M 165 142 L 180 130 L 200 145 Z" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
      <path d="M 425 112 L 440 100 L 458 116 Z" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
      <path d="M 1065 162 L 1080 150 L 1098 164 Z" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
      <path d="M 1405 172 L 1420 160 L 1438 175 Z" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
      <path d="M-50 300 Q 200 220 400 280 T 800 270 T 1200 290 T 1650 270 L 1650 380 L -50 380 Z"
            fill="#d96b3a" stroke="#2a2218" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M-50 300 Q 200 220 400 280 T 800 270 T 1200 290 T 1650 270 L 1650 380 L -50 380 Z"
            fill="url(#dots)"/>
      <path d="M-50 340 Q 200 320 500 335 T 1000 330 T 1650 340 L 1650 380 L -50 380 Z"
            fill="#6e8e4e" stroke="#2a2218" strokeWidth="2.5" strokeLinejoin="round"/>
      {[[80,320],[180,326],[260,322],[340,328],[820,322],[950,328],[1090,318],[1450,326],[1530,324]].map(([x,y],i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M-12 0 L 0 -34 L 12 0 Z" fill="#386a3a" stroke="#2a2218" strokeWidth="2"/>
          <path d="M-9 -10 L 0 -44 L 9 -10 Z" fill="#5a8c4a" stroke="#2a2218" strokeWidth="2"/>
          <rect x="-2" y="0" width="4" height="6" fill="#6b4a2a" stroke="#2a2218" strokeWidth="1"/>
        </g>
      ))}
      <g transform="translate(420 308)">
        <rect x="-14" y="-12" width="28" height="20" fill="#fff" stroke="#2a2218" strokeWidth="2"/>
        <path d="M-18 -12 L 0 -26 L 18 -12 Z" fill="#b14b22" stroke="#2a2218" strokeWidth="2"/>
        <rect x="-4" y="-2" width="8" height="10" fill="#6b4a2a" stroke="#2a2218" strokeWidth="1.5"/>
        <rect x="6" y="-8" width="6" height="6" fill="#f5d572" stroke="#2a2218" strokeWidth="1.5"/>
      </g>
      <path d="M -50 380 Q 300 350 600 358 T 1200 348 T 1650 358"
            fill="none" stroke="#fdf6e6" strokeWidth="14" strokeLinecap="round" opacity="0.85"/>
      <path d="M -50 380 Q 300 350 600 358 T 1200 348 T 1650 358"
            fill="none" stroke="#2a2218" strokeWidth="2" strokeDasharray="6 8"/>
      <g transform="translate(380 332)" className="bob">
        <circle cx="0" cy="-12" r="5" fill="#f4d8b6" stroke="#2a2218" strokeWidth="1.5"/>
        <rect x="-3" y="-7" width="6" height="10" fill="#d96b3a" stroke="#2a2218" strokeWidth="1.5"/>
        <line x1="-3" y1="3" x2="-5" y2="9" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <line x1="3" y1="3" x2="5" y2="9" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6" y1="-4" x2="11" y2="-12" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <rect x="9" y="-13" width="3" height="3" fill="#f5d572" stroke="#2a2218" strokeWidth="1"/>
      </g>
      <g transform="translate(900 90) rotate(-12)" className="bob">
        <path d="M0 0 L 36 -8 L 28 4 L 36 -8 L 22 18 L 18 6 L 0 0 Z"
              fill="#fff" stroke="#2a2218" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M0 0 L 18 6 L 22 18" fill="none" stroke="#2a2218" strokeWidth="2" strokeLinejoin="round"/>
      </g>
      <g stroke="#2a2218" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M 700 130 q 6 -6 12 0 q 6 -6 12 0"/>
        <path d="M 740 150 q 5 -5 10 0 q 5 -5 10 0"/>
        <path d="M 820 130 q 5 -5 10 0 q 5 -5 10 0"/>
      </g>
    </svg>
  );
}

export function IconCV({ size = 80 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <defs>
        <pattern id="dotsCV" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.6" fill="#2a2218" opacity="0.12"/>
        </pattern>
      </defs>
      <g transform="rotate(-4 40 40)">
        <rect x="14" y="10" width="48" height="60" rx="3" fill="#fff" stroke="#2a2218" strokeWidth="2.5"/>
        <rect x="14" y="10" width="48" height="60" rx="3" fill="url(#dotsCV)"/>
        <circle cx="26" cy="22" r="5" fill="#d96b3a" stroke="#2a2218" strokeWidth="1.5"/>
        <line x1="36" y1="20" x2="56" y2="20" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <line x1="36" y1="25" x2="50" y2="25" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="38" x2="56" y2="38" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="44" x2="56" y2="44" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="50" x2="48" y2="50" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="56" x2="56" y2="56" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="62" x2="42" y2="62" stroke="#2a2218" strokeWidth="2" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

export function IconVacancy({ size = 80 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <g transform="rotate(-8 40 40)">
        <path d="M16 32 L 56 18 L 56 62 L 16 48 Z" fill="#f5d572" stroke="#2a2218" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="56" y="22" width="14" height="36" rx="3" fill="#d96b3a" stroke="#2a2218" strokeWidth="2.5"/>
        <path d="M16 32 Q 6 40 16 48 Z" fill="#fff" stroke="#2a2218" strokeWidth="2.5"/>
        <line x1="22" y1="40" x2="50" y2="40" stroke="#2a2218" strokeWidth="2" strokeDasharray="3 3"/>
      </g>
    </svg>
  );
}

export function IconPen({ size = 80 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <g transform="rotate(-30 40 40)">
        <rect x="20" y="14" width="14" height="40" fill="#6e8e4e" stroke="#2a2218" strokeWidth="2.5"/>
        <path d="M20 54 L 27 66 L 34 54 Z" fill="#2a2218"/>
        <rect x="20" y="14" width="14" height="8" fill="#d96b3a" stroke="#2a2218" strokeWidth="2.5"/>
        <line x1="22" y1="22" x2="22" y2="50" stroke="#2a2218" strokeWidth="1" opacity=".4"/>
      </g>
    </svg>
  );
}

export function IconBadge({ size = 80 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <g transform="rotate(6 40 40)">
        <path d="M40 8 L 50 14 L 62 12 L 64 24 L 72 32 L 64 40 L 62 52 L 50 50 L 40 56 L 30 50 L 18 52 L 16 40 L 8 32 L 16 24 L 18 12 L 30 14 Z"
              fill="#d96b3a" stroke="#2a2218" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="40" cy="32" r="14" fill="#f5d572" stroke="#2a2218" strokeWidth="2"/>
        <path d="M32 32 L 38 38 L 48 26" stroke="#2a2218" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30 50 L 28 70 L 40 64 L 52 70 L 50 50" fill="#b14b22" stroke="#2a2218" strokeWidth="2.5" strokeLinejoin="round"/>
      </g>
    </svg>
  );
}

export function IconEnvelope({ size = 80 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <g transform="rotate(-3 40 40)">
        <rect x="10" y="22" width="60" height="40" rx="3" fill="#fff" stroke="#2a2218" strokeWidth="2.5"/>
        <path d="M10 22 L 40 46 L 70 22" fill="none" stroke="#2a2218" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M10 62 L 30 42" stroke="#2a2218" strokeWidth="2"/>
        <path d="M70 62 L 50 42" stroke="#2a2218" strokeWidth="2"/>
        <circle cx="60" cy="20" r="8" fill="#b14b22" stroke="#2a2218" strokeWidth="2"/>
        <path d="M56 20 L 60 24 L 64 16" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size}>
      <circle cx="30" cy="30" r="28" fill="#d96b3a" stroke="#2a2218" strokeWidth="2.5"/>
      <path d="M 12 42 L 22 26 L 30 36 L 40 20 L 50 42 Z" fill="#fff" stroke="#2a2218" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M 18 22 a 3 3 0 1 1 6 0 a 3 3 0 1 1 -6 0" fill="#f5d572" stroke="#2a2218" strokeWidth="1.5"/>
    </svg>
  );
}

export function Star({ size = 28, fill = '#f5d572' }: { size?: number; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12 2 L 14 9 L 22 10 L 16 15 L 18 22 L 12 18 L 6 22 L 8 15 L 2 10 L 10 9 Z"
            fill={fill} stroke="#2a2218" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function ArrowDoodle({ rotate = 0, w = 90, h = 60 }: { rotate?: number; w?: number; h?: number }) {
  return (
    <svg viewBox="0 0 90 60" width={w} height={h} style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M 4 30 Q 30 4 60 30 Q 70 38 80 30" fill="none" stroke="#2a2218" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 80 30 L 72 24 M 80 30 L 72 36" fill="none" stroke="#2a2218" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
