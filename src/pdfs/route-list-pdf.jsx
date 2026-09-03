import { Page, Font, Text, View, Document } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';

import {
  PDFTitle,
  PDFTable,
  PDFHeader,
  PDFFooter,
  PDFStyles,
  PDFDeclaration,
} from 'src/pdfs/common';

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

export default function RouteListPdf({ routes, tenant }) {
  const renderRouteTables = () =>
    routes.map((route, index) => {
      const headers = [
        'Vehicle Type',
        'Tyres',
        'Toll',
        'Advance',
        'Fixed Salary',
        'Percentage',
        'Diesel',
        'AdBlue',
        'Fix Mileage',
        'Perf Mileage',
      ];

      const data = route.vehicleConfiguration.map((config) => [
        config.vehicleType,
        config.noOfTyres,
        config.tollAmt ?? '-',
        config.advanceAmt ?? '-',
        config.fixedSalary ?? '-',
        config.percentageSalary ? `${config.percentageSalary}%` : '-',
        config.diesel ? `${config.diesel}L` : '-',
        config.adBlue ? `${config.adBlue}L` : '-',
        config.fixMilage ?? '-',
        config.performanceMilage ?? '-',
      ]);

      const columnWidths = [2, 1, 1, 1, 2, 1, 1, 1, 1, 1];

      return (
        <View
          key={route._id}
          wrap={false}
          style={[PDFStyles.border, { marginBottom: 24, padding: 12 }]}
        >
          <Text style={PDFStyles.subtitle}>
            {index + 1}. {route.routeName} — {route.fromPlace} ➝ {route.toPlace} | {route.distance}{' '}
            km | {route.noOfDays} Days
          </Text>
          {route.isCustomerSpecific && route.customer?.customerName && (
            <Text style={PDFStyles.caption}>Customer: {route.customer.customerName}</Text>
          )}
          <PDFTable headers={headers} data={data} columnWidths={columnWidths} />
        </View>
      );
    });

  return (
    <Document>
      <Page size="A4" style={PDFStyles.page} orientation="portrait">
        <PDFTitle title="Route List with Vehicle Configurations" />
        <PDFHeader company={tenant} />
        <PDFDeclaration
          content={`This report contains all routes with their associated vehicle configurations as of ${fDate(new Date())}.`}
        />

        {renderRouteTables()}
        <PDFFooter additionalInfo={`Total Routes: ${routes.length}`} />
      </Page>
    </Document>
  );
}
