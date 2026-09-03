import ExcelJS from 'exceljs';

export async function generateTyreTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tyre Import Template');

  // Define columns
  worksheet.columns = [
    { header: 'Brand', key: 'brand', width: 20 },
    { header: 'Model', key: 'model', width: 20 },
    { header: 'Serial Number', key: 'serialNumber', width: 20 },
    { header: 'Size', key: 'size', width: 15 },
    { header: 'Type (New/Remolded/Used)', key: 'type', width: 25 },
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Purchase Order No.', key: 'purchaseOrderNumber', width: 20 },
    { header: 'Current KM', key: 'currentKm', width: 15 },
    { header: 'Cost', key: 'cost', width: 15 },
    { header: 'Original Thread Depth', key: 'originalThreadDepth', width: 20 },
    { header: 'Current Thread Depth', key: 'currentThreadDepth', width: 20 },
  ];

  // Add dummy data rows
  const dummyData = [
    {
      brand: 'Michelin',
      model: 'X Multi Z',
      serialNumber: 'MICH-001',
      size: '295/80R22.5',
      type: 'New',
      category: 'Front - New Line',
      purchaseOrderNumber: 'PO-2024-001',
      currentKm: 0,
      cost: 25000,
      originalThreadDepth: 14,
      currentThreadDepth: 14,
    },
    {
      brand: 'Bridgestone',
      model: 'R156',
      serialNumber: 'BRIDGE-005',
      size: '10.00R20',
      type: 'Used',
      category: 'Rear - RM Cross',
      purchaseOrderNumber: '',
      currentKm: 45000,
      cost: 12000,
      originalThreadDepth: 16,
      currentThreadDepth: 8,
    },
    {
      brand: 'Apollo',
      model: 'EnduRace',
      serialNumber: 'APO-991',
      size: '11R22.5',
      type: 'Remolded',
      category: '',
      purchaseOrderNumber: 'PO-REF-002',
      currentKm: 0,
      cost: 8000,
      originalThreadDepth: 12,
      currentThreadDepth: 12,
    },
  ];

  dummyData.forEach((row) => {
    worksheet.addRow(row);
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
