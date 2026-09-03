import { Box, Tooltip } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { SimpleStepper } from './subtrip-completion-stepper';

export function EmptySubtripStatusStepper({ status }) {
  const statusToStepIndex = {
    'in-queue': 0,
    billed: 1,
  };

  const statusDescriptions = {
    'in-queue': 'Initial state: Empty trip is created and assigned to a vehicle',
    billed: 'Trip completed and payment received',
  };

  const currentStep = statusToStepIndex[status] ?? 0;

  const steps = ['In-Queue', 'Billed'];

  const icons = [
    <Tooltip title={statusDescriptions['in-queue']} arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
        }}
      >
        <Iconify icon="solar:sort-by-time-bold-duotone" width={24} />
      </Box>
    </Tooltip>,
    <Tooltip title={statusDescriptions.billed} arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
        }}
      >
        <Iconify icon="mdi:file-document-check" width={24} />
      </Box>
    </Tooltip>,
  ];

  return (
    <SimpleStepper
      steps={steps.map((step, index) => (
        <Tooltip key={step} title={statusDescriptions[Object.keys(statusToStepIndex)[index]]} arrow>
          <span>{step}</span>
        </Tooltip>
      ))}
      icons={icons}
      currentStep={currentStep}
    />
  );
}
