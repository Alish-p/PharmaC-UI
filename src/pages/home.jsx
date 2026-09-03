import { Helmet } from 'react-helmet-async';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Tranzit Logistics & Fleet Management Software',
  description:
    'Tranzit is logistics management software and fleet management software for transporters to manage trips, vehicles, drivers, fuel, maintenance, invoices, and payments.',
  keywords:
    'Tranzit, logistics management software, fleet management software, transport management software, transport management system, TMS software, vehicle tracking software, logistics ERP',
  author: 'Tranzit',
  url: 'https://tranzitsolutions.com/',
  image: 'https://tranzitsolutions.com/logo/tranzit-logo-full.png',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tranzit',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: metadata.url,
  image: metadata.image,
  description: metadata.description,
  brand: {
    '@type': 'Brand',
    name: 'Tranzit',
  },
  offers: {
    '@type': 'Offer',
    url: metadata.url,
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
  },
};

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={metadata.url} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:site_name" content="Tranzit" />
        <meta property="og:image" content={metadata.image} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />

        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <HomeView />
    </>
  );
}
