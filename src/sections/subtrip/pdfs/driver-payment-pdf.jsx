/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { Page, View, Text, Font, Document, StyleSheet } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import TenantLogo from 'src/pdfs/common/TenantLogo';

import { pdfStyles } from './pdf-styles';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () => useMemo(() => StyleSheet.create(pdfStyles), []);

export default function DriverPaymentPdf({ subtrip, tenant }) {
  const COMPANY = tenant;
  const phone = COMPANY.contacts?.[0] || COMPANY.contactDetails?.phone;
  const email = COMPANY.email || COMPANY.contactDetails?.email;
  const website = COMPANY.website || COMPANY.contactDetails?.website;
  const {
    _id,
    subtripNo,
    customerId,
    startDate,
    expenses,
    driverId,
    loadingPoint,
    unloadingPoint,
  } = subtrip;

  console.log(subtrip);

  const expenseTypesToInclude = ['driver-salary', 'trip-advance', 'trip-extra-advance'];

  const filteredExpenses = expenses.filter((expense) =>
    expenseTypesToInclude.includes(expense.expenseType)
  );

  const totalExpense = useMemo(
    () => filteredExpenses.reduce((total, expense) => total + expense.amount, 0),
    [filteredExpenses]
  );

  const styles = useStyles();

  const renderDocumentTitle = () => (
    <View style={[styles.gridContainer]}>
      <Text style={[styles.h3, styles.mb4]}>Driver Payment For Job {subtripNo}</Text>
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
          The total driver payment amount for this job {subtripNo} is as follows:
        </Text>
      </View>
    </View>
  );

  const renderEmptyLine = () => (
    <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
      <View style={[styles.col12]}>
        <Text style={{ textAlign: 'center', padding: 4 }}> </Text>
      </View>
    </View>
  );

  const renderDriverRow = () => (
    <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
      <View style={[styles.col8, styles.borderRight, { minHeight: 80 }]}>
        {/* Driver */}
        <Text style={[styles.subtitle2, styles.p8]}>Driver Details:</Text>
        <View
          style={[
            styles.col12,
            { display: 'flex', alignItems: 'flex-start', justifyContent: 'center' },
            styles.p8,
          ]}
        >
          <Text style={[styles.subtitle2]}>{driverId?.driverName}</Text>
          <Text style={styles.body2}>+91-{driverId?.driverCellNo}</Text>
          <Text style={styles.body2}>{driverId?.permanentAddress} </Text>
          <Text style={styles.body2}>
            {`ACC No - ${driverId?.bankDetails?.accNo},${driverId?.bankDetails?.branch}, ${driverId?.bankDetails?.name}`}
          </Text>
        </View>
      </View>

      {/* LR/Date */}
      <View style={[styles.col4, styles.gridContainer, { minHeight: 80 }]}>
        <View style={[styles.col6, styles.borderRight]}>
          <View style={[styles.horizontalCell, styles.borderBottom]}>
            <Text style={[styles.horizontalCellTitle]}>LR No: </Text>
          </View>
          <View style={[styles.horizontalCell, styles.borderBottom]}>
            <Text style={[styles.horizontalCellTitle]}>Customer</Text>
          </View>
          <View style={[styles.horizontalCell, styles.borderBottom]}>
            <Text style={[styles.horizontalCellTitle]}>Disp. Date </Text>
          </View>

          <View style={[styles.horizontalCell, styles.borderBottom]}>
            <Text style={[styles.horizontalCellTitle]}>From: </Text>
          </View>
          <View style={[styles.horizontalCell]}>
            <Text style={[styles.horizontalCellTitle]}>To: </Text>
          </View>
        </View>
        <View style={[styles.col6]}>
          <View style={[styles.horizontalCell, styles.borderBottom]}>
            <Text style={[styles.horizontalCellContent]}>{subtripNo} </Text>
          </View>
          <View style={[styles.horizontalCell, styles.borderBottom]}>
            <Text style={[styles.horizontalCellContent]}>{customerId?.customerName} </Text>
          </View>
          <View style={[styles.horizontalCell, styles.borderBottom]}>
            <Text style={[styles.horizontalCellContent]}>{fDate(startDate)} </Text>
          </View>
          <View style={[styles.horizontalCell, styles.borderBottom]}>
            <Text style={[styles.horizontalCellContent]}>{loadingPoint}</Text>
          </View>
          <View style={[styles.horizontalCell]}>
            <Text style={[styles.horizontalCellContent]}>{unloadingPoint}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTableDetails = () => (
    <>
      {/* Salary Details Header */}
      <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
        <View style={[styles.col1, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>#</Text>
        </View>
        <View style={[styles.col5, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>Payment Type</Text>
        </View>
        <View style={[styles.col3, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellTitle]}>Date</Text>
        </View>
        <View style={[styles.col3, styles.horizontalCell]}>
          <Text style={[styles.horizontalCellTitle]}>Amount</Text>
        </View>
      </View>
      {/* Values */}

      {filteredExpenses.map((expense, idx) => (
        <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
          <View style={[styles.col1, styles.horizontalCell, styles.borderRight]}>
            <Text style={[styles.horizontalCellContent]}>{idx}</Text>
          </View>
          <View style={[styles.col5, styles.horizontalCell, styles.borderRight]}>
            <Text style={[styles.horizontalCellContent]}>{expense?.expenseType}</Text>
          </View>
          <View style={[styles.col3, styles.horizontalCell, styles.borderRight]}>
            <Text style={[styles.horizontalCellContent]}>{fDate(expense?.date)}</Text>
          </View>
          <View style={[styles.col3, styles.horizontalCell, styles.borderRight]}>
            <Text style={[styles.horizontalCellContent]}>{fCurrency(expense?.amount)}</Text>
          </View>
        </View>
      ))}

      <View style={[styles.gridContainer, styles.border, styles.noBorderTop]}>
        <View style={[styles.col9, styles.horizontalCell, styles.borderRight]}>
          <Text style={[styles.horizontalCellContent]}>{}</Text>
        </View>

        <View style={[styles.col3, styles.horizontalCell]}>
          <Text style={[styles.horizontalCellTitle]}>{fCurrency(totalExpense)}</Text>
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
        {renderDriverRow()}
        {renderDeclaration()}
        {renderEmptyLine()}
        {renderTableDetails()}
      </Page>
    </Document>
  );
}
