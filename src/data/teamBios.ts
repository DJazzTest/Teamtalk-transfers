export interface TeamBioFact {
  label: string;
  value: string;
}

export interface TeamBioEntry {
  intro: string;
  history: string;
  honoursHeading?: string;
  honours: string[];
  facts?: TeamBioFact[];
  website?: string;
  twitter?: string;
}

export type TeamBioMap = Record<string, TeamBioEntry>;

export const DEFAULT_TEAM_BIOS: TeamBioMap = {
  'Leeds United': {
    intro:
      'Leeds United Football Club is a professional football club based in Leeds, West Yorkshire, England, founded on 17 October 1919. The club plays its home matches at Elland Road, which has a capacity of 37,645. Leeds United are nicknamed “The Whites” due to their iconic all-white kit, inspired by Real Madrid during the Don Revie era.',
    honoursHeading: 'Major honours',
    honours: [
      '3 First Division titles (1968–69, 1973–74, 1991–92)',
      '1 FA Cup (1972)',
      '1 League Cup (1968)',
      '2 Inter-Cities Fairs Cups (1968, 1971)',
      '2 Charity Shields (1969, 1992)',
    ],
    history:
      'The club experienced its golden era under Don Revie in the 1960s and 70s, becoming one of the most feared sides in Europe. After a decline and financial turmoil in the early 2000s, Leeds returned to the Premier League in 2020 under Marcelo Bielsa and again in 2025 under Daniel Farke.',
    facts: [
      { label: 'Founded', value: '17 October 1919' },
      { label: 'Location', value: 'Leeds, West Yorkshire' },
      { label: 'Stadium', value: 'Elland Road (37,645)' },
      { label: 'Nickname', value: 'The Whites' },
      { label: 'Manager', value: 'Daniel Farke' },
    ],
    website: 'https://www.leedsunited.com',
    twitter: 'https://x.com/LUFC',
  },
  'Manchester United': {
    intro:
      'Manchester United Football Club, commonly known as Man United or “The Red Devils”, is based in Old Trafford, Greater Manchester, England. The club was originally founded in 1878 as Newton Heath LYR F.C., and renamed Manchester United in 1902. Their home ground is Old Trafford, with a capacity of 74,310.',
    honoursHeading: 'Major honours',
    honours: [
      '20 English league titles (record)',
      '12 FA Cups',
      '6 League Cups',
      '3 UEFA Champions League titles (1968, 1999, 2008)',
      '1 FIFA Club World Cup (2008)',
      '1 UEFA Europa League (2017)',
      '21 FA Community Shields',
    ],
    history:
      'The club’s most iconic era came under Sir Alex Ferguson, who managed from 1986 to 2013, winning 38 trophies including the historic 1999 treble (Premier League, FA Cup, Champions League). United are known for their attacking style, youth development, and global fanbase.',
    facts: [
      { label: 'Founded', value: '1878 (as Newton Heath LYR F.C.)' },
      { label: 'Location', value: 'Old Trafford, Greater Manchester' },
      { label: 'Stadium', value: 'Old Trafford (74,310)' },
      { label: 'Nickname', value: 'The Red Devils' },
      { label: 'Manager', value: 'Rúben Amorim' },
    ],
    website: 'https://www.manutd.com',
    twitter: 'https://x.com/ManUtd',
  },
  'Aston Villa': {
    intro:
      'Aston Villa Football Club are one of the oldest and most decorated clubs in English football. Founded on 21 November 1874 and based in Birmingham, they were founding members of both the Football League (1888) and the Premier League (1992). Villa Park has been their home since 1897.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division / Premier League: 7',
      'FA Cup: 7',
      'League Cup: 5',
      'European Cup: 1 (1982)',
      'UEFA Super Cup: 1 (1982)',
    ],
    history:
      'Villa played a pivotal role in shaping English football, with director William McGregor credited as the founder of the Football League. Their golden era came in the early 1980s, capped by a European Cup triumph, and they maintain a fierce rivalry with Birmingham City in the Second City Derby.',
    facts: [
      { label: 'Founded', value: '21 November 1874' },
      { label: 'Location', value: 'Birmingham, England' },
      { label: 'Stadium', value: 'Villa Park (42,657)' },
      { label: 'Nickname', value: 'The Villans' },
      { label: 'Manager', value: 'Unai Emery' },
    ],
    website: 'https://www.avfc.co.uk',
    twitter: 'https://x.com/AVFCOfficial',
  },
  Bournemouth: {
    intro:
      'Bournemouth spent most of their history in the lower leagues before a remarkable rise under Eddie Howe, culminating in their first-ever Premier League promotion in 2015. Known for their compact stadium and attacking football, they’ve become a respected top-flight side despite modest resources.',
    honoursHeading: 'Major honours',
    honours: [
      'Championship Winners: 1 (2014–15)',
      'League One Runners-up: 1 (2012–13)',
    ],
    history:
      'Their nickname “The Cherries” is thought to derive from the cherry-red stripes of their kit and the nearby cherry orchards. Vitality Stadium (Dean Court) provides one of the most intimate atmospheres in the Premier League.',
    facts: [
      { label: 'Founded', value: '1899 (as Boscombe FC)' },
      { label: 'Location', value: 'Bournemouth, Dorset' },
      { label: 'Stadium', value: 'Vitality Stadium (11,307)' },
      { label: 'Nickname', value: 'The Cherries' },
      { label: 'Head Coach', value: 'Andoni Iraola' },
    ],
    website: 'https://www.afcb.co.uk',
    twitter: 'https://x.com/afcbournemouth',
  },
  Arsenal: {
    intro:
      'Arsenal are one of England’s most successful and historic clubs. Founded in 1886 as Dial Square, they moved from Woolwich to Highbury in 1913 before relocating to the Emirates Stadium in 2006. Under Arsène Wenger they became synonymous with fluid attacking football and famously went unbeaten in 2003–04.',
    honoursHeading: 'Major honours',
    honours: [
      'English League Titles: 13',
      'FA Cups: 14 (record)',
      'League Cups: 2',
      'UEFA Cup Winners’ Cup: 1 (1994)',
      'Community Shields: 17',
    ],
    history:
      'Arsenal’s fierce rivalry with Tottenham Hotspur fuels the North London Derby, one of world football’s classic fixtures. The club continues to challenge at the top level under Mikel Arteta, blending academy graduates with elite recruits.',
    facts: [
      { label: 'Founded', value: '1886 (as Dial Square)' },
      { label: 'Location', value: 'North London' },
      { label: 'Stadium', value: 'Emirates Stadium (60,704)' },
      { label: 'Nickname', value: 'The Gunners' },
      { label: 'Manager', value: 'Mikel Arteta' },
    ],
    website: 'https://www.arsenal.com',
    twitter: 'https://x.com/Arsenal',
  },
  Liverpool: {
    intro:
      'Liverpool Football Club are one of the most decorated clubs in world football. Founded on 3 June 1892, their dominance in the 1970s and 80s under Bill Shankly and Bob Paisley set the standard, while Jürgen Klopp restored European glory in the modern era.',
    honoursHeading: 'Major honours',
    honours: [
      'English League Titles: 19',
      'FA Cups: 8',
      'League Cups: 9',
      'UEFA Champions League: 6',
      'UEFA Europa League: 3',
      'FIFA Club World Cup: 1',
      'UEFA Super Cups: 4',
      'Community Shields: 16',
    ],
    history:
      'Their anthem “You’ll Never Walk Alone” is sung passionately at Anfield, now expanded to 61,000 seats. The Merseyside club remain renowned for high-intensity pressing, European pedigree, and one of the most devoted fanbases in the game.',
    facts: [
      { label: 'Founded', value: '3 June 1892' },
      { label: 'Location', value: 'Liverpool, Merseyside' },
      { label: 'Stadium', value: 'Anfield (61,000)' },
      { label: 'Nickname', value: 'The Reds' },
      { label: 'Head Coach', value: 'Arne Slot' },
    ],
    website: 'https://www.liverpoolfc.com',
    twitter: 'https://x.com/LFC',
  },
  'Manchester City': {
    intro:
      'Manchester City were founded in 1880 as St. Mark’s, becoming Manchester City in 1894. Since the 2008 takeover by City Football Group they have evolved into a modern powerhouse, renowned for technical football and relentless success under Pep Guardiola.',
    honoursHeading: 'Major honours',
    honours: [
      'English League Titles: 9',
      'FA Cups: 6',
      'League Cups: 8',
      'UEFA Champions League: 1 (2023)',
      'UEFA Super Cup: 1',
      'FIFA Club World Cup: 1',
      'Community Shields: 6',
    ],
    history:
      'City completed a historic treble in 2022–23, winning the Premier League, FA Cup and Champions League. Their Etihad Campus infrastructure and global club network underpin sustained dominance.',
    facts: [
      { label: 'Founded', value: '1880 (as St. Mark’s)' },
      { label: 'Location', value: 'Manchester' },
      { label: 'Stadium', value: 'Etihad Stadium (53,500)' },
      { label: 'Nickname', value: 'The Citizens' },
      { label: 'Manager', value: 'Pep Guardiola' },
    ],
    website: 'https://www.mancity.com',
    twitter: 'https://x.com/ManCity',
  },
  'Newcastle United': {
    intro:
      'Newcastle United were formed in 1892 through the merger of Newcastle East End and West End. Their black-and-white stripes and St James’ Park fortress embody the pride of Tyneside, with one of England’s most passionate fanbases.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division Titles: 4',
      'FA Cups: 6',
      'Inter-Cities Fairs Cup: 1 (1969)',
      'Championship Winners: 4',
    ],
    history:
      'Backed by Saudi ownership since 2021, Newcastle have re-emerged as genuine contenders under Eddie Howe. Despite a long wait for silverware, optimism is high that a new era of trophies is within reach.',
    facts: [
      { label: 'Founded', value: '1892' },
      { label: 'Location', value: 'Newcastle upon Tyne' },
      { label: 'Stadium', value: 'St James’ Park (52,305)' },
      { label: 'Nickname', value: 'The Magpies' },
      { label: 'Manager', value: 'Eddie Howe' },
    ],
    website: 'https://www.nufc.co.uk',
    twitter: 'https://x.com/NUFC',
  },
  'Nottingham Forest': {
    intro:
      'Founded in 1865, Nottingham Forest are one of England’s most storied clubs, best known for their back-to-back European Cup triumphs under Brian Clough in 1979 and 1980. They returned to the Premier League in 2022 after 23 years away.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division: 1 (1977–78)',
      'FA Cups: 2',
      'League Cups: 4',
      'European Cups: 2 (1979, 1980)',
      'UEFA Super Cup: 1 (1979)',
    ],
    history:
      'Forest’s legacy is defined by Clough’s underdog success and their ability to punch above their weight on the European stage. Recent investment aims to cement their place in the top flight.',
    facts: [
      { label: 'Founded', value: '1865' },
      { label: 'Location', value: 'Nottingham' },
      { label: 'Stadium', value: 'City Ground (30,445)' },
      { label: 'Nickname', value: 'Forest' },
      { label: 'Manager', value: 'Nuno Espírito Santo' },
    ],
    website: 'https://www.nottinghamforest.co.uk',
    twitter: 'https://x.com/NFFC',
  },
  Sunderland: {
    intro:
      'Sunderland AFC, founded in 1879, carry a proud working-class identity rooted in Wearside. They returned to the Premier League in 2025 after years of rebuilding, rekindling one of England’s fiercest derbies with Newcastle.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division Titles: 6',
      'FA Cups: 2 (1937, 1973)',
      'Championship Winners: 5',
      'League One Playoff Winners: 2022',
    ],
    history:
      'The Black Cats’ shock 1973 FA Cup win over Leeds remains one of the great upsets. With a 49,000-seat Stadium of Light and passionate following, Sunderland are determined to re-establish themselves at the top level.',
    facts: [
      { label: 'Founded', value: '1879' },
      { label: 'Location', value: 'Sunderland, Tyne and Wear' },
      { label: 'Stadium', value: 'Stadium of Light (49,000)' },
      { label: 'Nickname', value: 'The Black Cats' },
      { label: 'Manager', value: 'Michael Beale' },
    ],
    website: 'https://www.safc.com',
    twitter: 'https://x.com/SunderlandAFC',
  },
  'Tottenham Hotspur': {
    intro:
      'Tottenham Hotspur were founded in 1882 and are renowned for attacking tradition and stylish football. Spurs were the first 20th-century club to win the English league and FA Cup double (1960–61) and now play in a state-of-the-art 62,850-seat stadium.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division Titles: 2',
      'FA Cups: 8',
      'League Cups: 4',
      'UEFA Cup: 2',
      'Cup Winners’ Cup: 1',
      'Community Shields: 7',
    ],
    history:
      'The North London Derby with Arsenal is one of the sport’s most intense rivalries. Under Ange Postecoglou, Spurs are embracing front-foot football once again.',
    facts: [
      { label: 'Founded', value: '1882' },
      { label: 'Location', value: 'North London' },
      { label: 'Stadium', value: 'Tottenham Hotspur Stadium (62,850)' },
      { label: 'Nickname', value: 'Spurs' },
      { label: 'Head Coach', value: 'Ange Postecoglou' },
    ],
    website: 'https://www.tottenhamhotspur.com',
    twitter: 'https://x.com/SpursOfficial',
  },
  'West Ham United': {
    intro:
      'Founded in 1895 as Thames Ironworks, West Ham United embody East London’s working-class culture. The Hammers are famed for their “Academy of Football”, producing icons such as Bobby Moore and Geoff Hurst.',
    honoursHeading: 'Major honours',
    honours: [
      'FA Cups: 3',
      'UEFA Cup Winners’ Cup: 1 (1965)',
      'UEFA Europa Conference League: 1 (2023)',
      'Championship Winners: 2',
    ],
    history:
      'In 2023 West Ham lifted their first major European trophy in over 50 years by winning the Europa Conference League. Now settled in the 62,500-seat London Stadium, they aim to regularly compete in Europe.',
    facts: [
      { label: 'Founded', value: '1895 (as Thames Ironworks)' },
      { label: 'Location', value: 'East London' },
      { label: 'Stadium', value: 'London Stadium (62,500)' },
      { label: 'Nickname', value: 'The Hammers' },
      { label: 'Manager', value: 'Julen Lopetegui' },
    ],
    website: 'https://www.whufc.com',
    twitter: 'https://x.com/WestHam',
  },
  'Brentford': {
    intro:
      'Brentford Football Club, based in West London, were founded on 10 October 1889 and now play at the Gtech Community Stadium. Their innovative, data-driven approach has guided them from the lower leagues to the Premier League.',
    honoursHeading: 'Major honours',
    honours: [
      'Championship Playoff Winners: 2021',
      'Third Division South Champions: 3 times',
      'FA Cup Quarter-finalists: multiple times',
    ],
    history:
      'Promoted to the Premier League in 2021 after decades away, Brentford have become a model of sustainable success. Their rivalry with Fulham and QPR forms the West London Derby triangle, while smart analytics and academy development power their rise.',
    facts: [
      { label: 'Founded', value: '10 October 1889' },
      { label: 'Location', value: 'Brentford, West London' },
      { label: 'Stadium', value: 'Gtech Community Stadium (17,250)' },
      { label: 'Nickname', value: 'The Bees' },
      { label: 'Head Coach', value: 'Keith Andrews' },
    ],
    website: 'https://www.brentfordfc.com',
    twitter: 'https://x.com/BrentfordFC',
  },
  'Brighton & Hove Albion': {
    intro:
      'Brighton & Hove Albion, founded on 24 June 1901, play on the south coast at the Amex Stadium (Falmer Stadium). The Seagulls moved into the Amex in 2011 and have since become known for progressive football and smart recruitment.',
    honoursHeading: 'Major honours',
    honours: [
      'FA Charity Shield: 1 (shared, 1910)',
      'Championship Runners-up: 2016–17',
      'FA Cup Finalists: 1983',
    ],
    history:
      'Brighton’s modern resurgence began with their stadium move and Premier League promotion in 2017. They are admired for attacking, possession-based football, youth development, and a growing global fanbase that now sees them as European contenders.',
    facts: [
      { label: 'Founded', value: '24 June 1901' },
      { label: 'Location', value: 'Brighton & Hove, East Sussex' },
      { label: 'Stadium', value: 'Amex Stadium (31,876)' },
      { label: 'Nickname', value: 'The Seagulls' },
      { label: 'Head Coach', value: 'Fabian Hürzeler' },
    ],
    website: 'https://www.brightonandhovealbion.com',
    twitter: 'https://x.com/OfficialBHAFC',
  },
  'Burnley': {
    intro:
      'Burnley Football Club, founded on 18 May 1882, are based in Lancashire and play at Turf Moor, one of the oldest continuously used grounds in English football. The Clarets were founding members of the Football League in 1888.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division / Premier League titles: 2 (1920–21, 1959–60)',
      'FA Cup: 1 (1914)',
      'FA Charity Shield: 2 (1960, shared 1973)',
      'Championship Winners: 3 (most recently 2022–23)',
    ],
    history:
      'Burnley have a proud reputation for punching above their weight, deeply rooted in community values. Under Vincent Kompany they adopted a more possession-based style, earning praise for their transformation and rapid return to the top flight.',
    facts: [
      { label: 'Founded', value: '18 May 1882' },
      { label: 'Location', value: 'Burnley, Lancashire' },
      { label: 'Stadium', value: 'Turf Moor (21,944)' },
      { label: 'Nickname', value: 'The Clarets' },
      { label: 'Manager', value: 'Vincent Kompany' },
    ],
    website: 'https://www.burnleyfootballclub.com',
    twitter: 'https://x.com/BurnleyOfficial',
  },
  'Chelsea': {
    intro:
      'Chelsea Football Club were founded on 10 March 1905 in Fulham, London, and have played at Stamford Bridge ever since. Known as “The Blues”, they became a global powerhouse following Roman Abramovich’s takeover in the early 2000s.',
    honoursHeading: 'Major honours',
    honours: [
      'Premier League / First Division: 6',
      'FA Cups: 8',
      'League Cups: 5',
      'UEFA Champions League: 2 (2012, 2021)',
      'UEFA Europa League: 2 (2013, 2019)',
      'FIFA Club World Cup: 1 (2021)',
      'UEFA Super Cup: 2',
    ],
    history:
      'Chelsea’s aggressive transfer strategy and willingness to change managers delivered silverware across every major competition. Their Cobham academy has produced stars such as Mason Mount and Reece James while the club’s global brand continues to expand.',
    facts: [
      { label: 'Founded', value: '10 March 1905' },
      { label: 'Location', value: 'Fulham, London' },
      { label: 'Stadium', value: 'Stamford Bridge (40,341)' },
      { label: 'Nickname', value: 'The Blues' },
      { label: 'Head Coach', value: 'Enzo Maresca' },
    ],
    website: 'https://www.chelseafc.com',
    twitter: 'https://x.com/ChelseaFC',
  },
  'Crystal Palace': {
    intro:
      'Crystal Palace Football Club, founded on 10 September 1905, are based in South London and play at Selhurst Park. Nicknamed “The Eagles”, they are renowned for their passionate fanbase and South London identity.',
    honoursHeading: 'Major honours',
    honours: [
      'Championship Playoff Winners: 4 times',
      'FA Cup Finalists: 2 (1990, 2016)',
      'Full Members Cup: 1 (1991)',
    ],
    history:
      'Palace have spent much of their history bouncing between the top two divisions but have established themselves as a respected Premier League outfit. They boast a strong academy record, producing talents such as Wilfried Zaha and Eberechi Eze, and maintain a fierce rivalry with Brighton.',
    facts: [
      { label: 'Founded', value: '10 September 1905' },
      { label: 'Location', value: 'Selhurst, South London' },
      { label: 'Stadium', value: 'Selhurst Park (25,486)' },
      { label: 'Nickname', value: 'The Eagles' },
      { label: 'Manager', value: 'Oliver Glasner' },
    ],
    website: 'https://www.cpfc.co.uk',
    twitter: 'https://x.com/CPFC',
  },
  'Everton': {
    intro:
      'Everton Football Club are one of England’s oldest and most decorated clubs, founded in 1878 in Liverpool. They were founding members of the Football League in 1888 and have played more top-flight seasons than any other English club.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division / Premier League titles: 9',
      'FA Cups: 5',
      'League Titles: 9',
      'European Cup Winners’ Cup: 1 (1985)',
      'FA Charity Shields: 9',
    ],
    history:
      'Everton’s fierce rivalry with Liverpool in the Merseyside Derby is one of the most historic in world football. The club currently play at Goodison Park but are constructing the new Bramley-Moore Dock Stadium on the banks of the River Mersey.',
    facts: [
      { label: 'Founded', value: '1878' },
      { label: 'Location', value: 'Liverpool, Merseyside' },
      { label: 'Stadium', value: 'Goodison Park (39,414)' },
      { label: 'Nickname', value: 'The Toffees' },
      { label: 'Manager', value: 'Sean Dyche' },
    ],
    website: 'https://www.evertonfc.com',
    twitter: 'https://x.com/Everton',
  },
  'Fulham': {
    intro:
      'Fulham Football Club, founded in 1879, are London’s oldest professional club and play at the picturesque riverside Craven Cottage. Often labelled a yo-yo club, they have built a reputation for attractive football and strong academy development.',
    honoursHeading: 'Major honours',
    honours: [
      'Championship Winners: 2 (2000–01, 2021–22)',
      'FA Cup Finalists: 1975',
      'UEFA Europa League Finalists: 2010',
    ],
    history:
      'Fulham’s rivalry with Chelsea and Queens Park Rangers forms part of the West London football triangle. Their run to the 2010 UEFA Europa League final under Roy Hodgson remains one of the club’s proudest achievements.',
    facts: [
      { label: 'Founded', value: '1879' },
      { label: 'Location', value: 'Fulham, London' },
      { label: 'Stadium', value: 'Craven Cottage (29,130)' },
      { label: 'Nickname', value: 'The Cottagers' },
      { label: 'Manager', value: 'Marco Silva' },
    ],
    website: 'https://www.fulhamfc.com',
    twitter: 'https://x.com/FulhamFC',
  },
  'Wolverhampton Wanderers': {
    intro:
      'Wolverhampton Wanderers are one of the oldest and most historically rich clubs in English football. Founded in 1877 as St. Luke’s FC before merging with Blakenhall Wanderers, they were founding members of the Football League in 1888 and have played at Molineux since 1889.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division / Premier League titles: 3 (1953–54, 1957–58, 1958–59)',
      'FA Cups: 4 (1893, 1908, 1949, 1960)',
      'League Cups: 2 (1974, 1980)',
      'FA Charity Shields: 4 (including shared titles)',
      'UEFA Cup Finalists: 1972',
    ],
    history:
      'Wolves dominated English football in the 1950s under Stan Cullis, pioneering floodlit friendlies against Europe’s elite and helping inspire continental competitions. Club legend Billy Wright became the first footballer to earn 100 international caps. Despite financial crises and relegations, Wolves have continually bounced back, with a modern resurgence in 2018 under Nuno Espírito Santo bringing European nights back to Molineux.',
    facts: [
      { label: 'Founded', value: '1877 (as St. Luke’s FC)' },
      { label: 'Location', value: 'Wolverhampton, West Midlands' },
      { label: 'Stadium', value: 'Molineux Stadium (31,750)' },
      { label: 'Nickname', value: 'Wolves / The Old Gold' },
      { label: 'Manager', value: 'Gary O’Neil' },
    ],
    website: 'https://www.wolves.co.uk',
    twitter: 'https://x.com/Wolves',
  },
  'Ipswich Town': {
    intro:
      'Ipswich Town Football Club, founded in 1878, are based in Ipswich, Suffolk. The Tractor Boys returned to the Premier League in 2024 after 22 years away, achieving back-to-back promotions under Kieran McKenna.',
    honoursHeading: 'Major honours',
    honours: [
      'First Division: 1 (1961–62)',
      'FA Cup: 1 (1978)',
      'UEFA Cup: 1 (1981)',
      'Championship Winners: 2 (1961–62, 1967–68)',
    ],
    history:
      'Ipswich enjoyed their greatest success under Sir Bobby Robson in the 1970s and early 1980s, winning the FA Cup and UEFA Cup. After years in the lower leagues, they achieved a remarkable return to the Premier League under McKenna\'s progressive, attacking style.',
    facts: [
      { label: 'Founded', value: '1878' },
      { label: 'Location', value: 'Ipswich, Suffolk' },
      { label: 'Stadium', value: 'Portman Road (30,311)' },
      { label: 'Nickname', value: 'The Tractor Boys' },
      { label: 'Manager', value: 'Kieran McKenna' },
    ],
    website: 'https://www.itfc.co.uk',
    twitter: 'https://x.com/IpswichTown',
  },
  'Leicester City': {
    intro:
      'Leicester City Football Club, founded in 1884 as Leicester Fosse, achieved one of football\'s greatest underdog stories by winning the Premier League in 2015–16 under Claudio Ranieri. The Foxes returned to the top flight in 2024 after a season in the Championship.',
    honoursHeading: 'Major honours',
    honours: [
      'Premier League: 1 (2015–16)',
      'First Division: 1 (1928–29)',
      'FA Cups: 1 (2021)',
      'League Cups: 3',
      'Championship Winners: 7',
    ],
    history:
      'Leicester\'s 2015–16 title triumph remains one of the most remarkable achievements in football history. The club has consistently punched above its weight, winning the FA Cup in 2021 and establishing themselves as a respected Premier League side.',
    facts: [
      { label: 'Founded', value: '1884 (as Leicester Fosse)' },
      { label: 'Location', value: 'Leicester, Leicestershire' },
      { label: 'Stadium', value: 'King Power Stadium (32,262)' },
      { label: 'Nickname', value: 'The Foxes' },
      { label: 'Manager', value: 'Steve Cooper' },
    ],
    website: 'https://www.lcfc.com',
    twitter: 'https://x.com/LCFC',
  },
  'Southampton': {
    intro:
      'Southampton Football Club, founded in 1885 as St. Mary\'s Y.M.A., are based on the south coast of England. The Saints returned to the Premier League in 2024 under Russell Martin, known for their academy development and attractive football.',
    honoursHeading: 'Major honours',
    honours: [
      'FA Cup: 1 (1976)',
      'FA Charity Shield: 1 (1976)',
      'Championship Winners: 1 (1965–66)',
      'League One Winners: 1 (2010–11)',
    ],
    history:
      'Southampton are renowned for their excellent academy, producing talents such as Gareth Bale, Theo Walcott, and Alex Oxlade-Chamberlain. The club has a reputation for developing young players and playing attractive, possession-based football.',
    facts: [
      { label: 'Founded', value: '1885 (as St. Mary\'s Y.M.A.)' },
      { label: 'Location', value: 'Southampton, Hampshire' },
      { label: 'Stadium', value: 'St. Mary\'s Stadium (32,384)' },
      { label: 'Nickname', value: 'The Saints' },
      { label: 'Manager', value: 'Russell Martin' },
    ],
    website: 'https://www.southamptonfc.com',
    twitter: 'https://x.com/SouthamptonFC',
  },
};

export const TEAM_BIO_TEAMS = Object.keys(DEFAULT_TEAM_BIOS);

export const sanitizeTeamBioMap = (input: any): TeamBioMap => {
  if (!input || typeof input !== 'object') return {};
  return Object.entries(input).reduce<TeamBioMap>((acc, [club, data]) => {
    if (!data || typeof data !== 'object') return acc;
    const entry = data as Partial<TeamBioEntry>;
    acc[club] = {
      intro: typeof entry.intro === 'string' ? entry.intro : '',
      history: typeof entry.history === 'string' ? entry.history : '',
      honoursHeading: typeof entry.honoursHeading === 'string' ? entry.honoursHeading : 'Major honours',
      honours: Array.isArray(entry.honours) ? entry.honours.filter(item => typeof item === 'string') : [],
      facts: Array.isArray(entry.facts)
        ? entry.facts
            .filter(
              fact => fact && typeof fact === 'object' && typeof fact.label === 'string' && typeof fact.value === 'string'
            )
            .map(fact => ({ label: fact.label, value: fact.value }))
        : [],
      website: typeof entry.website === 'string' ? entry.website : undefined,
      twitter: typeof entry.twitter === 'string' ? entry.twitter : undefined,
    };
    return acc;
  }, {});
};

