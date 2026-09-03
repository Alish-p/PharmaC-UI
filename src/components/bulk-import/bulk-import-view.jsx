import { useState } from 'react';
import { saveAs } from 'file-saver';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { UploadStep } from './upload-step';
import { ValidationStep } from './validation-step';
import { parseImportFile, generateTemplate } from './utils';

const STEPS = ['Upload File', 'Validate Data', 'Import'];

export function BulkImportView({
  entityName,
  schema,
  columns,
  onImport,
  onDownloadTemplate,
  isImporting = false,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [parsedData, setParsedData] = useState([]);

  const handleUpload = async (file) => {
    try {
      const data = await parseImportFile(file, columns);
      setParsedData(data);
      setActiveStep(1);
    } catch (error) {
      console.error('Error parsing file:', error);
      // You might want to show a snackbar here
    }
  };

  const handleImport = async (validData) => {
    try {
      await onImport(validData);
      setActiveStep(2); // Success step
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleDefaultDownloadTemplate = async () => {
    try {
      const blob = await generateTemplate(columns);
      saveAs(blob, `${entityName.toLowerCase()}_import_template.xlsx`);
    } catch (error) {
      console.error('Error generating template:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* <Typography variant="h4" sx={{ mb: 5 }}>
                Import {entityName}s
            </Typography> */}

      <Card sx={{ p: 3, mb: 5 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      {activeStep === 0 && (
        <Card sx={{ p: 3 }}>
          <UploadStep
            onUpload={handleUpload}
            onDownloadTemplate={onDownloadTemplate || handleDefaultDownloadTemplate}
          />
        </Card>
      )}

      {activeStep === 1 && (
        <ValidationStep
          data={parsedData}
          columns={columns}
          schema={schema}
          onBack={() => setActiveStep(0)}
          onImport={handleImport}
          isImporting={isImporting}
        />
      )}

      {activeStep === 2 && (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h5" paragraph>
            Import Successful!
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            All valid {entityName}s have been imported to the database.
          </Typography>
          <Box>{/* You can add a button to go back to list or import more */}</Box>
        </Card>
      )}
    </Container>
  );
}
