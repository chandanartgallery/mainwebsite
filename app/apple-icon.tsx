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
          border: '2px solid #d4af37',
        }}
      >
        <span
          style={{
            color: '#d4af37',
            fontSize: '130px',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          C
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
