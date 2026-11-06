import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'content/cv.json'), 'utf8'));
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
const e = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const links = Object.entries(data.links).map(([label, url]) => `<a href="${e(url)}">${e(label)} <span aria-hidden="true">↗</span></a>`).join('');
for (const lang of ['ru', 'en']) {
  const c = data[lang];
  const other = lang === 'en' ? 'ru' : 'en';
  const sectionTitle = (number, label) => `<div class="section-label"><span>${number}</span><h2>${e(label)}</h2></div>`;
  const html = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${e(c.intro)}"><meta name="color-scheme" content="light">
<title>${e(c.name)} — ${e(c.role)}</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="style.css">
<link rel="alternate" hreflang="${other}" href="${other}.html"></head>
<body id="top"><a class="skip" href="#main">${e(c.skip)}</a>
<header class="topbar"><a class="wordmark" href="#top" aria-label="${e(c.name)}">VV<span> / ENVIRONMENT ART</span></a>
<nav aria-label="${lang === 'ru' ? 'Навигация' : 'Navigation'}">${c.nav.map((s,i)=>`<a href="#${['experience','projects','skills','contact'][i]}">${e(s)}</a>`).join('')}</nav>
<div class="languages"><a href="ru.html" lang="ru" ${lang==='ru'?'aria-current="page"':''}>RU</a><span>/</span><a href="en.html" lang="en" ${lang==='en'?'aria-current="page"':''}>EN</a></div></header>
<main id="main"><section class="hero" aria-labelledby="name"><div class="eyebrow"><span>${e(c.role)}</span><span>HOUDINI / UNREAL ENGINE</span></div>
<h1 id="name">${e(c.name).split(' ').join('<br> ')}</h1>
<div class="hero-bottom"><p class="focus">${e(c.focus)}</p><div class="hero-intro"><p>${e(c.intro)}</p><a class="download" href="vitaliy-vishnev-${lang}.pdf" download>${e(c.download)} <span aria-hidden="true">↓</span></a><span class="pdf-label">${e(c.pdfLabel)}</span></div></div>
<div class="location"><span>${e(c.location)}</span><span>${e(c.availability)}</span></div></section>
<div class="print-contact"><div class="print-role">${e(c.role)} · Houdini / Unreal Engine</div><p>${e(c.location)} · ${e(c.availability)}</p><div><a href="mailto:${e(data.email)}">${e(data.email)}</a> · <a href="${e(data.links.Telegram)}">t.me/snusprincess</a> · <a href="${e(data.links.ArtStation)}">artstation.com/vitaliyvishnev</a></div></div>
<p class="print-summary">${e(c.intro)}</p>
<section class="about section">${sectionTitle('01',c.aboutLabel)}<p>${e(c.about)}</p></section>
<section id="experience" class="section experience">${sectionTitle('02',c.nav[0])}<div class="section-body"><div class="job-heading"><h3>${e(c.experience.company)}</h3><span>${e(c.experience.dates)}</span></div><div class="job-role">${e(c.experience.role)} <span>/</span> <a href="${e(c.experience.url)}">${e(c.experience.project)} ↗</a></div><p class="job-summary">${e(c.experience.summary)}</p><ul>${c.experience.bullets.map(b=>`<li>${e(b)}</li>`).join('')}</ul></div></section>
<section id="projects" class="section projects">${sectionTitle('03',c.nav[1])}<div class="section-body">${c.projects.map((p,i)=>`<article class="project"><div class="project-index">0${i+1}</div><div><p class="project-type">${e(p.type)}</p><h3><a href="${e(p.url)}">${e(p.title)} <span aria-hidden="true">↗</span></a></h3><p>${e(p.text)}</p><p class="credits">${e(p.credits)}</p></div></article>`).join('')}</div></section>
<section id="skills" class="section skills">${sectionTitle('04',c.nav[2])}<div class="section-body"><div class="skill-grid">${c.skills.map(s=>`<div><h3>${e(s.title)}</h3><p>${e(s.text)}</p></div>`).join('')}</div><div class="language"><h3>${e(c.languageLabel)}</h3><p>${e(c.language)}</p></div></div></section>
<section id="contact" class="contact"><div class="contact-top"><span>05 / ${e(c.nav[3])}</span><span>${e(c.availability)}</span></div><h2>${e(c.contactTitle).replace('\n','<br>')}</h2><p>${e(c.contactText)}</p><a class="email" href="mailto:${e(data.email)}">${e(data.email)} <span aria-hidden="true">↗</span></a><div class="socials">${links}</div></section>
</main><footer><span>© ${new Date().getFullYear()} ${e(c.name)}</span><a href="#top">${e(c.back)} ↑</a></footer></body></html>`;
  await writeFile(path.join(out, `${lang}.html`), html);
}
await copyFile(path.join(out, 'en.html'), path.join(out, 'index.html'));
await copyFile(path.join(root, 'src/style.css'), path.join(out, 'style.css'));
await copyFile(path.join(root, 'src/favicon.svg'), path.join(out, 'favicon.svg'));
await writeFile(path.join(out, '.nojekyll'), '');
console.log('Built dist/index.html, ru.html and en.html');
