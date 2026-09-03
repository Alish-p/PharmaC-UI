/* eslint-disable react/prop-types */
import { Page, View, Text, Font, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fNumber, fCurrency } from 'src/utils/format-number';

// Register font
Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const styles = StyleSheet.create({
  page: {
    fontSize: 8,
    lineHeight: 1.4,
    fontFamily: 'Roboto',
    padding: '30px 40px',
    backgroundColor: '#FFFFFF',
    color: '#212B36',
  },
  // Main Border Container
  borderContainer: {
    border: '1px solid #161C24',
    height: '100%',
    padding: 1,
  },
  // Header Section
  header: {
    padding: 10,
    borderBottom: '2px solid #161C24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F6F8',
  },
  companyInfo: {
    width: '65%',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  companyAddress: {
    fontSize: 8,
    color: '#454F5B',
    marginTop: 2,
    maxWidth: '90%',
  },
  titleBox: {
    width: '30%',
    textAlign: 'right',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#000000',
  },
  subtitle: {
    fontSize: 7,
    color: '#919EAB',
    marginTop: 2,
  },
  // Meta Bar (LR No, Date, etc.)
  metaBar: {
    flexDirection: 'row',
    borderBottom: '1px solid #161C24',
    backgroundColor: '#FFFFFF',
  },
  metaItem: {
    padding: '4px 10px',
    borderRight: '1px solid #161C24',
    flex: 1,
  },
  metaLabel: {
    fontSize: 6,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#637381',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 700,
    color: '#212B36',
  },
  // Consignor / Consignee
  partiesSection: {
    flexDirection: 'row',
    borderBottom: '1px solid #161C24',
    height: 100,
  },
  partyBox: {
    width: '50%',
    padding: 8,
    borderRight: '1px solid #161C24',
  },
  partyLabel: {
    fontSize: 7,
    fontWeight: 700,
    backgroundColor: '#919EAB',
    color: '#FFFFFF',
    padding: '2px 4px',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  partyName: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 2,
  },
  partyAddress: {
    fontSize: 7,
    color: '#454F5B',
  },
  // Route / Vehicle Bar
  infoBar: {
    flexDirection: 'row',
    borderBottom: '1px solid #161C24',
    backgroundColor: '#F9FAFB',
  },
  infoItem: {
    padding: '4px 10px',
    borderRight: '1px solid #161C24',
    flex: 1,
  },
  // Goods Table
  table: {
    marginTop: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#161C24',
    color: '#FFFFFF',
    padding: '4px 0',
  },
  tableCell: {
    paddingHorizontal: 4,
    fontSize: 7,
    textAlign: 'center',
  },
  tableCellBold: {
    paddingHorizontal: 4,
    fontSize: 7,
    fontWeight: 700,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #DFE3E8',
    paddingVertical: 4,
    minHeight: 20,
    alignItems: 'center',
  },
  // Footer Summary
  footerSection: {
    flexDirection: 'row',
    borderTop: '1px solid #161C24',
    flex: 1,
  },
  declarationBox: {
    width: '65%',
    padding: 10,
    borderRight: '1px solid #161C24',
  },
  chargesBox: {
    width: '35%',
    padding: 0,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '4px 8px',
    borderBottom: '1px solid #DFE3E8',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '6px 8px',
    backgroundColor: '#F4F6F8',
  },
  // Signatures
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '20px 10px 10px 10px',
  },
  signBox: {
    width: '28%',
    textAlign: 'center',
  },
  signLine: {
    borderTop: '1px solid #637381',
    marginTop: 20,
    paddingTop: 4,
    fontSize: 7,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
});

const COL_WIDTHS = {
  sno: '6%',
  description: '34%',
  qty: '10%',
  weight: '12%',
  unit: '10%',
  rate: '12%',
  amount: '16%',
};

export default function LRPdf({ data }) {
  const {
    companyName = '',
    companyAddress = '',
    companyPhone = '',
    companyGst = '',
    lrNumber = '',
    lrDate = new Date(),
    consignorName = '',
    consignorAddress = '',
    consignorGst = '',
    consigneeName = '',
    consigneeAddress = '',
    consigneeGst = '',
    vehicleNo = '',
    driverName = '',
    goods = [],
    freight = 0,
    otherCharges = 0,
    declaration = '',
  } = data || {};

  const goodsTotal = goods.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const grandTotal = goodsTotal + Number(freight) + Number(otherCharges);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.borderContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{companyName || 'Transport Company'}</Text>
              <Text style={styles.companyAddress}>
                {companyAddress}
                {companyPhone ? ` | Ph: ${companyPhone}` : ''}
              </Text>
              {companyGst ? (
                <Text style={[styles.companyAddress, { fontWeight: 700 }]}>
                  GSTIN: {companyGst}
                </Text>
              ) : null}
            </View>
            <View style={styles.titleBox}>
              <Text style={styles.title}>Lorry Receipt</Text>
              <Text style={styles.subtitle}>Consignment Note</Text>
            </View>
          </View>

          {/* Meta Bar */}
          <View style={styles.metaBar}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>LR Number</Text>
              <Text style={styles.metaValue}>{lrNumber || 'NEW'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>LR Date</Text>
              <Text style={styles.metaValue}>{fDate(lrDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Vehicle No</Text>
              <Text style={styles.metaValue}>{vehicleNo || '-'}</Text>
            </View>
            <View style={[styles.metaItem, { borderRight: 0 }]}>
              <Text style={styles.metaLabel}>Driver Name</Text>
              <Text style={styles.metaValue}>{driverName || '-'}</Text>
            </View>
          </View>

          {/* Consignor / Consignee */}
          <View style={styles.partiesSection}>
            <View style={styles.partyBox}>
              <Text style={styles.partyLabel}>CONSIGNOR (SENDER)</Text>
              <Text style={styles.partyName}>{consignorName || '-'}</Text>
              <Text style={styles.partyAddress}>{consignorAddress}</Text>
              {consignorGst ? (
                <Text style={[styles.partyAddress, { marginTop: 4 }]}>GST: {consignorGst}</Text>
              ) : null}
            </View>
            <View style={[styles.partyBox, { borderRight: 0 }]}>
              <Text style={styles.partyLabel}>CONSIGNEE (RECEIVER)</Text>
              <Text style={styles.partyName}>{consigneeName || '-'}</Text>
              <Text style={styles.partyAddress}>{consigneeAddress}</Text>
              {consigneeGst ? (
                <Text style={[styles.partyAddress, { marginTop: 4 }]}>GST: {consigneeGst}</Text>
              ) : null}
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { width: COL_WIDTHS.sno, color: '#FFF' }]}>
              S.No
            </Text>
            <Text
              style={[
                styles.tableCellBold,
                { width: COL_WIDTHS.description, color: '#FFF', textAlign: 'left' },
              ]}
            >
              Particulars of Goods
            </Text>
            <Text style={[styles.tableCellBold, { width: COL_WIDTHS.qty, color: '#FFF' }]}>
              Qty
            </Text>
            <Text style={[styles.tableCellBold, { width: COL_WIDTHS.weight, color: '#FFF' }]}>
              Weight
            </Text>
            <Text style={[styles.tableCellBold, { width: COL_WIDTHS.unit, color: '#FFF' }]}>
              Unit
            </Text>
            <Text style={[styles.tableCellBold, { width: COL_WIDTHS.rate, color: '#FFF' }]}>
              Rate (₹)
            </Text>
            <Text
              style={[
                styles.tableCellBold,
                { width: COL_WIDTHS.amount, color: '#FFF', textAlign: 'right', paddingRight: 8 },
              ]}
            >
              Amount (₹)
            </Text>
          </View>

          {/* Table Body */}
          <View style={{ flexGrow: 1, minHeight: 200 }}>
            {goods.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: COL_WIDTHS.sno }]}>{index + 1}</Text>
                <Text
                  style={[styles.tableCell, { width: COL_WIDTHS.description, textAlign: 'left' }]}
                >
                  {item.description}
                </Text>
                <Text style={[styles.tableCell, { width: COL_WIDTHS.qty }]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, { width: COL_WIDTHS.weight }]}>{item.weight}</Text>
                <Text style={[styles.tableCell, { width: COL_WIDTHS.unit }]}>{item.unit}</Text>
                <Text style={[styles.tableCell, { width: COL_WIDTHS.rate }]}>
                  {fNumber(item.rate)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: COL_WIDTHS.amount, textAlign: 'right', paddingRight: 8 },
                  ]}
                >
                  {fNumber(item.amount)}
                </Text>
              </View>
            ))}
          </View>

          {/* Footer Summary */}
          <View style={styles.footerSection}>
            <View style={styles.declarationBox}>
              <Text style={[styles.metaLabel, { color: '#000', marginBottom: 4 }]}>
                Terms & Conditions / Declaration:
              </Text>
              <Text style={{ fontSize: 6.5, color: '#454F5B', lineHeight: 1.5 }}>
                {declaration ||
                  "Notice: Under SEC. 10 of Carrier's act 1865, the company is not responsible for any damage / leakage unless registered within 3 days. Goods booked at owner's risk."}
              </Text>
            </View>
            <View style={styles.chargesBox}>
              <View style={styles.chargeRow}>
                <Text style={styles.metaLabel}>Goods Total</Text>
                <Text style={styles.metaValue}>{fCurrency(goodsTotal)}</Text>
              </View>
              <View style={styles.chargeRow}>
                <Text style={styles.metaLabel}>Freight</Text>
                <Text style={styles.metaValue}>{fCurrency(freight)}</Text>
              </View>
              <View style={styles.chargeRow}>
                <Text style={styles.metaLabel}>Other Charges</Text>
                <Text style={styles.metaValue}>{fCurrency(otherCharges)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.metaLabel, { color: '#000', fontSize: 8 }]}>Grand Total</Text>
                <Text style={{ fontSize: 10, fontWeight: 700, color: '#000' }}>
                  {fCurrency(grandTotal)}
                </Text>
              </View>
            </View>
          </View>

          {/* Signatures */}
          <View style={styles.signatureArea}>
            <View style={styles.signBox}>
              <Text style={styles.signLine}>Receiver&apos;s Sign</Text>
            </View>
            <View style={styles.signBox}>
              <Text style={styles.signLine}>Company Seal</Text>
            </View>
            <View style={styles.signBox}>
              <Text style={styles.signLine}>Booking Agent</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
