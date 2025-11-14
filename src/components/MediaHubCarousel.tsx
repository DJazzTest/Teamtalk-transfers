import React from 'react';
import { Card } from '@/components/ui/card';

export interface MediaItem {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  videoUrl?: string;
  url?: string;
  source?: string;
}

interface MediaHubCarouselProps {
  items: MediaItem[];
  title?: string;
}

export const MediaHubCarousel: React.FC<MediaHubCarouselProps> = ({ items, title = 'Media Hub' }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-4">
        <h3 className="text-white font-bold mb-3">{title}</h3>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {items.map((item) => (
            <a key={item.id} href={item.url || item.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex-none w-80">
              <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full">
                <div className="flex flex-col h-full">
                  {/* Thumbnail */}
                  <div className="w-full h-40 bg-slate-600/40">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 flex-1">
                    <div className="text-white font-semibold line-clamp-2 mb-1">{item.title}</div>
                    {item.summary && <div className="text-slate-300 text-sm line-clamp-2">{item.summary}</div>}
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MediaHubCarousel;







