import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';
const walk = d => fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const pages=[], issues=[], links=new Map();
for(const file of walk('dist').filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(file,'utf8'), $=load(html);
  if($('meta[http-equiv="refresh"]').length)continue;
  const url='/'+path.relative('dist',file).replaceAll('\\','/').replace(/index\.html$/,'');
  const title=$('title').text(),description=$('meta[name="description"]').attr('content')||'';
  const canonical=$('link[rel="canonical"]').attr('href');
  pages.push({url,title,description,canonical});
  const add=message=>issues.push({url,message});
  if(url==='/' && !$('head meta[name="google-site-verification"]').toArray().some(e=>$(e).attr('content')==='2usVXI0fx-uGkGaait9BJ5p7ONU8G4AAppbzWtaddlM'))add('Original Search Console ownership verification is missing');
  if(!title||!description)add('Missing title/description');
  if(description.includes('[...]'))add('Truncated description');
  if(!canonical?.startsWith('https://drilmax.com/'))add('Invalid canonical');
  if(canonical && new URL(canonical).search)add('Canonical contains query parameters');
  if($('h1').length!==1)add('H1 count: '+$('h1').length);
  if(html.includes('localhost:4321'))add('Localhost reference');
  if($('img:not([alt])').length)add('Images missing alt: '+$('img:not([alt])').length);
  const ogImage=$('meta[property="og:image"]').attr('content');
  if(ogImage?.startsWith('https://drilmax.com/') && !fs.existsSync(path.join('dist',decodeURIComponent(new URL(ogImage).pathname))))add('Missing social sharing image');
  $('script[type="application/ld+json"]').each((_,e)=>{try{const value=JSON.parse($(e).text());if(typeof value!=='object'||value===null)add('Schema is not an object');}catch{add('Invalid JSON-LD');}});
  for(const e of $('a[href],img[src]').toArray()){
    const raw=$(e).attr(e.tagName==='img'?'src':'href');let u;
    try{u=new URL(raw,'https://drilmax.com'+url);}catch{continue;}
    if(u.origin!=='https://drilmax.com')continue;
    let target;try{target=decodeURIComponent(u.pathname);}catch{continue;}
    const local=path.join('dist',target);
    if(fs.existsSync(local)&&fs.statSync(local).isFile()||fs.existsSync(path.join(local,'index.html')))continue;
    if(!links.has(target))links.set(target,new Set());links.get(target).add(url);
  }
}
if(!pages.length)throw Error('No built pages found');
const sitemapFiles=walk('dist').filter(f=>/sitemap.*\.xml$/.test(f));
if(!sitemapFiles.length)issues.push({url:'/',message:'Missing sitemap'});
for(const file of sitemapFiles){
  const $=load(fs.readFileSync(file,'utf8'),{xmlMode:true});
  $('url > loc').each((_,el)=>{const url=$(el).text();const route=decodeURIComponent(new URL(url).pathname);if(route.startsWith('/category/')||route.startsWith('/404'))issues.push({url,message:'Non-indexable page in sitemap'});});
}
const duplicates=key=>Object.entries(Object.groupBy(pages,p=>p[key])).filter(([,v])=>v.length>1).map(([value,v])=>({value,urls:v.map(p=>p.url)}));
const report={pageCount:pages.length,issues,duplicateTitles:duplicates('title'),duplicateDescriptions:duplicates('description'),brokenLinks:[...links].map(([target,sources])=>({target,sources:[...sources]})),pages};
fs.writeFileSync('seo-audit-results.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,pages:undefined},null,2));
if(issues.length||links.size||report.duplicateTitles.length||report.duplicateDescriptions.length)process.exitCode=1;
