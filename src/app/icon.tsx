import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0B1220',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
      }}
    >
      <span
        style={{
          color: '#F6F4EE',
          fontSize: 19,
          fontFamily: 'Georgia, serif',
          fontWeight: 400,
          letterSpacing: -0.5,
          marginTop: -1,
        }}
      >
        P
      </span>
    </div>,
    { ...size }
  );
}
