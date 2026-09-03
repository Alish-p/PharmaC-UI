/* eslint-disable react/prop-types */
import { View, Text } from '@react-pdf/renderer';

import PDFStyles from './styles';

export default function PDFEmptyLine() {
  return (
    <View
      style={[
        PDFStyles.gridContainer,
        PDFStyles.border,
        PDFStyles.noBorderTop,
        PDFStyles.noBorderBottom,
      ]}
    >
      <View style={[PDFStyles.col12]}>
        <Text style={{ textAlign: 'center', padding: 4 }}> </Text>
      </View>
    </View>
  );
}
