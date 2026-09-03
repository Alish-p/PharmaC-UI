function pad2(n) {
  return String(n).padStart(2, '0');
}

function escapeXml(unsafe) {
  const safe = unsafe == null ? '' : unsafe;
  return String(safe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDateYYYYMMDD(date) {
  try {
    const d = new Date(date);
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    return `${yyyy}${mm}${dd}`;
  } catch (e) {
    return '';
  }
}

function toFixed2(n) {
  const v = Number(n || 0);
  // Round to 2 decimals avoiding FP drift, then format
  const rounded = Math.round(v * 100) / 100;
  return rounded.toFixed(2);
}

// (Removed) Legacy generator for a custom <root><Sheet1> format.

// Build Tally ENVELOPE XML for a list of invoices
// Accepts optional tenant to derive ledger names from accounting integration config
export function buildInvoicesXml(invoicesInput, tenant) {
  const invoices = invoicesInput || [];

  // Resolve ledger names (fallback to legacy defaults if not configured)
  const accountingEnabled = !!(
    tenant?.integrations?.accounting && tenant?.integrations?.accounting?.enabled
  );
  const invoiceLedgersEnabled =
    !!tenant?.integrations?.accounting?.config?.invoiceLedgerNames?.enabled;

  const configuredLedgers =
    accountingEnabled && invoiceLedgersEnabled
      ? tenant?.integrations?.accounting?.config?.invoiceLedgerNames || {}
      : {};

  const LEDGER_NAMES = {
    income: configuredLedgers.income || 'Freight Income',
    cgst: configuredLedgers.cgst,
    sgst: configuredLedgers.sgst,
    igst: configuredLedgers.igst,
  };

  // Company info
  const companyName = tenant?.name || tenant?.company?.name || 'Shree Enterprises (Mudhol)';
  const companyGstin = tenant?.company?.gstin || tenant?.gstin || '29AVEPS8011L2Z3';
  const companyStateName = tenant?.company?.state || tenant?.state || 'Karnataka';
  const numberingStyle = 'Auto Retain';

  const vouchers = (invoices || [])
    .filter(Boolean)
    .map((invoice) => {
      const issueDate = invoice.issueDate || new Date();
      const invoiceNo = invoice.invoiceNo || '';
      const reference = invoice.reference || invoice.invoiceNo || '';
      const customer = invoice.customerId || {};
      const address = customer.address || customer.city || '';

      const taxBreakup = invoice.taxBreakup || {};
      const cgst = taxBreakup.cgst || { rate: 0, amount: 0 };
      const sgst = taxBreakup.sgst || { rate: 0, amount: 0 };
      const igst = taxBreakup.igst || { rate: 0, amount: 0 };

      const taxableAmount = Math.round(Number(invoice.totalAmountBeforeTax || 0) * 100) / 100;
      const cgstAmt = Math.round(Number(cgst.amount || 0) * 100) / 100;
      const sgstAmt = Math.round(Number(sgst.amount || 0) * 100) / 100;
      const igstAmt = Math.round(Number(igst.amount || 0) * 100) / 100;
      const isIGST = igstAmt > 0;
      const netTotal = Math.round((taxableAmount + cgstAmt + sgstAmt + igstAmt) * 100) / 100;

      const yyyymmdd = escapeXml(formatDateYYYYMMDD(issueDate));
      const customerName = escapeXml(customer.customerName || '');
      const customerGST = customer.GSTNo || '';
      const customerStateName = customer.state || companyStateName;
      const narration = escapeXml(invoice.narration || 'Sale of Cement');

      const cgstRate = Number(cgst.rate || 0);
      const sgstRate = Number(sgst.rate || 0);
      const igstRate = Number(igst.rate || 0);
      const cgstLedgerName = LEDGER_NAMES.cgst || `Output CGST @${cgstRate}%`;
      const sgstLedgerName = LEDGER_NAMES.sgst || `Output SGST @${sgstRate}%`;
      const igstLedgerName = LEDGER_NAMES.igst || `Output IGST @${igstRate}%`;

      const hsn = invoice.hsnCode || configuredLedgers.hsn || '996511';
      const hsnDesc = invoice.hsnDescription || 'Transport Service';

      const partyAllLedger = `
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <LEDGERNAME>${customerName}</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
       <GSTOVERRIDDEN>No</GSTOVERRIDDEN>
       <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
       <ISCAPVATTAXALTERED>No</ISCAPVATTAXALTERED>
       <ISCAPVATNOTCLAIMED>No</ISCAPVATNOTCLAIMED>
       <AMOUNT>-${toFixed2(netTotal)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>`;

      const incomeAllLedger = `
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
       <LEDGERNAME>${escapeXml(LEDGER_NAMES.income)}</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <GSTOVRDNISREVCHARGEAPPL>&#4; Not Applicable</GSTOVRDNISREVCHARGEAPPL>
       <GSTOVRDNTAXABILITY>Taxable</GSTOVRDNTAXABILITY>
       <GSTSOURCETYPE>Ledger</GSTSOURCETYPE>
       <GSTLEDGERSOURCE>${escapeXml(LEDGER_NAMES.income)}</GSTLEDGERSOURCE>
       <HSNSOURCETYPE>Company</HSNSOURCETYPE>
       <GSTOVRDNSTOREDNATURE/>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <GSTRATEINFERAPPLICABILITY>As per Masters/Company</GSTRATEINFERAPPLICABILITY>
       <GSTHSNNAME>${escapeXml(hsn)}</GSTHSNNAME>
       <GSTHSNDESCRIPTION>${escapeXml(hsnDesc)}</GSTHSNDESCRIPTION>
       <GSTHSNINFERAPPLICABILITY>As per Masters/Company</GSTHSNINFERAPPLICABILITY>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
       <AMOUNT>${toFixed2(taxableAmount)}</AMOUNT>
       <RATEDETAILS.LIST>
        <GSTRATEDUTYHEAD>CGST</GSTRATEDUTYHEAD>
        <GSTRATEVALUATIONTYPE>Based on Value</GSTRATEVALUATIONTYPE>
        <GSTRATE>${String(cgstRate)}</GSTRATE>
       </RATEDETAILS.LIST>
       <RATEDETAILS.LIST>
        <GSTRATEDUTYHEAD>SGST/UTGST</GSTRATEDUTYHEAD>
        <GSTRATEVALUATIONTYPE>Based on Value</GSTRATEVALUATIONTYPE>
        <GSTRATE>${String(sgstRate)}</GSTRATE>
       </RATEDETAILS.LIST>
       <RATEDETAILS.LIST>
        <GSTRATEDUTYHEAD>IGST</GSTRATEDUTYHEAD>
        <GSTRATEVALUATIONTYPE>Based on Value</GSTRATEVALUATIONTYPE>
        <GSTRATE>${String(igstRate)}</GSTRATE>
       </RATEDETAILS.LIST>
       <RATEDETAILS.LIST>
        <GSTRATEDUTYHEAD>Cess</GSTRATEDUTYHEAD>
        <GSTRATEVALUATIONTYPE>&#4; Not Applicable</GSTRATEVALUATIONTYPE>
       </RATEDETAILS.LIST>
       <RATEDETAILS.LIST>
        <GSTRATEDUTYHEAD>State Cess</GSTRATEDUTYHEAD>
        <GSTRATEVALUATIONTYPE>Based on Value</GSTRATEVALUATIONTYPE>
       </RATEDETAILS.LIST>
      </ALLLEDGERENTRIES.LIST>`;

      const cgstAllLedger = `
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <LEDGERNAME>${escapeXml(cgstLedgerName)}</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <ISPARTYLEDGER>No</ISPARTYLEDGER>
       <GSTOVERRIDDEN>No</GSTOVERRIDDEN>
       <AMOUNT>${toFixed2(cgstAmt)}</AMOUNT>
       <RATEDETAILS.LIST>       </RATEDETAILS.LIST>
      </ALLLEDGERENTRIES.LIST>`;

      const sgstAllLedger = `
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <LEDGERNAME>${escapeXml(sgstLedgerName)}</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <ISPARTYLEDGER>No</ISPARTYLEDGER>
       <AMOUNT>${toFixed2(sgstAmt)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>`;

      const igstAllLedger = `
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <LEDGERNAME>${escapeXml(igstLedgerName)}</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <ISPARTYLEDGER>No</ISPARTYLEDGER>
       <AMOUNT>${toFixed2(igstAmt)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>`;

      const taxLines = isIGST
        ? igstAllLedger
        : `${cgstAllLedger}
${sgstAllLedger}`;

      return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View" ISINVOICE="No">
		 <ADDRESS.LIST TYPE="String">
       <ADDRESS>${escapeXml(address)}</ADDRESS>
      </ADDRESS.LIST>
      <OLDAUDITENTRYIDS.LIST TYPE="Number">
       <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
      </OLDAUDITENTRYIDS.LIST>
      <DATE>${yyyymmdd}</DATE>
      <REFERENCEDATE>${yyyymmdd}</REFERENCEDATE>
      <VCHSTATUSDATE>${yyyymmdd}</VCHSTATUSDATE>
      
      <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
      <VATDEALERTYPE>Regular</VATDEALERTYPE>
      <STATENAME>${escapeXml(companyStateName)}</STATENAME>
      <NARRATION>${narration}</NARRATION>
      <COUNTRYOFRESIDENCE>India</COUNTRYOFRESIDENCE>
      <PARTYGSTIN>${escapeXml(customerGST)}</PARTYGSTIN>
      <PLACEOFSUPPLY>${escapeXml(customerStateName)}</PLACEOFSUPPLY>
      <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
      <PARTYNAME>${customerName}</PARTYNAME>
      <GSTREGISTRATION TAXTYPE="GST" TAXREGISTRATION="${escapeXml(companyGstin)}">${escapeXml(companyStateName)} Registration</GSTREGISTRATION>
      <CMPGSTIN>${escapeXml(companyGstin)}</CMPGSTIN>
      <PARTYLEDGERNAME>${customerName}</PARTYLEDGERNAME>
      <VOUCHERNUMBER>${escapeXml(invoiceNo)}</VOUCHERNUMBER>
      <CMPGSTREGISTRATIONTYPE>Regular</CMPGSTREGISTRATIONTYPE>
      <REFERENCE>${escapeXml(reference)}</REFERENCE>
      <PARTYMAILINGNAME>${customerName}</PARTYMAILINGNAME>
      <CMPGSTSTATE>${escapeXml(companyStateName)}</CMPGSTSTATE>
      <BASICBASEPARTYNAME>${customerName}</BASICBASEPARTYNAME>
      <NUMBERINGSTYLE>${numberingStyle}</NUMBERINGSTYLE>
      <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
      <VCHSTATUSTAXADJUSTMENT>Default</VCHSTATUSTAXADJUSTMENT>
      <VCHSTATUSVOUCHERTYPE>Sales</VCHSTATUSVOUCHERTYPE>
      <VCHSTATUSTAXUNIT>${escapeXml(companyStateName)} Registration</VCHSTATUSTAXUNIT>
      <VCHGSTCLASS>&#4; Not Applicable</VCHGSTCLASS>
      <VOUCHERTYPEORIGNAME>Sales</VOUCHERTYPEORIGNAME>
      
      <EFFECTIVEDATE>${yyyymmdd}</EFFECTIVEDATE>
      
      <ISSYSTEM>No</ISSYSTEM>
${partyAllLedger}
${incomeAllLedger}
${taxLines}
      <GST.LIST>
       <PURPOSETYPE>GST</PURPOSETYPE>
       <STAT.LIST>
        <PURPOSETYPE>GST</PURPOSETYPE>
       
       </STAT.LIST>
      </GST.LIST>
      
     </VOUCHER>
    </TALLYMESSAGE>`;
    })
    .join('\n');

  const companyMessage = `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <COMPANY>
      <REMOTECMPINFO.LIST MERGE="Yes">
       <REMOTECMPNAME>${escapeXml(companyName)}</REMOTECMPNAME>
       <REMOTECMPSTATE>${escapeXml(companyStateName)}</REMOTECMPSTATE>
      </REMOTECMPINFO.LIST>
     </COMPANY>
    </TALLYMESSAGE>`;

  return `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
 <HEADER>
  <TALLYREQUEST>Import Data</TALLYREQUEST>
 </HEADER>
 <BODY>
  <IMPORTDATA>
   <REQUESTDESC>
    <REPORTNAME>Vouchers</REPORTNAME>
    <STATICVARIABLES>
     <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
    </STATICVARIABLES>
   </REQUESTDESC>
   <REQUESTDATA>
${vouchers}
${companyMessage}
   </REQUESTDATA>
  </IMPORTDATA>
 </BODY>
</ENVELOPE>`;
}

export function buildInvoiceXml(invoice, tenant) {
  return buildInvoicesXml([invoice], tenant);
}

export function downloadInvoiceXml(invoice, tenant) {
  const xml = buildInvoiceXml(invoice, tenant);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoice?.invoiceNo || 'invoice'}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadInvoicesXml(invoicesInput, fileNameInput, tenant) {
  const invoices = invoicesInput || [];
  const fileName = fileNameInput || 'invoices.xml';
  const xml = buildInvoicesXml(invoices, tenant);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default {
  buildInvoiceXml,
  buildInvoicesXml,
  downloadInvoiceXml,
  downloadInvoicesXml,
};

// ----------------------------------
// Tally POST helpers
// ----------------------------------

/**
 * Post one or more invoices to a Tally HTTP server.
 * - In dev, configure Vite proxy to forward '/tally' to 'http://localhost:9000'.
 * - In production, you may point `tallyUrl` to a reachable Tally endpoint.
 * @param {Array|Object} invoicesInput One invoice or an array of invoices
 * @param {Object} tenant Current tenant (for ledger config)
 * @param {Object} opts { tallyUrl?: string }
 * @returns {Promise<{ ok: boolean, status: number, text: string }>} Response summary
 */
export async function postInvoicesToTally(invoicesInput, tenant, opts = {}) {
  const invoices = Array.isArray(invoicesInput) ? invoicesInput : [invoicesInput];
  const xml = buildInvoicesXml(invoices, tenant);

  // Resolve URL: explicit option > env var > dev proxy path
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_TALLY_URL : undefined;
  const tallyUrl = opts.tallyUrl || envUrl || '/tally';

  try {
    const res = await fetch(tallyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body: xml,
    });
    const text = await res.text().catch(() => '');
    return { ok: res.ok, status: res.status, text };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      text:
        (err && (err.message || String(err))) || 'Failed to reach Tally server. Check CORS/proxy.',
    };
  }
}

export const tally = {
  postInvoicesToTally,
};
