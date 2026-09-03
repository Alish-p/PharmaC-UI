import { View, Text } from '@react-pdf/renderer';

import { fNumber } from 'src/utils/format-number';

import PDFStyles from './styles';

export default function NewPDFTable({
  columns = [],
  data = [],
  showTotals = false,
  totalRowLabel = 'TOTAL',
  cellStyler,
  extraRows = [],
}) {
  const totals = {};

  if (showTotals) {
    data.forEach((row) => {
      columns.forEach((col) => {
        if (col.showTotal) {
          const val = row[col.accessor];
          const num = typeof val === 'number' ? val : parseFloat(val) || 0;
          totals[col.accessor] = (totals[col.accessor] || 0) + num;
        }
      });
    });
  }

  const alignStyle = (align) => {
    if (align === 'center') return PDFStyles.textCenter;
    if (align === 'right') return PDFStyles.textRight;
    return PDFStyles.textLeft;
  };

  const getCellStyle = (row, column, rowIndex) => {
    const styleName = cellStyler ? cellStyler(row, column, rowIndex) : null;
    return styleName && PDFStyles[styleName] ? PDFStyles[styleName] : null;
  };

  const renderHeader = () => (
    <View style={[PDFStyles.gridContainer, PDFStyles.border, PDFStyles.bgLight]}>
      {columns.map((col, index) => (
        <View
          key={index}
          style={[
            PDFStyles.horizontalCell,
            { width: col.width || `${100 / columns.length}%` },
            index !== columns.length - 1 && PDFStyles.borderRight,
          ]}
        >
          <Text style={[PDFStyles.horizontalCellTitle, alignStyle(col.align)]}>{col.header}</Text>
        </View>
      ))}
    </View>
  );

  const renderRow = (row, rowIndex) => (
    <View key={rowIndex} style={[PDFStyles.gridContainer, PDFStyles.border, PDFStyles.noBorderTop]}>
      {columns.map((col, colIndex) => {
        const rawValue = row[col.accessor];
        const displayValue = col.formatter ? col.formatter(rawValue, row) : rawValue;
        const customStyle = getCellStyle(row, col, rowIndex);
        return (
          <View
            key={colIndex}
            style={[
              PDFStyles.horizontalCell,
              { width: col.width || `${100 / columns.length}%` },
              colIndex !== columns.length - 1 && PDFStyles.borderRight,
              customStyle,
            ]}
          >
            <Text style={[PDFStyles.horizontalCellContent, alignStyle(col.align), customStyle]}>
              {displayValue}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderTotalsRow = () => {
    if (!showTotals) return null;
    const row = columns.map((col, idx) => {
      if (idx === 0) return totalRowLabel;
      if (col.showTotal) {
        const sum = totals[col.accessor] || 0;
        return col.totalFormatter
          ? col.totalFormatter(sum, data)
          : col.formatter
            ? col.formatter(sum)
            : fNumber(sum);
      }
      return '';
    });

    return (
      <View
        style={[
          PDFStyles.gridContainer,
          PDFStyles.border,
          PDFStyles.noBorderTop,
          PDFStyles.bgLight,
        ]}
      >
        {row.map((val, index) => (
          <View
            key={index}
            style={[
              PDFStyles.horizontalCell,
              { width: columns[index].width || `${100 / columns.length}%` },
              index !== columns.length - 1 && PDFStyles.borderRight,
            ]}
          >
            <Text style={[PDFStyles.horizontalCellTitle, alignStyle(columns[index].align)]}>
              {val}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderExtraRows = () => {
    if (!extraRows || extraRows.length === 0) return null;

    return extraRows.map((extraRow, extraRowIndex) => (
      <View
        key={`extra-${extraRowIndex}`}
        style={[
          PDFStyles.gridContainer,
          PDFStyles.border,
          PDFStyles.noBorderTop,
          extraRow.highlight && PDFStyles.bgLight, // Optional highlighting
        ]}
      >
        {extraRow.cells
          ? // Handle custom cell structure with colspan
            extraRow.cells.map((cell, cellIndex) => {
              const cellWidth = cell.colspan
                ? columns
                    .slice(cell.startIndex, cell.startIndex + cell.colspan)
                    .reduce(
                      (acc, col) => acc + parseFloat(col.width || `${100 / columns.length}`),
                      0
                    )
                : columns[cell.startIndex]?.width || `${100 / columns.length}%`;

              const isLastCell = cellIndex === extraRow.cells.length - 1;
              const cellAlign = cell.align || columns[cell.startIndex]?.align;

              return (
                <View
                  key={cellIndex}
                  style={[
                    PDFStyles.horizontalCell,
                    { width: `${cellWidth}%` },
                    !isLastCell && PDFStyles.borderRight,
                  ]}
                >
                  <Text
                    style={[
                      extraRow.highlight
                        ? PDFStyles.horizontalCellTitle
                        : PDFStyles.horizontalCellContent,
                      alignStyle(cellAlign),
                    ]}
                  >
                    {cell.value}
                  </Text>
                </View>
              );
            })
          : // Handle legacy data array format
            columns.map((col, colIndex) => {
              const cellValue = extraRow.data[colIndex] || '';
              const displayValue =
                col.formatter && typeof cellValue === 'number'
                  ? col.formatter(cellValue)
                  : cellValue;

              return (
                <View
                  key={colIndex}
                  style={[
                    PDFStyles.horizontalCell,
                    { width: col.width || `${100 / columns.length}%` },
                    colIndex !== columns.length - 1 && PDFStyles.borderRight,
                  ]}
                >
                  <Text
                    style={[
                      extraRow.highlight
                        ? PDFStyles.horizontalCellTitle
                        : PDFStyles.horizontalCellContent,
                      alignStyle(col.align),
                    ]}
                  >
                    {displayValue}
                  </Text>
                </View>
              );
            })}
      </View>
    ));
  };

  return (
    <>
      {renderHeader()}
      {data.map((row, index) => renderRow(row, index))}
      {renderTotalsRow()}
      {renderExtraRows()}
    </>
  );
}
