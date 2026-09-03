/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { Page, Font, View, Text, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';

import {
  PDFTitle,
  PDFTable,
  PDFHeader,
  PDFStyles,
  PDFEmptyLine,
  PDFDeclaration,
} from 'src/pdfs/common';

import { DRIVER_ADVANCE_GIVEN_BY_OPTIONS } from 'src/sections/subtrip/constants';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () => useMemo(() => StyleSheet.create(PDFStyles), []);

// ----------------------------------------------------------------------

export default function IndentPdf({ subtrip, tenant }) {
  const {
    _id,
    subtripNo,
    startDate,
    initialAdvanceDiesel,
    initialAdvanceDieselUnit,
    initialTripAdvance,
    driverId,
    vehicleId,
    intentFuelPump,
    driverAdvanceGivenBy,
  } = subtrip;

  const styles = useStyles();

  // Prepare table data
  // Show diesel as per unit captured on subtrip
  const isDieselAmount = String(initialAdvanceDieselUnit || '').toLowerCase() === 'amount';
  const dieselHeader = isDieselAmount ? 'Diesel (₹)' : 'Diesel (Ltr)';
  const dieselDisplayValue = initialAdvanceDiesel || '';

  const tableHeaders = [
    'Driver Name',
    'Driver Mobile No.',
    'Vehicle No.',
    'Vehicle Type',
    dieselHeader,
    'Advance Amount (₹)',
  ];

  // Determine if advance is given by pump using enum values strictly
  const isPumpAdvance = driverAdvanceGivenBy === DRIVER_ADVANCE_GIVEN_BY_OPTIONS.FUEL_PUMP;

  // Resolve advance amount only from initialTripAdvance (no expense derivation)
  const advanceAmount = Number(initialTripAdvance || 0) || 0;

  const tableData = [
    [
      driverId?.driverName || '',
      driverId?.driverCellNo || '',
      vehicleId?.vehicleNo || '',
      `${vehicleId?.noOfTyres || ''} Tyre`,
      dieselDisplayValue,
      isPumpAdvance ? advanceAmount : 0,
    ],
  ];

  // Prepare pump info
  const pumpInfo = {
    to: intentFuelPump?.name || '',
    lrNo: subtripNo || '',
    date: fDate(startDate),
  };

  // Prepare declaration content
  const declarationContent =
    'Please pay the amount mentioned below and provide fuel to the following vehicle details:';

  return (
    <Document>
      <Page size="A5" style={styles.page} orientation="landscape">
        <PDFTitle title="Petrol Pump Intent" />

        <PDFHeader company={tenant} />

        {/* Pump Info Row */}
        <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
          <View style={[styles.gridContainer, styles.col8, styles.borderRight]}>
            <View style={[styles.col12, styles.horizontalCell, { justifyContent: 'flex-start' }]}>
              <Text style={[styles.horizontalCellTitle]}>To:</Text>
              <Text style={[styles.horizontalCellContent]}>{pumpInfo.to}</Text>
            </View>
          </View>

          <View style={[styles.col4, styles.gridContainer]}>
            <View style={[styles.col6, styles.horizontalCell, styles.borderRight]}>
              <Text style={[styles.horizontalCellTitle]}>LR No:</Text>
              <Text style={[styles.horizontalCellContent]}>{pumpInfo.lrNo}</Text>
            </View>
            <View style={[styles.col6, styles.horizontalCell]}>
              <Text style={[styles.horizontalCellTitle]}>Date :</Text>
              <Text style={styles.horizontalCellContent}>{pumpInfo.date}</Text>
            </View>
          </View>
        </View>

        <PDFEmptyLine />

        <PDFDeclaration content={declarationContent} />

        <PDFTable headers={tableHeaders} data={tableData} columnWidths={[2, 2, 2, 2, 2, 2]} />
      </Page>
    </Document>
  );
}
