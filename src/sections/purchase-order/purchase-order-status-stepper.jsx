import { Box, Tooltip } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { SimpleStepper } from 'src/sections/subtrip/widgets/subtrip-completion-stepper';

const STATUS_ORDER = [
  'pending-approval',
  'rejected',
  'approved',
  'received',
  'closed',
];

const STATUS_DESCRIPTIONS = {
  'pending-approval': 'Purchase order has been created and is awaiting approval',
  approved: 'Purchase order has been approved and can be processed',
  received: 'Ordered items have been received into inventory',
  rejected: 'Purchase order was rejected and will not be processed',
  closed: 'Purchase order has been closed. No further actions can be taken.',
};

export function PurchaseOrderStatusStepper({ status }) {
  const isPartialReceived = status === 'partial-received';
  const isClosed = status === 'closed';
  const normalizedStatus = isClosed ? 'closed' : isPartialReceived ? 'received' : status;

  const statusToStepIndex = STATUS_ORDER.reduce(
    (acc, key, index) => ({ ...acc, [key]: index }),
    {}
  );

  const currentStep = statusToStepIndex[normalizedStatus] ?? 0;

  const stepLabels = STATUS_ORDER.map((statusKey) => {
    const label =
      statusKey === 'pending-approval'
        ? 'Pending Approval'
        : statusKey === 'received' && isPartialReceived
          ? 'Partially Received'
          : statusKey === 'closed'
            ? 'Closed'
            : statusKey.charAt(0).toUpperCase() + statusKey.slice(1);

    const description =
      statusKey === 'received' && isPartialReceived
        ? 'Some items have been received. Remaining items are still pending.'
        : STATUS_DESCRIPTIONS[statusKey];

    return (
      <Tooltip key={statusKey} title={description} arrow>
        <span>{label}</span>
      </Tooltip>
    );
  });

  const icons = STATUS_ORDER.map((statusKey) => {
    let iconName = 'mdi:clock-outline';

    if (statusKey === 'approved') iconName = 'eva:checkmark-circle-2-outline';
    if (statusKey === 'received') {
      iconName = isPartialReceived
        ? 'mdi:alert-circle-outline'
        : 'material-symbols:inventory-2-outline';
    }
    if (statusKey === 'rejected') iconName = 'eva:close-circle-outline';
    if (statusKey === 'closed') iconName = 'mdi:lock-outline';

    const description =
      statusKey === 'received' && isPartialReceived
        ? 'Partially received - Some items are still missing'
        : STATUS_DESCRIPTIONS[statusKey];

    return (
      <Tooltip key={statusKey} title={description} arrow>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify
            icon={iconName}
            width={24}
            sx={
              statusKey === 'received' && isPartialReceived ? { color: 'warning.main' } : undefined
            }
          />
        </Box>
      </Tooltip>
    );
  });

  return <SimpleStepper steps={stepLabels} icons={icons} currentStep={currentStep} />;
}
