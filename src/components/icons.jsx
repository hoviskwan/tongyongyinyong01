// 内联 SVG 图标：轻量应用不引入额外图标依赖，保持单一图标家族。

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function Boxes(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
      <path d="m7 16.5-4.74-2.85" />
      <path d="m7 16.5 5-3" />
      <path d="M21.39 13.11a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0L12 13v5.5l5 3a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.64-1.64Z" />
      <path d="m17 16.5 4.74-2.85" />
      <path d="M17 16.5-5 7.5" />
      <path d="m7 16.5 5-3" />
      <path d="M7 7.5v5.5" />
      <path d="M12 13V7.5" />
      <path d="M17 8.5v5.5" />
      <path d="m12 7.5-5-3" />
      <path d="m12 7.5 5-3" />
    </svg>
  );
}

export function PackageCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="m16 16 2 2 4-4" />
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
      <path d="m7.5 4.27 9 5.15" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

export function TriangleAlert(props) {
  return (
    <svg {...base} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function AlertTriangle(props) {
  return (
    <svg {...base} width={14} height={14} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function Search(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function ArrowDownToLine(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 17V3" />
      <path d="m6 11 6 6 6-6" />
      <path d="M19 21H5" />
    </svg>
  );
}

export function ArrowUpFromLine(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21V9" />
      <path d="m6 15 6-6 6 6" />
      <path d="M19 3H5" />
    </svg>
  );
}

export function ListOrdered(props) {
  return (
    <svg {...base} {...props}>
      <path d="M10 12h11" />
      <path d="M10 18h11" />
      <path d="M10 6h11" />
      <path d="M4 10h2v4" />
      <path d="M4 6h1.5a1.5 1.5 0 0 1 0 3H4" />
    </svg>
  );
}
