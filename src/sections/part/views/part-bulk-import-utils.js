import ExcelJS from 'exceljs';

export async function generatePartTemplate(locations = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Part Import Template');

  // Define columns
  const baseColumns = [
    { header: 'Part Number', key: 'partNumber', width: 20 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Manufacturer', key: 'manufacturer', width: 20 },
    { header: 'Unit Cost', key: 'unitCost', width: 15 },
    { header: 'Measurement Unit', key: 'measurementUnit', width: 20 },
    { header: 'Description', key: 'description', width: 30 },
  ];

  const locColumns = locations.flatMap((loc) => [
    { header: `${loc.name} Quantity`, key: `loc_${loc._id}_qty`, width: 20 },
    { header: `${loc.name} Reorder Point`, key: `loc_${loc._id}_threshold`, width: 20 },
  ]);

  worksheet.columns = [...baseColumns, ...locColumns];

  // Add dummy data rows
  const dummyData = [
    {
      partNumber: 'FIL-001',
      name: 'Oil Filter',
      category: 'Engine Parts',
      manufacturer: 'Bosch',
      unitCost: 1500,
      measurementUnit: 'Piece',
      description: 'Standard oil filter for heavy vehicles',
    },
    {
      partNumber: 'BRK-002',
      name: 'Brake Pad Set',
      category: 'Brakes',
      manufacturer: 'TVS',
      unitCost: 4500,
      measurementUnit: 'Set',
      description: 'Front and rear brake pads',
    },
    {
      partNumber: 'LUB-003',
      name: 'Engine Oil',
      category: 'Lubricants',
      manufacturer: 'Castrol',
      unitCost: 800,
      measurementUnit: 'Litre',
      description: 'Synthetic engine oil 15W-40',
    },
  ];

  if (locations.length > 0) {
    dummyData.forEach((row) => {
      locations.forEach((loc) => {
        row[`loc_${loc._id}_qty`] = Math.floor(Math.random() * 50);
        row[`loc_${loc._id}_threshold`] = Math.floor(Math.random() * 10);
      });
    });
  }

  dummyData.forEach((row) => {
    worksheet.addRow(row);
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
