import React from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page5IdentityPlaceholderProps {
  onBack: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

export const Page5IdentityPlaceholder: React.FC<Page5IdentityPlaceholderProps> = ({
  onBack,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const { profile, phoneNumber, countryCode } = useAuth();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        backgroundColor: '#100c0e',
        color: 'var(--color-warm-porcelain)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Background with Ambient Dark Mulberry Tone */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 20%, #3a1d2e 0%, #100c0e 75%)',
          zIndex: 1,
        }}
      />

      {/* Top Header Region */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {showStatusBar && <StatusBar variant="light" />}

        {/* Back Button */}
        <div style={{ padding: '8px 24px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-warm-porcelain)',
              cursor: 'pointer',
              padding: '8px',
              marginLeft: '-8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span>BACK</span>
          </button>

          <span style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--color-dusty-lilac)', textTransform: 'uppercase' }}>
            STEP 3 OF 4
          </span>
        </div>
      </div>

      {/* Center Content: Preserved Profile Data Confirmation */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          overflowY: 'auto',
        }}
      >
        {/* Verification Icon Badge */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(73, 40, 61, 0.4)',
            border: '1.5px solid var(--color-dusty-lilac)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 24px rgba(179, 154, 174, 0.2)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-warm-porcelain)" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: 400,
            letterSpacing: '0.02em',
            margin: '0 0 6px 0',
            color: 'var(--color-warm-porcelain)',
          }}
        >
          Identity Verification
        </h2>

        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--color-dusty-lilac)',
            margin: '0 0 20px 0',
          }}
        >
          Route <code style={{ color: 'var(--color-warm-porcelain)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>/join/identity-verification</code>
        </p>

        {/* Preserved Profile Summary Card */}
        <div
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(39, 33, 36, 0.75)',
            border: '1px solid rgba(243, 238, 233, 0.12)',
            marginBottom: '20px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-mushroom)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            Collected Member Profile Data
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--color-dusty-lilac)', fontSize: '11px', display: 'block' }}>FIRST NAME</span>
              <strong style={{ color: 'var(--color-warm-porcelain)' }}>{profile.firstName || 'Not provided'}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--color-dusty-lilac)', fontSize: '11px', display: 'block' }}>CITY</span>
              <strong style={{ color: 'var(--color-warm-porcelain)' }}>{profile.city || 'Not provided'}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--color-dusty-lilac)', fontSize: '11px', display: 'block' }}>GENDER</span>
              <strong style={{ color: 'var(--color-warm-porcelain)' }}>
                {profile.genderIdentity === 'PREFER TO SELF-DESCRIBE'
                  ? profile.selfDescribeGender || 'Self-describe'
                  : profile.genderIdentity || 'Not provided'}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--color-dusty-lilac)', fontSize: '11px', display: 'block' }}>INTERESTED IN</span>
              <strong style={{ color: 'var(--color-warm-porcelain)' }}>{profile.datingPreference || 'Not provided'}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--color-dusty-lilac)', fontSize: '11px', display: 'block' }}>STATUS</span>
              <strong style={{ color: 'var(--color-warm-porcelain)' }}>{profile.currentStatus || 'Not provided'}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--color-dusty-lilac)', fontSize: '11px', display: 'block' }}>VERIFIED PHONE</span>
              <strong style={{ color: 'var(--color-warm-porcelain)' }}>{countryCode} {phoneNumber || '6896568960'}</strong>
            </div>
          </div>

          {/* Photo Thumbnails */}
          {profile.photos.length > 0 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: 'var(--color-dusty-lilac)', fontSize: '11px', display: 'block', marginBottom: '8px' }}>
                UPLOADED PHOTOGRAPHS ({profile.photos.length})
              </span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {profile.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Thumb ${i + 1}`}
                    style={{
                      width: '44px',
                      height: '56px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid rgba(243, 238, 233, 0.2)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <p style={{ fontSize: '12.5px', lineHeight: '1.5', color: 'rgba(243, 238, 233, 0.7)', margin: 0 }}>
          Identity Verification (Government ID & Selfie check) will be built in the next step after Page 4 approval.
        </p>
      </div>

      {/* Bottom Action */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 24px 16px 24px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '9999px',
            border: '1px solid rgba(243, 238, 233, 0.25)',
            backgroundColor: 'transparent',
            color: 'var(--color-warm-porcelain)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← Return to Profile Setup (Page 4)
        </button>

        {showHomeIndicator && (
          <div
            style={{
              width: '134px',
              height: '5px',
              backgroundColor: 'rgba(243, 238, 233, 0.45)',
              borderRadius: '9999px',
              margin: '14px auto 4px auto',
            }}
          />
        )}
      </div>
    </div>
  );
};
