import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
}

export default function SEO({ title }: SEOProps) {
  const pageTitle = title ? `${title} | DoFri` : 'DoFri';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      <meta name="googlebot" content="noindex, nofollow" />
    </Helmet>
  );
}
