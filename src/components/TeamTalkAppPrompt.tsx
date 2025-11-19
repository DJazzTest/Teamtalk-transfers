import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, X, ExternalLink } from 'lucide-react';

interface TeamTalkAppPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
  articleUrl?: string;
}

// Detect device type
const detectDevice = (): 'android' | 'ios' | 'unknown' => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Check for Android
  if (userAgent.includes('android')) {
    return 'android';
  }
  
  // Check for iOS (iPhone, iPad, iPod)
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  
  return 'unknown';
};

const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.planetsport.teamtalk&hl=en_GB';
const IOS_APP_URL = 'https://apps.apple.com/gb/app/teamtalk-football-transfers/id6467007361';

export const TeamTalkAppPrompt: React.FC<TeamTalkAppPromptProps> = ({
  isOpen,
  onClose,
  onDismiss,
  articleUrl,
}) => {
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'unknown'>('unknown');

  useEffect(() => {
    setDeviceType(detectDevice());
  }, []);

  const handleOpenInApp = () => {
    if (deviceType === 'android') {
      window.open(ANDROID_APP_URL, '_blank', 'noopener,noreferrer');
    } else if (deviceType === 'ios') {
      window.open(IOS_APP_URL, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const handleViewOnWeb = () => {
    onDismiss();
    onClose();
    // Open article after a brief delay to allow modal to close
    if (articleUrl) {
      setTimeout(() => {
        window.open(articleUrl, '_blank', 'noopener,noreferrer');
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              View in TEAMtalk App
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-300 pt-2">
            Get the best experience reading this article in the TEAMtalk app with live notifications and exclusive content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Primary CTA based on device */}
          {deviceType !== 'unknown' ? (
            <Button
              onClick={handleOpenInApp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
              size="lg"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              {deviceType === 'android' ? 'Get TEAMtalk on Google Play' : 'Get TEAMtalk on App Store'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => window.open(ANDROID_APP_URL, '_blank', 'noopener,noreferrer')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                size="lg"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Get on Google Play
              </Button>
              <Button
                onClick={() => window.open(IOS_APP_URL, '_blank', 'noopener,noreferrer')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                size="lg"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Get on App Store
              </Button>
            </div>
          )}

          {/* Dismiss button */}
          <Button
            onClick={handleViewOnWeb}
            variant="outline"
            className="w-full border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on this device instead
          </Button>
        </div>

        <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-slate-700">
          The TEAMtalk app offers live scores, breaking news, and personalized content for your favorite teams.
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to check if URL is from TeamTalk
export const isTeamTalkUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return hostname.includes('teamtalk.com') || 
           hostname.includes('teamtalk') ||
           hostname.includes('tt-apis.com') ||
           url.toLowerCase().includes('teamtalk.com');
  } catch {
    // If URL parsing fails, check if it contains teamtalk
    return url.toLowerCase().includes('teamtalk');
  }
};

