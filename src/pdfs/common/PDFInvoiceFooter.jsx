/* eslint-disable react/prop-types */
import { View, Text } from '@react-pdf/renderer';

import PDFStyles from './styles';

export default function PDFInvoiceFooter({ declaration, signatory = 'For Shree Enterprises' }) {
  return (
    <View style={[PDFStyles.border, PDFStyles.p16, PDFStyles.mt16]}>
      <View style={[PDFStyles.gridContainer]}>
        {/* Declaration - 70% Width */}
        <View style={[PDFStyles.col8]}>
          <Text style={[PDFStyles.body1]}>{declaration}</Text>
        </View>

        {/* Signature Block - 30% Width */}
        <View style={[PDFStyles.col4, PDFStyles.alignEnd]}>
          <Text style={[PDFStyles.body1, PDFStyles.mb8]}>{signatory}</Text>

          {/* Empty space for stamp or sign */}
          <View style={{ height: 40 }} />

          <Text style={[PDFStyles.subtitle2]}>Authorised Signatory</Text>
        </View>
      </View>
    </View>
  );
}
