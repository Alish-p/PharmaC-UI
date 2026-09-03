import { Page, Font, View, Text, Document } from '@react-pdf/renderer';

import { wrapText } from 'src/utils/change-case';
import { fNumber } from 'src/utils/format-number';
import { fDate, fDateTime, fDateTimeDuration, fDateRangeShortLabel } from 'src/utils/format-time';

import { PDFTitle, PDFTable, PDFHeader, PDFStyles, NewPDFTable } from 'src/pdfs/common';

import { getTripTotalKm } from 'src/sections/trip/utils/trip-utils';

import { SUBTRIP_EXPENSE_TYPES } from '../../expense/expense-config';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

export default function TripSheetPdf({ trip, tenant }) {
  const {
    tripNo,
    fromDate,
    toDate,
    vehicleId,
    startKm: tripStartKm,
    endKm: tripEndKm,
    subtrips = [],
  } = trip || {};

  const uniqueDriversMap = new Map();
  subtrips.forEach((st) => {
    if (st?.driverId?._id) {
      uniqueDriversMap.set(st.driverId._id, st.driverId);
    }
  });
  const uniqueDrivers = Array.from(uniqueDriversMap.values());

  // Prepare subtrip table data
  const subtripColumns = [
    { header: 'S.No', accessor: 'sno', width: '4%' },
    { header: 'LR No', accessor: 'id', width: '6%' },
    { header: 'Customer', accessor: 'customer', width: '18%' },
    { header: 'Route', accessor: 'route', width: '18%' },
    { header: 'Start Date', accessor: 'startDate', width: '8%' },
    { header: 'Received Date', accessor: 'endDate', width: '8%' },
    {
      header: 'Time Taken',
      accessor: 'timeTaken',
      width: '8%',
      align: 'right',
    },
    { header: 'Material', accessor: 'material', width: '6%' },
    {
      header: 'Weight (T)',
      accessor: 'weight',
      width: '6%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
    {
      header: 'Freight Rate',
      accessor: 'rate',
      width: '6%',
      align: 'right',
      formatter: (v) => fNumber(v),
    },
    {
      header: 'Income',
      accessor: 'income',
      width: '7%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
    {
      header: 'Expense',
      accessor: 'expense',
      width: '7%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
    {
      header: 'Net Amount',
      accessor: 'net',
      width: '7%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
  ];

  const subtripData = subtrips.map((st, idx) => {
    const rate = st.freightDetails?.rate || 0;
    const income = st.freightDetails?.freightAmount || 0;
    const expenseTotal = Array.isArray(st.expenses)
      ? st.expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      : 0;
    const net = income - expenseTotal;

    return {
      sno: idx + 1,
      id: st.subtripNo || '-',
      customer: st.customerId?.customerName || '-',
      route:
        st.loadingPoint && st.unloadingPoint ? `${st.loadingPoint} → ${st.unloadingPoint}` : '-',
      startDate: fDate(st.startDate),
      endDate: fDate(st.endDate),
      timeTaken: fDateTimeDuration(st.startDate, st.endDate) || '-',
      material: st.materialType || '-',
      weight: st.loadingWeight || 0,
      rate,
      income,
      expense: expenseTotal,
      net,
    };
  });

  // Prepare flat expense table with global indexing
  let expenseIndex = 0;
  const expenseColumns = [
    { header: 'S.No', accessor: 'sno', width: '4%' },
    { header: 'LR No', accessor: 'lrNo', width: '6%' },
    { header: 'Type', accessor: 'type', width: '14%' },
    { header: 'Date', accessor: 'date', width: '10%' },
    {
      header: 'Amount',
      accessor: 'amount',
      width: '8%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
    {
      header: 'LTR',
      accessor: 'ltr',
      width: '8%',
      align: 'right',
      showTotal: true,
      formatter: (v) => fNumber(v),
    },
    { header: 'Remarks', accessor: 'remarks', width: '50%' },
  ];

  const allExpenses = subtrips.flatMap((st) =>
    (st.expenses || []).map((e) => {
      expenseIndex += 1;
      return {
        sno: expenseIndex,
        lrNo: st.subtripNo || '-',
        type: e.expenseType,
        date: fDateTime(e.date),
        amount: e.amount || 0,
        ltr: e.expenseType === SUBTRIP_EXPENSE_TYPES.DIESEL ? e.dieselLtr || 0 : 0,
        remarks: wrapText(e.remarks, 60),
      };
    })
  );

  // Calculate total distance (moved to Trip) and diesel consumption
  const totalKm = getTripTotalKm(trip);
  const totalDiesel = subtrips.reduce(
    (sum, st) =>
      sum +
      (Array.isArray(st.expenses)
        ? st.expenses.reduce(
            (s, e) => (e.expenseType === SUBTRIP_EXPENSE_TYPES.DIESEL ? s + (e.dieselLtr || 0) : s),
            0
          )
        : 0),
    0
  );
  const mileage = totalDiesel > 0 ? totalKm / totalDiesel : 0;

  // Amount per Ton per Km
  // Formula: Total Freight Amount / (Total Weight × Total Distance)
  // Exclude subtrips that don't have positive weight, distance, or rate
  const validForRate = subtrips.filter((st) => {
    const weight = Number(st?.loadingWeight) || 0;
    const rate = Number(st?.freightDetails?.rate) || 0;
    return weight > 0 && rate > 0;
  });

  const totalFreightAmount = validForRate.reduce(
    (sum, st) => sum + (st?.freightDetails?.freightAmount || 0),
    0
  );
  const totalWeight = validForRate.reduce((sum, st) => sum + (Number(st?.loadingWeight) || 0), 0);
  // Use Trip-level distance for rate per T-Km calculation
  const totalDistance = totalKm;
  const ratePerTonKm =
    totalWeight > 0 && totalDistance > 0 ? totalFreightAmount / (totalWeight * totalDistance) : 0;

  return (
    <Document title={`${tripNo}`} subject="Trip Sheet">
      <Page size="A4" style={PDFStyles.page} orientation="landscape">
        <PDFTitle title="Trip Sheet" />
        <PDFHeader company={tenant} />

        {/* Details Section */}
        <View style={{ flexDirection: 'row', marginVertical: 1 }}>
          <View style={[PDFStyles.border, { flex: 1, padding: 8 }]}>
            <Text style={PDFStyles.subtitle1}>Trip Details</Text>
            <Text>Trip ID: {tripNo}</Text>
            <Text>
              Durations: {fDateRangeShortLabel(fromDate, toDate)} (
              {fDateTimeDuration(fromDate, toDate)}){' '}
            </Text>
            <Text>Start Km: {tripStartKm !== undefined ? fNumber(tripStartKm) : 'N/A'}</Text>
            <Text>End Km: {tripEndKm !== undefined ? fNumber(tripEndKm) : 'N/A'}</Text>
            <Text>Total Distance: {fNumber(totalKm)} Km</Text>
          </View>
          <View style={[PDFStyles.border, { flex: 1, padding: 8 }]}>
            <Text style={PDFStyles.subtitle1}>Vehicle Details</Text>
            <Text>Vehicle: {vehicleId?.vehicleNo}</Text>
            <Text>Ownership: {vehicleId?.isOwn ? 'Own' : 'Market'}</Text>
            <Text>Type: {vehicleId?.vehicleType}</Text>
            <Text>No. Of Tyres: {vehicleId?.noOfTyres}</Text>
          </View>
          <View style={[PDFStyles.border, { flex: 1, padding: 8 }]}>
            <Text style={PDFStyles.subtitle1}>Driver Details</Text>
            {uniqueDrivers.length > 0 ? (
              uniqueDrivers.map((drv) => (
                <View key={drv._id} style={{ marginBottom: 4 }}>
                  <Text>Name: {drv?.driverName}</Text>
                  <Text>Cell No: {drv?.driverCellNo}</Text>
                </View>
              ))
            ) : (
              <View>
                <Text>Name: N/A</Text>
                <Text>Cell No: N/A</Text>
              </View>
            )}
          </View>
        </View>

        {/* Subtrip Table */}
        <Text style={[PDFStyles.subtitle1, { marginTop: 8 }]}>Subtrip Details</Text>
        <NewPDFTable columns={subtripColumns} data={subtripData} showTotals totalRowLabel="TOTAL" />

        {/* Expense Table */}
        <Text style={[PDFStyles.subtitle1, { marginTop: 8 }]}>Expense Details</Text>
        <NewPDFTable columns={expenseColumns} data={allExpenses} showTotals totalRowLabel="TOTAL" />

        {/* Summary Section */}
        <Text style={[PDFStyles.subtitle1, { marginTop: 8 }]}>Summary</Text>
        <PDFTable
          headers={['Mileage', 'Rate per Tonne-Kilometer']}
          data={[[`${fNumber(mileage)} Km/L`, `${fNumber(ratePerTonKm)} per T-Km`]]}
          columnWidths={[12]}
        />
      </Page>
    </Document>
  );
}
