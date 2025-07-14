import React from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PlayerImageUploadProps {
  playerImage?: string;
  playerName?: string;
  onImageChange: (file: File | null) => void;
}

export const PlayerImageUpload: React.FC<PlayerImageUploadProps> = ({ playerImage, playerName, onImageChange }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="w-24 h-24">
        {playerImage ? (
          <AvatarImage src={playerImage} alt={playerName || 'Player'} />
        ) : (
          <AvatarFallback>{playerName?.[0] || '?'}</AvatarFallback>
        )}
      </Avatar>
      <FileUpload onChange={onImageChange} label="Upload Player Image" accept="image/*" />
    </div>
  );
};

export default PlayerImageUpload;
