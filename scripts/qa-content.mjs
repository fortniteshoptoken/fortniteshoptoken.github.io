import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd();
const read=(f)=>JSON.parse(readFileSync(join(root,f),'utf8'));
const site=read('content/generated/site.json'),home=read('content/generated/home.json'),pages=read('content/generated/pages.json');
const fails=[];const checks=[];
function check(name,condition){checks.push({name,pass:!!condition});if(!condition)fails.push(name)}
const frozen=['how-to-get-fortnite-shop-token','fortnite-token-chance','fortnite-shop-token-rewards','fortnite-shop-token-activation'];
const added=['fortnite-token-finder','fortnite-shop-token-locations'];
const expected=[...frozen,...added];
const slugs=pages.map(p=>p.slug);
const oldGuides=pages.filter(p=>frozen.includes(p.slug));
const newGuides=pages.filter(p=>added.includes(p.slug));
const text=v=>Array.isArray(v)?v.map(text).join(' '):v&&typeof v==='object'?Object.entries(v).filter(([k])=>!['id','slug','lastReviewed','pageType','enabled','navVisible'].includes(k)).map(([,x])=>text(x)).join(' '):typeof v==='string'?v:'';
const words=v=>(text(v).match(/\b[\w'-]+\b/g)||[]).length;
check('target host',site.hosting.siteUrl==='https://fortniteshoptoken.github.io');
check('correct identity',site.game.name==='Fortnite'&&site.siteName.includes('Fortnite'));
check('home + exactly six approved articles',home.enabled&&home.slug===''&&pages.length===expected.length&&expected.every(s=>slugs.includes(s)));
check('no held article published',slugs.every(s=>expected.includes(s)));
check('unique slugs',new Set(slugs).size===slugs.length);
check('home title and primary',home.title.startsWith('Fortnite Shop Token')&&home.hero.heading.includes('Fortnite Shop Token'));
check('unique page titles, descriptions and H1s', ['title','description'].every(field=>new Set([home,...pages].map(p=>p[field])).size===pages.length+1) && new Set([home,...pages].map(p=>p.hero.heading)).size===pages.length+1);
check('each frozen guide >=900 authored words',oldGuides.every(p=>words(p)>=900));
check('home >=1200 authored words',words(home)>=1200);
check('frozen guides keep rich sections',oldGuides.every(p=>p.sections.length>=5));
check('each guide has FAQ and reviewed date',pages.every(p=>p.faq?.length>=4&&/^\d{4}-\d{2}-\d{2}$/.test(p.lastReviewed)));
check('new guides have concise metadata, separate content and a sibling link', newGuides.every(p =>
  p.title.length <= 60 && p.description.length <= 160 && p.sections.length >= 2 &&
  p.sections.some(section => section.links?.some(link => added.includes(link.slug) && link.slug !== p.slug))
));
const finder = newGuides.find(p => p.slug === 'fortnite-token-finder');
const locations = newGuides.find(p => p.slug === 'fortnite-shop-token-locations');
check('Finder has tracker instructions', finder?.sections.some(section => section.steps?.length >= 3));
check('Locations has sources, a comparison and a runnable route', locations?.references?.length >= 2 &&
  locations.sections.some(section => section.table?.rows.length >= 2) &&
  locations.sections.some(section => section.steps?.length >= 5 && section.steps.length <= 7)
);
check('all internal links resolve', [home,...pages].every(p=>p.sections.every(s=>!(s.links||[]).some(l=>!slugs.includes(l.slug)))));
check('all related slugs resolve',pages.every(p=>p.relatedSlugs.every(s=>slugs.includes(s))));
check('all navigation entries published',pages.every(p=>p.enabled&&p.navVisible));
check('branded assets exist',['logo','cover','openGraph','favicon'].every(k=>existsSync(join(root,'public',site.assets[k]))));
check('authorized GA4 measurement ID',read('content/generated/integrations.json').gaMeasurementId==='G-V1DJH444FE');
check('original skin retained',readFileSync('config/skin.ts','utf8').includes('return "directory"'));
console.log('CONTENT / ROUTE SOURCE CHECKS');
for(let c of checks)console.log((c.pass?'PASS':'FAIL')+' '+c.name);
for(let p of [home,...pages])console.log('WORDS',p.slug||'/',words(p));
console.log(`${checks.filter(c=>c.pass).length}/${checks.length} static checks PASS`);
if(fails.length)process.exitCode=1;
