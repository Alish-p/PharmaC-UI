/* eslint-disable react/prop-types */
import { View, Text } from '@react-pdf/renderer';

import PDFStyles from './styles';

export default function PDFTitle({ title }) {
  return (
    <View style={[PDFStyles.gridContainer]}>
      <Text style={[PDFStyles.h2, PDFStyles.mb4]}>{title}</Text>
    </View>
  );
}
