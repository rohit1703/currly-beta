import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/utils/supabase/admin';

export const alt = 'AI Tool on Currly';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function ToolOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: tool } = await supabase
    .from('tools')
    .select('name, description, main_category, pricing_model, image_url')
    .eq('slug', slug)
    .single();

  const name = tool?.name ?? 'AI Tool';
  const category = tool?.main_category ?? '';
  const desc = tool?.description?.substring(0, 110) ?? '';
  const pricing = tool?.pricing_model ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0066FF 0%, #00AAFF 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {tool?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tool.image_url}
              width={96}
              height={96}
              style={{
                borderRadius: '20px',
                background: 'white',
                padding: '10px',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 800,
                color: 'white',
              }}
            >
              {name[0]}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span
              style={{ fontSize: '58px', fontWeight: 800, color: 'white', lineHeight: 1 }}
            >
              {name}
            </span>
            {category && (
              <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.72)' }}>
                {category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {desc && (
          <p
            style={{
              fontSize: '26px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.5,
              maxWidth: '940px',
            }}
          >
            {desc}
          </p>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Pricing badge */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {pricing && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '100px',
                  fontSize: '20px',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {pricing}
              </span>
            )}
          </div>

          {/* Currly branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0,0,0,0.2)',
              padding: '12px 28px',
              borderRadius: '100px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0066FF',
              }}
            >
              C
            </div>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>currly</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
