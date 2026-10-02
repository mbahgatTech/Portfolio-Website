import Head from 'next/head';
import { SEO } from '../utils/json/constants';

/** Turns a site path like "/ncr" into a full URL on the production domain. */
const absoluteUrl = (path) => new URL(path, SEO.SITE_URL).href;

/**
 * Per-page metadata for search engines and link previews: the <title>, the meta
 * description (the snippet under the title in search results), the canonical URL
 * (the one official address for the page), Open Graph / Twitter tags (the card
 * shown when the link is shared on LinkedIn, Slack, X, etc.), and optional JSON-LD
 * structured data. Crawlers and preview bots require absolute URLs.
 */
const Seo = ({ title, description, path = '/', jsonLd }) => {
  const url = absoluteUrl(path);
  const image = absoluteUrl(SEO.IMAGE.PATH);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SEO.SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(SEO.IMAGE.WIDTH)} />
      <meta property="og:image:height" content={String(SEO.IMAGE.HEIGHT)} />
      <meta property="og:image:alt" content={SEO.IMAGE.ALT} />

      {/* "summary" is the square-thumbnail card, which suits the portrait photo. */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={SEO.IMAGE.ALT} />

      {jsonLd && (
        <script
          type="application/ld+json"
          // Escape "<" so the JSON can never close the <script> tag early.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
    </Head>
  );
};

export default Seo;
export { absoluteUrl };
