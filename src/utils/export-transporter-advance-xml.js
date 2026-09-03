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

export function buildTransporterAdvancesXml(advancesInput, tenant) {
  const advances = advancesInput || [];

  const companyName = tenant?.name || tenant?.company?.name || 'Shree Enterprises ( Test)';
  const companyGstin = tenant?.company?.gstin || tenant?.gstin || '29AVEPS8011L2Z3';
  const companyStateName = tenant?.company?.state || tenant?.state || 'Karnataka';

  const vouchers = advances
    .filter(Boolean)
    .map((advance) => {
      const type = (advance.advanceType || '').toLowerCase();
      const date = advance.date || new Date();
      const yyyymmdd = escapeXml(formatDateYYYYMMDD(date));
      
      const guid = getGuidFromId(advance._id);
      const voucherNo = escapeXml(String(advance._id).slice(-6).toUpperCase());
      const amount = Number(advance.amount || 0);
      
      const subtripNo = advance.subtripId?.subtripNo || '';
      const reference = escapeXml(subtripNo);
      
      const transporterName = escapeXml(advance.vehicleId?.transporter?.transportName || '');
      const vehicleNo = escapeXml(advance.vehicleId?.vehicleNo || advance.vehicleNo || '');
      const remarks = advance.remarks ? ` ${advance.remarks}` : '';

      if (type === 'diesel') {
        let narrationText = '';
        if (advance.dieselLtr && advance.dieselPrice) {
          narrationText = `Diesel: ${advance.dieselLtr} Ltrs @ ₹${advance.dieselPrice}/Ltr to Transporter: ${transporterName}`;
        } else {
          narrationText = `Diesel Supply to Transporter: ${transporterName}`;
        }
        if (vehicleNo) narrationText += ` for ${vehicleNo}`;
        if (subtripNo) narrationText += ` (Job: ${subtripNo})`;
        narrationText += remarks;

        const narration = escapeXml(narrationText);
        const pumpName = escapeXml(advance.pumpCd?.name || 'VIJAYALAXMI PETROLIUM JKD');

        return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <VOUCHER REMOTEID="${guid}" VCHKEY="${guid}:000000b8" VCHTYPE="Journal" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <OLDAUDITENTRYIDS.LIST TYPE="Number">
       <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
      </OLDAUDITENTRYIDS.LIST>
      <DATE>${yyyymmdd}</DATE>
      <VCHSTATUSDATE>${yyyymmdd}</VCHSTATUSDATE>
      <GUID>${guid}</GUID>
      <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
      <NARRATION>${narration}</NARRATION>
      <VOUCHERTYPENAME>Journal</VOUCHERTYPENAME>
      <PARTYNAME>${transporterName}</PARTYNAME>
      <GSTREGISTRATION TAXTYPE="GST" TAXREGISTRATION="${escapeXml(companyGstin)}">${escapeXml(companyStateName)} Registration</GSTREGISTRATION>
      <CMPGSTIN>${escapeXml(companyGstin)}</CMPGSTIN>
      <PARTYLEDGERNAME>${transporterName}</PARTYLEDGERNAME>
      <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
      <CMPGSTREGISTRATIONTYPE>Regular</CMPGSTREGISTRATIONTYPE>
      <REFERENCE>${reference}</REFERENCE>
      <PARTYMAILINGNAME>${transporterName}</PARTYMAILINGNAME>
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
       <LEDGERNAME>${transporterName}</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
       <GSTOVERRIDDEN>No</GSTOVERRIDDEN>
       <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
       <AMOUNT>-${toFixed2(amount)}</AMOUNT>
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
        let narrationText = `Trip Advance to Transporter: ${transporterName}`;
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
      <PARTYNAME>${transporterName}</PARTYNAME>
      <GSTREGISTRATION TAXTYPE="GST" TAXREGISTRATION="${escapeXml(companyGstin)}">${escapeXml(companyStateName)} Registration</GSTREGISTRATION>
      <CMPGSTIN>${escapeXml(companyGstin)}</CMPGSTIN>
      <PARTYLEDGERNAME>${transporterName}</PARTYLEDGERNAME>
      <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
      <CMPGSTREGISTRATIONTYPE>Regular</CMPGSTREGISTRATIONTYPE>
      <REFERENCE>${reference}</REFERENCE>
      <PARTYMAILINGNAME>${transporterName}</PARTYMAILINGNAME>
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
      <EFFECTIVEDATE>${yyyymmdd}</EFFECTIVEDATE>
      <ISBOENOTAPPLICABLE>Yes</ISBOENOTAPPLICABLE>
      <ISELIGIBLEFORITC>Yes</ISELIGIBLEFORITC>
      <ISVATDUTYPAID>Yes</ISVATDUTYPAID>
      <ALLLEDGERENTRIES.LIST>
       <OLDAUDITENTRYIDS.LIST TYPE="Number">
        <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
       </OLDAUDITENTRYIDS.LIST>
       <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
       <LEDGERNAME>${transporterName}</LEDGERNAME>
       <GSTCLASS>&#4; Not Applicable</GSTCLASS>
       <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
       <GSTOVERRIDDEN>No</GSTOVERRIDDEN>
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
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <AMOUNT>${toFixed2(amount)}</AMOUNT>
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

export function downloadTransporterAdvancesXml(advancesInput, fileNameInput, tenant) {
  const advances = advancesInput || [];
  const fileName = fileNameInput || 'transporter-advances.xml';
  const xml = buildTransporterAdvancesXml(advances, tenant);
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
  buildTransporterAdvancesXml,
  downloadTransporterAdvancesXml,
};
