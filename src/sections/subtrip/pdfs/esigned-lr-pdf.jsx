/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { Page, View, Text, Font, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { fDateTime } from 'src/utils/format-time';

import { PDFTitle, PDFTable, PDFHeader, PDFFooter, PDFDeclaration } from 'src/pdfs/common';

import { pdfStyles } from './pdf-styles';
import { loadingWeightUnit } from '../../vehicle/vehicle-config';

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () => useMemo(() => StyleSheet.create(pdfStyles), []);

export default function ESignedLRPDF({ subtrip, tenant, mapImageUrl }) {
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
    // EPOD fields
    podSignature,
    podSignedBy,
    podSigneeMobile,
    podSignedAt,
    podRemarks,
    podGeoLocation,
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

    const driverHeaders = ['Driver Name', 'Mobile No.', 'DL No.', 'Vehicle Type'];
    const driverData = [
      [
        driverId?.driverName,
        driverId?.driverCellNo,
        driverId?.driverLicenceNo,
        vehicleId?.noOfTyres,
      ],
    ];

    return (
      <>
        <PDFTable styles={styles} headers={goodsHeaders} data={goodsData} />
        <PDFTable styles={styles} headers={driverHeaders} data={driverData} />
      </>
    );
  };

  const renderEpodSection = () => {
    if (!podSignature) return null;

    const hasGeo = podGeoLocation?.latitude && podGeoLocation?.longitude;

    return (
      <View
        style={[
          styles.border,
          {
            marginTop: 8,
            padding: 8,
          },
        ]}
      >
        {/* EPOD Header */}
        <View
          style={{
            backgroundColor: '#1B806A',
            padding: '4px 8px',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: 700 }}>
            ✓ ELECTRONICALLY SIGNED — PROOF OF DELIVERY
          </Text>
        </View>

        {/* Content row: Signature + Info + Map */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Signature image */}
          <View style={{ width: hasGeo ? '35%' : '50%', alignItems: 'center' }}>
            <Text style={{ fontSize: 6, fontWeight: 700, color: '#637381', marginBottom: 4 }}>
              SIGNATURE
            </Text>
            <Image
              src={podSignature}
              style={{
                width: 140,
                height: 80,
                objectFit: 'contain',
                border: '1px solid #DFE3E8',
              }}
            />
          </View>

          {/* Info */}
          <View style={{ width: hasGeo ? '30%' : '50%', justifyContent: 'center' }}>
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 6, fontWeight: 700, color: '#637381' }}>SIGNED BY</Text>
              <Text style={{ fontSize: 8, fontWeight: 700 }}>{podSignedBy || '-'}</Text>
            </View>
            {podSigneeMobile && (
              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 6, fontWeight: 700, color: '#637381' }}>
                  MOBILE NUMBER
                </Text>
                <Text style={{ fontSize: 8, fontWeight: 700 }}>{podSigneeMobile}</Text>
              </View>
            )}
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 6, fontWeight: 700, color: '#637381' }}>DATE & TIME</Text>
              <Text style={{ fontSize: 7 }}>{podSignedAt ? fDateTime(podSignedAt) : '-'}</Text>
            </View>
            {podRemarks && (
              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 6, fontWeight: 700, color: '#637381' }}>REMARKS</Text>
                <Text style={{ fontSize: 7 }}>{podRemarks}</Text>
              </View>
            )}
            {hasGeo && (
              <View>
                <Text style={{ fontSize: 6, fontWeight: 700, color: '#637381' }}>GPS LOCATION</Text>
                <Text style={{ fontSize: 6 }}>
                  {podGeoLocation.latitude.toFixed(5)}, {podGeoLocation.longitude.toFixed(5)}
                </Text>
              </View>
            )}
          </View>

          {/* Map */}
          {hasGeo && mapImageUrl && (
            <View style={{ width: '35%', alignItems: 'center' }}>
              <Text style={{ fontSize: 6, fontWeight: 700, color: '#637381', marginBottom: 4 }}>
                DELIVERY LOCATION
              </Text>
              <Image
                src={mapImageUrl}
                style={{
                  width: 150,
                  height: 100,
                  objectFit: 'cover',
                  border: '1px solid #DFE3E8',
                }}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <PDFTitle styles={styles} title="Lorry Receipt — E-Signed" />
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

        {/* EPOD Signature Section */}
        {renderEpodSection()}

        <PDFFooter styles={styles} additionalInfo={`LR No: ${subtripNo} | E-Signed POD`} />
      </Page>
    </Document>
  );
}
