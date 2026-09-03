/* eslint-disable react/prop-types */
import { View, Text } from '@react-pdf/renderer';

import PDFStyles from './styles';

export default function PDFBillToSection({
  title = 'Bill To',
  billToDetails = [],
  metaDetails = [],
}) {
  return (
    <View style={[PDFStyles.border, PDFStyles.p8, PDFStyles.mb8]}>
      {/* Grid Container */}
      <View style={[PDFStyles.gridContainer, PDFStyles.alignStart]}>
        {/* Bill To Section - 70% width */}
        <View style={[PDFStyles.col8, PDFStyles.pr8]}>
          <Text style={[PDFStyles.subtitle1, PDFStyles.mb4]}>{title}</Text>

          {billToDetails.map(
            (value, index) =>
              value && (
                <Text key={index} style={[PDFStyles.body2, PDFStyles.mb2]}>
                  {value}
                </Text>
              )
          )}
        </View>

        {/* Meta Info Section - 30% width */}
        <View style={[PDFStyles.col4, PDFStyles.borderLeft, PDFStyles.contactSection]}>
          <View style={[PDFStyles.flexColumn]}>
            {metaDetails.map(
              ([label, value], index) =>
                value && (
                  <View key={index} style={[PDFStyles.flexRow, PDFStyles.mb4]}>
                    <Text style={[PDFStyles.contactLabel, PDFStyles.col5]}>{label}</Text>
                    <Text style={[PDFStyles.contactValue, PDFStyles.col7]}>{value}</Text>
                  </View>
                )
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
