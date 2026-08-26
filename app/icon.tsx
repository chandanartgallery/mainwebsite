import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <span
          style={{
            color: '#d4af37',
            fontSize: '26px',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 1,
            marginTop: '-1px',
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
