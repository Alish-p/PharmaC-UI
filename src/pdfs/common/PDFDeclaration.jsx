/* eslint-disable react/prop-types */
import { View, Text } from '@react-pdf/renderer';

import PDFStyles from './styles';

export default function PDFDeclaration({ title = 'Declaration:', content }) {
  return (
    <View style={[PDFStyles.border, PDFStyles.p16, PDFStyles.mb16, PDFStyles.flexColumn]}>
      <Text style={[PDFStyles.subtitle1, PDFStyles.mb8]}>{title}</Text>

      {Array.isArray(content) ? (
        content.map((line, index) => (
          <Text key={index} style={[PDFStyles.body2, PDFStyles.mb4]}>
            {line}
          </Text>
        ))
      ) : (
        <Text style={[PDFStyles.body2]}>{content}</Text>
      )}
    </View>
  );
}
