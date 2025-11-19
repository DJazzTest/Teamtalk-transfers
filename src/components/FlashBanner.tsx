import React, { useState, useEffect } from 'react';

export type BannerLabelType = 
  | 'Breaking'
  | 'Confirmed'
  | 'Rumour'
  | 'Exclusive'
  | 'Done Deals'
  | 'Paper Watch'
  | 'Loan Watch'
  | 'Rejected'
  | 'Target'
  | 'Monitoring'
  | 'Shown Interest'
  | '';

export interface FlashBannerData {
  enabled: boolean;
  text: string;
  url?: string;
  imageDataUrl?: string;
  labelType: BannerLabelType;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  padding: string;
}

const STORAGE_KEY = 'flashBannerData';
const DEFAULT_BANNER: FlashBannerData = {
  enabled: false,
  text: '',
  url: '',
  imageDataUrl: '',
  labelType: '',
  backgroundColor: '#fbbf24', // Yellow default
  textColor: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '12px 16px'
};

export const FlashBanner: React.FC = () => {
  const [bannerData, setBannerData] = useState<FlashBannerData>(DEFAULT_BANNER);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Load banner data from API (for cross-device sync) with localStorage fallback
    const loadBannerData = async () => {
      try {
        // First try to load from API for cross-device sync
        try {
          const apiUrl = '/.netlify/functions/flash-banner';
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const apiData = await response.json();
            if (apiData && apiData.enabled !== undefined) {
              setBannerData({ 
                ...DEFAULT_BANNER, 
                ...apiData,
                url: (typeof apiData.url === 'string' ? apiData.url : '') || '',
                text: (typeof apiData.text === 'string' ? apiData.text : '') || '',
                imageDataUrl: (typeof apiData.imageDataUrl === 'string' ? apiData.imageDataUrl : '') || '',
                labelType: (apiData.labelType && typeof apiData.labelType === 'string' ? apiData.labelType : '') as BannerLabelType
              });
              // Also sync to localStorage as backup
              if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(apiData));
                } catch (e) {
                  // Ignore localStorage errors
                }
              }
              return;
            }
          }
        } catch (apiError) {
          console.warn('Failed to load from API, trying localStorage:', apiError);
        }

        // Fallback to localStorage if API fails
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setBannerData({ 
                ...DEFAULT_BANNER, 
                ...parsed,
                url: (typeof parsed.url === 'string' ? parsed.url : '') || '',
                text: (typeof parsed.text === 'string' ? parsed.text : '') || '',
                imageDataUrl: (typeof parsed.imageDataUrl === 'string' ? parsed.imageDataUrl : '') || '',
                labelType: (parsed.labelType && typeof parsed.labelType === 'string' ? parsed.labelType : '') as BannerLabelType
              });
            } catch (parseError) {
              console.error('Error parsing flash banner data:', parseError);
              setBannerData(DEFAULT_BANNER);
            }
          }
        }
      } catch (error) {
        console.error('Error loading flash banner data:', error);
        setHasError(true);
      }
    };

    loadBannerData();

    const intervalId = setInterval(() => {
      loadBannerData();
    }, 60 * 1000);

    // Listen for updates from CMS
    const handleBannerUpdate = () => {
      loadBannerData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('flashBannerUpdated', handleBannerUpdate);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('flashBannerUpdated', handleBannerUpdate);
      }
    };
  }, []);

  if (hasError) {
    return null;
  }

  if (!bannerData || !bannerData.enabled || !bannerData.text || typeof bannerData.text !== 'string' || !bannerData.text.trim()) {
    return null;
  }

  return (
    <div
      className="w-full flash-banner-container"
      style={{
        backgroundColor: bannerData.backgroundColor,
        color: bannerData.textColor,
        fontSize: bannerData.fontSize,
        fontWeight: bannerData.fontWeight,
        fontFamily: bannerData.fontFamily,
        padding: bannerData.padding,
        width: '100%',
        marginBottom: '16px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Fixed Label on Left */}
      {bannerData.labelType && (
        <div
          className="flash-banner-label"
          style={{
            flexShrink: 0,
            padding: '4px 12px',
            marginRight: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            zIndex: 2
          }}
        >
          {bannerData.labelType}
        </div>
      )}

      {/* Scrolling Text */}
      <div
        className="flash-banner-scroll"
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          whiteSpace: 'nowrap'
        }}
      >
        <div
          className="flash-banner-text-wrapper"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            animation: 'scrollText 25s linear infinite',
            willChange: 'transform',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ paddingRight: '50px', display: 'inline-flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
            {bannerData.text}
            {bannerData.imageDataUrl && (
              <img
                src={bannerData.imageDataUrl}
                alt="Banner thumbnail"
                style={{
                  height: '32px',
                  width: 'auto',
                  maxWidth: '120px',
                  objectFit: 'contain',
                  verticalAlign: 'middle',
                  display: 'inline-block'
                }}
                loading="lazy"
              />
            )}
          </span>
          <span style={{ paddingRight: '50px', display: 'inline-flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
            {bannerData.text}
            {bannerData.imageDataUrl && (
              <img
                src={bannerData.imageDataUrl}
                alt="Banner thumbnail"
                style={{
                  height: '32px',
                  width: 'auto',
                  maxWidth: '120px',
                  objectFit: 'contain',
                  verticalAlign: 'middle',
                  display: 'inline-block'
                }}
                loading="lazy"
              />
            )}
          </span>
        </div>
      </div>

      {/* Fixed "Click here" and Logo on Right */}
      {bannerData.url && typeof bannerData.url === 'string' && bannerData.url.trim() && (() => {
        // Ensure URL is properly formatted
        let url = bannerData.url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        return (
          <div
            className="flash-banner-right"
            style={{
              flexShrink: 0,
              paddingLeft: '16px',
              marginLeft: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 2
            }}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}
              onClick={(e) => {
                // Ensure link opens properly
                if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
                  e.preventDefault();
                  console.error('Invalid URL in flash banner:', url);
                }
              }}
            >
              Click here
            </a>
            <img
              src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png"
              alt="TEAMtalk"
              width="30"
              height="27"
              style={{ height: '32px', width: 'auto', flexShrink: 0 }}
              loading="lazy"
            />
          </div>
        );
      })()}

      {/* Fixed Logo on Right (when no URL) */}
      {(!bannerData.url || !bannerData.url.trim()) && (
        <div
          className="flash-banner-logo"
          style={{
            flexShrink: 0,
            paddingLeft: '16px',
            marginLeft: '16px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 2
          }}
        >
          <img
            src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png"
            alt="TEAMtalk"
            width="30"
            height="27"
            style={{ height: '32px', width: 'auto', flexShrink: 0 }}
            loading="lazy"
          />
        </div>
      )}

      <style>{`
        @keyframes scrollText {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .flash-banner-text-wrapper:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

