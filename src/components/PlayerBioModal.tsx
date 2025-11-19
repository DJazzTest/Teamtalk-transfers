import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { User, Calendar, MapPin, Globe, Footprints, Ruler } from 'lucide-react';

interface PlayerBio {
  height?: string;
  weight?: string;
  nationality?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  preferredFoot?: string;
  description?: string;
}

interface PlayerBioModalProps {
  playerName: string;
  bio: PlayerBio;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerBioModal: React.FC<PlayerBioModalProps> = ({
  playerName,
  bio,
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6" />
            {playerName} - Bio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Physical Attributes */}
          {(bio.height || bio.weight) && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Physical Attributes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {bio.height && (
                  <div>
                    <p className="text-sm text-gray-400">Height</p>
                    <p className="text-white font-medium">{bio.height}</p>
                  </div>
                )}
                {bio.weight && (
                  <div>
                    <p className="text-sm text-gray-400">Weight</p>
                    <p className="text-white font-medium">{bio.weight}</p>
                  </div>
                )}
                {bio.preferredFoot && (
                  <div>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Footprints className="w-4 h-4" />
                      Preferred Foot
                    </p>
                    <p className="text-white font-medium">{bio.preferredFoot}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Personal Information */}
          {(bio.nationality || bio.dateOfBirth || bio.placeOfBirth) && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="space-y-2">
                {bio.nationality && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Nationality:</span>
                    <span className="text-white">{bio.nationality}</span>
                  </div>
                )}
                {bio.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Date of Birth:</span>
                    <span className="text-white">{bio.dateOfBirth}</span>
                  </div>
                )}
                {bio.placeOfBirth && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Place of Birth:</span>
                    <span className="text-white">{bio.placeOfBirth}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Description */}
          {bio.description && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-3">About</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {bio.description}
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

