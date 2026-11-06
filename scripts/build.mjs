import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const labels = {
  ru: { download: 'Скачать CV', skip: 'К содержимому', navigation: 'Навигация' },
  en: { download: 'Download CV', skip: 'Skip to content', navigation: 'Navigation' }
};
for (const lang of ['ru', 'en']) {
  const tokens = marked.lexer(await readFile(path.join(root, `content/${lang}.md`), 'utf8'));
  const headings = tokens.filter(token => token.type === 'heading' && token.depth === 1);
  if (headings.length !== 1) throw new Error(`content/${lang}.md must have exactly one # name heading`);
  const name = headings[0].text;
  const profile = [];
  const sections = [];
  let current = profile;
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) continue;
    if (token.type === 'heading' && token.depth === 2) {
      const section = { title: token.text, tokens: [] };
      sections.push(section);
      current = section.tokens;
    } else current.push(token);
  }
  if (!sections.length) throw new Error(`content/${lang}.md needs ## section headings`);
  const description = profile.filter(t => t.type === 'paragraph').at(-1)?.text || name;
  const nav = sections.map((s,i)=>`<a href="#section-${i}">${escape(s.title)}</a>`).join('');
  const contacts = sections.flatMap(section => section.tokens).find(token =>
    token.type === 'paragraph' && token.tokens?.some(inline => inline.type === 'link' && inline.href.startsWith('mailto:')));
  const html = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escape(description)}"><meta name="color-scheme" content="light">
<title>${escape(name)} · CV</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="style.css">
<link rel="alternate" hreflang="${lang === 'ru' ? 'en' : 'ru'}" href="${lang === 'ru' ? 'en' : 'ru'}.html"></head>
<body><a class="skip" href="#main">${labels[lang].skip}</a>
<header class="topbar"><a class="wordmark" href="#main" aria-label="${escape(name)}">VV</a>
<nav aria-label="${labels[lang].navigation}">${nav}</nav>
<div class="languages"><a href="ru.html" lang="ru" ${lang==='ru'?'aria-current="page"':''}>RU</a><span>/</span><a href="en.html" lang="en" ${lang==='en'?'aria-current="page"':''}>EN</a></div></header>
${contacts ? `<div class="quick-contacts">${marked.parser([{ ...contacts, tokens: contacts.tokens.filter(token => token.type === 'link') }])}</div>` : ''}
<main id="main"><article><header class="profile"><h1>${escape(name)}</h1>${marked.parser(profile)}
<a class="download" href="vitaliy-vishnev-${lang}.pdf" download>${labels[lang].download} <span aria-hidden="true">↓</span></a></header>
${sections.map((s,i)=>`<section id="section-${i}" class="resume-section section-${i}"><h2>${escape(s.title)}</h2><div class="section-body">${marked.parser(s.tokens)}</div></section>`).join('\n')}
</article></main><footer>© ${new Date().getFullYear()} ${escape(name)}</footer></body></html>`;
  await writeFile(path.join(out, `${lang}.html`), html);
}
await copyFile(path.join(out, 'en.html'), path.join(out, 'index.html'));
await copyFile(path.join(root, 'src/style.css'), path.join(out, 'style.css'));
await copyFile(path.join(root, 'src/favicon.svg'), path.join(out, 'favicon.svg'));
await writeFile(path.join(out, '.nojekyll'), '');
console.log('Built RU/EN pages from content/*.md');
