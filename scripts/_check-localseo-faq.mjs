const t = await (await fetch("http://127.0.0.1:3000/services/local-seo")).text();
console.log("faq img", t.includes("localseo-faq-2ffcfefec3"));
console.log("alt", t.includes('alt="Local SEO Services FAQs"'));
console.log("old stack", (t.match(/--faq-shot|--shot-1|--cta-shot/g) || []).length);
