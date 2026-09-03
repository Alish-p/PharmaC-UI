/* eslint-disable react/prop-types */
import StandardTransporterPaymentPdf from './templates/standard-transporter-payment-pdf';
import Template1TransporterPaymentPdf from './templates/template-1-transporter-payment-pdf';

export default function TransporterPaymentPdf({ transporterPayment, tenant, ...props }) {
  const template = tenant?.config?.transporterPayment?.template || 'standard';

  if (template === 'template-1') {
    return (
      <Template1TransporterPaymentPdf
        transporterPayment={transporterPayment}
        tenant={tenant}
        {...props}
      />
    );
  }

  return (
    <StandardTransporterPaymentPdf
      transporterPayment={transporterPayment}
      tenant={tenant}
      {...props}
    />
  );
}
