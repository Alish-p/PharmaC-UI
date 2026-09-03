/* eslint-disable react/prop-types */
import { Page, Font, Document } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fNumber, fCurrency } from 'src/utils/format-number';

import { PDFTitle, PDFHeader, PDFStyles, NewPDFTable } from 'src/pdfs/common';

import PDFBillToSection from './common/PDFBillTo';

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

export default function PurchaseOrderPdf({ purchaseOrder, tenant }) {
  const {
    purchaseOrderNo,
    vendor,
    vendorSnapshot,
    partLocation,
    partLocationSnapshot,
    orderDate,
    createdAt,
    lines = [],
    subtotal = 0,
    discount = 0,
    discountType,
    shipping = 0,
    tax = 0,
    taxType,
    discountAmount,
    taxAmount,
    total = 0,
    receipts = [],
  } = purchaseOrder || {};

  const displayVendor = vendorSnapshot || vendor;
  const displayLocation = partLocationSnapshot || partLocation;

  const displayDate = orderDate || createdAt;
  const displayPoNo = purchaseOrderNo || '';

  const hasReceipts = receipts && receipts.length > 0;

  // Columns differ depending on whether any items have been received
  const columns = [
    { header: 'S.No', accessor: 'sno', width: '5%' },
    { header: 'Part', accessor: 'part', width: hasReceipts ? '20%' : '30%' },
    { header: 'Part No.', accessor: 'partNumber', width: hasReceipts ? '12%' : '15%' },
    {
      header: 'Qty Ord.',
      accessor: 'qtyOrdered',
      width: hasReceipts ? '9%' : '12%',
      align: 'right',
    },
    {
      header: 'Qty Rec.',
      accessor: 'qtyReceived',
      width: hasReceipts ? '9%' : '12%',
      align: 'right',
    },
    {
      header: 'PO Cost',
      accessor: 'unitCost',
      width: hasReceipts ? '9%' : '13%',
      align: 'right',
      formatter: (v) => fCurrency(v || 0),
    },
    {
      header: 'PO Amount',
      accessor: 'poAmount',
      width: hasReceipts ? '9%' : '13%',
      align: 'right',
      formatter: (v) => fCurrency(v || 0),
      showTotal: true,
    },
    ...(hasReceipts
      ? [
          {
            header: 'Act. Avg Cost',
            accessor: 'actualCost',
            width: '12%',
            align: 'right',
            formatter: (v) => (v != null ? fCurrency(v) : '-'),
          },
          {
            header: 'Act. Total',
            accessor: 'actualTotal',
            width: '10%',
            align: 'right',
            formatter: (v) => (v != null ? fCurrency(v) : '-'),
            showTotal: hasReceipts,
          },
        ]
      : []),
  ];

  const data = lines.map((line, index) => {
    const displayPartName = line.partSnapshot?.name ?? line.part?.name ?? 'Unknown Part';
    const displayPartNumber = line.partSnapshot?.partNumber ?? line.part?.partNumber ?? '-';
    const displayUnit = line.partSnapshot?.measurementUnit ?? line.part?.measurementUnit ?? '-';

    let avgActualCost = null;
    let actualTotal = null;
    if (hasReceipts) {
      let totalReceivedCost = 0;
      let totalReceivedQty = 0;
      receipts.forEach((grn) => {
        const grnLine = grn.lines?.find((l) => l.lineId?.toString() === line._id?.toString());
        if (grnLine && grnLine.quantityReceived > 0) {
          totalReceivedCost += (grnLine.actualUnitCost || 0) * grnLine.quantityReceived;
          totalReceivedQty += grnLine.quantityReceived;
        }
      });
      if (totalReceivedQty > 0) {
        avgActualCost = totalReceivedCost / totalReceivedQty;
        actualTotal = totalReceivedCost;
      }
    }

    const poAmount = line.amount || (line.quantityOrdered || 0) * (line.unitCost || 0);

    return {
      sno: index + 1,
      part: displayPartName,
      partNumber: displayPartNumber,
      qtyOrdered: `${fNumber(line.quantityOrdered || 0)}${displayUnit !== '-' ? ` ${displayUnit}` : ''}`,
      qtyReceived: `${fNumber(line.quantityReceived || 0)}${displayUnit !== '-' ? ` ${displayUnit}` : ''}`,
      unitCost: line.unitCost || 0,
      poAmount,
      actualCost: avgActualCost,
      actualTotal,
    };
  });

  const effectiveDiscountAmount =
    discountAmount ??
    (discountType === 'percentage' ? (subtotal * (discount || 0)) / 100 : discount || 0);

  const taxableBase = Math.max(subtotal - (effectiveDiscountAmount || 0), 0);

  const effectiveTaxAmount =
    taxAmount ?? (taxType === 'percentage' ? (taxableBase * (tax || 0)) / 100 : tax || 0);

  // Extra rows show PO cost summary columns
  // Column count differs: 7 without receipts, 9 with receipts
  const totalCols = hasReceipts ? 9 : 7;
  const labelStart = totalCols - 2;

  const extraRows = [];

  extraRows.push({
    cells: [
      { startIndex: 0, colspan: labelStart - 1, value: '', align: 'left' },
      { startIndex: labelStart - 1, colspan: 2, value: 'Subtotal', align: 'right' },
      { startIndex: labelStart + 1, colspan: 1, value: fCurrency(subtotal), align: 'right' },
    ],
    highlight: false,
  });

  if (discount > 0) {
    extraRows.push({
      cells: [
        { startIndex: 0, colspan: labelStart - 1, value: '', align: 'left' },
        {
          startIndex: labelStart - 1,
          colspan: 2,
          value: `Discount${discountType === 'percentage' ? ` (${discount}%)` : ''}`,
          align: 'right',
        },
        {
          startIndex: labelStart + 1,
          colspan: 1,
          value: `- ${fCurrency(effectiveDiscountAmount || 0)}`,
          align: 'right',
        },
      ],
      highlight: false,
    });
  }

  if (shipping > 0) {
    extraRows.push({
      cells: [
        { startIndex: 0, colspan: labelStart - 1, value: '', align: 'left' },
        { startIndex: labelStart - 1, colspan: 2, value: 'Shipping', align: 'right' },
        { startIndex: labelStart + 1, colspan: 1, value: fCurrency(shipping), align: 'right' },
      ],
      highlight: false,
    });
  }

  if (tax > 0) {
    extraRows.push({
      cells: [
        { startIndex: 0, colspan: labelStart - 1, value: '', align: 'left' },
        {
          startIndex: labelStart - 1,
          colspan: 2,
          value: `Tax${taxType === 'percentage' ? ` (${tax}%)` : ''}`,
          align: 'right',
        },
        {
          startIndex: labelStart + 1,
          colspan: 1,
          value: fCurrency(effectiveTaxAmount || 0),
          align: 'right',
        },
      ],
      highlight: false,
    });
  }

  // PO Total row
  extraRows.push({
    cells: [
      { startIndex: 0, colspan: labelStart - 1, value: '', align: 'left' },
      { startIndex: labelStart - 1, colspan: 2, value: 'PO Total', align: 'right' },
      { startIndex: labelStart + 1, colspan: 1, value: fCurrency(total), align: 'right' },
    ],
    highlight: true,
  });

  // If receipts exist, add Actual Received Total and Variance rows
  if (hasReceipts) {
    const actualReceivedTotal = receipts.reduce((sum, grn) => sum + (grn.totalAmount || 0), 0);
    const totalVariance = actualReceivedTotal - total;

    extraRows.push({
      cells: [
        { startIndex: 0, colspan: labelStart - 1, value: '', align: 'left' },
        { startIndex: labelStart - 1, colspan: 2, value: 'Actual Received Total', align: 'right' },
        {
          startIndex: labelStart + 1,
          colspan: 1,
          value: fCurrency(actualReceivedTotal),
          align: 'right',
        },
      ],
      highlight: false,
    });

    extraRows.push({
      cells: [
        { startIndex: 0, colspan: labelStart - 1, value: '', align: 'left' },
        { startIndex: labelStart - 1, colspan: 2, value: 'Variance', align: 'right' },
        {
          startIndex: labelStart + 1,
          colspan: 1,
          value: `${totalVariance > 0 ? '+' : ''}${fCurrency(totalVariance)}`,
          align: 'right',
        },
      ],
      highlight: false,
    });
  }

  return (
    <Document>
      <Page size="A4" style={PDFStyles.page}>
        <PDFTitle title="Purchase Order" />
        <PDFHeader company={tenant} />

        <PDFBillToSection
          title="Vendor"
          billToDetails={[displayVendor?.name, displayVendor?.address, displayVendor?.phone]}
          metaDetails={[
            ['PO No.', displayPoNo],
            ['Date', displayDate && fDate(displayDate)],
            ['Location', displayLocation?.name],
            ...(displayVendor?.gstNumber ? [['GST No.', displayVendor.gstNumber]] : []),
          ]}
        />

        <NewPDFTable
          columns={columns}
          data={data}
          showTotals
          totalRowLabel="TOTAL"
          extraRows={extraRows}
        />
      </Page>
    </Document>
  );
}
