/* eslint-disable react/prop-types */
import { View, Text, Link } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';

import PDFStyles from './styles';

export default function PDFFooter({ additionalInfo = [] }) {
  const infoLines = Array.isArray(additionalInfo) ? additionalInfo : [additionalInfo];

  return (
    <View style={[PDFStyles.footer, PDFStyles.borderTop, PDFStyles.p8]}>
      {/* Date + Additional Info Lines */}
      <View style={[PDFStyles.flexColumn, PDFStyles.alignCenter, PDFStyles.mb4]}>
        <Text style={[PDFStyles.body2, PDFStyles.mb2]}>Generated on {fDate(new Date())}</Text>

        {infoLines.map((line, index) => (
          <Text key={index} style={[PDFStyles.body2]}>
            {line}
          </Text>
        ))}
      </View>

      {/* Branding Line */}
      <Text style={[PDFStyles.caption, PDFStyles.textCenter]}>
        Powered by{' '}
        <Link
          src="https://tranzitsolutions.com/"
          style={[PDFStyles.caption, PDFStyles.textPrimary, PDFStyles.underline]}
        >
          Tranzit Solutions
        </Link>
      </Text>
    </View>
  );
}

