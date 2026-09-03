/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { Page, View, Text, Font, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import TenantLogo from 'src/pdfs/common/TenantLogo';

import { pdfStyles } from './pdf-styles';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () => useMemo(() => StyleSheet.create(pdfStyles), []);

export default function EntryPassPdf({ subtrip, tenant }) {
  const COMPANY = tenant;
  const phone = COMPANY.contacts?.[0] || COMPANY.contactDetails?.phone;
  const email = COMPANY.email || COMPANY.contactDetails?.email;
  const website = COMPANY.website || COMPANY.contactDetails?.website;
  const { _id, subtripNo, diNumber, customerId, startDate, driverId, vehicleId } = subtrip;

  console.log(subtrip);

  const styles = useStyles();

  const renderDocumentTitle = () => (
    <View style={[styles.gridContainer]}>
      <Text style={[styles.h3, styles.mb4]}>Entry Pass</Text>
    </View>
  );

  const renderCompanyHeader = () => (
    <View style={[styles.gridContainer, styles.border]}>
      <View style={[styles.gridContainer, styles.col8, styles.p8, styles.borderRight]}>
        <View style={[styles.col4]}>
          <TenantLogo
            tenant={tenant}
            size={48}
            src={getTenantLogoUrl(tenant, { fallback: false })}
          />
        </View>

        <View style={[styles.col8, { display: 'flex', alignItems: 'center' }]}>
          <Text style={[styles.h1]}>{COMPANY.name}</Text>
          <Text style={styles.body2}>{COMPANY.tagline}</Text>
          <Text style={styles.body2}>{COMPANY.address.line1} </Text>
          <Text style={styles.body2}>{`${COMPANY.address.line2} , ${COMPANY.address.state}`}</Text>
          {/* <Text style={styles.body2}>{COMPANY.email} </Text>
              <Text style={styles.body2}>{COMPANY.website} </Text> */}
        </View>
      </View>

      <View
        style={[
          styles.gridContainer,
          styles.col4,
          styles.p8,
          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        ]}
      >
        {/* Left Column: Labels */}
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={[styles.subtitle2]}>Mobile No</Text>
          <Text style={[styles.subtitle2]}>Email</Text>
          <Text style={[styles.subtitle2]}>Website</Text>
        </View>

        {/* Right Column: Values */}
        <View style={{ flex: 2 }}>
          <Text style={[styles.body2]}>{phone}</Text>
          <Text style={[styles.body2]}>{email}</Text>
          <Text style={styles.body2}>{website}</Text>
        </View>
      </View>
    </View>
  );

  const renderDeclaration = () => (
    <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
      <View style={[styles.col12]}>
        <Text style={[styles.p4, styles.subtitle2]}>
          Please allow this vehicle to enter for loading.
        </Text>
      </View>
    </View>
  );

  const renderCompanyRow = () => (
    <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
      <View style={[styles.gridContainer, styles.col8, styles.borderRight]}>
        {/* Company */}
        <View style={[styles.col12, styles.horizontalCell, { justifyContent: 'flex-start' }]}>
          <Text style={[styles.horizontalCellTitle]}>To:</Text>
          <Text style={[styles.horizontalCellContent]}>{customerId?.customerName}</Text>
        </View>
      </View>

      {/* LR/Date */}
      <View style={[styles.col4, styles.gridContainer]}>
        <View style={[styles.col6, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>DI/DO No: </Text>
          <Text style={[styles.horizontalCellContent]}>{diNumber || '-'}</Text>
        </View>
        <View style={[styles.col6, styles.horizontalCell]}>
          <Text style={[styles.horizontalCellTitle]}>Date :</Text>
          <Text style={styles.horizontalCellContent}>{fDate(startDate)}</Text>
        </View>
      </View>
    </View>
  );

  const renderTableDetails = () => (
    <>
      {/* Vehicle Details Header */}
      <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>Driver Name</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>Driver Mobile No.</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>Vehicle No.</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>Vehicle Type</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>LR NO</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell]}>
          <Text style={[styles.horizontalCellTitle]}>Transporter</Text>
        </View>
      </View>
      {/* Values */}
      <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellContent]}>{driverId?.driverName}</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellContent]}>{driverId?.driverCellNo}</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellContent]}>{vehicleId?.vehicleNo}</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellContent]}>{vehicleId?.noOfTyres} Tyre</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellContent]}>{subtripNo}</Text>
        </View>
        <View style={[styles.col2, styles.horizontalCell]}>
          <Text style={[styles.horizontalCellContent]}>{COMPANY.name}</Text>
        </View>
      </View>
    </>
  );

  return (
    <Document>
      <Page size="A5" style={styles.page} orientation="landscape">
        {/* Headers */}

        {renderDocumentTitle()}
        {renderCompanyHeader()}
        {renderDeclaration()}
        {renderCompanyRow()}
        {renderTableDetails()}
      </Page>
    </Document>
  );
}
