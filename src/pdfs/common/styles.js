import { StyleSheet } from '@react-pdf/renderer';

const pdfStyles = {
  // ------------------------------------------
  // Layout: Columns (Grid System - 12 cols)
  // ------------------------------------------
  col1: { width: '8.33%' },
  col2: { width: '16.67%' },
  col3: { width: '25%' },
  col4: { width: '33.33%' },
  col5: { width: '41.67%' },
  col6: { width: '50%' },
  col7: { width: '58.33%' },
  col8: { width: '66.67%' },
  col9: { width: '75%' },
  col10: { width: '83.33%' },
  col11: { width: '91.67%' },
  col12: { width: '100%' },

  // ------------------------------------------
  // Spacing: Margin & Padding
  // ------------------------------------------
  // Margin
  mb2: { marginBottom: 2 },
  mb4: { marginBottom: 2 },
  mb8: { marginBottom: 4 },
  mb16: { marginBottom: 8 },
  mb40: { marginBottom: 20 },
  mt4: { marginTop: 2 },
  mt8: { marginTop: 4 },
  mt16: { marginTop: 8 },
  mx4: { marginHorizontal: 2 },
  mx8: { marginHorizontal: 4 },
  my4: { marginVertical: 2 },
  my8: { marginVertical: 4 },

  // Padding
  p4: { padding: 2 },
  p8: { padding: 4 },
  p16: { padding: 8 },
  p40: { padding: 20 },
  px4: { paddingHorizontal: 2 },
  px8: { paddingHorizontal: 4 },
  py4: { paddingVertical: 2 },
  py8: { paddingVertical: 4 },

  // ------------------------------------------
  // Typography
  // ------------------------------------------
  h1: { fontSize: 16, fontWeight: 700 },
  h2: { fontSize: 14, fontWeight: 700 },
  h3: { fontSize: 12, fontWeight: 700 },
  h4: { fontSize: 10, fontWeight: 700 },
  body1: { fontSize: 8 },
  body2: { fontSize: 7, color: '#111111', lineHeight: 1.4 },
  subtitle1: { fontSize: 8, fontWeight: 700, color: '#333333' },
  subtitle2: { fontSize: 7, fontWeight: 700 },
  caption: { fontSize: 6, color: '#777777' },

  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textLeft: { textAlign: 'left' },

  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
  underline: { textDecoration: 'underline' },

  // ------------------------------------------
  // Colors
  // ------------------------------------------
  textPrimary: { color: '#007bff' },
  textSecondary: { color: '#6c757d' },
  textDanger: { color: '#dc3545' },
  // Cell background helpers
  successCell: { backgroundColor: '#d4edda' },
  warningCell: { backgroundColor: '#f8d7da' },
  highlightCell: { backgroundColor: '#fff3cd' },
  textWhite: { color: '#ffffff' },
  bgLight: { backgroundColor: '#f1f3f5' },
  bgDark: { backgroundColor: '#343a40' },

  // ------------------------------------------
  // Page
  // ------------------------------------------
  page: {
    fontSize: 7,
    lineHeight: 1.4,
    fontFamily: 'Roboto',
    backgroundColor: '#FFFFFF',
    padding: '10px 12px 40px 12px',
  },

  // ------------------------------------------
  // Header & Footer
  // ------------------------------------------
  headerContainer: {
    borderWidth: 1,
    borderColor: 'black',
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#DFE3E8',
    borderStyle: 'solid',
    backgroundColor: '#f8f9fa',
  },

  // ------------------------------------------
  // Company Info Block
  // ------------------------------------------
  companyName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
    color: '#333333',
  },
  companyTagline: {
    fontSize: 8,
    fontWeight: 500,
    color: '#555555',
  },
  companyAddress: {
    fontSize: 8,
    color: '#666666',
    lineHeight: 1.4,
  },
  contactSection: {
    backgroundColor: '#f9f9f9',
    padding: 7,
    borderRadius: 2,
  },
  contactLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: '#555555',
  },
  contactValue: {
    fontSize: 7,
    color: '#333333',
  },

  // ------------------------------------------
  // Flex Utilities
  // ------------------------------------------
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  justifyCenter: { justifyContent: 'center' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyStart: { justifyContent: 'flex-start' },
  alignCenter: { alignItems: 'center' },
  alignEnd: { alignItems: 'flex-end' },
  alignStart: { alignItems: 'flex-start' },

  // ------------------------------------------
  // Grid System
  // ------------------------------------------
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    margin: 2,
  },

  // ------------------------------------------
  // Table Styles
  // ------------------------------------------
  table: {
    display: 'flex',
    width: 'auto',
  },
  tableRow: {
    padding: '4px 0',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#DFE3E8',
  },
  tableCell_1: { width: '5%' },
  tableCell_2: { width: '50%', paddingRight: 8 },
  tableCell_3: { width: '15%' },

  // Table Cell Layouts
  horizontalCell: {
    padding: 2,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  horizontalCellTitle: {
    fontSize: 7,
    fontWeight: 700,
    marginRight: 3,
    width: '100%',
  },
  horizontalCellContent: {
    fontSize: 7,
    width: '100%',
  },
  verticalCell: {
    padding: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  verticalCellTitle: {
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 2,
  },
  verticalCellContent: {
    fontSize: 7,
  },

  // ------------------------------------------
  // Borders
  // ------------------------------------------
  border: { borderWidth: 1, borderColor: 'black' },
  borderTop: { borderTopWidth: 1, borderColor: 'black' },
  borderBottom: { borderBottomWidth: 1, borderColor: 'black' },
  borderLeft: { borderLeftWidth: 1, borderColor: 'black' },
  borderRight: { borderRightWidth: 1, borderColor: 'black' },
  borderHorizontal: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  borderVertical: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'black',
  },
  borderNoTopBottom: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'black',
  },
  borderNoLeftRight: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'black',
  },

  // No Borders
  noBorder: { borderWidth: 0 },
  noBorderTop: { borderTopWidth: 0 },
  noBorderBottom: { borderBottomWidth: 0 },
  noBorderLeft: { borderLeftWidth: 0 },
  noBorderRight: { borderRightWidth: 0 },
};

const Styles = StyleSheet.create(pdfStyles);

export default Styles;
