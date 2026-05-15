import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ProofRevenue — Verified Revenue Certificate';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Hex approximations of the brand OKLCH colors (Satori doesn't support oklch)
const C = {
  paper: '#F6F4EE',
  paperAlt: '#EFEDE5',
  ink900: '#0B1220',
  ink400: '#5B6478',
  ink300: '#8A93A8',
  line: '#DEDAD0',
  white: '#FFFFFF',
  emerald: '#18A066',
  emeraldSoft: '#D4F0E4',
  emeraldDark: '#0D5C3A',
};

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: C.paper,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 64px',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 44,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 600,
            color: C.ink900,
            letterSpacing: -0.5,
          }}
        >
          ProofRevenue
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: C.emeraldSoft,
            border: `1px solid ${C.emerald}`,
            borderRadius: 99,
            padding: '7px 16px',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: C.emerald,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontFamily: 'monospace',
              color: C.emeraldDark,
              letterSpacing: 0.3,
            }}
          >
            Stripe verified
          </span>
        </div>
      </div>

      {/* Body: headline left, certificate card right */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: 52,
          alignItems: 'center',
        }}
      >
        {/* Left — headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: 58,
              color: C.ink900,
              lineHeight: 1.08,
              letterSpacing: -2,
              fontFamily: 'Georgia, serif',
            }}
          >
            Prove your revenue.
          </span>
          <span
            style={{
              fontSize: 58,
              color: C.ink900,
              lineHeight: 1.08,
              letterSpacing: -2,
              fontFamily: 'Georgia, serif',
              marginBottom: 28,
            }}
          >
            Not a screenshot.
          </span>
          <span
            style={{
              fontSize: 19,
              color: C.ink400,
              fontFamily: 'system-ui, sans-serif',
              lineHeight: 1.55,
              maxWidth: 440,
            }}
          >
            Connect Stripe. Get verified MRR, ARR and customer count in one shareable link investors and buyers can trust.
          </span>
        </div>

        {/* Right — certificate card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: C.white,
            border: `1px solid ${C.line}`,
            borderRadius: 18,
            padding: '28px 32px',
            width: 370,
            flexShrink: 0,
            boxShadow: '0 4px 24px rgba(11,18,32,0.07)',
          }}
        >
          {/* Verified badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: C.emerald,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                color: C.ink400,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              Stripe verified · LIVEMODE
            </span>
          </div>

          {/* Company name */}
          <span
            style={{
              fontSize: 26,
              color: C.ink900,
              fontFamily: 'Georgia, serif',
              letterSpacing: -0.5,
              marginBottom: 22,
            }}
          >
            Acme SaaS
          </span>

          {/* MRR label */}
          <span
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              color: C.ink400,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Monthly Recurring Revenue
          </span>

          {/* MRR value */}
          <span
            style={{
              fontSize: 48,
              color: C.ink900,
              fontFamily: 'Georgia, serif',
              letterSpacing: -2,
              lineHeight: 1,
              marginBottom: 22,
            }}
          >
            €12,400
          </span>

          {/* ARR + Customers */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              borderTop: `1px solid ${C.line}`,
              paddingTop: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: C.ink400,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Annual
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: C.ink900,
                  fontFamily: 'Georgia, serif',
                  letterSpacing: -0.5,
                }}
              >
                €148,800
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: C.ink400,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Customers
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: C.ink900,
                  fontFamily: 'Georgia, serif',
                  letterSpacing: -0.5,
                }}
              >
                47
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 36,
          borderTop: `1px solid ${C.line}`,
          paddingTop: 20,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontFamily: 'monospace',
            color: C.ink300,
          }}
        >
          proof-revenue.vercel.app
        </span>
        <span
          style={{
            fontSize: 13,
            fontFamily: 'system-ui, sans-serif',
            color: C.ink300,
          }}
        >
          €9/month · cancel anytime
        </span>
      </div>
    </div>,
    { ...size }
  );
}
