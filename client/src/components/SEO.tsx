import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULTS = {
  title: 'DoFri - Votre portail de liens',
  description: 'DoFri regroupe les meilleurs liens du web : outils, ressources, divertissement et bien plus. Découvrez, notez et partagez vos trouvailles.',
  image: '/hero-banner.jpg',
};

export default function SEO({ title, description, image, url }: SEOProps) {
  const pageTitle = title ? `${title} | DoFri` : DEFAULTS.title;
  const pageDescription = description || DEFAULTS.description;
  const pageImage = image || DEFAULTS.image;
  const pageUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content="DoFri" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
    </Helmet>
  );
}
