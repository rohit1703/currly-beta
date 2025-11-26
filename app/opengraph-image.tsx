import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Currly - The World\'s First AI Tools Discovery Engine';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageWrapper
      <div
        style={{
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Glow (Lighthouse Beam) */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            width: '1000px',
            height: '1000px',
            background: '#0066FF',
            opacity: '0.15',
            filter: 'blur(100px)',
            borderRadius: '50%',
          }}
        />

        {/* Logo Container */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', zIndex: 10 }}>
           {/* Blue Square C */}
           <div
            style={{
              width: '80px',
              height: '80px',
              background: '#0066FF',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 0 40px rgba(0,102,255,0.5)',
              marginRight: '24px',
            }}
          >
            C
          </div>
          {/* Wordmark */}
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: 'white', letterSpacing: '-2px' }}>
            Currly
          </div>
        </div>

        {/* Main Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '60px', fontWeight: '900', color: 'white', textAlign: 'center', lineHeight: '1.1', letterSpacing: '-1px' }}>
            Don't just find AI.
          </div>
          <div style={{ fontSize: '60px', fontWeight: '900', color: '#0066FF', textAlign: 'center', lineHeight: '1.1', letterSpacing: '-1px' }}>
            Adopt it.
          </div>
        </div>

        {/* Stats / Trust Badges */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '60px', zIndex: 10 }}>
           <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '50px', color: '#E5E5E5', fontSize: '24px', fontWeight: '500' }}>
              712+ Tools
           </div>
           <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '50px', color: '#E5E5E5', fontSize: '24px', fontWeight: '500' }}>
              Zero Affiliate Bias
           </div>
           <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '50px', color: '#E5E5E5', fontSize: '24px', fontWeight: '500' }}>
              Updated Weekly
           </div>
        </div>

      </div>
    ),
    {
      ...size,
    }
  );
}