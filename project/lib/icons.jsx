// Minimal icon set — thin 1.5px strokes, 16×16 by default
function Icon({ name, size = 16, color = "currentColor", strokeWidth = 1.5, style }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    style,
  };
  switch (name) {
    case "check": return (<svg {...common}><path d="M4 12.5L9 17.5L20 6.5"/></svg>);
    case "check-circle": return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M8 12.5L11 15.5L16 9.5"/></svg>);
    case "lock": return (<svg {...common}><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>);
    case "arrow-right": return (<svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case "arrow-up-right": return (<svg {...common}><path d="M7 17L17 7M8 7h9v9"/></svg>);
    case "external": return (<svg {...common}><path d="M14 5h5v5M19 5l-9 9M14 13v6H5V10h6"/></svg>);
    case "copy": return (<svg {...common}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>);
    case "refresh": return (<svg {...common}><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/></svg>);
    case "shield": return (<svg {...common}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/></svg>);
    case "shield-check": return (<svg {...common}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/><path d="M9 12l2.5 2.5L15 11"/></svg>);
    case "spark": return (<svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>);
    case "bolt": return (<svg {...common}><path d="M13 3L5 13h6l-1 8 8-10h-6l1-8Z"/></svg>);
    case "menu": return (<svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>);
    case "x": return (<svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case "chevron-right": return (<svg {...common}><path d="M9 6l6 6-6 6"/></svg>);
    case "chevron-down": return (<svg {...common}><path d="M6 9l6 6 6-6"/></svg>);
    case "eye": return (<svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>);
    case "eye-off": return (<svg {...common}><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.9 17.9 0 0 1-3.1 4M6.5 6.5C3.5 8.5 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4.7-1.1"/></svg>);
    case "link": return (<svg {...common}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7L12 6.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7L12 17.5"/></svg>);
    case "warn": return (<svg {...common}><path d="M12 3L2 20h20L12 3Z"/><path d="M12 10v5M12 18v.5"/></svg>);
    case "info": return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>);
    case "clock": return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "dot": return (<svg {...common}><circle cx="12" cy="12" r="3" fill={color}/></svg>);
    case "logo-mark":
      // ProofRevenue mark: chevron + tick inside a rounded square
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" fill={color} stroke="none"/>
          <path d="M8 12.5L11 15.5L16.5 9.5" stroke="var(--paper, #F6F4EE)" strokeWidth="1.6"/>
        </svg>
      );
    case "stripe-s":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12.8 7.3c-1.6 0-2.9.5-3.9 1.4-.9.9-1.3 2.1-1.3 3.5v.2c0 1.8.8 3 2.4 3.7l3.2 1.3c.9.4 1.3.8 1.3 1.4 0 .7-.6 1.1-1.8 1.1-1.4 0-3.3-.6-4.9-1.5v3.2c1.6.6 3.2 1 4.9 1 1.8 0 3.2-.4 4.2-1.3 1-.9 1.5-2.1 1.5-3.6v-.2c0-1.8-.9-3.1-2.6-3.8l-3-1.2c-.9-.4-1.3-.8-1.3-1.3 0-.6.5-1 1.5-1 1.4 0 3 .5 4.5 1.3V7.9c-1.5-.5-2.9-.6-4.7-.6Z" fill={color} stroke="none"/>
        </svg>
      );
    default: return null;
  }
}

Object.assign(window, { Icon });
