import { Box, Tooltip } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { SimpleStepper } from './subtrip-completion-stepper';

export function SubtripStatusStepper({ status }) {
  const statusToStepIndex = {
    // 'in-queue': 0, // Commented out: Hide In-queue step
    loaded: 0,
    error: 1,
    received: 2,
    billed: 3,
  };

  const statusDescriptions = {
    // 'in-queue':
    //   'Initial state: Consignment is created and assigned to a vehicle, waiting to be loaded',
    loaded: 'Vehicle is fully loaded with goods and has departed for delivery',
    error:
      'Issues detected: Problems with documentation or other complications that need resolution',
    received: 'Goods have been successfully delivered and received at the destination',
    billed: 'Invoice generated ',
  };

  const currentStep = statusToStepIndex[status] ?? 0;

  const steps = ['Loaded', 'Error', 'Received', 'Billed'];

  const icons = [
    // Commented out: In-queue icon & tooltip
    // <Tooltip title={statusDescriptions['in-queue']} arrow>
    //   <Box
    //     sx={{
    //       display: 'flex',
    //       alignItems: 'center',
    //       justifyContent: 'center',
    //       width: 24,
    //       height: 24,
    //     }}
    //   >
    //     <Iconify icon="solar:sort-by-time-bold-duotone" width={24} />
    //   </Box>
    // </Tooltip>,
    <Tooltip title={statusDescriptions.loaded} arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
        }}
      >
        <Iconify icon="mdi:truck" width={24} />
      </Box>
    </Tooltip>,
    <Tooltip title={statusDescriptions.error} arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
        }}
      >
        <Iconify icon="material-symbols:error-outline" width={24} />
      </Box>
    </Tooltip>,
    <Tooltip title={statusDescriptions.received} arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
        }}
      >
        <Iconify icon="material-symbols:call-received" width={24} />
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
