import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';

interface Page4ProfileScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
  isUpdatingPhotosMode?: boolean;
  onPhotosUpdated?: () => void;
}

const SAMPLE_PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
];

// Helper: Convert YYYY-MM-DD to DD/MM/YYYY
const isoToDisplayDate = (iso: string): string => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year && month && day) return `${day}/${month}/${year}`;
  }
  return iso;
};

// Helper: Check valid calendar date
const isValidCalendarDate = (day: number, month: number, year: number): boolean => {
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
};

export const Page4ProfileScreen: React.FC<Page4ProfileScreenProps> = ({
  onBack,
  onSuccess,
  showStatusBar = true,
  showHomeIndicator = true,
  isUpdatingPhotosMode = false,
  onPhotosUpdated,
}) => {
  const {
    profile,
    updateProfile,
    isPhoneVerified,
    phoneNumber,
    countryCode,
    appearanceMode,
    setApplicationDecision,
  } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  // Track initial photos snapshot when entering to verify genuinely new photos are added
  const initialPhotosRef = useRef<string[]>([...(profile.photos || [])]);

  // Form State
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || '');
  const [rawDobInput, setRawDobInput] = useState(
    profile.dateOfBirth ? isoToDisplayDate(profile.dateOfBirth) : ''
  );
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  const [city, setCity] = useState(profile.city || '');
  const [genderIdentity, setGenderIdentity] = useState(profile.genderIdentity || '');
  const [selfDescribeGender, setSelfDescribeGender] = useState(profile.selfDescribeGender || '');
  const [datingPreference, setDatingPreference] = useState(profile.datingPreference || '');
  const [currentStatus, setCurrentStatus] = useState(profile.currentStatus || '');
  const [designation, setDesignation] = useState(profile.designation || '');
  const [company, setCompany] = useState(profile.company || '');
  const [photos, setPhotos] = useState<string[]>(profile.photos || []);
  const [invitationCode, setInvitationCode] = useState(profile.invitationCode || '');
  const [introduction, setIntroduction] = useState(profile.introduction || '');

  // Validation Errors State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photosSectionRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to photos section if opened in photo update mode
  useEffect(() => {
    if (isUpdatingPhotosMode && photosSectionRef.current) {
      setTimeout(() => {
        photosSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [isUpdatingPhotosMode]);

  // Auto-sync form changes into auth context so data isn't lost if user navigates back
  useEffect(() => {
    updateProfile({
      firstName,
      dateOfBirth,
      city,
      genderIdentity,
      selfDescribeGender,
      datingPreference,
      currentStatus,
      designation,
      company,
      photos,
      invitationCode,
      introduction,
    });
  }, [
    firstName,
    dateOfBirth,
    city,
    genderIdentity,
    selfDescribeGender,
    datingPreference,
    currentStatus,
    designation,
    company,
    photos,
    invitationCode,
    introduction,
  ]);

  // Calculate age from YYYY-MM-DD
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle manual typing of DOB (DD / MM / YYYY)
  const handleManualDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    // Allow deleting smoothly
    if (inputVal.length < rawDobInput.length) {
      setRawDobInput(inputVal);
      setDateOfBirth('');
      return;
    }

    // Extract digits only (max 8)
    const digits = inputVal.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length > 0) {
      formatted = digits.slice(0, 2);
      if (digits.length > 2) {
        formatted += '/' + digits.slice(2, 4);
      }
      if (digits.length > 4) {
        formatted += '/' + digits.slice(4, 8);
      }
    }

    setRawDobInput(formatted);

    // When all 8 digits (DD/MM/YYYY) are entered
    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year = parseInt(digits.slice(4, 8), 10);

      if (isValidCalendarDate(day, month, year)) {
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const birthDate = new Date(iso);
        const today = new Date();
        if (birthDate > today) {
          setErrors((prev) => ({ ...prev, dateOfBirth: 'Date of birth cannot be in the future.' }));
          setDateOfBirth('');
        } else {
          const age = calculateAge(iso);
          if (age < 18) {
            setErrors((prev) => ({ ...prev, dateOfBirth: 'You must be 18 or older to join VennZ.' }));
          } else {
            setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
          }
          setDateOfBirth(iso);
        }
      } else {
        setErrors((prev) => ({ ...prev, dateOfBirth: 'Please enter a valid date (DD/MM/YYYY).' }));
        setDateOfBirth('');
      }
    } else {
      setDateOfBirth('');
      if (errors.dateOfBirth) {
        setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
      }
    }
  };

  // Handle native calendar picker selection (YYYY-MM-DD)
  const handleCalendarPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (isoVal) {
      setDateOfBirth(isoVal);
      setRawDobInput(isoToDisplayDate(isoVal));
      setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
      const age = calculateAge(isoVal);
      if (age < 18) {
        setErrors((prev) => ({ ...prev, dateOfBirth: 'You must be 18 or older to join VennZ.' }));
      }
    }
  };

  // Validate fields
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 1. Name validation
    const trimmedName = firstName.trim();
    if (!trimmedName) {
      newErrors.firstName = 'Public first name is required.';
    } else if (/\d/.test(trimmedName)) {
      newErrors.firstName = 'Please enter a valid name (cannot contain numbers).';
    } else if (!/^[A-Za-z\s'-]{2,50}$/.test(trimmedName)) {
      newErrors.firstName = 'Please enter a valid alphabetic name.';
    }

    // 2. DOB & Age validation
    if (!dateOfBirth) {
      if (rawDobInput.trim()) {
        newErrors.dateOfBirth = 'Please enter a complete and valid date (DD/MM/YYYY).';
      } else {
        newErrors.dateOfBirth = 'Date of birth is required.';
      }
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
      } else {
        const age = calculateAge(dateOfBirth);
        if (age < 18) {
          newErrors.dateOfBirth = 'You must be 18 or older to join VennZ.';
        }
      }
    }

    // 3. City validation
    if (!city.trim()) {
      newErrors.city = 'City is required.';
    }

    // 4. Gender Identity validation
    if (!genderIdentity) {
      newErrors.genderIdentity = 'Please select your gender identity.';
    } else if (genderIdentity === 'PREFER TO SELF-DESCRIBE' && !selfDescribeGender.trim()) {
      newErrors.selfDescribeGender = 'Please specify how you self-describe.';
    }

    // 5. Dating Preference validation
    if (!datingPreference) {
      newErrors.datingPreference = 'Please select your dating preference.';
    }

    // 6. Current Status validation
    if (!currentStatus) {
      newErrors.currentStatus = 'Please select your current status.';
    }

    // 7. Designation / Role validation (Compulsory)
    if (!designation.trim()) {
      newErrors.designation = 'Designation or role is required.';
    }

    // 7. Photographs validation: Min 2, Max 6
    if (photos.length < 2) {
      newErrors.photos = 'Add at least 2 photos to continue.';
    } else if (photos.length > 6) {
      newErrors.photos = 'You can upload a maximum of 6 photos.';
    } else if (isUpdatingPhotosMode) {
      // If user came here to update photos (from "more info"), verify they actually added at least one NEW photo
      const initial = initialPhotosRef.current;
      const hasAddedNewPhoto = photos.some((p) => !initial.includes(p));

      if (!hasAddedNewPhoto) {
        newErrors.photos =
          'A new photograph is required. Please add or replace with at least one new clear photograph before submitting.';
      }
    }

    // 8. Introduction validation (Compulsory two-line introduction)
    const trimmedIntro = introduction.trim();
    if (!trimmedIntro) {
      newErrors.introduction = 'A two-line introduction is required as it will be shown on your profile.';
    } else if (trimmedIntro.length > 140) {
      newErrors.introduction = 'Introduction must not exceed 140 characters.';
    }

    // 9. Phone number verification check
    const isIndian = !countryCode || countryCode === '+91';
    if (!isIndian) {
      newErrors.general = 'Only Indian phone numbers (+91) are currently accepted.';
    } else if (!isPhoneVerified && phoneNumber) {
      newErrors.general = 'Your phone number must be verified on the previous screen before continuing.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      updateProfile({
        firstName,
        dateOfBirth,
        city,
        genderIdentity,
        selfDescribeGender,
        datingPreference,
        currentStatus,
        designation,
        company,
        photos,
        invitationCode,
        introduction,
      });

      if (isUpdatingPhotosMode) {
        sessionStorage.setItem('ic_photos_just_updated', 'true');
        setApplicationDecision(null);
        if (onPhotosUpdated) {
          onPhotosUpdated();
        }
      } else {
        onSuccess();
      }
    }
  };

// Helper: Downscale & compress high-res camera photos (e.g. 12MP/24MP iPhone photos) to prevent memory crashes & storage quota errors on mobile WebKit
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (file.size < 150 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const maxDim = 900;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
};

  // Handle Photo Upload with Mobile Memory Protection
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 6 - photos.length;
    if (remainingSlots <= 0) {
      setErrors((prev) => ({ ...prev, photos: 'Maximum 6 photos allowed.' }));
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    for (const file of filesToProcess) {
      try {
        const compressedBase64 = await compressImageFile(file);
        if (compressedBase64) {
          setPhotos((prev) => {
            if (prev.length >= 6) return prev;
            return [...prev, compressedBase64];
          });
          setErrors((prev) => {
            const next = { ...prev };
            delete next.photos;
            return next;
          });
        }
      } catch {
        // Safe fail
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddSamplePhotos = () => {
    if (isUpdatingPhotosMode) {
      // Find a sample photo that is NOT in initial photos and NOT in current photos
      const candidate =
        SAMPLE_PORTRAITS.find(
          (p) => !initialPhotosRef.current.includes(p) && !photos.includes(p)
        ) ||
        SAMPLE_PORTRAITS.find((p) => !photos.includes(p)) ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80';

      if (photos.length >= 6) {
        setPhotos((prev) => [...prev.slice(0, 5), candidate]);
      } else {
        setPhotos((prev) => [...prev, candidate]);
      }
    } else {
      setPhotos(SAMPLE_PORTRAITS.slice(0, 3));
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photos;
      return next;
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: isDark ? '#050104' : '#FAF6F0',
        color: isDark ? '#F3EEE9' : 'var(--color-espresso)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Clean Parchment Watercolor Foliage Background (with Cream flowers in Dark Mode) */}
      <img
        src={isDark ? '/profile-bg-dark.png' : '/profile-bg.jpg'}
        alt="VennZ Profile Setup Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Foreground Scrollable Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Top Fixed Area: Status Bar & Back Button */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: isDark ? 'rgba(5, 1, 4, 0.88)' : 'rgba(250, 246, 240, 0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          {showStatusBar && <StatusBar variant={isDark ? 'light' : 'dark'} />}

          {/* ← BACK & Step Indicator */}
          <div
            style={{
              padding: '6px 24px 8px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDark ? '#F5EFEB' : 'var(--color-mulberry)',
                cursor: 'pointer',
                padding: '6px 8px',
                marginLeft: '-8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'opacity 0.15s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              <span>BACK</span>
            </button>

            {/* Subtle Step Indicator */}
            <span
              style={{
                fontSize: '13px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: isDark ? '#B3A1A8' : '#8A7A84',
              }}
            >
              PROFILE
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', padding: '24px 24px 48px 24px', textAlign: 'left', boxSizing: 'border-box' }}>
          {/* Main Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 3.8vw, 42px)',
              lineHeight: '1.15',
              fontWeight: 400,
              color: isDark ? '#FBF7F2' : 'var(--color-mulberry)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.01em',
            }}
          >
            A short profile.
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.5',
              color: isDark ? '#BDB0B6' : '#6E5E68',
              margin: '0 0 26px 0',
            }}
          >
            Tell us a bit about who you are and what you're looking for. Hand-reviewed before your profile goes live.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* 1. PUBLIC FIRST NAME */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                PUBLIC FIRST NAME <span style={{ color: '#E06D6D' }}>*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                }}
                placeholder="e.g. Ananya"
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: errors.firstName ? '1.5px solid #E06D6D' : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {errors.firstName && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.firstName}</div>
              )}
            </div>

            {/* 2. DATE OF BIRTH */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                DATE OF BIRTH <span style={{ color: '#E06D6D' }}>*</span>
              </label>
              {/* Dual Input: Manual Typing (DD / MM / YYYY) + Calendar Picker Button */}
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rawDobInput}
                  onChange={handleManualDobChange}
                  placeholder="DD / MM / YYYY"
                  maxLength={10}
                  style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '13px',
                    border: errors.dateOfBirth ? '1.5px solid #E06D6D' : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                    backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                    padding: '0 52px 0 16px',
                    fontSize: '16px',
                    fontFamily: 'var(--font-sans)',
                    color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                    letterSpacing: '0.04em',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Hidden Native Date Input for Calendar Picker */}
                <input
                  ref={datePickerRef}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={dateOfBirth}
                  onChange={handleCalendarPickerChange}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    width: 0,
                    height: 0,
                    bottom: 0,
                    right: 0,
                  }}
                  tabIndex={-1}
                  aria-hidden="true"
                />

                {/* Calendar Icon Button */}
                <button
                  type="button"
                  onClick={() => {
                    const el = datePickerRef.current;
                    if (!el) return;
                    try {
                      if (typeof (el as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
                        (el as HTMLInputElement & { showPicker?: () => void }).showPicker!();
                      } else {
                        el.click();
                      }
                    } catch (err) {
                      el.click();
                    }
                  }}
                  title="Choose from calendar"
                  aria-label="Open calendar picker"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(73, 40, 61, 0.08)',
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(73, 40, 61, 0.16)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(73, 40, 61, 0.08)';
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                    <path d="M8 14h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 18h.01" />
                    <path d="M12 18h.01" />
                    <path d="M16 18h.01" />
                  </svg>
                </button>
              </div>
              {!dateOfBirth ? (
                <div style={{ fontSize: '13.5px', color: isDark ? '#B3A1A8' : '#8A7A84', marginTop: '6px', lineHeight: '1.4' }}>
                  Must be 18 years or older. Your exact birthdate is never displayed publicly.
                </div>
              ) : (
                <div style={{ marginTop: '6px', lineHeight: '1.4' }}>
                  <div
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 700,
                      color: calculateAge(dateOfBirth) >= 18 ? (isDark ? '#F0D4B8' : 'var(--color-mulberry)') : '#E06D6D',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {calculateAge(dateOfBirth)} years old
                  </div>
                  <div style={{ fontSize: '13px', color: isDark ? '#B3A1A8' : '#8A7A84', marginTop: '2px' }}>
                    Your exact birthdate is never displayed publicly
                  </div>
                </div>
              )}
              {errors.dateOfBirth && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '4px' }}>{errors.dateOfBirth}</div>
              )}
            </div>

            {/* 3. CITY */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                CITY <span style={{ color: '#E06D6D' }}>*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                }}
                placeholder="Enter your city (e.g. Mumbai)"
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: errors.city ? '1.5px solid #E06D6D' : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {errors.city && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.city}</div>
              )}
            </div>

            {/* 4. GENDER IDENTITY */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                GENDER IDENTITY <span style={{ color: '#E06D6D' }}>*</span>
              </label>
              <select
                value={genderIdentity}
                onChange={(e) => {
                  setGenderIdentity(e.target.value);
                  if (errors.genderIdentity) setErrors((prev) => ({ ...prev, genderIdentity: '' }));
                }}
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: errors.genderIdentity ? '1.5px solid #E06D6D' : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: genderIdentity ? (isDark ? '#FBF7F2' : 'var(--color-espresso)') : (isDark ? '#8A7A84' : '#8A7A84'),
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>Select gender identity...</option>
                <option value="WOMAN" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>WOMAN</option>
                <option value="MAN" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>MAN</option>
                <option value="NON-BINARY" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>NON-BINARY</option>
                <option value="PREFER TO SELF-DESCRIBE" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>PREFER TO SELF-DESCRIBE</option>
              </select>

              {/* Self-Describe Sub-Input */}
              {genderIdentity === 'PREFER TO SELF-DESCRIBE' && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    value={selfDescribeGender}
                    onChange={(e) => {
                      setSelfDescribeGender(e.target.value);
                      if (errors.selfDescribeGender) setErrors((prev) => ({ ...prev, selfDescribeGender: '' }));
                    }}
                    placeholder="Describe your gender identity"
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '12px',
                      border: errors.selfDescribeGender ? '1.5px solid #E06D6D' : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                      backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                      padding: '0 14px',
                      fontSize: '16px',
                      color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.selfDescribeGender && (
                    <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '4px' }}>
                      {errors.selfDescribeGender}
                    </div>
                  )}
                </div>
              )}
              {errors.genderIdentity && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.genderIdentity}</div>
              )}
            </div>

            {/* 5. INTERESTED IN DATING */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                INTERESTED IN DATING <span style={{ color: '#E06D6D' }}>*</span>
              </label>
              <select
                value={datingPreference}
                onChange={(e) => {
                  setDatingPreference(e.target.value);
                  if (errors.datingPreference) setErrors((prev) => ({ ...prev, datingPreference: '' }));
                }}
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: errors.datingPreference ? '1.5px solid #E06D6D' : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: datingPreference ? (isDark ? '#FBF7F2' : 'var(--color-espresso)') : (isDark ? '#8A7A84' : '#8A7A84'),
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>Select dating preference...</option>
                <option value="WOMEN" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>WOMEN</option>
                <option value="MEN" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>MEN</option>
                <option value="EVERYONE" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>EVERYONE</option>
              </select>
              {errors.datingPreference && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.datingPreference}</div>
              )}
            </div>

            {/* 6. CURRENT STATUS */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                CURRENT STATUS <span style={{ color: '#E06D6D' }}>*</span>
              </label>
              <select
                value={currentStatus}
                onChange={(e) => {
                  setCurrentStatus(e.target.value);
                  if (errors.currentStatus) setErrors((prev) => ({ ...prev, currentStatus: '' }));
                }}
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: errors.currentStatus ? '1.5px solid #E06D6D' : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: currentStatus ? (isDark ? '#FBF7F2' : 'var(--color-espresso)') : (isDark ? '#8A7A84' : '#8A7A84'),
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>Select current status...</option>
                <option value="WORKING" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>WORKING</option>
                <option value="FOUNDER / ENTREPRENEUR" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>FOUNDER / ENTREPRENEUR</option>
                <option value="STUDENT" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>STUDENT</option>
                <option value="SELF-EMPLOYED / FREELANCER" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>SELF-EMPLOYED / FREELANCER</option>
                <option value="OTHER" style={{ backgroundColor: isDark ? '#1C1218' : '#FFFFFF', color: isDark ? '#FBF7F2' : '#272124' }}>OTHER</option>
              </select>
              {errors.currentStatus && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.currentStatus}</div>
              )}
            </div>

            {/* 7. DESIGNATION OR ROLE (COMPULSORY) */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                DESIGNATION OR ROLE <span style={{ color: '#E06D6D' }}>*</span>
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => {
                  setDesignation(e.target.value);
                  if (errors.designation) setErrors((prev) => ({ ...prev, designation: '' }));
                }}
                placeholder="e.g. Product Manager"
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: errors.designation ? '1.5px solid #E06D6D' : isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {errors.designation && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.designation}</div>
              )}
            </div>

            {/* 8. COMPANY (OPTIONAL) */}
            <div style={{ marginBottom: '28px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '8px',
                }}
              >
                COMPANY <span style={{ color: isDark ? '#B3A1A8' : '#8A7A84', fontWeight: 400 }}>(OPTIONAL)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: '13px',
                  border: isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0 16px',
                  fontSize: '16.5px',
                  fontFamily: 'var(--font-sans)',
                  color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* DIVIDER */}
            <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.12)', margin: '28px 0' }} />

            {/* 9. PHOTOGRAPHS SECTION */}
            <div ref={photosSectionRef} style={{ marginBottom: '28px' }}>
              {isUpdatingPhotosMode && (
                <div
                  style={{
                    backgroundColor: isDark ? 'rgba(217, 119, 6, 0.2)' : 'rgba(217, 119, 6, 0.12)',
                    border: '1.5px solid rgba(217, 119, 6, 0.4)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>📸</span>
                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: isDark ? '#FBBF24' : '#B45309',
                        marginBottom: '2px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Photo Update Requested
                    </div>
                    <div style={{ fontSize: '12.5px', color: isDark ? '#FDE68A' : '#78350F', lineHeight: '1.4' }}>
                      Add or replace with a clearer photograph to continue your membership review.
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  }}
                >
                  PHOTOGRAPHS <span style={{ color: '#E06D6D' }}>*</span>
                </label>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: photos.length >= 2 ? (isDark ? '#86EFAC' : '#2E7D32') : (isDark ? '#F0D4B8' : 'var(--color-mulberry)'),
                  }}
                >
                  {photos.length} / 6 added
                </span>
              </div>

              <p
                style={{
                  fontSize: '14.5px',
                  lineHeight: '1.45',
                  color: isDark ? '#BDB0B6' : '#6E5E68',
                  margin: '0 0 14px 0',
                }}
              >
                Between two and six clear photographs of you. Reviewed by hand before your profile goes live.
              </p>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />

              {/* Photo Upload Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                {photos.map((photoUrl, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      aspectRatio: '3/4',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(73, 40, 61, 0.08)',
                      border: isDark ? '1.5px solid rgba(243, 238, 233, 0.18)' : '1.5px solid rgba(73, 40, 61, 0.15)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt={`Uploaded profile ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />

                    {/* Primary Badge for Photo 1 */}
                    {index === 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          backgroundColor: 'rgba(73, 40, 61, 0.85)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        MAIN
                      </span>
                    )}

                    {/* Remove Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      aria-label="Remove photo"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: '#FFFFFF',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Empty / Add Tile (if < 6 photos) */}
                {photos.length < 6 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: '3/4',
                      borderRadius: '14px',
                      border: isDark ? '1.5px dashed rgba(243, 238, 233, 0.35)' : '1.5px dashed rgba(73, 40, 61, 0.35)',
                      backgroundColor: isDark ? 'rgba(24, 15, 20, 0.55)' : 'rgba(255, 255, 255, 0.45)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease, border-color 0.15s ease',
                      padding: '8px',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(24, 15, 20, 0.8)' : 'rgba(255, 255, 255, 0.75)';
                      e.currentTarget.style.borderColor = isDark ? '#F0D4B8' : 'var(--color-mulberry)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(24, 15, 20, 0.55)' : 'rgba(255, 255, 255, 0.45)';
                      e.currentTarget.style.borderColor = isDark ? 'rgba(243, 238, 233, 0.35)' : 'rgba(73, 40, 61, 0.35)';
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? 'rgba(240, 212, 184, 0.15)' : 'rgba(73, 40, 61, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                        fontSize: '20px',
                        marginBottom: '4px',
                      }}
                    >
                      +
                    </div>
                    <span
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      ADD
                    </span>
                  </div>
                )}
              </div>

              {/* Fast Demo Sample Photos Helper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAddSamplePhotos}
                  style={{
                    background: isDark ? 'rgba(240, 212, 184, 0.12)' : 'rgba(73, 40, 61, 0.08)',
                    border: isDark ? '1px solid rgba(240, 212, 184, 0.3)' : '1px solid rgba(73, 40, 61, 0.2)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isUpdatingPhotosMode ? '✦ Demo: Add 1 New Sample Photo' : '✦ Demo: Fill 3 Sample Photos'}
                </button>
                {photos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPhotos([])}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      color: isDark ? '#B3A1A8' : '#8A7A84',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {errors.photos && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '6px' }}>{errors.photos}</div>
              )}
            </div>

            {/* DIVIDER */}
            <div style={{ height: '1px', backgroundColor: isDark ? 'rgba(243, 238, 233, 0.08)' : 'rgba(73, 40, 61, 0.12)', margin: '28px 0' }} />

            {/* 10. INVITATION CODE (OPTIONAL) */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  marginBottom: '5px',
                }}
              >
                INVITATION CODE <span style={{ color: isDark ? '#B3A1A8' : '#8A7A84', fontWeight: 400 }}>(OPTIONAL)</span>
              </label>
              <p style={{ fontSize: '14px', lineHeight: '1.45', color: isDark ? '#BDB0B6' : '#6E5E68', margin: '0 0 10px 0' }}>
                Were you invited by a member? Add their code for priority review. Leave it blank if you weren't — every application is read either way.
              </p>
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                placeholder="e.g. IC-MUM-4820"
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '13px',
                  border: isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)',
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0 16px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: '0.05em',
                }}
              />
            </div>

            {/* 11. TWO-LINE INTRODUCTION (COMPULSORY) */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isDark ? '#F0D4B8' : 'var(--color-mulberry)',
                  }}
                >
                  TWO-LINE INTRODUCTION <span style={{ color: '#E06D6D', fontWeight: 700 }}>*</span>
                </label>
                <span style={{ fontSize: '13px', color: introduction.length === 140 ? '#E06D6D' : (isDark ? '#B3A1A8' : '#8A7A84'), fontFamily: 'monospace' }}>
                  {introduction.length}/140
                </span>
              </div>

              <p style={{ fontSize: '13px', color: isDark ? '#B3A1A8' : '#8A7A84', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SHOWN ON YOUR PROFILE AND CURATED INTRODUCTIONS
              </p>

              <textarea
                rows={3}
                maxLength={140}
                value={introduction}
                onChange={(e) => {
                  setIntroduction(e.target.value.slice(0, 140));
                  if (errors.introduction) {
                    setErrors((prev) => ({ ...prev, introduction: '' }));
                  }
                }}
                placeholder="A thoughtful note about what drives you, favorite conversation starters, or ideal Sunday afternoons..."
                style={{
                  width: '100%',
                  borderRadius: '13px',
                  border: errors.introduction ? '1.5px solid #E06D6D' : (isDark ? '1px solid rgba(243, 238, 233, 0.18)' : '1px solid rgba(73, 40, 61, 0.22)'),
                  backgroundColor: isDark ? 'rgba(24, 15, 20, 0.75)' : 'rgba(255, 255, 255, 0.65)',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-sans)',
                  color: isDark ? '#FBF7F2' : 'var(--color-espresso)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'none',
                  lineHeight: '1.5',
                }}
              />
              {errors.introduction && (
                <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '6px' }}>{errors.introduction}</div>
              )}
            </div>

            {/* General Validation Error Alert */}
            {errors.general && (
              <div style={{ color: '#E06D6D', fontSize: '14px', marginBottom: '16px', fontWeight: 600 }}>
                {errors.general}
              </div>
            )}

            {/* 12. CONTINUE TO VERIFICATION / SUBMIT UPDATED PHOTOS BUTTON */}
            <button
              type="submit"
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: isDark ? '#5C2D49' : 'var(--color-mulberry)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                fontSize: '16.5px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                borderRadius: '9999px',
                border: isDark ? '1px solid rgba(240, 212, 184, 0.35)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(73, 40, 61, 0.28)',
                transition: 'transform 0.15s ease, background-color 0.15s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#73375B' : '#391d2f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#5C2D49' : 'var(--color-mulberry)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>
                {isUpdatingPhotosMode
                  ? 'SUBMIT UPDATED PHOTOGRAPHS'
                  : 'CONTINUE TO VERIFICATION'}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>

        {/* Bottom Home Indicator */}
        {showHomeIndicator && (
          <div style={{ paddingBottom: '12px', marginTop: 'auto' }}>
            <div
              style={{
                width: '134px',
                height: '5px',
                backgroundColor: isDark ? 'rgba(243, 238, 233, 0.3)' : 'rgba(73, 40, 61, 0.3)',
                borderRadius: '9999px',
                margin: '0 auto',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
