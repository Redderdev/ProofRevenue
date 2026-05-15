import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0B1220',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
      }}
    >
      <span
        style={{
          color: '#F6F4EE',
          fontSize: 108,
          fontFamily: 'Georgia, serif',
          fontWeight: 400,
          letterSpacing: -3,
          marginTop: -6,
        }}
      >
        P
      </span>
    </div>,
    { ...size }
  );
}
