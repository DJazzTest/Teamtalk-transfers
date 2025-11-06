import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'player-images', 'leeds-united');

const expected = [
  'Illan Meslier','Kristoffer Klaesson','Robin Koch','Liam Cooper','Pascal Struijk','Junior Firpo','Rasmus Kristensen','Cody Drameh','Leo Hjelde','Tyler Adams','Marc Roca','Weston McKennie','Brenden Aaronson','Jack Harrison','Luis Sinisterra','Crysencio Summerville','Sam Greenwood','Patrick Bamford','Rodrigo','Georginio Rutter','Joe Gelhardt','Wilfried Gnonto','Sonny Perkins','Darko Gyabi','Archie Gray'
];

function slug(n){
  return n.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
}

function main(){
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  for (const name of expected){
    const want = slug(name) + '.png';
    if (files.includes(want)) { continue; }
    const prefix = slug(name);
    // try exact alternatives
    const alternates = [
      prefix+'-profile.png',
      prefix+'-profile-picture.png',
      prefix.replace('wilfried','willy')+'.png',
    ];
    let from = files.find(f => alternates.includes(f));
    if (!from){
      from = files.find(f => f.startsWith(prefix));
    }
    if (from){
      fs.copyFileSync(path.join(dir, from), path.join(dir, want));
      console.log(`Aliased ${from} -> ${want}`);
    } else {
      console.warn(`Missing image source for ${name}`);
    }
  }
}

main();





