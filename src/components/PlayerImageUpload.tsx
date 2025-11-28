import React from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PLAYER_PLACEHOLDER, handlePlayerImageError } from '@/utils/playerImageUtils';

interface PlayerImageUploadProps {
  playerImage?: string;
  playerName?: string;
  onImageChange: (file: File | null) => void;
}

export const PlayerImageUpload: React.FC<PlayerImageUploadProps> = ({ playerImage, playerName, onImageChange }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="w-24 h-24">
        <AvatarImage
          src={playerImage || PLAYER_PLACEHOLDER}
          alt={playerName || 'Player'}
          onError={handlePlayerImageError}
        />
        <AvatarFallback className="bg-green-100 text-green-600">
          <img src="/player-placeholder.png" alt="Player placeholder" className="w-full h-full object-cover" />
        </AvatarFallback>
      </Avatar>
      <FileUpload onChange={onImageChange} label="Upload Player Image" accept="image/*" />
    </div>
  );
};

export default PlayerImageUpload;
