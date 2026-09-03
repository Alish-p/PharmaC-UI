/* eslint-disable react/prop-types */
import { View, Text } from '@react-pdf/renderer';

import PDFStyles from './styles';

export default function PDFTable({
  headers,
  data,
  columnWidths = [],
  showBorders = true,
  hideHeader = false,
  tableFooter,
}) {
  const getColumnWidth = (index) => {
    if (columnWidths && columnWidths[index]) {
      return PDFStyles[`col${columnWidths[index]}`] || {};
    }
    return PDFStyles[`col${Math.floor(12 / headers.length)}`];
  };

  const renderHeader = () => (
    <View
      style={[
        PDFStyles.gridContainer,
        PDFStyles.border,
        PDFStyles.bgLight,
        { justifyContent: 'flex-start' },
      ]}
    >
      {headers.map((header, index) => (
        <View
          key={index}
          style={[
            PDFStyles.horizontalCell,
            getColumnWidth(index),
            index !== headers.length - 1 && PDFStyles.borderRight,
          ]}
        >
          <Text style={[PDFStyles.horizontalCellTitle]}>{header}</Text>
        </View>
      ))}
    </View>
  );

  const renderRow = (rowData, rowIndex) => (
    <View
      key={rowIndex}
      style={[
        PDFStyles.gridContainer,
        PDFStyles.border,
        PDFStyles.noBorderTop,
        !showBorders && PDFStyles.noBorder,
        { justifyContent: 'flex-start' },
      ]}
    >
      {rowData.map((cell, cellIndex) => (
        <View
          key={cellIndex}
          style={[
            PDFStyles.horizontalCell,
            getColumnWidth(cellIndex),
            cellIndex !== headers.length - 1 && PDFStyles.borderRight,
          ]}
        >
          <Text style={[PDFStyles.horizontalCellContent]}>{cell}</Text>
        </View>
      ))}
    </View>
  );

  const renderFooter = () =>
    tableFooter ? (
      <View
        style={[
          PDFStyles.gridContainer,
          PDFStyles.border,
          PDFStyles.noBorderTop,
          PDFStyles.bgDark,
          { justifyContent: 'flex-start' },
        ]}
      >
        {tableFooter.map((footerCell, index) => (
          <View
            key={index}
            style={[
              PDFStyles.horizontalCell,
              getColumnWidth(index),
              index !== headers.length - 1 && PDFStyles.borderRight,
            ]}
          >
            <Text style={[PDFStyles.horizontalCellTitle, PDFStyles.textWhite]}>{footerCell}</Text>
          </View>
        ))}
      </View>
    ) : null;

  return (
    <>
      {!hideHeader && renderHeader()}
      {data.map((row, index) => renderRow(row, index))}
      {renderFooter()}
    </>
  );
}
