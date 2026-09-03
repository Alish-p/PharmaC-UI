import { Helmet } from 'react-helmet-async';

import { HomeLRGenerator } from 'src/sections/home/home-lr-generator';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Free LR Generator - Create Lorry Receipts Online | Tranzit',
  description:
    'Generate professional lorry receipts (LR) for free. Fill in company, consignor, consignee, vehicle, and goods details to download a ready-to-use PDF.',
  keywords:
    'free LR generator, lorry receipt generator online, bilty maker, online bilty receipt, transport bilty, transport receipt, create lorry receipt, Tranzit tools',
  url: 'https://tranzit.in/tools/lr-generator',
  image: 'https://tranzit.in/logo/tranzit-logo-full.png',
  author: 'Tranzit',
};

export default function LRGeneratorPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:site_name" content="Tranzit" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={metadata.url} />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />

        {/* Canonical Link */}
        <link rel="canonical" href={metadata.url} />
      </Helmet>

      <HomeLRGenerator />
    </>
  );
}
