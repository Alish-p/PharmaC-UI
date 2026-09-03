import ExcelJS from 'exceljs';

import axios from 'src/utils/axios';

export async function generateVehicleKmTemplate() {
  const { data } = await axios.get('/api/vehicles/km-template');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Vehicle KM Template');

  worksheet.columns = [
    { header: 'Vehicle No', key: 'vehicleNo', width: 25 },
    { header: 'Current Odometer', key: 'currentOdometer', width: 20 },
    { header: 'GPS Odometer (FleetX)', key: 'gpsOdometer', width: 25 },
  ];

  if (data && data.length) {
    data.forEach((vehicle) => {
      worksheet.addRow({
        vehicleNo: vehicle.vehicleNo,
        currentOdometer: vehicle.currentOdometer || 0,
        gpsOdometer: vehicle.gpsOdometer || 'N/A',
      });
    });
  } else {
    worksheet.addRow({
      vehicleNo: 'SAMPLE001',
      currentOdometer: 10000,
      gpsOdometer: 12000,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
