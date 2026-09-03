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
  const rounded = Math.round(v * 100) / 100;
  return rounded.toFixed(2);
}

// Generate stable UUID-like GUID from Mongoose ID
function getGuidFromId(id) {
  if (!id) return '00000000-0000-0000-0000-000000000000';
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    return id;
  }
  const clean = String(id).replace(/[^0-9a-fA-F]/g, '').padEnd(32, '0');
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
}

export function buildExpensesXml(expensesInput, tenant) {
  const expenses = expensesInput || [];

  const companyName = tenant?.name || tenant?.company?.name || 'Shree Enterprises ( Test)';
  const companyGstin = tenant?.company?.gstin || tenant?.gstin || '29AVEPS8011L2Z3';
  const companyStateName = tenant?.company?.state || tenant?.state || 'Karnataka';

  const vouchers = expenses
    .filter(Boolean)
    .map((expense) => {
      const type = (expense.expenseType || '').toLowerCase();
      const date = expense.date || new Date();
      const yyyymmdd = escapeXml(formatDateYYYYMMDD(date));

      const guid = getGuidFromId(expense._id);
      const voucherNo = escapeXml(String(expense._id).slice(-6).toUpperCase());
      const amount = Number(expense.amount || 0);

      const subtripNo = expense.subtripId?.subtripNo || '';
      const reference = escapeXml(subtripNo);

      const vehicleNo = expense.vehicleId?.vehicleNo || expense.vehicleNo || '';
      const remarks = expense.remarks ? ` ${expense.remarks}` : '';

      if (type === 'diesel') {
        let narrationText = '';
        if (expense.dieselLtr && expense.dieselPrice) {
          narrationText = `Diesel: ${expense.dieselLtr} Ltrs @ ₹${expense.dieselPrice}/Ltr`;
        } else {
          narrationText = 'Diesel Consumption of Own Vehicle';
        }
        if (vehicleNo) narrationText += ` for ${vehicleNo}`;
        if (subtripNo) narrationText += ` (Job: ${subtripNo})`;
        narrationText += remarks;

        const narration = escapeXml(narrationText);
        const pumpName = escapeXml(expense.pumpCd?.name || 'Mane Pump');

        return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <VOUCHER REMOTEID="${guid}" VCHKEY="${guid}:00000008" VCHTYPE="Journal" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <OLDAUDITENTRYIDS.LIST TYPE="Number">
       <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
      </OLDAUDITENTRYIDS.LIST>
      <DATE>${yyyymmdd}</DATE>
      <VCHSTATUSDATE>${yyyymmdd}</VCHSTATUSDATE>
      <GUID>${guid}</GUID>
      <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
      <NARRATION>${narration}</NARRATION>
      <VOUCHERTYPENAME>Journal</VOUCHERTYPENAME>
      <PARTYNAME>${pumpName}</PARTYNAME>
      <GSTREGISTRATION TAXTYPE="GST" TAXREGISTRATION="${escapeXml(companyGstin)}">${escapeXml(companyStateName)} Registration</GSTREGISTRATION>
      <CMPGSTIN>${escapeXml(companyGstin)}</CMPGSTIN>
      <PARTYLEDGERNAME>${pumpName}</PARTYLEDGERNAME>
      <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
      <CMPGSTREGISTRATIONTYPE>Regular</CMPGSTREGISTRATIONTYPE>
      <REFERENCE>${reference}</REFERENCE>
      <PARTYMAILINGNAME>${pumpName}</PARTYMAILINGNAME>
      <CMPGSTSTATE>${escapeXml(companyStateName)}</CMPGSTSTATE>
      <NUMBERINGSTYLE>Auto Retain</NUMBERINGSTYLE>
      <CSTFORMISSUETYPE>&#4; Not Applicable</CSTFORMISSUETYPE>
      <CSTFORMRECVTYPE>&#4; Not Applicable</CSTFORMRECVTYPE>
      <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
      <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
      <VCHSTATUSTAXADJUSTMENT>Default</VCHSTATUSTAXADJUSTMENT>
      <VCHSTATUSVOUCHERTYPE>Journal</VCHSTATUSVOUCHERTYPE>
      <VCHSTATUSTAXUNIT>${escapeXml(companyStateName)} Registration</VCHSTATUSTAXUNIT>
      <VCHGSTCLASS>&#4; Not Applicable</VCHGSTCLASS>
      <VCHENTRYMODE>As Voucher</VCHENTRYMODE>
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
       <LEDGERNAME>OWN VEHICLE DIESEL EXPENCES</LEDGERNAME>
       <GSTOVRDNSTOREDNATURE/>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <GSTRATEINFERAPPLICABILITY>As per Masters/Company</GSTRATEINFERAPPLICABILITY>
       <GSTHSNINFERAPPLICABILITY>As per Masters/Company</GSTHSNINFERAPPLICABILITY>
       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <AMOUNT>-${toFixed2(amount)}</AMOUNT>
       <SERVICETAXDETAILS.LIST>       </SERVICETAXDETAILS.LIST>
       <CATEGORYALLOCATIONS.LIST>
        <CATEGORY>Primary Cost Category</CATEGORY>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <COSTCENTREALLOCATIONS.LIST>
         <NAME>${escapeXml(vehicleNo)}</NAME>
         <AMOUNT>-${toFixed2(amount)}</AMOUNT>
        </COSTCENTREALLOCATIONS.LIST>
       </CATEGORYALLOCATIONS.LIST>
       <TAXTYPEALLOCATIONS.LIST>       </TAXTYPEALLOCATIONS.LIST>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
       <LEDGERNAME>${pumpName}</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
       <AMOUNT>${toFixed2(amount)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
     </VOUCHER>
    </TALLYMESSAGE>`;
      }

      if (type === 'trip advance') {
        let narrationText = 'Payment Towards Loading & Unloading Charges';
        if (vehicleNo) narrationText += ` for ${vehicleNo}`;
        if (subtripNo) narrationText += ` (Job: ${subtripNo})`;
        narrationText += remarks;

        const narration = escapeXml(narrationText);

        return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <VOUCHER REMOTEID="${guid}" VCHKEY="${guid}:00000008" VCHTYPE="Payment" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <OLDAUDITENTRYIDS.LIST TYPE="Number">
       <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
      </OLDAUDITENTRYIDS.LIST>
      <DATE>${yyyymmdd}</DATE>
      <VCHSTATUSDATE>${yyyymmdd}</VCHSTATUSDATE>
      <GUID>${guid}</GUID>
      <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
      <NARRATION>${narration}</NARRATION>
      <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
      <GSTREGISTRATION TAXTYPE="GST" TAXREGISTRATION="${escapeXml(companyGstin)}">${escapeXml(companyStateName)} Registration</GSTREGISTRATION>
      <CMPGSTIN>${escapeXml(companyGstin)}</CMPGSTIN>
      <PARTYLEDGERNAME>HDFC BANK LTD A/C NO.50200064812820</PARTYLEDGERNAME>
      <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
      <CMPGSTREGISTRATIONTYPE>Regular</CMPGSTREGISTRATIONTYPE>
      <REFERENCE>${reference}</REFERENCE>
      <CMPGSTSTATE>${escapeXml(companyStateName)}</CMPGSTSTATE>
      <NUMBERINGSTYLE>Auto Retain</NUMBERINGSTYLE>
      <CSTFORMISSUETYPE>&#4; Not Applicable</CSTFORMISSUETYPE>
      <CSTFORMRECVTYPE>&#4; Not Applicable</CSTFORMRECVTYPE>
      <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
      <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
      <VCHSTATUSTAXADJUSTMENT>Default</VCHSTATUSTAXADJUSTMENT>
      <VCHSTATUSVOUCHERTYPE>Payment</VCHSTATUSVOUCHERTYPE>
      <VCHSTATUSTAXUNIT>${escapeXml(companyStateName)} Registration</VCHSTATUSTAXUNIT>
      <VCHGSTCLASS>&#4; Not Applicable</VCHGSTCLASS>
      <VCHENTRYMODE>Single Entry</VCHENTRYMODE>
      <VOUCHERTYPEORIGNAME>Payment</VOUCHERTYPEORIGNAME>
      <EFFECTIVEDATE>${yyyymmdd}</EFFECTIVEDATE>
      <ISBOENOTAPPLICABLE>Yes</ISBOENOTAPPLICABLE>
      <ISELIGIBLEFORITC>Yes</ISELIGIBLEFORITC>
      <VCHGSTSTATUSISUNCERTAIN>Yes</VCHGSTSTATUSISUNCERTAIN>
      <VCHGSTSTATUSISAPPLICABLE>Yes</VCHGSTSTATUSISAPPLICABLE>
      <VCHSTATUSISREACCEPHSNSIXONEDONE>Yes</VCHSTATUSISREACCEPHSNSIXONEDONE>
      <HASCASHFLOW>Yes</HASCASHFLOW>
      <ISVATDUTYPAID>Yes</ISVATDUTYPAID>
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
       <LEDGERNAME>Loading &amp; Unloading Expence</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <GSTOVRDNINELIGIBLEITC>&#4; Not Applicable</GSTOVRDNINELIGIBLEITC>
       <GSTOVRDNISREVCHARGEAPPL>&#4; Not Applicable</GSTOVRDNISREVCHARGEAPPL>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <GSTRATEINFERAPPLICABILITY>As per Masters/Company</GSTRATEINFERAPPLICABILITY>
       <GSTHSNINFERAPPLICABILITY>As per Masters/Company</GSTHSNINFERAPPLICABILITY>
       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
       <AMOUNT>-${toFixed2(amount)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
       <LEDGERNAME>HDFC BANK LTD A/C NO.50200064812820</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
       <AMOUNT>${toFixed2(amount)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
     </VOUCHER>
    </TALLYMESSAGE>`;
      }

      if (type === 'bhatta') {
        let narrationText = 'Bhatta / Halting Charges';
        if (vehicleNo) narrationText += ` for ${vehicleNo}`;
        if (subtripNo) narrationText += ` (Job: ${subtripNo})`;
        narrationText += remarks;

        const narration = escapeXml(narrationText);

        return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <VOUCHER REMOTEID="${guid}" VCHKEY="${guid}:00000030" VCHTYPE="Payment" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <OLDAUDITENTRYIDS.LIST TYPE="Number">
       <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
      </OLDAUDITENTRYIDS.LIST>
      <DATE>${yyyymmdd}</DATE>
      <VCHSTATUSDATE>${yyyymmdd}</VCHSTATUSDATE>
      <GUID>${guid}</GUID>
      <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
      <NARRATION>${narration}</NARRATION>
      <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
      <GSTREGISTRATION TAXTYPE="GST" TAXREGISTRATION="${escapeXml(companyGstin)}">${escapeXml(companyStateName)} Registration</GSTREGISTRATION>
      <CMPGSTIN>${escapeXml(companyGstin)}</CMPGSTIN>
      <PARTYLEDGERNAME>HDFC BANK LTD A/C NO.50200064812820</PARTYLEDGERNAME>
      <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
      <CMPGSTREGISTRATIONTYPE>Regular</CMPGSTREGISTRATIONTYPE>
      <REFERENCE>${reference}</REFERENCE>
      <CMPGSTSTATE>${escapeXml(companyStateName)}</CMPGSTSTATE>
      <NUMBERINGSTYLE>Auto Retain</NUMBERINGSTYLE>
      <CSTFORMISSUETYPE>&#4; Not Applicable</CSTFORMISSUETYPE>
      <CSTFORMRECVTYPE>&#4; Not Applicable</CSTFORMRECVTYPE>
      <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
      <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
      <VCHSTATUSTAXADJUSTMENT>Default</VCHSTATUSTAXADJUSTMENT>
      <VCHSTATUSVOUCHERTYPE>Payment</VCHSTATUSVOUCHERTYPE>
      <VCHSTATUSTAXUNIT>${escapeXml(companyStateName)} Registration</VCHSTATUSTAXUNIT>
      <VCHGSTCLASS>&#4; Not Applicable</VCHGSTCLASS>
      <VCHENTRYMODE>As Voucher</VCHENTRYMODE>
      <EFFECTIVEDATE>${yyyymmdd}</EFFECTIVEDATE>
      <ISBOENOTAPPLICABLE>Yes</ISBOENOTAPPLICABLE>
      <ISELIGIBLEFORITC>Yes</ISELIGIBLEFORITC>
      <VCHGSTSTATUSISUNCERTAIN>Yes</VCHGSTSTATUSISUNCERTAIN>
      <VCHGSTSTATUSISAPPLICABLE>Yes</VCHGSTSTATUSISAPPLICABLE>
      <VCHSTATUSISREACCEPHSNSIXONEDONE>Yes</VCHSTATUSISREACCEPHSNSIXONEDONE>
      <HASCASHFLOW>Yes</HASCASHFLOW>
      <ISVATDUTYPAID>Yes</ISVATDUTYPAID>
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
       <LEDGERNAME>HDFC BANK LTD A/C NO.50200064812820</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <LEDGERFROMITEM>No</LEDGERFROMITEM>
       <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
       <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
       <AMOUNT>${toFixed2(amount)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
       <LEDGERNAME>Halting Cherges of Vehicle( Bhatta)</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <GSTOVRDNINELIGIBLEITC>&#4; Not Applicable</GSTOVRDNINELIGIBLEITC>
       <GSTOVRDNISREVCHARGEAPPL>&#4; Not Applicable</GSTOVRDNISREVCHARGEAPPL>
       <GSTOVRDNSTOREDNATURE/>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <GSTRATEINFERAPPLICABILITY>As per Masters/Company</GSTRATEINFERAPPLICABILITY>
       <GSTHSNINFERAPPLICABILITY>As per Masters/Company</GSTHSNINFERAPPLICABILITY>
       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
       <AMOUNT>-${toFixed2(amount)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
     </VOUCHER>
    </TALLYMESSAGE>`;
      }

      return '';
    })
    .filter(Boolean)
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

export function downloadExpensesXml(expensesInput, fileNameInput, tenant) {
  const expenses = expensesInput || [];
  const fileName = fileNameInput || 'expenses.xml';
  const xml = buildExpensesXml(expenses, tenant);
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
  buildExpensesXml,
  downloadExpensesXml,
};
