/* eslint-disable react/prop-types */
import { View, Text } from '@react-pdf/renderer';

import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import PDFStyles from './styles';
import TenantLogo from './TenantLogo';

export default function PDFHeader({ company, logoPath, logoSize = 55 }) {
  const { name, tagline, address } = company;
  const phone = company.contacts?.[0] || company.contactDetails?.phone || null;
  const email = company.email || company.contactDetails?.email || null;
  const website = company.website || company.contactDetails?.website || null;
  // For PDFs, avoid SVG data URLs. Use raster if available, else vector fallback.
  const finalLogoPath = logoPath || getTenantLogoUrl(company, { fallback: false });

  return (
    <View style={[PDFStyles.border, PDFStyles.p8, PDFStyles.mb8]}>
      {/* Grid Container */}
      <View style={[PDFStyles.gridContainer, PDFStyles.alignStart]}>
        {/* Logo Section */}
        <View style={[PDFStyles.col2, PDFStyles.alignCenter]}>
          <TenantLogo tenant={company} size={logoSize} src={finalLogoPath} />
        </View>

        {/* Company Info */}
        <View style={[PDFStyles.col6]}>
          <Text style={[PDFStyles.companyName]}>{name}</Text>
          <Text style={[PDFStyles.companyTagline, PDFStyles.mb4]}>{tagline}</Text>
          <Text style={[PDFStyles.companyAddress]}>{address.line1}</Text>
          <Text style={[PDFStyles.companyAddress]}>
            {address.line2}, {address.state}
          </Text>
        </View>

        {/* Contact Info */}
        <View style={[PDFStyles.col4, PDFStyles.contactSection, PDFStyles.borderLeft]}>
          <View style={[PDFStyles.flexColumn]}>
            <ContactRow label="Mobile" value={phone} />
            <ContactRow label="Email" value={email} />
            <ContactRow label="Website" value={website} />
          </View>
        </View>
      </View>
    </View>
  );
}

function ContactRow({ label, value }) {
  return (
    <View style={[PDFStyles.flexRow, PDFStyles.mb4]}>
      <Text style={[PDFStyles.contactLabel, PDFStyles.col5]}>{label}</Text>
      <Text style={[PDFStyles.contactValue, PDFStyles.col7]}>{value}</Text>
    </View>
  );
}
