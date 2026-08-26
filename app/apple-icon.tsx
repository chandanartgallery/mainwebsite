import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          borderRadius: '36px',
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontSize: '72px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 800,
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}
        >
          CAG
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
