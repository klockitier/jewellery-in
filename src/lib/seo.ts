/**
 * Small SEO helper: builds the `<head>` meta payload for a route from
 * title / description / image. Use inside a route's `head()`:
 *
 *   head: () => pageHead({ title, description })
 */

export interface SeoInput {
  title: string;
  description?: string;
  image?: string;
  path?: string;
}

const SITE_URL = "https://092f4fe8c2c6de6062d71800ad81fc1f.ctonew.app"; // published preview origin
const DEFAULT_DESCRIPTION =
  "Yogesh Jewellers — premium gold & silver jewellery with transparent live rates, BIS-hallmarked purity and a price-locking cart.";
const DEFAULT_IMAGE = "/images/og-image.jpg";

export function pageHead({ title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, path = "/" }: SeoInput) {
  const url = `${SITE_URL}${path}`;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: "Yogesh Jewellers" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: fullImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: fullImage },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
