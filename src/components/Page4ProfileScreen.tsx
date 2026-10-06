import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { useAuth } from '../context/AuthContext';
import { calculateAgeFromISO } from '../utils/ageCalculation';

interface Page4ProfileScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
  isUpdatingPhotosMode?: boolean;
  onPhotosUpdated?: () => void;
}

const GENDER_OPTIONS = ['WOMAN', 'MAN', 'NON-BINARY', 'PREFER TO SELF-DESCRIBE'];
const DATING_PREF_OPTIONS = ['WOMEN', 'MEN', 'EVERYONE'];
const STATUS_OPTIONS = ['WORKING', 'FOUNDER / ENTREPRENEUR', 'STUDENT', 'SELF-EMPLOYED / FREELANCER', 'OTHER'];
const INTEREST_OPTIONS = [
  'Art', 'Books', 'Cooking', 'Fitness', 'Gaming', 'Hiking', 'Music', 'Photography',
  'Startups', 'Tech', 'Travel', 'Yoga', 'Cycling', 'Coffee', 'Cinema', 'Theatre',
  'Investing', 'Sports', 'Dancing', 'Poetry'
];
const VIBE_OPTIONS = [
  'Ambitious', 'Creative', 'Curious', 'Empathetic', 'Grounded', 'Humorous',
  'Intellectual', 'Laid-back', 'Outgoing', 'Passionate', 'Spontaneous', 'Thoughtful'
];

const SAMPLE_PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
];

const isoToDisplayDate = (iso: string): string => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year && month && day) return `${day}/${month}/${year}`;
  }
  return iso;
};

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
    isDigiLockerVerified,
    digiLockerVerifiedName,
    digiLockerVerifiedDob,
  } = useAuth();
  const isDark = appearanceMode === 'after-dark';

  const [stage, setStage] = useState<'about' | 'venn'>('about');

  const initialPhotosRef = useRef<string[]>([...(profile.photos || [])]);

  const verifiedName = isDigiLockerVerified && digiLockerVerifiedName ? digiLockerVerifiedName : null;
  const verifiedDob = isDigiLockerVerified && digiLockerVerifiedDob ? digiLockerVerifiedDob : null;

  const [firstName, setFirstName] = useState(verifiedName || profile.firstName || '');
  const [dateOfBirth, setDateOfBirth] = useState(verifiedDob || profile.dateOfBirth || '');
  const [rawDobInput, setRawDobInput] = useState(
    verifiedDob ? isoToDisplayDate(verifiedDob) : (profile.dateOfBirth ? isoToDisplayDate(profile.dateOfBirth) : '')
  );

  const getInitial = (name?: string | null) => {
    if (!name) return '';
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '';
  };

  const [vennzName, setVennzName] = useState<string>(() => {
    return getInitial(verifiedName || profile.firstName);
  });

  // Automatically keep vennzName locked to the first letter of legal name
  useEffect(() => {
    const nextInitial = getInitial(verifiedName || firstName);
    if (nextInitial && nextInitial !== vennzName) {
      setVennzName(nextInitial);
    }
  }, [verifiedName, firstName]);

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
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  const [vibes, setVibes] = useState<string[]>(profile.vibes || []);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photosSectionRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isUpdatingPhotosMode && photosSectionRef.current) {
      setTimeout(() => {
        photosSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [isUpdatingPhotosMode]);

  // Scroll to top of this page's container whenever the stage changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [stage]);

  useEffect(() => {
    updateProfile({
      firstName: vennzName.trim() || firstName,
      vennzName: vennzName.trim(),
      legalName: verifiedName || firstName,
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
      interests,
      vibes,
    });
  }, [
    firstName,
    vennzName,
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
    interests,
    vibes,
  ]);

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

  const handleManualDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    if (inputVal.length < rawDobInput.length) {
      setRawDobInput(inputVal);
      setDateOfBirth('');
      return;
    }

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

  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!verifiedName) {
      const trimmedName = firstName.trim();
      if (!trimmedName) {
        newErrors.firstName = 'Public first name is required.';
      } else if (/\d/.test(trimmedName)) {
        newErrors.firstName = 'Please enter a valid name (cannot contain numbers).';
      } else if (!/^[A-Za-z\s'-]{1,50}$/.test(trimmedName)) {
        newErrors.firstName = 'Please enter a valid alphabetic name.';
      }
    }

    const trimmedVennz = vennzName.trim();
    if (!trimmedVennz) {
      newErrors.vennzName = 'Name on VennZ is required.';
    } else if (/\d/.test(trimmedVennz)) {
      newErrors.vennzName = 'Name cannot contain numbers.';
    } else if (!/^[A-Za-z\s'.-]{1,50}$/.test(trimmedVennz)) {
      newErrors.vennzName = 'Please enter a valid alphabetic name.';
    }

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
        const age = calculateAgeFromISO(dateOfBirth);
        if (age < 18) {
          newErrors.dateOfBirth = 'You must be 18 or older to join VennZ.';
        }
      }
    }

    if (!city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!genderIdentity) {
      newErrors.genderIdentity = 'Please select your gender identity.';
    } else if (genderIdentity === 'PREFER TO SELF-DESCRIBE' && !selfDescribeGender.trim()) {
      newErrors.selfDescribeGender = 'Please specify how you self-describe.';
    }

    if (!datingPreference) {
      newErrors.datingPreference = 'Please select your dating preference.';
    }

    if (!currentStatus) {
      newErrors.currentStatus = 'Please select your current status.';
    }

    if (!designation.trim()) {
      newErrors.designation = 'Designation or role is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (interests.length < 3) {
      newErrors.interests = 'Please select at least 3 interests to continue.';
    } else if (interests.length > 6) {
      newErrors.interests = 'You can select up to 6 interests.';
    }

    if (vibes.length < 2) {
      newErrors.vibes = 'Please select at least 2 vibes to continue.';
    } else if (vibes.length > 5) {
      newErrors.vibes = 'You can select up to 5 vibes.';
    }
    
    if (photos.length < 2) {
      newErrors.photos = 'Add at least 2 photos to continue.';
    } else if (photos.length > 6) {
      newErrors.photos = 'You can upload a maximum of 6 photos.';
    } else if (isUpdatingPhotosMode) {
      const initial = initialPhotosRef.current;
      const hasAddedNewPhoto = photos.some((p) => !initial.includes(p));
      if (!hasAddedNewPhoto) {
        newErrors.photos = 'A new photograph is required. Please add or replace with at least one new clear photograph before submitting.';
      }
    }

    const trimmedIntro = introduction.trim();
    if (!trimmedIntro) {
      newErrors.introduction = 'A brief introduction is required.';
    } else if (introduction.length > 240) {
      newErrors.introduction = 'Introduction cannot exceed 240 characters.';
    }

    const isIndian = !countryCode || countryCode === '+91';
    if (!isIndian) {
      newErrors.general = 'Only Indian phone numbers (+91) are currently accepted.';
    } else if (!isPhoneVerified && phoneNumber) {
      newErrors.general = 'Your phone number must be verified on the previous screen before continuing.';
    }

    setErrors(prev => ({...prev, ...newErrors}));
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStage('venn');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isStep1Valid = validateStep1();
    if (!isStep1Valid) {
      setStage('about');
      return;
    }
    const isStep2Valid = validateStep2();
    if (isStep2Valid) {
      updateProfile({
        firstName: (vennzName.trim() || firstName).trim(),
        vennzName: vennzName.trim(),
        legalName: verifiedName || firstName,
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
        interests,
        vibes,
      });

      if (isUpdatingPhotosMode) {
        sessionStorage.setItem('ic_photos_just_updated', 'true');
        setApplicationDecision(null);
        if (onPhotosUpdated) onPhotosUpdated();
      } else {
        onSuccess();
      }
    }
  };

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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddSamplePhotos = () => {
    if (isUpdatingPhotosMode) {
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



  const profileCompletion = {
    aboutYou: Boolean((verifiedName || firstName.trim()) && vennzName.trim().length >= 1 && dateOfBirth),
    basicDetails: Boolean(city.trim() && genderIdentity),
    datingPreferences: Boolean(datingPreference && currentStatus),
    workRole: Boolean(designation.trim()),
    interestsVibe: Boolean(interests.length >= 3 && vibes.length >= 2),
    presentation: Boolean(photos.length >= 2 && introduction.trim().length >= 1 && introduction.length <= 240),
  };

  const completedCount = Object.values(profileCompletion).filter(Boolean).length;
  let completionText = 'Your Venn is beginning';
  if (completedCount === 6) completionText = 'Your Venn is complete';
  else if (completedCount >= 3) completionText = 'Your Venn is becoming yours';
  else if (completedCount >= 1) completionText = 'Your Venn is taking shape';

  const petals = [
    { isComplete: profileCompletion.aboutYou, x: 0, y: -36 },
    { isComplete: profileCompletion.basicDetails, x: 31.17, y: -18 },
    { isComplete: profileCompletion.datingPreferences, x: 31.17, y: 18 },
    { isComplete: profileCompletion.workRole, x: 0, y: 36 },
    { isComplete: profileCompletion.interestsVibe, x: -31.17, y: 18 },
    { isComplete: profileCompletion.presentation, x: -31.17, y: -18 },
  ];

  const labelColor = isDark ? '#F9AAAD' : 'var(--color-mulberry)';
  const inputBgColor = isDark ? 'rgba(70, 32, 55, 0.65)' : 'rgba(255,255,255,0.65)';
  const inputBorderColor = isDark ? 'rgba(243,238,233,0.18)' : 'rgba(73,40,61,0.22)';
  const textColor = isDark ? '#FBF7F2' : 'var(--color-espresso)';

  const renderChip = (opt: string, isSelected: boolean, onClick: () => void) => (
    <button
      key={opt}
      type="button"
      onClick={onClick}
      style={{
        padding: '9px 20px',
        borderRadius: '999px',
        border: `1.5px solid ${isSelected ? 'rgba(161,82,95,0.9)' : (isDark ? 'rgba(161,82,95,0.3)' : 'rgba(73,40,61,0.2)')}`,
        backgroundColor: isSelected
          ? (isDark ? 'rgba(161,82,95,0.85)' : 'rgba(199,87,124,0.85)')
          : (isDark ? 'rgba(70,32,55,0.5)' : 'rgba(255,255,255,0.6)'),
        color: isSelected ? '#FDF3F5' : (isDark ? '#F9AAAD' : 'var(--color-mulberry)'),
        fontSize: '14px',
        fontWeight: isSelected ? 700 : 600,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {opt}
    </button>
  );

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
        backgroundColor: isDark ? '#140E1C' : '#FAF1F3',
        color: isDark ? '#FDF3F5' : '#462037',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)',
          opacity: isDark ? 0.2 : 0.1,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div
        ref={scrollContainerRef}
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
        <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'transparent' }}>
          {showStatusBar && <StatusBar variant={isDark ? 'light' : 'dark'} />}

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
              onClick={() => stage === 'about' ? onBack() : setStage('about')}
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

            <span
              style={{
                fontSize: '13px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: isDark ? '#B3A1A8' : '#8A7A84',
              }}
            >
              {stage === 'about' ? 'STEP 1 OF 2 · ABOUT YOU' : 'STEP 2 OF 2 · YOUR VENN'}
            </span>
          </div>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', padding: '24px 24px 48px 24px', textAlign: 'left', boxSizing: 'border-box' }}>
          
          {/* Venn Flower Visual */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ height: '140px', width: '140px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              {/* Petals */}
              {petals.map((petal, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: `1.5px solid ${isDark ? 'rgba(161,82,95,0.45)' : 'rgba(161,82,95,0.35)'}`,
                    background: isDark ? 'rgba(161,82,95,0.12)' : 'rgba(199,87,124,0.08)',
                    transform: petal.isComplete ? `translate(${petal.x}px, ${petal.y}px) scale(1)` : 'translate(0px, 0px) scale(0.3)',
                    opacity: petal.isComplete ? 1 : 0,
                    transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
                    zIndex: 1,
                  }}
                />
              ))}

              {/* Center Circle */}
              <div
                style={{
                  position: 'absolute',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: `1.5px solid ${isDark ? 'rgba(161,82,95,0.85)' : 'rgba(161,82,95,0.75)'}`,
                  background: isDark ? 'rgba(20,14,28,0.85)' : 'rgba(250,241,243,0.85)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: isDark ? '#F9AAAD' : '#A1525F' }}>
                  VENNZ
                </span>
              </div>
            </div>

            {/* Completion Text */}
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 400, color: isDark ? '#FBF7F2' : 'var(--color-mulberry)', margin: '16px 0 4px 0', transition: 'all 0.3s ease' }}>
              {completionText}
            </h2>
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', color: isDark ? '#B3A1A8' : '#8A7A84', textTransform: 'uppercase' }}>
              {completedCount} of 6 connected
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            {/* STAGE 1 */}
            <div style={{
              position: stage === 'about' ? 'relative' : 'absolute',
              opacity: stage === 'about' ? 1 : 0,
              pointerEvents: stage === 'about' ? 'auto' : 'none',
              visibility: stage === 'about' ? 'visible' : 'hidden',
              transform: stage === 'about' ? 'translateY(0)' : 'translateY(-12px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              height: stage === 'about' ? 'auto' : '0px',
              overflow: 'hidden',
              width: '100%'
            }}>
              <form onSubmit={handleContinue} noValidate>
                {/* 1. LEGAL FULL NAME */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor }}>
                      <span>FULL NAME</span>
                    </label>
                    {verifiedName && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C7577C', backgroundColor: 'rgba(199, 87, 124, 0.12)', border: '1px solid rgba(199, 87, 124, 0.3)', padding: '3px 8px', borderRadius: '6px' }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#C7577C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        VERIFIED BY DIGILOCKER
                      </span>
                    )}
                  </div>
                  {verifiedName ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input type="text" value={verifiedName} readOnly disabled aria-label="Verified Legal Full Name"
                        style={{ width: '100%', height: '54px', borderRadius: '13px', border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(73, 40, 61, 0.22)', backgroundColor: isDark ? 'rgba(40, 18, 32, 0.75)' : 'rgba(240, 230, 235, 0.65)', padding: '0 44px 0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed', opacity: 0.95 }}
                      />
                      <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#A1525F' : '#8A7A84', display: 'flex', alignItems: 'center' }} title="Verified legal identity">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' })); }} placeholder="e.g. Rahul Sharma"
                      style={{ width: '100%', height: '54px', borderRadius: '13px', border: errors.firstName ? '1.5px solid #E06D6D' : `1px solid ${inputBorderColor}`, backgroundColor: inputBgColor, padding: '0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box' }}
                    />
                  )}
                  <div style={{ fontSize: '12.5px', color: isDark ? '#B3A1A8' : '#8A7A84', marginTop: '6px' }}>
                    Legal name verified from DigiLocker. Kept private and never displayed to other users.
                  </div>
                  {errors.firstName && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.firstName}</div>}
                </div>

                {/* 2. NAME ON VENNZ */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor }}>
                      NAME ON VENNZ
                    </label>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: isDark ? '#F9AAAD' : '#A1525F', backgroundColor: isDark ? 'rgba(161, 82, 95, 0.15)' : 'rgba(161, 82, 95, 0.08)', border: isDark ? '1px solid rgba(161, 82, 95, 0.3)' : '1px solid rgba(161, 82, 95, 0.2)', padding: '3px 8px', borderRadius: '6px' }}>
                      FIRST INITIAL ONLY
                    </span>
                  </div>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      value={vennzName}
                      readOnly
                      disabled
                      aria-label="Name on VennZ (Non-editable First Initial)"
                      style={{
                        width: '100%',
                        height: '54px',
                        borderRadius: '13px',
                        border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(73, 40, 61, 0.22)',
                        backgroundColor: isDark ? 'rgba(40, 18, 32, 0.75)' : 'rgba(240, 230, 235, 0.65)',
                        padding: '0 44px 0 16px',
                        fontSize: '18px',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: textColor,
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                        opacity: 0.95,
                      }}
                    />
                    <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#A1525F' : '#8A7A84', display: 'flex', alignItems: 'center' }} title="Non-editable initial">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: '12.5px', color: isDark ? '#B3A1A8' : '#8A7A84', marginTop: '6px' }}>
                    Your first initial is your public identifier on VennZ. Once you match with someone, they will see your full legal name.
                  </div>
                  {errors.vennzName && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.vennzName}</div>}
                </div>

                {/* 3. DATE OF BIRTH */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor }}>
                      DATE OF BIRTH <span style={{ color: '#E06D6D' }}>*</span>
                    </label>
                    {verifiedDob && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C7577C', backgroundColor: 'rgba(199, 87, 124, 0.12)', border: '1px solid rgba(199, 87, 124, 0.3)', padding: '3px 8px', borderRadius: '6px' }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#C7577C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        VERIFIED BY DIGILOCKER
                      </span>
                    )}
                  </div>
                  {verifiedDob ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input type="text" value={isoToDisplayDate(verifiedDob)} readOnly disabled
                        style={{ width: '100%', height: '54px', borderRadius: '13px', border: isDark ? '1px solid rgba(161, 82, 95, 0.35)' : '1px solid rgba(73, 40, 61, 0.22)', backgroundColor: isDark ? 'rgba(40, 18, 32, 0.75)' : 'rgba(240, 230, 235, 0.65)', padding: '0 44px 0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed', opacity: 0.95 }}
                      />
                      <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#A1525F' : '#8A7A84', display: 'flex', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input type="text" value={rawDobInput} onChange={handleManualDobChange} placeholder="DD / MM / YYYY"
                        style={{ width: '100%', height: '54px', borderRadius: '13px', border: errors.dateOfBirth ? '1.5px solid #E06D6D' : `1px solid ${inputBorderColor}`, backgroundColor: inputBgColor, padding: '0 48px 0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box' }}
                      />
                      <div style={{ position: 'absolute', right: '0', top: '0', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }} onClick={() => datePickerRef.current?.showPicker && datePickerRef.current.showPicker()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#F9AAAD' : '#C7577C'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <input type="date" ref={datePickerRef} value={dateOfBirth || ''} onChange={handleCalendarPickerChange} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  )}
                  {dateOfBirth && (
                    <div style={{ fontSize: '13.5px', color: isDark ? '#A1525F' : '#C7577C', marginTop: '8px', fontWeight: 500 }}>
                      Age: {calculateAge(dateOfBirth)} years old
                    </div>
                  )}
                  {errors.dateOfBirth && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.dateOfBirth}</div>}
                </div>

                {/* 4. CITY */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: '8px' }}>
                    CITY <span style={{ color: '#E06D6D' }}>*</span>
                  </label>
                  <input type="text" value={city} onChange={(e) => { setCity(e.target.value); if (errors.city) setErrors((prev) => ({ ...prev, city: '' })); }} placeholder="e.g. Mumbai"
                    style={{ width: '100%', height: '54px', borderRadius: '13px', border: errors.city ? '1.5px solid #E06D6D' : `1px solid ${inputBorderColor}`, backgroundColor: inputBgColor, padding: '0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box' }}
                  />
                  {errors.city && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.city}</div>}
                </div>

                {/* 5. GENDER IDENTITY */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: '8px' }}>
                    GENDER IDENTITY <span style={{ color: '#E06D6D' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {GENDER_OPTIONS.map(opt => renderChip(opt, genderIdentity === opt, () => {
                      setGenderIdentity(opt);
                      if (errors.genderIdentity) setErrors(prev => ({...prev, genderIdentity: ''}));
                    }))}
                  </div>
                  {genderIdentity === 'PREFER TO SELF-DESCRIBE' && (
                    <div style={{ marginTop: '12px' }}>
                      <input type="text" value={selfDescribeGender} onChange={(e) => { setSelfDescribeGender(e.target.value); if (errors.selfDescribeGender) setErrors((prev) => ({ ...prev, selfDescribeGender: '' })); }} placeholder="Please specify"
                        style={{ width: '100%', height: '54px', borderRadius: '13px', border: errors.selfDescribeGender ? '1.5px solid #E06D6D' : `1px solid ${inputBorderColor}`, backgroundColor: inputBgColor, padding: '0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box' }}
                      />
                      {errors.selfDescribeGender && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.selfDescribeGender}</div>}
                    </div>
                  )}
                  {errors.genderIdentity && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.genderIdentity}</div>}
                </div>

                {/* 6. INTERESTED IN DATING */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: '8px' }}>
                    INTERESTED IN DATING <span style={{ color: '#E06D6D' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {DATING_PREF_OPTIONS.map(opt => renderChip(opt, datingPreference === opt, () => {
                      setDatingPreference(opt);
                      if (errors.datingPreference) setErrors(prev => ({...prev, datingPreference: ''}));
                    }))}
                  </div>
                  {errors.datingPreference && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.datingPreference}</div>}
                </div>

                {/* 7. CURRENT STATUS */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: '8px' }}>
                    CURRENT STATUS <span style={{ color: '#E06D6D' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {STATUS_OPTIONS.map(opt => renderChip(opt, currentStatus === opt, () => {
                      setCurrentStatus(opt);
                      if (errors.currentStatus) setErrors(prev => ({...prev, currentStatus: ''}));
                    }))}
                  </div>
                  {errors.currentStatus && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.currentStatus}</div>}
                </div>

                {/* 8. DESIGNATION / ROLE */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: '8px' }}>
                    DESIGNATION / ROLE <span style={{ color: '#E06D6D' }}>*</span>
                  </label>
                  <input type="text" value={designation} onChange={(e) => { setDesignation(e.target.value); if (errors.designation) setErrors((prev) => ({ ...prev, designation: '' })); }} placeholder="e.g. Software Engineer"
                    style={{ width: '100%', height: '54px', borderRadius: '13px', border: errors.designation ? '1.5px solid #E06D6D' : `1px solid ${inputBorderColor}`, backgroundColor: inputBgColor, padding: '0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box' }}
                  />
                  {errors.designation && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.designation}</div>}
                </div>

                {/* 9. COMPANY */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: '8px' }}>
                    COMPANY (OPTIONAL)
                  </label>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google"
                    style={{ width: '100%', height: '54px', borderRadius: '13px', border: `1px solid ${inputBorderColor}`, backgroundColor: inputBgColor, padding: '0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button type="submit"
                  style={{ width: '100%', height: '56px', borderRadius: '28px', background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-sans)', letterSpacing: '0.04em', cursor: 'pointer', boxShadow: '0 8px 24px rgba(161, 82, 95, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Continue to Your Venn →
                </button>
              </form>
            </div>

            {/* STAGE 2 */}
            <div style={{
              position: stage === 'venn' ? 'relative' : 'absolute',
              opacity: stage === 'venn' ? 1 : 0,
              pointerEvents: stage === 'venn' ? 'auto' : 'none',
              visibility: stage === 'venn' ? 'visible' : 'hidden',
              transform: stage === 'venn' ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              height: stage === 'venn' ? 'auto' : '0px',
              overflow: 'hidden',
              width: '100%'
            }}>
              <form onSubmit={handleSubmit} noValidate>
                {/* 10. INTERESTS */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor }}>
                      INTERESTS <span style={{ color: '#E06D6D' }}>*</span>
                    </label>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: interests.length >= 3 ? (isDark ? '#86EFAC' : '#2E7D32') : (isDark ? '#F9AAAD' : '#A1525F') }}>
                      {interests.length} / 6 selected
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: isDark ? '#B3A1A8' : '#8A7A84', margin: '0 0 12px 0' }}>
                    Select 3 to 6 interests that reflect who you are.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {INTEREST_OPTIONS.map(opt => renderChip(opt, interests.includes(opt), () => {
                      setInterests(prev => {
                        if (prev.includes(opt)) return prev.filter(x => x !== opt);
                        if (prev.length >= 6) return prev;
                        return [...prev, opt];
                      });
                      if (errors.interests) setErrors(prev => ({...prev, interests: ''}));
                    }))}
                  </div>
                  {errors.interests && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '6px' }}>{errors.interests}</div>}
                </div>

                {/* 11. YOUR VIBE */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor }}>
                      YOUR VIBE <span style={{ color: '#E06D6D' }}>*</span>
                    </label>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: vibes.length >= 2 ? (isDark ? '#86EFAC' : '#2E7D32') : (isDark ? '#F9AAAD' : '#A1525F') }}>
                      {vibes.length} / 5 selected
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: isDark ? '#B3A1A8' : '#8A7A84', margin: '0 0 12px 0' }}>
                    Choose 2 to 5 traits that capture your essence.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {VIBE_OPTIONS.map(opt => renderChip(opt, vibes.includes(opt), () => {
                      setVibes(prev => {
                        if (prev.includes(opt)) return prev.filter(x => x !== opt);
                        if (prev.length >= 5) return prev;
                        return [...prev, opt];
                      });
                      if (errors.vibes) setErrors(prev => ({...prev, vibes: ''}));
                    }))}
                  </div>
                  {errors.vibes && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '6px' }}>{errors.vibes}</div>}
                </div>

                {/* 12. PHOTOS */}
                <div ref={photosSectionRef} style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: '8px' }}>
                    PHOTOGRAPHS <span style={{ color: '#E06D6D' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {photos.map((photo, index) => (
                      <div key={index} style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <img src={photo} alt={`Upload ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {index === 0 && (
                          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(20, 14, 28, 0.75)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', letterSpacing: '0.08em', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                            MAIN
                          </div>
                        )}
                        <button type="button" onClick={() => handleRemovePhoto(index)} style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '12px', backgroundColor: 'rgba(20, 14, 28, 0.65)', backdropFilter: 'blur(4px)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }} aria-label="Remove photo">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                    {photos.length < 6 && (
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: '12px', border: errors.photos ? '1.5px dashed #E06D6D' : (isDark ? '1.5px dashed rgba(243, 238, 233, 0.3)' : '1.5px dashed rgba(73, 40, 61, 0.3)'), backgroundColor: isDark ? 'rgba(40, 18, 32, 0.4)' : 'rgba(255, 255, 255, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => fileInputRef.current?.click()}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#F9AAAD' : '#C7577C'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#B3A1A8' : '#8A7A84' }}>Add Photo</span>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/jpeg, image/png, image/webp" multiple style={{ display: 'none' }} />
                      </div>
                    )}
                  </div>
                  {errors.photos && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '8px' }}>{errors.photos}</div>}
                  <button type="button" onClick={handleAddSamplePhotos} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: 'rgba(161, 82, 95, 0.15)', color: isDark ? '#F9AAAD' : '#C7577C', border: '1px solid rgba(161, 82, 95, 0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    {isUpdatingPhotosMode ? 'Demo: Add 1 Sample Photo' : 'Demo: Auto-fill 3 Sample Photos'}
                  </button>
                </div>

                {/* 13. INVITATION CODE */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, marginBottom: '8px' }}>
                    INVITATION CODE (OPTIONAL)
                  </label>
                  <input type="text" value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} placeholder="If you have one"
                    style={{ width: '100%', height: '54px', borderRadius: '13px', border: `1px solid ${inputBorderColor}`, backgroundColor: inputBgColor, padding: '0 16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* 14. ABOUT YOU / DESCRIPTION */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor }}>
                      ABOUT YOU <span style={{ color: '#E06D6D' }}>*</span>
                    </label>
                    <span style={{ fontSize: '12px', color: introduction.length > 240 ? '#E06D6D' : (isDark ? '#B3A1A8' : '#8A7A84') }}>
                      {introduction.length} / 240 characters
                    </span>
                  </div>
                  <textarea
                    value={introduction}
                    maxLength={240}
                    onChange={(e) => {
                      setIntroduction(e.target.value);
                      if (errors.introduction) setErrors((prev) => ({ ...prev, introduction: '' }));
                    }}
                    placeholder="A thoughtful note about what drives you, favorite conversation starters, or what you enjoy..."
                    rows={4}
                    style={{ width: '100%', borderRadius: '13px', border: errors.introduction || introduction.length > 240 ? '1.5px solid #E06D6D' : `1px solid ${inputBorderColor}`, backgroundColor: inputBgColor, padding: '16px', fontSize: '16.5px', fontFamily: 'var(--font-sans)', color: textColor, outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '100px' }}
                  />
                  {errors.introduction && <div style={{ color: '#E06D6D', fontSize: '13px', marginTop: '5px' }}>{errors.introduction}</div>}
                </div>

                {errors.general && <div style={{ color: '#E06D6D', fontSize: '14px', marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(224, 109, 109, 0.1)', borderRadius: '8px', border: '1px solid rgba(224, 109, 109, 0.3)' }}>{errors.general}</div>}

                <button type="submit" disabled={introduction.length > 240}
                  style={{ width: '100%', height: '56px', borderRadius: '28px', background: 'linear-gradient(135deg, #A1525F 0%, #C7577C 100%)', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-sans)', letterSpacing: '0.04em', cursor: introduction.length > 240 ? 'not-allowed' : 'pointer', opacity: introduction.length > 240 ? 0.6 : 1, boxShadow: introduction.length > 240 ? 'none' : '0 8px 24px rgba(161, 82, 95, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isUpdatingPhotosMode ? 'Submit Updated Photographs' : 'Your Venn is ready →'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        {showHomeIndicator && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '34px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '8px', zIndex: 100, pointerEvents: 'none' }}>
            <div style={{ width: '134px', height: '5px', borderRadius: '100px', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};
