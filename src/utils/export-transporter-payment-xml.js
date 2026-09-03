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

// Derive a second stable GUID for the Payment voucher (sibling of the Journal GUID)
function getPaymentGuidFromId(id) {
  const base = getGuidFromId(id);
  // Increment the last segment by 1 to get a distinct but related GUID
  const parts = base.split('-');
  const lastHex = parseInt(parts[4], 16);
  parts[4] = String(lastHex + 7).padStart(12, '0').slice(-12);
  return parts.join('-');
}

function buildLedgerEntries(entries) {
  return entries
    .map(
      ({ ledgerName, amount, isDeemedPositive, isPartyLedger, extraFields = '' }) => `
       <ALLLEDGERENTRIES.LIST>
        <OLDAUDITENTRYIDS.LIST TYPE="Number">
         <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
        </OLDAUDITENTRYIDS.LIST>
        <APPROPRIATEFOR>&#4; Not Applicable</APPROPRIATEFOR>
        <LEDGERNAME>${escapeXml(ledgerName)}</LEDGERNAME>
        <GSTCLASS>&#4; Not Applicable</GSTCLASS>
        <GSTOVRDNTYPEOFSUPPLY>Services</GSTOVRDNTYPEOFSUPPLY>
        <ISDEEMEDPOSITIVE>${isDeemedPositive ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
        <LEDGERFROMITEM>No</LEDGERFROMITEM>
        <REMOVEZEROENTRIES>No</REMOVEZEROENTRIES>
        <ISPARTYLEDGER>${isPartyLedger ? 'Yes' : 'No'}</ISPARTYLEDGER>
        <GSTOVERRIDDEN>No</GSTOVERRIDDEN>
        <ISGSTASSESSABLEVALUEOVERRIDDEN>No</ISGSTASSESSABLEVALUEOVERRIDDEN>
        <STRDISGSTAPPLICABLE>No</STRDISGSTAPPLICABLE>
        <STRDGSTISPARTYLEDGER>No</STRDGSTISPARTYLEDGER>
        <STRDGSTISDUTYLEDGER>No</STRDGSTISDUTYLEDGER>
        <CONTENTNEGISPOS>No</CONTENTNEGISPOS>
        <ISLASTDEEMEDPOSITIVE>${isDeemedPositive ? 'Yes' : 'No'}</ISLASTDEEMEDPOSITIVE>
        <ISCAPVATTAXALTERED>No</ISCAPVATTAXALTERED>
        <ISCAPVATNOTCLAIMED>No</ISCAPVATNOTCLAIMED>
        <AMOUNT>${toFixed2(amount)}</AMOUNT>${extraFields}
        <SERVICETAXDETAILS.LIST>       </SERVICETAXDETAILS.LIST>
        <BANKALLOCATIONS.LIST>       </BANKALLOCATIONS.LIST>
        <BILLALLOCATIONS.LIST>       </BILLALLOCATIONS.LIST>
        <INTERESTCOLLECTION.LIST>       </INTERESTCOLLECTION.LIST>
        <OLDAUDITENTRIES.LIST>       </OLDAUDITENTRIES.LIST>
        <ACCOUNTAUDITENTRIES.LIST>       </ACCOUNTAUDITENTRIES.LIST>
        <AUDITENTRIES.LIST>       </AUDITENTRIES.LIST>
        <INPUTCRALLOCS.LIST>       </INPUTCRALLOCS.LIST>
        <DUTYHEADDETAILS.LIST>       </DUTYHEADDETAILS.LIST>
        <EXCISEDUTYHEADDETAILS.LIST>       </EXCISEDUTYHEADDETAILS.LIST>
        <RATEDETAILS.LIST>       </RATEDETAILS.LIST>
        <SUMMARYALLOCS.LIST>       </SUMMARYALLOCS.LIST>
        <CENVATDUTYALLOCATIONS.LIST>       </CENVATDUTYALLOCATIONS.LIST>
        <STPYMTDETAILS.LIST>       </STPYMTDETAILS.LIST>
        <EXCISEPAYMENTALLOCATIONS.LIST>       </EXCISEPAYMENTALLOCATIONS.LIST>
        <TAXBILLALLOCATIONS.LIST>       </TAXBILLALLOCATIONS.LIST>
        <TAXOBJECTALLOCATIONS.LIST>       </TAXOBJECTALLOCATIONS.LIST>
        <TDSEXPENSEALLOCATIONS.LIST>       </TDSEXPENSEALLOCATIONS.LIST>
        <VATSTATUTORYDETAILS.LIST>       </VATSTATUTORYDETAILS.LIST>
        <COSTTRACKALLOCATIONS.LIST>       </COSTTRACKALLOCATIONS.LIST>
        <REFVOUCHERDETAILS.LIST>       </REFVOUCHERDETAILS.LIST>
        <INVOICEWISEDETAILS.LIST>       </INVOICEWISEDETAILS.LIST>
        <VATITCDETAILS.LIST>       </VATITCDETAILS.LIST>
        <ADVANCETAXDETAILS.LIST>       </ADVANCETAXDETAILS.LIST>
        <TAXTYPEALLOCATIONS.LIST>       </TAXTYPEALLOCATIONS.LIST>
       </ALLLEDGERENTRIES.LIST>`
    )
    .join('');
}

function buildVoucherTail() {
  return `
      <GST.LIST>      </GST.LIST>
      <STKJRNLADDLCOSTDETAILS.LIST>      </STKJRNLADDLCOSTDETAILS.LIST>
      <PAYROLLMODEOFPAYMENT.LIST>      </PAYROLLMODEOFPAYMENT.LIST>
      <ATTDRECORDS.LIST>      </ATTDRECORDS.LIST>
      <GSTEWAYCONSIGNORADDRESS.LIST>      </GSTEWAYCONSIGNORADDRESS.LIST>
      <GSTEWAYCONSIGNEEADDRESS.LIST>      </GSTEWAYCONSIGNEEADDRESS.LIST>
      <TEMPGSTRATEDETAILS.LIST>      </TEMPGSTRATEDETAILS.LIST>
      <TEMPGSTADVADJUSTED.LIST>      </TEMPGSTADVADJUSTED.LIST>
      <GSTBUYERADDRESS.LIST>      </GSTBUYERADDRESS.LIST>
      <GSTCONSIGNEEADDRESS.LIST>      </GSTCONSIGNEEADDRESS.LIST>`;
}

function buildVoucherHeader(fields) {
  const {
    guid,
    vchType,
    vchKey,
    yyyymmdd,
    narration,
    transporterName,
    companyGstin,
    companyStateName,
    voucherNo,
    reference,
    entryMode,
    extraHeaderFields = '',
  } = fields;

  return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <VOUCHER REMOTEID="${guid}" VCHKEY="${vchKey}" VCHTYPE="${vchType}" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <OLDAUDITENTRYIDS.LIST TYPE="Number">
       <OLDAUDITENTRYIDS>-1</OLDAUDITENTRYIDS>
      </OLDAUDITENTRYIDS.LIST>
      <DATE>${yyyymmdd}</DATE>
      <VCHSTATUSDATE>${yyyymmdd}</VCHSTATUSDATE>
      <GUID>${guid}</GUID>
      <GSTREGISTRATIONTYPE>Regular</GSTREGISTRATIONTYPE>
      <NARRATION>${narration}</NARRATION>
      <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
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
      <VCHSTATUSVOUCHERTYPE>${vchType}</VCHSTATUSVOUCHERTYPE>
      <VCHSTATUSTAXUNIT>${escapeXml(companyStateName)} Registration</VCHSTATUSTAXUNIT>
      <VCHGSTCLASS>&#4; Not Applicable</VCHGSTCLASS>
      <VCHENTRYMODE>${entryMode}</VCHENTRYMODE>
      <DIFFACTUALQTY>No</DIFFACTUALQTY>
      <ISMSTFROMSYNC>No</ISMSTFROMSYNC>
      <ISDELETED>No</ISDELETED>
      <ISSECURITYONWHENENTERED>No</ISSECURITYONWHENENTERED>
      <ASORIGINAL>No</ASORIGINAL>
      <AUDITED>No</AUDITED>
      <ISCOMMONPARTY>No</ISCOMMONPARTY>
      <FORJOBCOSTING>No</FORJOBCOSTING>
      <ISOPTIONAL>No</ISOPTIONAL>
      <EFFECTIVEDATE>${yyyymmdd}</EFFECTIVEDATE>
      <USEFOREXCISE>No</USEFOREXCISE>
      <ISFORJOBWORKIN>No</ISFORJOBWORKIN>
      <ALLOWCONSUMPTION>No</ALLOWCONSUMPTION>
      <USEFORINTEREST>No</USEFORINTEREST>
      <USEFORGAINLOSS>No</USEFORGAINLOSS>
      <USEFORGODOWNTRANSFER>No</USEFORGODOWNTRANSFER>
      <USEFORCOMPOUND>No</USEFORCOMPOUND>
      <USEFORSERVICETAX>No</USEFORSERVICETAX>
      <ISREVERSECHARGEAPPLICABLE>No</ISREVERSECHARGEAPPLICABLE>
      <ISSYSTEM>No</ISSYSTEM>
      <ISFETCHEDONLY>No</ISFETCHEDONLY>
      <ISGSTOVERRIDDEN>No</ISGSTOVERRIDDEN>
      <ISCANCELLED>No</ISCANCELLED>
      <ISONHOLD>No</ISONHOLD>
      <ISSUMMARY>No</ISSUMMARY>
      <ISECOMMERCESUPPLY>No</ISECOMMERCESUPPLY>
      <ISBOENOTAPPLICABLE>Yes</ISBOENOTAPPLICABLE>
      <ISGSTSECSEVENAPPLICABLE>No</ISGSTSECSEVENAPPLICABLE>
      <IGNOREEINVVALIDATION>No</IGNOREEINVVALIDATION>
      <CMPGSTISOTHTERRITORYASSESSEE>No</CMPGSTISOTHTERRITORYASSESSEE>
      <PARTYGSTISOTHTERRITORYASSESSEE>No</PARTYGSTISOTHTERRITORYASSESSEE>
      <IRNJSONEXPORTED>No</IRNJSONEXPORTED>
      <IRNCANCELLED>No</IRNCANCELLED>
      <IGNOREGSTCONFLICTINMIG>No</IGNOREGSTCONFLICTINMIG>
      <ISOPBALTRANSACTION>No</ISOPBALTRANSACTION>
      <IGNOREGSTFORMATVALIDATION>No</IGNOREGSTFORMATVALIDATION>
      <ISELIGIBLEFORITC>Yes</ISELIGIBLEFORITC>
      <IGNOREGSTOPTIONALUNCERTAIN>No</IGNOREGSTOPTIONALUNCERTAIN>
      <UPDATESUMMARYVALUES>No</UPDATESUMMARYVALUES>
      <ISEWAYBILLAPPLICABLE>No</ISEWAYBILLAPPLICABLE>
      <ISDELETEDRETAINED>No</ISDELETEDRETAINED>
      <ISNULL>No</ISNULL>
      <ISEXCISEVOUCHER>No</ISEXCISEVOUCHER>
      <EXCISETAXOVERRIDE>No</EXCISETAXOVERRIDE>
      <USEFORTAXUNITTRANSFER>No</USEFORTAXUNITTRANSFER>
      <ISEXER1NOPOVERWRITE>No</ISEXER1NOPOVERWRITE>
      <ISEXF2NOPOVERWRITE>No</ISEXF2NOPOVERWRITE>
      <ISEXER3NOPOVERWRITE>No</ISEXER3NOPOVERWRITE>
      <IGNOREPOSVALIDATION>No</IGNOREPOSVALIDATION>
      <EXCISEOPENING>No</EXCISEOPENING>
      <USEFORFINALPRODUCTION>No</USEFORFINALPRODUCTION>
      <ISTDSOVERRIDDEN>No</ISTDSOVERRIDDEN>
      <ISTCSOVERRIDDEN>No</ISTCSOVERRIDDEN>
      <ISTDSTCSCASHVCH>No</ISTDSTCSCASHVCH>
      <INCLUDEADVPYMTVCH>No</INCLUDEADVPYMTVCH>
      <ISSUBWORKSCONTRACT>No</ISSUBWORKSCONTRACT>
      <ISVATOVERRIDDEN>No</ISVATOVERRIDDEN>
      <IGNOREORIGVCHDATE>No</IGNOREORIGVCHDATE>
      <ISVATPAIDATCUSTOMS>No</ISVATPAIDATCUSTOMS>
      <ISDECLAREDTOCUSTOMS>No</ISDECLAREDTOCUSTOMS>
      <VATADVANCEPAYMENT>No</VATADVANCEPAYMENT>
      <VATADVPAY>No</VATADVPAY>
      <ISCSTDELCAREDGOODSSALES>No</ISCSTDELCAREDGOODSSALES>
      <ISVATRESTAXINV>No</ISVATRESTAXINV>
      <ISSERVICETAXOVERRIDDEN>No</ISSERVICETAXOVERRIDDEN>
      <ISISDVOUCHER>No</ISISDVOUCHER>
      <ISEXCISEOVERRIDDEN>No</ISEXCISEOVERRIDDEN>
      <ISEXCISESUPPLYVCH>No</ISEXCISESUPPLYVCH>
      <GSTNOTEXPORTED>No</GSTNOTEXPORTED>
      <IGNOREGSTINVALIDATION>No</IGNOREGSTINVALIDATION>
      <ISGSTREFUND>No</ISGSTREFUND>
      <OVRDNEWAYBILLAPPLICABILITY>No</OVRDNEWAYBILLAPPLICABILITY>
      <ISVATPRINCIPALACCOUNT>No</ISVATPRINCIPALACCOUNT>
      <VCHSTATUSISVCHNUMUSED>No</VCHSTATUSISVCHNUMUSED>
      <VCHGSTSTATUSISINCLUDED>No</VCHGSTSTATUSISINCLUDED>
      <VCHGSTSTATUSISUNCERTAIN>No</VCHGSTSTATUSISUNCERTAIN>
      <VCHGSTSTATUSISEXCLUDED>No</VCHGSTSTATUSISEXCLUDED>
      <VCHGSTSTATUSISAPPLICABLE>No</VCHGSTSTATUSISAPPLICABLE>
      <VCHGSTSTATUSISGSTR2BRECONCILED>No</VCHGSTSTATUSISGSTR2BRECONCILED>
      <VCHGSTSTATUSISGSTR2BONLYINPORTAL>No</VCHGSTSTATUSISGSTR2BONLYINPORTAL>
      <VCHGSTSTATUSISGSTR2BONLYINBOOKS>No</VCHGSTSTATUSISGSTR2BONLYINBOOKS>
      <VCHGSTSTATUSISGSTR2BMISMATCH>No</VCHGSTSTATUSISGSTR2BMISMATCH>
      <VCHGSTSTATUSISGSTR2BINDIFFPERIOD>No</VCHGSTSTATUSISGSTR2BINDIFFPERIOD>
      <VCHGSTSTATUSISRETEFFDATEOVERRDN>No</VCHGSTSTATUSISRETEFFDATEOVERRDN>
      <VCHGSTSTATUSISOVERRDN>No</VCHGSTSTATUSISOVERRDN>
      <VCHGSTSTATUSISSTATINDIFFDATE>No</VCHGSTSTATUSISSTATINDIFFDATE>
      <VCHGSTSTATUSISRETINDIFFDATE>No</VCHGSTSTATUSISRETINDIFFDATE>
      <VCHGSTSTATUSMAINSECTIONEXCLUDED>No</VCHGSTSTATUSMAINSECTIONEXCLUDED>
      <VCHGSTSTATUSISBRANCHTRANSFEROUT>No</VCHGSTSTATUSISBRANCHTRANSFEROUT>
      <VCHGSTSTATUSISSYSTEMSUMMARY>No</VCHGSTSTATUSISSYSTEMSUMMARY>
      <VCHSTATUSISUNREGISTEREDRCM>No</VCHSTATUSISUNREGISTEREDRCM>
      <VCHSTATUSISOPTIONAL>No</VCHSTATUSISOPTIONAL>
      <VCHSTATUSISCANCELLED>No</VCHSTATUSISCANCELLED>
      <VCHSTATUSISDELETED>No</VCHSTATUSISDELETED>
      <VCHSTATUSISOPENINGBALANCE>No</VCHSTATUSISOPENINGBALANCE>
      <VCHSTATUSISFETCHEDONLY>No</VCHSTATUSISFETCHEDONLY>
      <VCHGSTSTATUSISOPTIONALUNCERTAIN>No</VCHGSTSTATUSISOPTIONALUNCERTAIN>
      <VCHSTATUSISREACCEPTFORHSNDONE>No</VCHSTATUSISREACCEPTFORHSNDONE>
      <VCHSTATUSISREACCEPHSNSIXONEDONE>No</VCHSTATUSISREACCEPHSNSIXONEDONE>
      <PAYMENTLINKHASMULTIREF>No</PAYMENTLINKHASMULTIREF>
      <ISSHIPPINGWITHINSTATE>No</ISSHIPPINGWITHINSTATE>
      <ISOVERSEASTOURISTTRANS>No</ISOVERSEASTOURISTTRANS>
      <ISDESIGNATEDZONEPARTY>No</ISDESIGNATEDZONEPARTY>${extraHeaderFields}
      <HASCASHFLOW>No</HASCASHFLOW>
      <ISPOSTDATED>No</ISPOSTDATED>
      <USETRACKINGNUMBER>No</USETRACKINGNUMBER>
      <ISINVOICE>No</ISINVOICE>
      <MFGJOURNAL>No</MFGJOURNAL>
      <HASDISCOUNTS>No</HASDISCOUNTS>
      <ASPAYSLIP>No</ASPAYSLIP>
      <ISCOSTCENTRE>No</ISCOSTCENTRE>
      <ISSTXNONREALIZEDVCH>No</ISSTXNONREALIZEDVCH>
      <ISEXCISEMANUFACTURERON>No</ISEXCISEMANUFACTURERON>
      <ISBLANKCHEQUE>No</ISBLANKCHEQUE>
      <ISVOID>No</ISVOID>
      <ORDERLINESTATUS>No</ORDERLINESTATUS>
      <VATISAGNSTCANCSALES>No</VATISAGNSTCANCSALES>
      <VATISPURCEXEMPTED>No</VATISPURCEXEMPTED>
      <ISVATRESTAXINVOICE>No</ISVATRESTAXINVOICE>
      <VATISASSESABLECALCVCH>No</VATISASSESABLECALCVCH>
      <ISVATDUTYPAID>Yes</ISVATDUTYPAID>
      <ISDELIVERYSAMEASCONSIGNEE>No</ISDELIVERYSAMEASCONSIGNEE>
      <ISDISPATCHSAMEASCONSIGNOR>No</ISDISPATCHSAMEASCONSIGNOR>
      <ISDELETEDVCHRETAINED>No</ISDELETEDVCHRETAINED>
      <VCHONLYADDLINFOUPDATED>No</VCHONLYADDLINFOUPDATED>
      <CHANGEVCHMODE>No</CHANGEVCHMODE>
      <RESETIRNQRCODE>No</RESETIRNQRCODE>
      <EWAYBILLDETAILS.LIST>      </EWAYBILLDETAILS.LIST>
      <EXCLUDEDTAXATIONS.LIST>      </EXCLUDEDTAXATIONS.LIST>
      <OLDAUDITENTRIES.LIST>      </OLDAUDITENTRIES.LIST>
      <ACCOUNTAUDITENTRIES.LIST>      </ACCOUNTAUDITENTRIES.LIST>
      <AUDITENTRIES.LIST>      </AUDITENTRIES.LIST>
      <DUTYHEADDETAILS.LIST>      </DUTYHEADDETAILS.LIST>
      <GSTADVADJDETAILS.LIST>      </GSTADVADJDETAILS.LIST>
      <CONTRITRANS.LIST>      </CONTRITRANS.LIST>
      <EWAYBILLERRORLIST.LIST>      </EWAYBILLERRORLIST.LIST>
      <IRNERRORLIST.LIST>      </IRNERRORLIST.LIST>
      <HARYANAVAT.LIST>      </HARYANAVAT.LIST>
      <SUPPLEMENTARYDUTYHEADDETAILS.LIST>      </SUPPLEMENTARYDUTYHEADDETAILS.LIST>
      <INVOICEDELNOTES.LIST>      </INVOICEDELNOTES.LIST>
      <INVOICEORDERLIST.LIST>      </INVOICEORDERLIST.LIST>
      <INVOICEINDENTLIST.LIST>      </INVOICEINDENTLIST.LIST>
      <ATTENDANCEENTRIES.LIST>      </ATTENDANCEENTRIES.LIST>
      <ORIGINVOICEDETAILS.LIST>      </ORIGINVOICEDETAILS.LIST>
      <INVOICEEXPORTLIST.LIST>      </INVOICEEXPORTLIST.LIST>`;
}

/**
 * Builds a Journal voucher TALLYMESSAGE for transporter payment.
 * Records the freight expense (bill recognition).
 * - Transporter ledger: credit (positive amount, ISDEEMEDPOSITIVE=No)
 * - Expense ledger: debit (negative amount, ISDEEMEDPOSITIVE=Yes)
 */
function buildJournalVoucher({ payment, companyGstin, companyStateName }) {
  const { _id, paymentId, issueDate, transporterId, summary } = payment;
  const transporterName = escapeXml(transporterId?.transportName || '');
  const yyyymmdd = escapeXml(formatDateYYYYMMDD(issueDate || new Date()));
  const reference = escapeXml(paymentId || '');
  const voucherNo = escapeXml(String(_id).slice(-6).toUpperCase());
  const journalGuid = getGuidFromId(_id);

  const freightAmount = Number(summary?.totalFreightAmount || 0);

  const billingPeriod = payment.billingPeriod
    ? ` | ${formatDateYYYYMMDD(payment.billingPeriod.start)} – ${formatDateYYYYMMDD(payment.billingPeriod.end)}`
    : '';
  const narration = escapeXml(
    `Transporter Bill | ${transporterId?.transportName || ''} | ${paymentId || ''}${billingPeriod}`
  );

  const headerXml = buildVoucherHeader({
    guid: journalGuid,
    vchType: 'Journal',
    vchKey: `${journalGuid}:000000b8`,
    yyyymmdd,
    narration,
    transporterName,
    companyGstin,
    companyStateName,
    voucherNo,
    reference,
    entryMode: 'As Voucher',
  });

  // Expense ledger extra: RATEDETAILS for GST heads (matches Tally export pattern)
  const expenseLedgerExtra = `
        <RATEDETAILS.LIST>
         <GSTRATEDUTYHEAD>CGST</GSTRATEDUTYHEAD>
        </RATEDETAILS.LIST>
        <RATEDETAILS.LIST>
         <GSTRATEDUTYHEAD>SGST/UTGST</GSTRATEDUTYHEAD>
        </RATEDETAILS.LIST>
        <RATEDETAILS.LIST>
         <GSTRATEDUTYHEAD>IGST</GSTRATEDUTYHEAD>
        </RATEDETAILS.LIST>
        <RATEDETAILS.LIST>
         <GSTRATEDUTYHEAD>Cess</GSTRATEDUTYHEAD>
        </RATEDETAILS.LIST>
        <RATEDETAILS.LIST>
         <GSTRATEDUTYHEAD>State Cess</GSTRATEDUTYHEAD>
        </RATEDETAILS.LIST>`;

  const ledgersXml = buildLedgerEntries([
    {
      // Transporter ledger: credit (clearing payable — positive, ISDEEMEDPOSITIVE=No)
      ledgerName: transporterId?.transportName || '',
      amount: freightAmount,
      isDeemedPositive: false,
      isPartyLedger: true,
    },
    {
      // Expense ledger: debit (recognising cost — negative, ISDEEMEDPOSITIVE=Yes)
      ledgerName: 'TRANSPORTATION CHARGES PAID RCM (WITHEN)',
      amount: -freightAmount,
      isDeemedPositive: true,
      isPartyLedger: false,
      extraFields: expenseLedgerExtra,
    },
  ]);

  return `${headerXml}${ledgersXml}${buildVoucherTail()}
     </VOUCHER>
    </TALLYMESSAGE>`;
}

/**
 * Builds a Payment voucher TALLYMESSAGE for transporter payment.
 * Records the actual bank disbursement.
 * - Transporter ledger: debit (reducing payable — negative, ISDEEMEDPOSITIVE=Yes)
 * - Bank ledger: credit (money leaving bank — positive, ISDEEMEDPOSITIVE=No)
 */
function buildPaymentVoucher({ payment, companyGstin, companyStateName }) {
  const { _id, paymentId, issueDate, transporterId, summary } = payment;
  const transporterName = escapeXml(transporterId?.transportName || '');
  const yyyymmdd = escapeXml(formatDateYYYYMMDD(issueDate || new Date()));
  const reference = escapeXml(paymentId || '');
  const voucherNo = escapeXml(String(_id).slice(-6).toUpperCase());
  const paymentGuid = getPaymentGuidFromId(_id);

  const netAmount = Number(summary?.netIncome || 0);

  const narration = escapeXml(
    `Payment to ${transporterId?.transportName || ''} | ${paymentId || ''}`
  );

  const headerXml = buildVoucherHeader({
    guid: paymentGuid,
    vchType: 'Payment',
    vchKey: `${paymentGuid}:00000008`,
    yyyymmdd,
    narration,
    transporterName,
    companyGstin,
    companyStateName,
    voucherNo,
    reference,
    entryMode: 'Single Entry',
    // Payment vouchers need cash-flow tracking
    extraHeaderFields: `
      <HASCASHFLOW>Yes</HASCASHFLOW>`,
  });

  const ledgersXml = buildLedgerEntries([
    {
      // Transporter ledger: debit (reducing payable — negative, ISDEEMEDPOSITIVE=Yes)
      ledgerName: transporterId?.transportName || '',
      amount: -netAmount,
      isDeemedPositive: true,
      isPartyLedger: true,
    },
    {
      // Bank ledger: credit (money out of bank — positive, ISDEEMEDPOSITIVE=No)
      ledgerName: 'HDFC BANK LTD A/C NO.50200064812820',
      amount: netAmount,
      isDeemedPositive: false,
      isPartyLedger: true,
    },
  ]);

  return `${headerXml}${ledgersXml}${buildVoucherTail()}
     </VOUCHER>
    </TALLYMESSAGE>`;
}

/**
 * Builds the company REMOTECMPINFO TALLYMESSAGE.
 */
function buildCompanyMessage(companyName, companyStateName) {
  return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <COMPANY>
      <REMOTECMPINFO.LIST MERGE="Yes">
       <REMOTECMPNAME>${escapeXml(companyName)}</REMOTECMPNAME>
       <REMOTECMPSTATE>${escapeXml(companyStateName)}</REMOTECMPSTATE>
      </REMOTECMPINFO.LIST>
     </COMPANY>
    </TALLYMESSAGE>`;
}

/**
 * Builds a combined Tally XML envelope for one or more transporter payments.
 * Each payment produces two vouchers: a Journal (freight expense) and a Payment (bank disbursement).
 *
 * @param {Array} paymentsInput - Array of transporter payment objects
 * @param {Object} tenant - Tenant/company settings
 * @returns {string} Full XML string ready for Tally import
 */
export function buildTransporterPaymentsXml(paymentsInput, tenant) {
  const payments = (paymentsInput || []).filter(Boolean);

  const companyName = tenant?.name || tenant?.company?.name || 'Shree Enterprises ( Test)';
  const companyGstin = tenant?.company?.gstin || tenant?.gstin || '29AVEPS8011L2Z3';
  const companyStateName = tenant?.company?.state || tenant?.state || 'Karnataka';

  const voucherMessages = payments
    .map((payment) => {
      const journalXml = buildJournalVoucher({ payment, companyGstin, companyStateName });
      const paymentXml = buildPaymentVoucher({ payment, companyGstin, companyStateName });
      return `${journalXml}\n${paymentXml}`;
    })
    .join('\n');

  const companyMessage = buildCompanyMessage(companyName, companyStateName);

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
${voucherMessages}
${companyMessage}
   </REQUESTDATA>
  </IMPORTDATA>
 </BODY>
</ENVELOPE>`;
}

/**
 * Triggers a browser download of the Tally XML for selected transporter payments.
 *
 * @param {Array} paymentsInput - Array of transporter payment objects
 * @param {string} fileNameInput - Output filename (default: 'transporter-payments-tally.xml')
 * @param {Object} tenant - Tenant/company settings
 */
export function downloadTransporterPaymentsXml(paymentsInput, fileNameInput, tenant) {
  const payments = paymentsInput || [];
  const fileName = fileNameInput || 'transporter-payments-tally.xml';
  const xml = buildTransporterPaymentsXml(payments, tenant);
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
  buildTransporterPaymentsXml,
  downloadTransporterPaymentsXml,
};
