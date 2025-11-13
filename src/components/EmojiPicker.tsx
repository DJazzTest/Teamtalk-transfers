import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile, Angry, Heart, ThumbsUp, Fire, Trophy, DollarSign, Star } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  happy: ['😊', '😄', '😃', '😁', '😆', '😀', '🙂', '😉', '😎', '🤗'],
  angry: ['😠', '😡', '🤬', '😤', '😾', '💢', '🔥', '⚡'],
  sad: ['😢', '😭', '😞', '😔', '😟', '😕', '🙁', '☹️'],
  love: ['❤️', '💕', '💖', '💗', '💓', '💞', '💝', '😍', '🥰', '😘'],
  celebration: ['🎉', '🎊', '🥳', '🎈', '🎁', '🏆', '🥇', '👏', '🙌', '🔥'],
  money: ['💰', '💸', '💵', '💴', '💶', '💷', '💳', '💎'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎯', '🏆', '🥇'],
  thumbs: ['👍', '👎', '👌', '✌️', '🤞', '🤝', '🙏'],
  other: ['🤔', '😮', '😯', '😲', '🤯', '😱', '😴', '🤤', '😋', '🤪']
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          <Smile className="w-4 h-4 mr-2" />
          Add Emoji
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-800 border-slate-700 p-4" align="start">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Happy */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Happy</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CATEGORIES.happy.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to insert"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Angry */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Angry className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-semibold text-white">Angry</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CATEGORIES.angry.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to insert"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Love */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <h4 className="text-sm font-semibold text-white">Love</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CATEGORIES.love.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to insert"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Celebration */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Celebration</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CATEGORIES.celebration.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to insert"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Money */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <h4 className="text-sm font-semibold text-white">Money</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CATEGORIES.money.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to insert"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Sports */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Sports</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CATEGORIES.sports.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to insert"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Thumbs</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CATEGORIES.thumbs.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to insert"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Other */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-semibold text-white">Other</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CATEGORIES.other.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to insert"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

