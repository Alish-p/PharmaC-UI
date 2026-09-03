/* eslint-disable react/prop-types */
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

import { getStateCode } from 'src/utils/helper';
import { fDate, formatStr } from 'src/utils/format-time';
import { fNumber, fCurrencyInWords } from 'src/utils/format-number';

const styles = StyleSheet.create({
  page: {
    fontSize: 7.5,
    lineHeight: 1.4,
    fontFamily: 'Roboto',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  container: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    flexDirection: 'column',
    width: '100%',
  },
  titleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  titleText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  originalRow: {
    paddingLeft: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
  },
  originalText: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  transporterNameRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
  },
  transporterNameText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactRow: {
    flexDirection: 'row',
    paddingLeft: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
  },
  contactLabel: {
    fontSize: 7.5,
    width: 60,
  },
  contactValue: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  splitRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  splitLeftCol: {
    width: '55%',
    flexDirection: 'column',
  },
  splitRightCol: {
    width: '45%',
    borderLeftWidth: 1,
    borderLeftColor: '#000000',
    borderLeftStyle: 'solid',
    justifyContent: 'flex-end',
    paddingLeft: 6,
    paddingBottom: 4,
  },
  splitLeftItem: {
    flexDirection: 'row',
    paddingLeft: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
  },
  splitLeftItemLast: {
    flexDirection: 'row',
    paddingLeft: 6,
    paddingVertical: 4,
  },
  splitLabel: {
    fontSize: 7.5,
    width: 100,
  },
  splitValue: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  placeOfSupplyText: {
    fontSize: 7.5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  customerDetailsContainer: {
    paddingLeft: 6,
    paddingVertical: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  customerDetailsTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  customerLabel: {
    fontSize: 7.5,
    width: 75,
  },
  customerVal: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    height: 25,
    alignItems: 'center',
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    height: 140,
  },
  tableCell: {
    height: '100%',
    paddingHorizontal: 4,
    paddingTop: 5,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'dashed',
  },
  tableCellLast: {
    height: '100%',
    paddingHorizontal: 4,
    paddingTop: 5,
  },
  tableHeaderCellText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableDataCellText: {
    fontSize: 7.5,
  },
  grandTotalRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    height: 20,
    alignItems: 'center',
  },
  grandTotalLeftCell: {
    width: '85%',
    paddingRight: 6,
    alignItems: 'flex-end',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'dashed',
    height: '100%',
    justifyContent: 'center',
  },
  grandTotalRightCell: {
    width: '15%',
    paddingRight: 4,
    alignItems: 'flex-end',
    height: '100%',
    justifyContent: 'center',
  },
  grandTotalText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  invoiceValueRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    height: 20,
    alignItems: 'center',
  },
  invoiceValueLabelCell: {
    width: '85%',
    paddingLeft: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'dashed',
    height: '100%',
    justifyContent: 'center',
  },
  invoiceValueValCell: {
    width: '15%',
    paddingRight: 4,
    alignItems: 'flex-end',
    height: '100%',
    justifyContent: 'center',
  },
  invoiceValueLabelText: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  invoiceValueValText: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  wordsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    paddingVertical: 5,
    alignItems: 'flex-start',
  },
  wordsLabelCell: {
    width: '35%',
    paddingLeft: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'dashed',
  },
  wordsValCell: {
    width: '65%',
    paddingLeft: 6,
    paddingRight: 4,
  },
  remarksRow: {
    paddingLeft: 6,
    paddingRight: 4,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
  },
  remarksText: {
    fontSize: 7.5,
  },
  classificationRow: {
    paddingLeft: 6,
    paddingVertical: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  classificationText: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  tdsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    height: 20,
    alignItems: 'center',
  },
  tdsText: {
    fontSize: 8,
  },
  noteRow: {
    paddingLeft: 6,
    paddingVertical: 6,
  },
  noteText: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
});

export default function Template1TransporterPaymentPdf({ transporterPayment, tenant }) {
  const summary = transporterPayment?.summary || {};
  const taxBreakup = transporterPayment?.taxBreakup || {};
  const transporter = transporterPayment?.transporterId || {};
  const paymentId = transporterPayment?.paymentId || '';
  const issueDate = transporterPayment?.issueDate;

  const transporterState = transporter?.state || '';
  const stateCode = getStateCode(transporterState);

  const company = tenant || {};
  const companyName = company.name || 'Speedomile Logistics Private Limited';
  const addressLine1 = company.address?.line1 || '';
  const addressLine2 = company.address?.line2 || '';
  const city = company.address?.city || '';
  const state = company.address?.state || '';
  const pincode = company.address?.pincode || '';
  const gstNo = company.legalInfo?.gstNumber || '';
  const tenantStateCode = getStateCode(state);

  const { totalFreightAmount, totalExpense, totalAdditionalCharges, netIncome } = summary || {};

  const totalDeductions = -totalAdditionalCharges + totalExpense;

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.container}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>BILL OF SUPPLY</Text>
          </View>

          {/* Original For Recipient Row */}
          <View style={styles.originalRow}>
            <Text style={styles.originalText}>ORIGINAL FOR RECIPIENT</Text>
          </View>

          {/* Transporter Name Row */}
          <View style={styles.transporterNameRow}>
            <Text style={styles.transporterNameText}>
              {(transporter?.transportName || '').toUpperCase()}
            </Text>
          </View>

          {/* Contact Row */}
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Contact No -</Text>
            <Text style={styles.contactValue}>{transporter?.cellNo || ''}</Text>
          </View>

          {/* Split Row (Bill Details / Place of Supply) */}
          <View style={styles.splitRow}>
            <View style={styles.splitLeftCol}>
              <View style={styles.splitLeftItem}>
                <Text style={styles.splitLabel}>Bill of supply No -</Text>
                <Text style={styles.splitValue}>{paymentId}</Text>
              </View>
              <View style={styles.splitLeftItem}>
                <Text style={styles.splitLabel}>Bill of supply date -</Text>
                <Text style={styles.splitValue}>
                  {fDate(issueDate, formatStr.paramCase.date) || ''}
                </Text>
              </View>
              <View style={styles.splitLeftItemLast}>
                <Text style={styles.splitLabel}>PAN No. :</Text>
                <Text style={styles.splitValue}>{transporter?.panNo || ''}</Text>
              </View>
            </View>
            <View style={styles.splitRightCol}>
              <Text style={styles.placeOfSupplyText}>
                Place of supply{' '}
                <Text style={styles.boldText}>{transporterState.toUpperCase()}</Text> State Code{' '}
                <Text style={styles.boldText}>{stateCode}</Text>
              </Text>
            </View>
          </View>

          {/* Details of Customer Section */}
          <View style={styles.customerDetailsContainer}>
            <Text style={styles.customerDetailsTitle}>DETAILS OF CUSTOMER</Text>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>NAME : -</Text>
              <Text style={styles.customerVal}>{companyName}</Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>ADDRESS : -</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerVal}>{addressLine1}</Text>
                {(addressLine2 || city || pincode) && (
                  <Text style={[styles.customerVal, { marginTop: 2 }]}>
                    {addressLine2 ? `${addressLine2}, ` : ''}
                    {city}
                    {city && pincode ? ' - ' : ''}
                    {pincode}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>State: </Text>
              <Text style={[styles.customerVal, { width: 140 }]}>{state}</Text>
              <Text style={{ fontSize: 7.5, width: 70 }}>State Code </Text>
              <Text style={styles.customerVal}>{tenantStateCode}</Text>
            </View>
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>GSTIN -</Text>
              <Text style={styles.customerVal}>{gstNo}</Text>
            </View>
          </View>

          {/* Table Headers */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableCell, { width: '8%' }]}>
              <Text style={styles.tableHeaderCellText}>S.No.</Text>
            </View>
            <View style={[styles.tableCell, { width: '37%' }]}>
              <Text style={[styles.tableHeaderCellText, { textAlign: 'left' }]}>
                Description of Service
              </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text style={styles.tableHeaderCellText}>SAC</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text style={[styles.tableHeaderCellText, { textAlign: 'right' }]}>Total</Text>
            </View>
            <View style={[styles.tableCell, { width: '13%' }]}>
              <Text style={[styles.tableHeaderCellText, { textAlign: 'right' }]}>
                Other charges
              </Text>
            </View>
            <View style={[styles.tableCellLast, { width: '15%' }]}>
              <Text style={[styles.tableHeaderCellText, { textAlign: 'right' }]}>Net Value</Text>
            </View>
          </View>

          {/* Table Data Row (Single Aggregate Row) */}
          <View style={styles.tableDataRow}>
            <View style={[styles.tableCell, { width: '8%', alignItems: 'center' }]}>
              <Text style={styles.tableDataCellText}>1</Text>
            </View>
            <View style={[styles.tableCell, { width: '37%' }]}>
              <Text style={styles.tableDataCellText}>Vehicle Hiring Service</Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', alignItems: 'center' }]}>
              <Text style={styles.tableDataCellText}>996601</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%', alignItems: 'flex-end' }]}>
              <Text style={styles.tableDataCellText}>{fNumber(totalFreightAmount)}</Text>
            </View>
            <View style={[styles.tableCell, { width: '13%', alignItems: 'flex-end' }]}>
              <Text style={styles.tableDataCellText}>{fNumber(totalDeductions)}</Text>
            </View>
            <View style={[styles.tableCellLast, { width: '15%', alignItems: 'flex-end' }]}>
              <Text style={styles.tableDataCellText}>
                {fNumber(totalFreightAmount - totalDeductions)}
              </Text>
            </View>
          </View>

          {/* TDS Row */}
          {taxBreakup?.tds?.rate > 0 && (
            <View style={styles.tdsRow}>
              <View style={styles.grandTotalLeftCell}>
                <Text style={styles.tdsText}>TDS ({taxBreakup.tds.rate}%)</Text>
              </View>
              <View style={styles.grandTotalRightCell}>
                <Text style={styles.tdsText}>-{fNumber(taxBreakup.tds.amount)}</Text>
              </View>
            </View>
          )}

          {/* Grand Total Row */}
          <View style={styles.grandTotalRow}>
            <View style={styles.grandTotalLeftCell}>
              <Text style={styles.grandTotalText}>Grand Total</Text>
            </View>
            <View style={styles.grandTotalRightCell}>
              <Text style={styles.grandTotalText}>{fNumber(netIncome)}</Text>
            </View>
          </View>

          {/* Total invoice Value (in figures) */}
          <View style={styles.invoiceValueRow}>
            <View style={styles.invoiceValueLabelCell}>
              <Text style={styles.invoiceValueLabelText}>Total invoice Value (in figures)</Text>
            </View>
            <View style={styles.invoiceValueValCell}>
              <Text style={styles.invoiceValueValText}>{Math.round(netIncome)}</Text>
            </View>
          </View>

          {/* Total invoice value [ in Words] */}
          <View style={styles.wordsRow}>
            <View style={styles.wordsLabelCell}>
              <Text style={styles.invoiceValueLabelText}>Total invoice value [ in Words] :</Text>
            </View>
            <View style={styles.wordsValCell}>
              <Text style={styles.invoiceValueValText}>{fCurrencyInWords(netIncome)}</Text>
            </View>
          </View>

          {/* Remarks Row */}
          <View style={styles.remarksRow}>
            <Text style={styles.remarksText}>
              Remarks - Exempted vide Sr. No. 22 of Notification no 12/2017 - Central Tax (Rate)
              dated. 28th June, 2017 and as notified by State under GST law.
            </Text>
          </View>

          {/* Classification of supply Row */}
          <View style={styles.classificationRow}>
            <Text style={styles.classificationText}>Classification of supply - Exempted</Text>
          </View>

          {/* Computer generated Note Row */}
          <View style={styles.noteRow}>
            <Text style={styles.noteText}>
              Note: This is a computer-generated bill of supply issued. No signature is required
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
