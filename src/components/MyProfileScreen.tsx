import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Eye, Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { MemberBottomNav, type MemberTab } from './MemberBottomNav';
import { MemberTopBar } from './MemberTopBar';
import { StatusBar } from './StatusBar';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { calculateAgeFromISO } from '../utils/ageCalculation';

interface MyProfileScreenProps {
  onBack: () => void;
  onSelectTab: (tab: MemberTab) => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
}

const MAX_PHOTOS = 6;

const compressPhoto = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    const scale = Math.min(1, 900 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Unable to process this image.'));
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL('image/jpeg', 0.82));
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Unable to load this image.'));
  };
  image.src = objectUrl;
});

export const MyProfileScreen: React.FC<MyProfileScreenProps> = ({
  onBack,
  onSelectTab,
  showStatusBar = true,
  showHomeIndicator = true,
}) => {
  const {
    profile,
    updateProfile,
    appearanceMode,
    isPhoneVerified,
    isIdentityVerified,
    isSelfieVerified,
    isDigiLockerVerified,
  } = useAuth();
  const isDark = appearanceMode === 'after-dark';
  const [draft, setDraft] = useState<UserProfile>(() => ({ ...profile, photos: [...(profile.photos || [])], interests: [...(profile.interests || [])] }));
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = {
    bg: isDark ? '#140E1C' : '#FAF1F3',
    text: isDark ? '#FDF3F5' : '#462037',
    accent: isDark ? '#F9AAAD' : '#462037',
    muted: isDark ? '#D4A2AC' : '#683A46',
    border: isDark ? 'rgba(161, 82, 95, 0.32)' : 'rgba(161, 82, 95, 0.2)',
    surface: isDark ? 'rgba(48, 27, 43, 0.84)' : 'rgba(255, 255, 255, 0.82)',
    field: isDark ? 'rgba(20, 14, 28, 0.72)' : 'rgba(255, 255, 255, 0.8)',
  };

  const age = draft.dateOfBirth ? calculateAgeFromISO(draft.dateOfBirth) : null;
  const displayName = draft.vennzName?.trim() || draft.firstName?.trim() || 'Your name';
  const completionItems = [
    ['Name', Boolean(draft.firstName?.trim() || draft.vennzName?.trim())],
    ['Photos', (draft.photos?.length || 0) > 0],
    ['Introduction', Boolean(draft.introduction?.trim())],
    ['Location', Boolean(draft.city?.trim())],
    ['Work', Boolean(draft.designation?.trim() || draft.company?.trim())],
    ['Interests', Boolean(draft.interests?.length)],
  ] as const;
  const completion = Math.round((completionItems.filter(([, complete]) => complete).length / completionItems.length) * 100);

  const updateDraft = <K extends keyof UserProfile,>(key: K, value: UserProfile[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaveMessage('');
  };

  const handleSave = () => {
    const updatedProfile = { ...draft, profileUpdatedAt: Date.now() };
    updateProfile(updatedProfile);
    setDraft(updatedProfile);
    setIsEditing(false);
    setSaveMessage('Your profile is saved.');
  };

  const handleCancel = () => {
    setDraft({ ...profile, photos: [...(profile.photos || [])], interests: [...(profile.interests || [])] });
    setPhotoError('');
    setIsEditing(false);
  };

  const handlePhotoFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remaining = MAX_PHOTOS - (draft.photos?.length || 0);
    if (remaining <= 0) {
      setPhotoError('You can add up to six photos.');
      return;
    }
    try {
      const processed = await Promise.all(files.slice(0, remaining).map(compressPhoto));
      updateDraft('photos', [...(draft.photos || []), ...processed]);
      setPhotoError('');
    } catch {
      setPhotoError('One or more photos could not be added. Try another image.');
    }
    event.target.value = '';
  };

  const movePhoto = (index: number, direction: -1 | 1) => {
    const photos = [...(draft.photos || [])];
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    [photos[index], photos[target]] = [photos[target], photos[index]];
    updateDraft('photos', photos);
  };

  const toggleInterest = (interest: string) => {
    const interests = draft.interests || [];
    updateDraft('interests', interests.includes(interest)
      ? interests.filter((item) => item !== interest)
      : [...interests, interest]);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    color: colors.muted,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '42px',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    background: colors.field,
    color: colors.text,
    font: 'inherit',
    fontSize: '14px',
  };
  const sectionStyle: React.CSSProperties = {
    padding: '20px 0',
    borderTop: `1px solid ${colors.border}`,
  };

  const verificationItems: [string, boolean][] = [
    ['Phone number', Boolean(isPhoneVerified)],
    ['Identity', Boolean(isIdentityVerified || isDigiLockerVerified)],
    ['Selfie', Boolean(isSelfieVerified)],
  ];
  const verifiedCount = verificationItems.filter(([, verified]) => verified).length;
  const lastSaved = draft.profileUpdatedAt
    ? new Date(draft.profileUpdatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Not saved yet';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: colors.bg, color: colors.text, fontFamily: 'var(--font-sans)' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: isDark ? 'url(/discover-bg-dark.png)' : 'url(/discover-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.28, pointerEvents: 'none' }} />
      {showStatusBar && <div style={{ position: 'relative', zIndex: 2, background: isDark ? 'rgba(20, 14, 28, 0.98)' : 'rgba(250, 241, 243, 0.92)' }}><StatusBar variant={isDark ? 'light' : 'dark'} /></div>}
      <div style={{ position: 'relative', zIndex: 2 }}><MemberTopBar onLogoClick={onBack} /></div>

      <main style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ width: '100%', maxWidth: '900px', boxSizing: 'border-box', padding: '20px 22px 36px', margin: '0 auto' }}>
          <button type="button" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 0', border: 0, background: 'none', color: colors.muted, cursor: 'pointer', fontSize: '12px' }}>
            <ArrowLeft size={15} /> Back to You
          </button>

          <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', margin: '14px 0 20px' }}>
            <div>
              <div style={{ color: colors.muted, fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em' }}>YOUR PROFILE</div>
              <h1 style={{ margin: '5px 0 0', color: colors.accent, fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 400, lineHeight: 1.1 }}>{displayName}</h1>
              <p style={{ margin: '7px 0 0', color: colors.muted, fontSize: '13px' }}>{[draft.designation, draft.company, draft.city].filter(Boolean).join(' · ') || 'Add a few details to introduce yourself.'}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setIsPreviewOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', minHeight: '40px', padding: '0 14px', border: `1px solid ${colors.border}`, borderRadius: '22px', background: 'transparent', color: colors.accent, cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}><Eye size={15} /> Preview</button>
              {!isEditing ? (
                <button type="button" onClick={() => { setSaveMessage(''); setIsEditing(true); }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', minHeight: '40px', padding: '0 16px', border: 0, borderRadius: '22px', background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)', color: '#FFF8F8', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}><Pencil size={14} /> Edit profile</button>
              ) : (
                <>
                  <button type="button" onClick={handleCancel} style={{ minHeight: '40px', padding: '0 15px', border: `1px solid ${colors.border}`, borderRadius: '22px', background: 'transparent', color: colors.accent, cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>Cancel</button>
                  <button type="button" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', minHeight: '40px', padding: '0 16px', border: 0, borderRadius: '22px', background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)', color: '#FFF8F8', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}><Check size={15} /> Save changes</button>
                </>
              )}
            </div>
          </header>

          {saveMessage && <output style={{ display: 'block', margin: '0 0 16px', color: isDark ? '#A9D8AF' : '#2E7D32', fontSize: '13px' }}>{saveMessage}</output>}

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '20px', padding: '18px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: colors.surface }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={labelStyle}>Profile completeness</span>
                <strong style={{ color: colors.accent, fontSize: '13px' }}>{completion}%</strong>
              </div>
              <progress aria-label="Profile completeness" max={100} value={completion} style={{ display: 'block', width: '100%', height: '5px', margin: '4px 0 12px', accentColor: '#A1525F' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px 14px' }}>
                {completionItems.map(([label, complete]) => <span key={label} style={{ color: complete ? colors.accent : colors.muted, fontSize: '11px' }}>{complete ? '✓' : '○'} {label}</span>)}
              </div>
            </div>
            <div style={{ paddingLeft: '18px', borderLeft: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px', color: colors.accent, fontSize: '11px', fontWeight: 700 }}><ShieldCheck size={15} /> VERIFICATION {verifiedCount}/{verificationItems.length}</div>
              {verificationItems.map(([label, verified]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '4px 0', color: colors.muted, fontSize: '11px' }}><span>{label}</span><span style={{ color: verified ? (isDark ? '#A9D8AF' : '#2E7D32') : colors.muted }}>{verified ? 'Verified' : 'Incomplete'}</span></div>)}
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ margin: '0 0 12px', color: colors.accent, fontFamily: 'var(--font-serif)', fontSize: '21px', fontWeight: 400 }}>Photos</h2>
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handlePhotoFiles} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))', gap: '10px' }}>
              {(draft.photos || []).map((photo, index) => (
                <div key={`${photo.slice(0, 36)}-${index}`} style={{ position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', border: `1px solid ${colors.border}`, borderRadius: '6px', background: colors.field }}>
                  <img src={photo} alt={`Profile photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {index === 0 && <span style={{ position: 'absolute', left: '6px', bottom: '6px', padding: '4px 6px', borderRadius: '3px', background: 'rgba(20, 14, 28, 0.72)', color: '#fff', fontSize: '9px', fontWeight: 700 }}>MAIN PHOTO</span>}
                  {isEditing && <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '3px' }}>
                    <button type="button" aria-label={`Move photo ${index + 1} left`} title="Make earlier" disabled={index === 0} onClick={() => movePhoto(index, -1)} style={{ display: 'grid', placeItems: 'center', width: '27px', height: '27px', border: 0, borderRadius: '50%', background: 'rgba(20, 14, 28, 0.76)', color: '#fff', cursor: 'pointer' }}><ArrowUp size={14} /></button>
                    <button type="button" aria-label={`Move photo ${index + 1} right`} title="Make later" disabled={index === (draft.photos?.length || 0) - 1} onClick={() => movePhoto(index, 1)} style={{ display: 'grid', placeItems: 'center', width: '27px', height: '27px', border: 0, borderRadius: '50%', background: 'rgba(20, 14, 28, 0.76)', color: '#fff', cursor: 'pointer' }}><ArrowDown size={14} /></button>
                    <button type="button" aria-label={`Remove photo ${index + 1}`} title="Remove photo" onClick={() => updateDraft('photos', (draft.photos || []).filter((_, photoIndex) => photoIndex !== index))} style={{ display: 'grid', placeItems: 'center', width: '27px', height: '27px', border: 0, borderRadius: '50%', background: 'rgba(125, 27, 43, 0.88)', color: '#fff', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>}
                </div>
              ))}
              {isEditing && (draft.photos?.length || 0) < MAX_PHOTOS && <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', aspectRatio: '4 / 5', border: `1px dashed ${colors.border}`, borderRadius: '6px', background: 'transparent', color: colors.muted, cursor: 'pointer', fontSize: '11px' }}><Plus size={19} /> Add photo</button>}
            </div>
            {photoError && <p role="alert" style={{ margin: '8px 0 0', color: '#B91C1C', fontSize: '12px' }}>{photoError}</p>}
          </section>

          <section style={sectionStyle}>
            <h2 style={{ margin: '0 0 14px', color: colors.accent, fontFamily: 'var(--font-serif)', fontSize: '21px', fontWeight: 400 }}>About you</h2>
            {isEditing ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
              <label><span style={labelStyle}>Display name</span><input style={inputStyle} value={draft.vennzName || draft.firstName || ''} onChange={(event) => { updateDraft('vennzName', event.target.value); updateDraft('firstName', event.target.value); }} /></label>
              <label><span style={labelStyle}>City</span><input style={inputStyle} value={draft.city || ''} onChange={(event) => updateDraft('city', event.target.value)} /></label>
              <label><span style={labelStyle}>Job title</span><input style={inputStyle} value={draft.designation || ''} onChange={(event) => updateDraft('designation', event.target.value)} /></label>
              <label><span style={labelStyle}>Company</span><input style={inputStyle} value={draft.company || ''} onChange={(event) => updateDraft('company', event.target.value)} /></label>
              <label><span style={labelStyle}>Current status</span><input style={inputStyle} value={draft.currentStatus || ''} onChange={(event) => updateDraft('currentStatus', event.target.value)} /></label>
              <label><span style={labelStyle}>Gender identity</span><select style={inputStyle} value={draft.genderIdentity || ''} onChange={(event) => updateDraft('genderIdentity', event.target.value)}><option value="">Select identity</option><option value="WOMAN">Woman</option><option value="MAN">Man</option><option value="NON-BINARY">Non-binary</option><option value="PREFER TO SELF-DESCRIBE">Self-describe</option><option value="PREFER NOT TO SAY">Prefer not to say</option></select></label>
              {draft.genderIdentity === 'PREFER TO SELF-DESCRIBE' && <label><span style={labelStyle}>Describe your gender</span><input style={inputStyle} value={draft.selfDescribeGender || ''} onChange={(event) => updateDraft('selfDescribeGender', event.target.value)} /></label>}
              <label><span style={labelStyle}>Dating preference</span><select style={inputStyle} value={draft.datingPreference || ''} onChange={(event) => updateDraft('datingPreference', event.target.value)}><option value="">Select preference</option><option value="WOMEN">Women</option><option value="MEN">Men</option><option value="EVERYONE">Everyone</option></select></label>
              <label><span style={labelStyle}>LinkedIn URL</span><input style={inputStyle} value={draft.linkedinUrl || ''} onChange={(event) => updateDraft('linkedinUrl', event.target.value)} placeholder="linkedin.com/in/you" /></label>
              <label><span style={labelStyle}>Instagram username</span><input style={inputStyle} value={draft.instagramUsername || ''} onChange={(event) => updateDraft('instagramUsername', event.target.value)} placeholder="@username" /></label>
              <label style={{ gridColumn: '1 / -1' }}><span style={labelStyle}>Introduction</span><textarea style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }} value={draft.introduction || ''} onChange={(event) => updateDraft('introduction', event.target.value)} maxLength={500} /><span style={{ display: 'block', marginTop: '4px', color: colors.muted, textAlign: 'right', fontSize: '10px' }}>{(draft.introduction || '').length}/500</span></label>
            </div> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
              <Value label="Name" value={displayName} colors={colors} />
              <Value label="Age" value={age && age > 0 ? `${age}` : 'Not added'} colors={colors} />
              <Value label="City" value={draft.showCityPublicly === false ? 'Hidden from other members' : draft.city} colors={colors} />
              <Value label="Work" value={draft.showWorkPublicly === false ? 'Hidden from other members' : [draft.designation, draft.company].filter(Boolean).join(' · ')} colors={colors} />
              <Value label="Current status" value={draft.currentStatus} colors={colors} />
              <Value label="Dating preference" value={draft.datingPreference} colors={colors} />
              <div style={{ gridColumn: '1 / -1' }}><Value label="Introduction" value={draft.introduction} colors={colors} /></div>
            </div>}
          </section>

          <section style={sectionStyle}>
            <h2 style={{ margin: '0 0 5px', color: colors.accent, fontFamily: 'var(--font-serif)', fontSize: '21px', fontWeight: 400 }}>Private account details</h2>
            <p style={{ margin: '0 0 12px', color: colors.muted, fontSize: '11px' }}>Only you can see these details. They are never included in your member profile preview.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
              <Value label="Legal name" value={draft.legalName || draft.firstName} colors={colors} />
              <Value label="Date of birth" value={draft.dateOfBirth ? new Date(`${draft.dateOfBirth}T00:00:00`).toLocaleDateString() : ''} colors={colors} />
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ margin: '0 0 12px', color: colors.accent, fontFamily: 'var(--font-serif)', fontSize: '21px', fontWeight: 400 }}>Interests</h2>
            {isEditing ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{['Art', 'Books', 'Cooking', 'Fitness', 'Hiking', 'Music', 'Photography', 'Startups', 'Tech', 'Travel', 'Yoga', 'Cycling', 'Coffee', 'Cinema', 'Theatre', 'Investing', 'Sports', 'Dancing', 'Poetry'].map((interest) => {
              const selected = (draft.interests || []).includes(interest);
              return <button key={interest} type="button" aria-pressed={selected} onClick={() => toggleInterest(interest)} style={{ minHeight: '34px', padding: '0 12px', border: `1px solid ${selected ? '#A1525F' : colors.border}`, borderRadius: '18px', background: selected ? (isDark ? 'rgba(199, 87, 124, 0.25)' : 'rgba(199, 87, 124, 0.12)') : 'transparent', color: colors.accent, cursor: 'pointer', fontSize: '11px' }}>{interest}</button>;
            })}</div> : (draft.interests || []).length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{draft.interests?.map((interest) => <span key={interest} style={{ padding: '7px 11px', border: `1px solid ${colors.border}`, borderRadius: '18px', color: colors.accent, fontSize: '11px' }}>{interest}</span>)}</div> : <p style={{ color: colors.muted, fontSize: '13px' }}>No interests added yet.</p>}
          </section>

          <section style={sectionStyle}>
            <h2 style={{ margin: '0 0 6px', color: colors.accent, fontFamily: 'var(--font-serif)', fontSize: '21px', fontWeight: 400 }}>Privacy & visibility</h2>
            <p style={{ margin: '0 0 12px', color: colors.muted, fontSize: '12px', lineHeight: 1.5 }}>Choose what other members can see. Your legal name and date of birth are never shown.</p>
            <PrivacyToggle label="Show my age" checked={draft.showAgePublicly !== false} disabled={!isEditing} onChange={(checked) => updateDraft('showAgePublicly', checked)} colors={colors} />
            <PrivacyToggle label="Show my city" checked={draft.showCityPublicly !== false} disabled={!isEditing} onChange={(checked) => updateDraft('showCityPublicly', checked)} colors={colors} />
            <PrivacyToggle label="Show my work details" checked={draft.showWorkPublicly !== false} disabled={!isEditing} onChange={(checked) => updateDraft('showWorkPublicly', checked)} colors={colors} />
            <PrivacyToggle label="Show my LinkedIn" checked={Boolean(draft.showLinkedinPublicly)} disabled={!isEditing || !draft.linkedinUrl} onChange={(checked) => updateDraft('showLinkedinPublicly', checked)} colors={colors} />
            <PrivacyToggle label="Show my Instagram" checked={Boolean(draft.showInstagramPublicly)} disabled={!isEditing || !draft.instagramUsername} onChange={(checked) => updateDraft('showInstagramPublicly', checked)} colors={colors} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '12px 0', borderTop: `1px solid ${colors.border}` }}>
              <div><strong style={{ display: 'block', color: colors.text, fontSize: '13px' }}>Profile visibility</strong><span style={{ color: colors.muted, fontSize: '11px' }}>Hidden profiles are not shown in Discover.</span></div>
              <button type="button" role="switch" aria-checked={draft.profileVisibility !== 'hidden'} disabled={!isEditing} onClick={() => updateDraft('profileVisibility', draft.profileVisibility === 'hidden' ? 'visible' : 'hidden')} style={{ width: '48px', height: '27px', padding: '3px', border: 0, borderRadius: '16px', background: draft.profileVisibility === 'hidden' ? '#8C8087' : '#A1525F', cursor: isEditing ? 'pointer' : 'default', opacity: isEditing ? 1 : 0.72 }}><span style={{ display: 'block', width: '21px', height: '21px', borderRadius: '50%', background: '#fff', transform: draft.profileVisibility === 'hidden' ? 'translateX(0)' : 'translateX(21px)', transition: 'transform 0.15s ease' }} /></button>
            </div>
          </section>

          <footer style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px', paddingTop: '14px', borderTop: `1px solid ${colors.border}`, color: colors.muted, fontSize: '11px' }}>
            <span>Last saved: {lastSaved}</span>
            {draft.profileVisibility === 'hidden' && <span>Profile hidden from Discover</span>}
          </footer>
        </div>
      </main>

      <MemberBottomNav activeTab="you" onSelectTab={onSelectTab} showHomeIndicator={showHomeIndicator} />

      {isPreviewOpen && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsPreviewOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px', background: 'rgba(15, 8, 13, 0.76)', backdropFilter: 'blur(5px)' }}>
        <section role="dialog" aria-modal="true" aria-labelledby="profile-preview-title" style={{ position: 'relative', width: '100%', maxWidth: '560px', maxHeight: '88vh', overflowY: 'auto', padding: '22px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: colors.bg, color: colors.text }}>
          <button type="button" aria-label="Close preview" onClick={() => setIsPreviewOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', display: 'grid', placeItems: 'center', width: '34px', height: '34px', border: `1px solid ${colors.border}`, borderRadius: '50%', background: 'transparent', color: colors.accent, cursor: 'pointer' }}><X size={16} /></button>
          <span style={labelStyle}>PREVIEW AS OTHER MEMBERS SEE YOU</span>
          <h2 id="profile-preview-title" style={{ margin: '8px 44px 14px 0', color: colors.accent, fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400 }}>{displayName}{draft.showAgePublicly !== false && age && age > 0 ? `, ${age}` : ''}</h2>
          {(draft.photos || []).length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '8px', marginBottom: '15px' }}>{draft.photos?.map((photo, index) => <img key={`${photo.slice(0, 30)}-${index}`} src={photo} alt={`Preview photo ${index + 1}`} style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '5px' }} />)}</div>}
          {draft.city && draft.showCityPublicly !== false && <p style={{ color: colors.muted, fontSize: '13px' }}>{draft.city}</p>}
          {draft.showWorkPublicly !== false && (draft.designation || draft.company) && <p style={{ color: colors.muted, fontSize: '13px' }}>{[draft.designation, draft.company].filter(Boolean).join(' · ')}</p>}
          {draft.introduction && <p style={{ color: colors.text, fontFamily: 'var(--font-serif)', fontSize: '16px', lineHeight: 1.6 }}>{draft.introduction}</p>}
          {(draft.interests || []).length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', margin: '12px 0' }}>{draft.interests?.map((interest) => <span key={interest} style={{ padding: '6px 10px', border: `1px solid ${colors.border}`, borderRadius: '16px', color: colors.accent, fontSize: '11px' }}>{interest}</span>)}</div>}
          {draft.showLinkedinPublicly && draft.linkedinUrl && <p style={{ fontSize: '12px' }}>LinkedIn: {draft.linkedinUrl}</p>}
          {draft.showInstagramPublicly && draft.instagramUsername && <p style={{ fontSize: '12px' }}>Instagram: {draft.instagramUsername}</p>}
          <p style={{ paddingTop: '12px', borderTop: `1px solid ${colors.border}`, color: colors.muted, fontSize: '10px' }}>Your legal name and full date of birth remain private.</p>
        </section>
      </div>}
    </div>
  );
};

const Value: React.FC<{ label: string; value?: string | null; colors: { text: string; muted: string } }> = ({ label, value, colors }) => (
  <div>
    <span style={{ display: 'block', marginBottom: '5px', color: colors.muted, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
    <span style={{ color: colors.text, fontSize: '13px', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{value?.trim() || 'Not added'}</span>
  </div>
);

const PrivacyToggle: React.FC<{
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
  colors: { text: string; muted: string; border: string };
}> = ({ label, checked, disabled, onChange, colors }) => (
  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderTop: `1px solid ${colors.border}`, color: disabled && !checked ? colors.muted : colors.text, fontSize: '12px', opacity: disabled ? 0.76 : 1 }}>
    <span>{label}</span>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} style={{ width: '17px', height: '17px', accentColor: '#A1525F' }} />
  </label>
);