/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { Page, View, Text, Font, Document, StyleSheet } from '@react-pdf/renderer';

import { fDateTime } from 'src/utils/format-time';

import { PDFTitle, PDFTable, PDFHeader, PDFFooter, PDFDeclaration } from 'src/pdfs/common';

import { pdfStyles } from './pdf-styles';
import { loadingWeightUnit } from '../../vehicle/vehicle-config';

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () => useMemo(() => StyleSheet.create(pdfStyles), []);

export default function LRPDF({ subtrip, tenant }) {
  const {
    _id,
    subtripNo,
    customerId,
    consignee,
    ewayBill,
    invoiceNo,
    loadingPoint,
    loadingWeight,
    orderNo,
    startDate,
    unloadingPoint,
    grade,
    materialType,
    driverId,
    vehicleId,
  } = subtrip;

  const { vehicleType } = vehicleId;
  const styles = useStyles();

  const renderStructuredHeader = () => {
    const headers = [
      'Consignor',
      'Consignee',
      'From',
      'To',
      'LR No',
      'Date',
      'Invoice No',
      'Eway No',
    ];
    const data = [
      [
        customerId?.customerName || '-',
        consignee || '-',
        loadingPoint || '-',
        unloadingPoint || '-',
        subtripNo,
        fDateTime(startDate),
        invoiceNo,
        ewayBill,
      ],
    ];

    return <PDFTable styles={styles} headers={headers} data={data} columnWidths={[2, 2, 1, 1, 1, 1, 2, 2]} />;
  };

  const renderTables = () => {
    const goodsHeaders = [
      'Transporter Code',
      'Order No.',
      'Vehicle No.',
      `Qty. in (${loadingWeightUnit[vehicleType]})`,
      'Material',
      'Grade',
    ];
    const goodsData = [
      [
        customerId?.transporterCode,
        orderNo,
        vehicleId?.vehicleNo,
        loadingWeight,
        materialType,
        grade,
      ],
    ];

    const driverHeaders = ['Driver Name', 'Mobile No.', 'DL No.', 'Vehicle Type', 'Signature'];
    const driverData = [
      [
        driverId?.driverName,
        driverId?.driverCellNo,
        driverId?.driverLicenceNo,
        vehicleId?.noOfTyres,
        '',
      ],
    ];

    return (
      <>
        <PDFTable styles={styles} headers={goodsHeaders} data={goodsData} />
        <PDFTable styles={styles} headers={driverHeaders} data={driverData} />
      </>
    );
  };

  return (
    <Document>
      <Page size="A5" style={styles.page} orientation="landscape">
        <PDFTitle styles={styles} title="Lorry Receipt" />
        <PDFHeader styles={styles} company={tenant} />
        {renderStructuredHeader()}
        {renderTables()}
        <View style={[styles.gridContainer, styles.borderLeft, styles.borderRight]}>
          <View style={styles.col12}>
            <Text style={{ textAlign: 'center', padding: 4 }}> </Text>
          </View>
        </View>
        <PDFDeclaration
          styles={styles}
          content={[
            "1. Goods are transported at owner's risk.",
            '2. Subject to local jurisdiction.',
            '3. E. & O. E.',
          ]}
        />
        <PDFFooter styles={styles} additionalInfo={`LR No: ${subtripNo}`} />
      </Page>
    </Document>
  );
}
