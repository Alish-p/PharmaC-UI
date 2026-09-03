/* eslint-disable react/prop-types */
import { Page, Font, Document } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fNumber, fCurrency } from 'src/utils/format-number';

import { PDFTitle, PDFHeader, PDFStyles, NewPDFTable } from 'src/pdfs/common';

import { fFreightRate, getWeightUnit, calculateTotalWeight, calculateTotalShortageWeight } from 'src/sections/subtrip/utils';

import PDFBillToSection from './common/PDFBillTo';
import PDFInvoiceFooter from './common/PDFInvoiceFooter';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

export default function InvoicePdf({ invoice, tenant }) {
  const {
    customerId,
    issueDate,
    invoiceNo,
    subtripSnapshot,
    netTotal,
    additionalCharges = [],
    taxBreakup,
  } = invoice || {};

  const renderInvoiceTable = () => {
    const columns = [
      { header: 'S.No', accessor: 'sno', width: '4%' },
      { header: 'Consignee', accessor: 'consignee', width: '16%' },
      { header: 'Destination', accessor: 'destination', width: '12%' },
      { header: 'Invoice No', accessor: 'invoiceNo', width: '9%' },
      { header: 'Disp. Date', accessor: 'dispDate', width: '7%' },
      { header: 'LR No', accessor: 'lrNo', width: '5%' },
      { header: 'DI/DC No', accessor: 'diNumber', width: '7%' },
      { header: 'Vehicle', accessor: 'vehicle', width: '7%' },
      { header: 'Material', accessor: 'material', width: '7%' },
      {
        header: 'Rate',
        accessor: 'rateModel',
        width: '8%',
        align: 'right',
      },
      {
        header: 'Weight',
        accessor: 'weight',
        width: '8%',
        align: 'right',
        showTotal: true,
        formatter: (v, row) =>
          typeof v === 'number' && v > 0 ? `${fNumber(v)} ${row.weightUnit || 'Ton'}` : '-',
        totalFormatter: () => calculateTotalWeight(subtripSnapshot),
      },
      {
        header: 'Freight Amount ( ₹ )',
        accessor: 'freightAmount',
        width: '10%',
        align: 'right',
        showTotal: true,
        formatter: (v) => fNumber(v),
      },
      {
        header: 'Shortage',
        accessor: 'shortageWeight',
        width: '9%',
        align: 'right',
        showTotal: true,
        formatter: (v, row) =>
          typeof v === 'number' && v > 0 ? `${fNumber(v)} ${row?.weightUnit || 'Ton'}` : '-',
        totalFormatter: () => calculateTotalShortageWeight(subtripSnapshot),
      },
    ];

    const tableData = subtripSnapshot.map((subtrip, index) => {
      const weightUnit = getWeightUnit(subtrip);

      const rateModel = fFreightRate(
        subtrip.freightDetails?.rate || 0,
        subtrip.freightDetails?.freightModel,
        subtrip.freightDetails?.freightAmount
      );

      return {
        sno: index + 1,
        consignee: subtrip.consignee,
        destination: subtrip.unloadingPoint,
        invoiceNo: subtrip.invoiceNo,
        dispDate: fDate(subtrip.startDate),
        lrNo: subtrip.subtripNo,
        diNumber: subtrip.diNumber || '-',
        vehicle: subtrip.vehicleNo,
        material: subtrip.materialType || '-',
        rateModel,
        weight: subtrip.loadingWeight || 0,
        weightUnit,
        freightAmount:
          subtrip.freightDetails?.freightAmount ||
          (subtrip.freightDetails?.rate && subtrip.loadingWeight
            ? subtrip.freightDetails.rate * subtrip.loadingWeight
            : 0),
        shortageWeight: subtrip.shortageWeight,
      };
    });

    // Create extra rows for tax breakdown
    const createExtraRows = () => {
      const extraRows = [];

      // Add tax breakdown rows
      if (taxBreakup.cgst.rate !== 0) {
        extraRows.push({
          cells: [
            { startIndex: 0, colspan: 10, value: '', align: 'left' }, // Empty cell spanning first 10 columns
            { startIndex: 10, colspan: 1, value: `CGST-${taxBreakup.cgst.rate}%`, align: 'right' },
            {
              startIndex: 11,
              colspan: 1,
              value: fCurrency(taxBreakup.cgst.amount),
              align: 'right',
            },
            { startIndex: 12, colspan: 1, value: '', align: 'right' },
          ],
          highlight: false,
        });
      }

      if (taxBreakup.sgst.rate !== 0) {
        extraRows.push({
          cells: [
            { startIndex: 0, colspan: 10, value: '', align: 'left' },
            { startIndex: 10, colspan: 1, value: `SGST-${taxBreakup.sgst.rate}%`, align: 'right' },
            {
              startIndex: 11,
              colspan: 1,
              value: fCurrency(taxBreakup.sgst.amount),
              align: 'right',
            },
            { startIndex: 12, colspan: 1, value: '', align: 'right' },
          ],
          highlight: false,
        });
      }

      if (taxBreakup.igst.rate !== 0) {
        extraRows.push({
          cells: [
            { startIndex: 0, colspan: 10, value: '', align: 'left' },
            { startIndex: 10, colspan: 1, value: `IGST-${taxBreakup.igst.rate}%`, align: 'right' },
            {
              startIndex: 11,
              colspan: 1,
              value: fCurrency(taxBreakup.igst.amount),
              align: 'right',
            },
            { startIndex: 12, colspan: 1, value: '', align: 'right' },
          ],
          highlight: false,
        });
      }

      // Add additional charges
      if (additionalCharges.length > 0) {
        additionalCharges.forEach(({ label, amount }) => {
          extraRows.push({
            cells: [
              { startIndex: 0, colspan: 10, value: '', align: 'left' },
              { startIndex: 10, colspan: 1, value: label, align: 'right' },
              { startIndex: 11, colspan: 1, value: fCurrency(amount), align: 'right' },
              { startIndex: 12, colspan: 1, value: '', align: 'right' },
            ],
            highlight: false,
          });
        });
      }

      // Add net total row
      extraRows.push({
        cells: [
          { startIndex: 0, colspan: 10, value: '', align: 'left' },
          { startIndex: 10, colspan: 1, value: 'Net Total', align: 'right' },
          { startIndex: 11, colspan: 1, value: fCurrency(netTotal), align: 'right' },
          { startIndex: 12, colspan: 1, value: '', align: 'right' },
        ],
        highlight: true,
      });

      return extraRows;
    };

    const cellStyler = (row, column) => {
      if (column.accessor === 'shortageWeight' && row.shortageWeight > 0) {
        return 'textDanger';
      }
      return null;
    };

    return (
      <NewPDFTable
        columns={columns}
        data={tableData}
        showTotals
        totalRowLabel="TOTAL"
        cellStyler={cellStyler}
        extraRows={createExtraRows()}
      />
    );
  };

  return (
    <Document>
      <Page size="A4" style={PDFStyles.page} orientation="landscape">
        <PDFTitle title="Tax Invoice" />
        <PDFHeader company={tenant} />

        <PDFBillToSection
          title="Consignor / Bill To"
          billToDetails={[
            customerId?.customerName,
            customerId?.address,
            customerId?.GSTNo,
            customerId?.sacCode || 'SAC-CODE : 996791',
            customerId?.pinCode,
            customerId?.state,
          ]}
          metaDetails={[
            ['Bill No.', invoiceNo],
            ['Date', fDate(issueDate)],
            ['PAN NO', tenant?.legalInfo.panNumber],
            ['GSTIN NO', tenant?.legalInfo.gstNumber],
            ['Bank Name', tenant?.bankDetails?.name],
            ['IFSC code', tenant?.bankDetails?.ifsc],
            ['A/C No', tenant?.bankDetails?.accNo],
            ['Transporter Code', customerId?.transporterCode || '-'],
          ]}
        />

        {renderInvoiceTable()}
        <PDFInvoiceFooter
          declaration="I/we have taken registration under the CGST Act, 2017 and have exercised the option to pay tax on services of GTA in relation to transport of goods supplied by us."
          signatory="For Shree Enterprises"
        />
      </Page>
    </Document>
  );
}
