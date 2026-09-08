"use client";

type Props = { html: string };

/** Raw HTML shell — no deferred mega-menu loader (page script owns that). */
export default function TekcroftHtml({ html }: Props) {
  return (
    <div
      id="tekcroft-root"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
