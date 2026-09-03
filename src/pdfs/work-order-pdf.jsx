/* eslint-disable react/prop-types */
import { Page, View, Text, Font, Document } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { PDFTitle, PDFHeader, PDFStyles, NewPDFTable } from 'src/pdfs/common';

import PDFBillToSection from './common/PDFBillTo';

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

export default function WorkOrderPdf({ workOrder, tenant }) {
  const {
    workOrderNo,
    vehicle,
    status,
    priority,
    orderDate,
    createdAt,
    scheduledStartDate,
    odometerReading,
    parts = [],
    issues = [],
    description,
    partsCost = 0,
    labourCharge = 0,
    totalCost = 0,
  } = workOrder || {};

  const displayDate = orderDate || createdAt;
  const displayNo = workOrderNo || '';

  const partsColumns = [
    { header: 'S.No', accessor: 'sno', width: '5%' },
    { header: 'Part', accessor: 'part', width: '30%' },
    { header: 'Part No.', accessor: 'partNumber', width: '20%' },
    { header: 'Qty', accessor: 'qty', width: '15%', align: 'right' },
    {
      header: 'Price',
      accessor: 'price',
      width: '12%',
      align: 'right',
      formatter: (v) => fCurrency(v || 0),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      width: '13%',
      align: 'right',
      formatter: (v) => fCurrency(v || 0),
      showTotal: true,
    },
  ];

  const partsData = parts.map((line, index) => {
    const displayPartName = line.partSnapshot?.name ?? line.part?.name ?? 'Unknown Part';
    const displayPartNumber = line.partSnapshot?.partNumber ?? line.part?.partNumber ?? '-';
    const displayUnit = line.partSnapshot?.measurementUnit ?? line.part?.measurementUnit ?? '-';

    return {
      sno: index + 1,
      part: displayPartName,
      partNumber: displayPartNumber,
      qty: `${line.quantity || 0}${displayUnit !== '-' ? ` ${displayUnit}` : ''}`,
      price: line.price || 0,
      amount: line.amount || (line.quantity || 0) * (line.price || 0),
    };
  });

  const partsExtraRows = [
    {
      cells: [
        { startIndex: 0, colspan: 4, value: '', align: 'left' },
        { startIndex: 4, colspan: 1, value: 'Parts Cost', align: 'right' },
        { startIndex: 5, colspan: 1, value: fCurrency(partsCost), align: 'right' },
      ],
      highlight: false,
    },
    {
      cells: [
        { startIndex: 0, colspan: 4, value: '', align: 'left' },
        { startIndex: 4, colspan: 1, value: 'Labour Charge', align: 'right' },
        { startIndex: 5, colspan: 1, value: fCurrency(labourCharge), align: 'right' },
      ],
      highlight: false,
    },
    {
      cells: [
        { startIndex: 0, colspan: 4, value: '', align: 'left' },
        { startIndex: 4, colspan: 1, value: 'Total Cost', align: 'right' },
        { startIndex: 5, colspan: 1, value: fCurrency(totalCost), align: 'right' },
      ],
      highlight: true,
    },
  ];

  return (
    <Document>
      <Page size="A4" style={PDFStyles.page}>
        <PDFTitle title="Work Order / Job Card" />
        <PDFHeader company={tenant} />

        <PDFBillToSection
          title="Vehicle Details"
          billToDetails={[
            vehicle?.vehicleNo || 'Unknown Vehicle',
            vehicle?.vehicleType ? `Type: ${vehicle.vehicleType}` : '',
            typeof odometerReading === 'number' ? `Odometer: ${odometerReading} km` : '',
          ]}
          metaDetails={[
            ['Work Order No.', displayNo],
            ['Date', fDate(displayDate)],
            ['Status', status],
            ['Priority', priority],
            ['Scheduled', scheduledStartDate ? fDate(scheduledStartDate) : '-'],
          ]}
        />

        {/* Issues Checklist Section */}
        <View style={[PDFStyles.mt8, PDFStyles.mb8]}>
          <Text style={[PDFStyles.h3, { marginBottom: 4 }]}>Issues / Tasks</Text>
          <View style={[PDFStyles.border, { borderRadius: 2 }]}>
            {/* Header */}
            <View
              style={[
                PDFStyles.flexRow,
                PDFStyles.borderBottom,
                { backgroundColor: '#f4f6f8', padding: 4 },
              ]}
            >
              <View style={{ width: '5%', alignItems: 'center' }}>
                <Text style={PDFStyles.subtitle2}>#</Text>
              </View>
              <View style={{ width: '5%', alignItems: 'center' }}>
                <Text style={PDFStyles.subtitle2}>Done</Text>
              </View>
              <View style={{ width: '45%' }}>
                <Text style={PDFStyles.subtitle2}>Issue Description</Text>
              </View>
              <View style={{ width: '25%' }}>
                <Text style={PDFStyles.subtitle2}>Assigned To</Text>
              </View>
              <View style={{ width: '20%' }}>
                <Text style={PDFStyles.subtitle2}>Notes</Text>
              </View>
            </View>

            {/* Rows */}
            {issues.length > 0 ? (
              issues.map((issue, index) => {
                const descriptionText = typeof issue === 'string' ? issue : issue.issue;
                const assignedToText =
                  (typeof issue === 'object' &&
                    Array.isArray(issue.assignedTo) &&
                    issue.assignedTo.length > 0 &&
                    issue.assignedTo
                      .map((user) => user.name || user.customerName)
                      .filter(Boolean)
                      .join(', ')) ||
                  '-';

                return (
                  <View
                    key={index}
                    style={[
                      PDFStyles.flexRow,
                      index !== issues.length - 1 ? PDFStyles.borderBottom : {},
                      { padding: 4, minHeight: 24 },
                    ]}
                  >
                    <View style={{ width: '5%', alignItems: 'center' }}>
                      <Text style={PDFStyles.body2}>{index + 1}</Text>
                    </View>
                    <View style={{ width: '5%', alignItems: 'center' }}>
                      {/* Checkbox placeholder */}
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderWidth: 1,
                          borderColor: '#000',
                          marginTop: 1,
                        }}
                      />
                    </View>
                    <View style={{ width: '45%', paddingRight: 4 }}>
                      <Text style={PDFStyles.body2}>{descriptionText}</Text>
                    </View>
                    <View style={{ width: '25%', paddingRight: 4 }}>
                      <Text style={PDFStyles.body2}>{assignedToText}</Text>
                    </View>
                    <View style={{ width: '20%' }}>{/* Empty space for notes */}</View>
                  </View>
                );
              })
            ) : (
              <View style={{ padding: 8 }}>
                <Text style={[PDFStyles.body2, { color: '#777' }]}>No issues recorded.</Text>
              </View>
            )}
          </View>
        </View>

        {description && (
          <View style={[PDFStyles.mt8, PDFStyles.mb8]}>
            <Text style={[PDFStyles.h3, { marginBottom: 4 }]}>Instructions / Description</Text>
            <View style={[PDFStyles.border, { padding: 4, minHeight: 40 }]}>
              <Text style={PDFStyles.body2}>{description}</Text>
            </View>
          </View>
        )}

        {/* Parts Section */}
        {parts.length > 0 && (
          <View style={PDFStyles.mt8}>
            <Text style={[PDFStyles.h3, { marginBottom: 4 }]}>Parts Used</Text>
            <NewPDFTable
              columns={partsColumns}
              data={partsData}
              showTotals
              totalRowLabel="Total"
              extraRows={partsExtraRows}
            />
          </View>
        )}

        {/* Signatures */}
        <View style={[PDFStyles.flexRow, { marginTop: 40 }]}>
          <View style={{ width: '40%' }}>
            <View style={{ borderBottomWidth: 1, borderColor: '#000', marginBottom: 4 }} />
            <Text style={PDFStyles.subtitle2}>Mechanic Signature</Text>
          </View>
          <View style={{ width: '20%' }} />
          <View style={{ width: '40%' }}>
            <View style={{ borderBottomWidth: 1, borderColor: '#000', marginBottom: 4 }} />
            <Text style={PDFStyles.subtitle2}>Supervisor Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
