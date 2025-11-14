import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Eye, EyeOff, Image as ImageIcon, X, Upload } from 'lucide-react';
import type { FlashBannerData, BannerLabelType } from './FlashBanner';

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

const LABEL_OPTIONS: BannerLabelType[] = [
  '',
  'Breaking',
  'Confirmed',
  'Rumour',
  'Exclusive',
  'Done Deals',
  'Paper Watch',
  'Loan Watch',
  'Rejected',
  'Target',
  'Monitoring',
  'Shown Interest'
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi-Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' }
];

const FONT_FAMILIES = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'System Default' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Impact, sans-serif', label: 'Impact' }
];

const PRESET_COLORS = [
  { name: 'Yellow', bg: '#fbbf24', text: '#000000' },
  { name: 'Red', bg: '#ef4444', text: '#ffffff' },
  { name: 'Blue', bg: '#3b82f6', text: '#ffffff' },
  { name: 'Green', bg: '#10b981', text: '#ffffff' },
  { name: 'Orange', bg: '#f97316', text: '#ffffff' },
  { name: 'Purple', bg: '#a855f7', text: '#ffffff' },
  { name: 'Pink', bg: '#ec4899', text: '#ffffff' },
  { name: 'Gray', bg: '#6b7280', text: '#ffffff' }
];

export const FlashBannerManagement: React.FC = () => {
  const [bannerData, setBannerData] = useState<FlashBannerData>(DEFAULT_BANNER);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setBannerData({ ...DEFAULT_BANNER, ...parsed });
        } catch (parseError) {
          console.error('Error parsing flash banner data:', parseError);
        }
      }
    } catch (error) {
      console.error('Error loading flash banner data:', error);
    }
  }, []);

  const saveBannerData = () => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        toast.error('localStorage is not available');
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bannerData));
      // Dispatch event to notify frontend of update
      window.dispatchEvent(new Event('flashBannerUpdated'));
      toast.success('Flash banner saved successfully');
    } catch (error) {
      console.error('Error saving flash banner data:', error);
      toast.error('Failed to save banner data');
    }
  };

  const handlePresetColor = (preset: typeof PRESET_COLORS[0]) => {
    setBannerData(prev => ({
      ...prev,
      backgroundColor: preset.bg,
      textColor: preset.text
    }));
  };

  const updateBannerData = (updates: Partial<FlashBannerData>) => {
    setBannerData(prev => ({ ...prev, ...updates }));
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (limit to 2MB to avoid localStorage issues)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateBannerData({ imageDataUrl: dataUrl });
      toast.success('Image uploaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const removeImage = () => {
    updateBannerData({ imageDataUrl: '' });
    toast.success('Image removed');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Flash Banner Management</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {previewEnabled ? (
                <Eye className="w-5 h-5 text-blue-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
              <Label htmlFor="preview-toggle" className="text-white cursor-pointer">
                Preview
              </Label>
              <Switch
                id="preview-toggle"
                checked={previewEnabled}
                onCheckedChange={setPreviewEnabled}
              />
            </div>
            <Button onClick={saveBannerData} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Banner
            </Button>
          </div>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-semibold text-lg">Enable Flash Banner</Label>
              <p className="text-gray-400 text-sm mt-1">
                When enabled, the banner will appear on the main website
              </p>
            </div>
            <Switch
              checked={bannerData.enabled}
              onCheckedChange={(enabled) => updateBannerData({ enabled })}
            />
          </div>
        </div>

        {/* Label Type Selector */}
        <div className="mb-6">
          <Label htmlFor="label-type" className="text-white font-semibold mb-2 block">
            Label Type (Fixed on Left)
          </Label>
          <select
            id="label-type"
            value={bannerData.labelType}
            onChange={(e) => updateBannerData({ labelType: e.target.value as BannerLabelType })}
            className="w-full bg-slate-700 text-white border-slate-600 rounded-md px-3 py-2"
          >
            {LABEL_OPTIONS.map((label) => (
              <option key={label} value={label}>
                {label || 'None'}
              </option>
            ))}
          </select>
          <p className="text-gray-400 text-sm mt-2">
            Select a label that will stay fixed on the left side of the banner while the text scrolls
          </p>
        </div>

        {/* Banner Text */}
        <div className="mb-6">
          <Label htmlFor="banner-text" className="text-white font-semibold mb-2 block">
            Banner Text
          </Label>
          <Textarea
            id="banner-text"
            value={bannerData.text}
            onChange={(e) => updateBannerData({ text: e.target.value })}
            placeholder="Enter your flash message, breaking news, or headline here... (e.g., 'Click here' or 'Lord Barrington to Sell Gipton UFCK')"
            className="bg-slate-700 text-white border-slate-600 min-h-[100px]"
            rows={4}
          />
          <p className="text-gray-400 text-sm mt-2">
            This text will be displayed in the banner. If you add a URL below, "Click here" will be appended at the end and made clickable.
          </p>
        </div>

        {/* URL Link */}
        <div className="mb-6">
          <Label htmlFor="banner-url" className="text-white font-semibold mb-2 block">
            Link URL (Optional)
          </Label>
          <Input
            id="banner-url"
            type="url"
            value={bannerData.url || ''}
            onChange={(e) => updateBannerData({ url: e.target.value })}
            placeholder="https://www.teamtalk.com/everton/everton-have-secret-weapon..."
            className="bg-slate-700 text-white border-slate-600"
          />
          <p className="text-gray-400 text-sm mt-2">
            Enter a URL to make the banner text clickable. The text will be underlined and open in a new tab when clicked.
            Leave empty if you don't want the banner to be clickable.
          </p>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <Label className="text-white font-semibold mb-2 block">
            Banner Thumbnail Image (Optional)
          </Label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 bg-slate-700/30'
            }`}
          >
            {bannerData.imageDataUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={bannerData.imageDataUrl}
                    alt="Banner thumbnail preview"
                    className="max-h-32 max-w-full rounded object-contain"
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={removeImage}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Image
                  </Button>
                  <Label
                    htmlFor="image-upload-input"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Replace Image
                  </Label>
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-400" />
                <div>
                  <Label
                    htmlFor="image-upload-input"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Label>
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-gray-500 text-xs">
                  Image will automatically resize to fit. Max size: 2MB
                </p>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Upload a thumbnail image that will appear at the end of the scrolling text. The image will automatically resize to fit the banner height.
          </p>
        </div>

        {/* Color Presets */}
        <div className="mb-6">
          <Label className="text-white font-semibold mb-3 block">Quick Color Presets</Label>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetColor(preset)}
                className="p-3 rounded-lg border-2 border-slate-600 hover:border-blue-500 transition-colors"
                style={{
                  backgroundColor: preset.bg,
                  color: preset.text,
                  fontWeight: '600'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="bg-color" className="text-white font-semibold mb-2 block">
              Background Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={bannerData.backgroundColor}
                onChange={(e) => updateBannerData({ backgroundColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={bannerData.backgroundColor}
                onChange={(e) => updateBannerData({ backgroundColor: e.target.value })}
                placeholder="#fbbf24"
                className="bg-slate-700 text-white border-slate-600"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="text-color" className="text-white font-semibold mb-2 block">
              Text Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="text-color"
                type="color"
                value={bannerData.textColor}
                onChange={(e) => updateBannerData({ textColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={bannerData.textColor}
                onChange={(e) => updateBannerData({ textColor: e.target.value })}
                placeholder="#000000"
                className="bg-slate-700 text-white border-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Typography Settings */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="font-size" className="text-white font-semibold mb-2 block">
              Font Size
            </Label>
            <Input
              id="font-size"
              type="text"
              value={bannerData.fontSize}
              onChange={(e) => updateBannerData({ fontSize: e.target.value })}
              placeholder="16px"
              className="bg-slate-700 text-white border-slate-600"
            />
            <p className="text-gray-400 text-xs mt-1">e.g., 14px, 16px, 18px, 1.2rem</p>
          </div>
          <div>
            <Label htmlFor="font-weight" className="text-white font-semibold mb-2 block">
              Font Weight
            </Label>
            <select
              id="font-weight"
              value={bannerData.fontWeight}
              onChange={(e) => updateBannerData({ fontWeight: e.target.value })}
              className="w-full bg-slate-700 text-white border-slate-600 rounded-md px-3 py-2"
            >
              {FONT_WEIGHTS.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="font-family" className="text-white font-semibold mb-2 block">
              Font Family
            </Label>
            <select
              id="font-family"
              value={bannerData.fontFamily}
              onChange={(e) => updateBannerData({ fontFamily: e.target.value })}
              className="w-full bg-slate-700 text-white border-slate-600 rounded-md px-3 py-2"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Padding */}
        <div className="mb-6">
          <Label htmlFor="padding" className="text-white font-semibold mb-2 block">
            Padding
          </Label>
          <Input
            id="padding"
            type="text"
            value={bannerData.padding}
            onChange={(e) => updateBannerData({ padding: e.target.value })}
            placeholder="12px 16px"
            className="bg-slate-700 text-white border-slate-600"
          />
          <p className="text-gray-400 text-xs mt-1">e.g., 12px 16px (vertical horizontal)</p>
        </div>

        {/* Preview */}
        {previewEnabled && (
          <div className="mt-6">
            <Label className="text-white font-semibold mb-3 block">Live Preview</Label>
            <Card className="p-4 bg-slate-900 border-slate-700">
              {bannerData.enabled && bannerData.text.trim() ? (
                <div
                  style={{
                    backgroundColor: bannerData.backgroundColor,
                    color: bannerData.textColor,
                    fontSize: bannerData.fontSize,
                    fontWeight: bannerData.fontWeight,
                    fontFamily: bannerData.fontFamily,
                    padding: bannerData.padding,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {/* Fixed Label */}
                  {bannerData.labelType && (
                    <div
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
                  {/* Scrolling Text Preview */}
                  <div
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      position: 'relative',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        animation: 'scrollText 25s linear infinite',
                        willChange: 'transform'
                      }}
                    >
                      <span style={{ paddingRight: '50px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
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
                      <span style={{ paddingRight: '50px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
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
                  {bannerData.url && typeof bannerData.url === 'string' && bannerData.url.trim() ? (
                    <div
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
                        href={bannerData.url}
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
                  ) : (
                    <div
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
                  `}</style>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-600 rounded">
                  {bannerData.enabled
                    ? 'Enter text above to see preview'
                    : 'Enable banner and enter text to see preview'}
                </div>
              )}
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

