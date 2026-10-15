import fs from 'fs';

const files = [
  'lib/artificial-intelligence-services-body.html',
  'lib/google-business-profile-optimization-body.html',
  'lib/technical-seo-body.html',
  'lib/local-seo-body.html',
  'lib/ai-seo-body.html',
  'lib/mobile-app-development-body.html',
  'lib/franchise-seo-body.html',
  'lib/web-design-and-development-body.html',
];

for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const rails = [...h.matchAll(/<div class="tm-rail"[^>]*>/g)];
  // count tm-item only inside each tm section roughly
  const items = (h.match(/class="tm-item/g) || []).length;
  console.log(f.split('/').pop(), 'rails=', rails.length, 'items=', items, rails[0]?.[0]);
}
