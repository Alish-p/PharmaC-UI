import { Page, View, Text, Document } from '@react-pdf/renderer';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { PDFTitle, PDFHeader, PDFBillTo, PDFStyles } from './common';

export default function PaymentReceiptPdf({ payment, tenant }) {
  const { amount, paymentDate, paymentMethod, status, notes } = payment || {};

  return (
    <Document>
      <Page size="A5" style={PDFStyles.page} orientation="portrait">
        <PDFTitle title="Payment Receipt" />
        <PDFHeader company={tenant} />
        <PDFBillTo
          title="Details"
          billToDetails={[tenant?.name, tenant?.address?.line1, tenant?.address?.city]}
          metaDetails={[
            ['Amount', fCurrency(amount)],
            ['Date', fDate(paymentDate)],
            ['Method', paymentMethod],
            ['Status', status],
          ]}
        />
        {notes && (
          <View style={[PDFStyles.border, PDFStyles.p8, PDFStyles.mb8]}>
            <Text style={[PDFStyles.subtitle2, PDFStyles.mb4]}>Notes</Text>
            <Text style={PDFStyles.body2}>{notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
