/**
 * Non-blocking stylesheet download (media=print), flip to all as soon as
 * the file is ready — do not idle-delay (that late style+font apply steals LCP).
 */
export default function DeferredStylesheet({ href }: { href: string }) {
  const safe = JSON.stringify(href);
  return (
    <>
      <link
        rel="stylesheet"
        href={href}
        media="print"
        data-deferred-css={href}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var h=${safe};var l=document.querySelector('link[data-deferred-css=\"'+h+'\"]');if(!l)return;var go=function(){l.media='all'};if(l.addEventListener)l.addEventListener('load',go);if(l.sheet)go();})();`,
        }}
      />
    </>
  );
}