import React from 'react';
import { ExternalLink, Facebook, Instagram, Youtube } from 'lucide-react';

export const PlanetSportFooter: React.FC = () => {
  return (
    <div className="bg-[#1a1d24] dark:bg-[#0f1115] text-white" style={{ padding: '32px 16px', width: '960px', margin: '0 auto' }}>
      <div style={{ width: '960px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '32px', marginBottom: '32px' }}>
          {/* Planet Sport Network */}
          <div>
            <h3 className="text-white font-bold mb-3 pb-2 border-b border-white/20 text-base">Planet Sport Network</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {/* PlanetSport Logo */}
              <a href="https://www.planetsport.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/planet-sport.png" width="32" height="32" alt="PlanetSport" />
              </a>
              {/* Football365 Logo */}
              <a href="https://www.football365.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/football-365.png" width="30" height="30" alt="Football365" />
              </a>
              {/* TEAMtalk Logo */}
              <a href="https://www.teamtalk.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png" width="30" height="27" alt="TEAMtalk" />
              </a>
              {/* PlanetF1 Logo */}
              <a href="https://www.planetf1.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/planet-f1.png" width="27" height="17" alt="PlanetF1" />
              </a>
              {/* Planet Football Logo */}
              <a href="https://www.planetfootball.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/planet-football.png" width="36" height="36" alt="Planet Football" />
              </a>
              {/* PlanetRugby Logo */}
              <a href="https://www.planetrugby.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/planet-rugby.png" width="23" height="34" alt="PlanetRugby" />
              </a>
              {/* LoveRugbyLeague Logo */}
              <a href="https://www.loverugbyleague.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/love-rugby-league.png" width="28" height="28" alt="LoveRugbyLeague" />
              </a>
              {/* Tennis365 Logo */}
              <a href="https://www.tennis365.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/tennis-365.png?v=20240607" width="28" height="28" alt="Tennis365" />
              </a>
              {/* Golf365 Logo */}
              <a href="https://www.golf365.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/golf365.png" width="32" height="28" alt="Golf365" />
              </a>
              {/* Cricket365 Logo */}
              <a href="https://www.cricket365.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                <img className="object-contain" src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/footer/cricket-365.png?v=20240607" width="32" height="28" alt="Cricket365" />
              </a>
            </div>
          </div>

          {/* Planet Sport Group */}
          <div>
            <h3 className="text-white font-bold mb-3 pb-2 border-b border-white/20 text-base">Planet Sport Group</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.planetsport.com/corporate" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  Planet Sport Corporate Site
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.planetsport.com/contact" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  Corporate, Marketing & B2B Enquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Planet Sport Partners */}
          <div>
            <h3 className="text-white font-bold mb-3 pb-2 border-b border-white/20 text-base">Planet Sport Partners</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.skysports.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  Sky Sports
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.sabc.co.za/sport" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  SABC Sport
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.racingandsports.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  Racing and Sports
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.dragonsports.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  DragonSports
                </a>
              </li>
            </ul>
          </div>

          {/* TEAMtalk Info */}
          <div>
            <h3 className="text-white font-bold mb-3 pb-2 border-b border-white/20 text-base">TEAMtalk Info</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.teamtalk.com/about" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  About TEAMtalk
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.teamtalk.com/contact" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  Contact Us
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.teamtalk.com/terms" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  Terms & Conditions
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.teamtalk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  Privacy Policy & Cookie Notice
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.teamtalk.com/preferences" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm block py-1">
                  Preferences & Consent Settings
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold mb-3 pb-2 border-b border-white/20 text-base">Social</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.facebook.com/teamtalk" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm flex items-center gap-2 py-1">
                  <Facebook className="w-4 h-4 flex-shrink-0" />
                  Facebook
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://twitter.com/teamtalk" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm flex items-center gap-2 py-1">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  X
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.instagram.com/teamtalk" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm flex items-center gap-2 py-1">
                  <Instagram className="w-4 h-4 flex-shrink-0" />
                  Instagram
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="https://www.youtube.com/teamtalk" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#05DF72] transition-colors text-sm flex items-center gap-2 py-1">
                  <Youtube className="w-4 h-4 flex-shrink-0" />
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* TEAMtalk Logo and Copyright */}
        <div className="text-center pt-8 border-t border-white/20">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2">
              <img 
                src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png" 
                alt="TEAMtalk" 
                className="h-8 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-[#05DF72] font-bold text-2xl">TEAMTALK</span>';
                  }
                }}
              />
            </div>
          </div>
          <p className="text-white/70 text-sm">
            © Planet Sport Limited 2025 • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

