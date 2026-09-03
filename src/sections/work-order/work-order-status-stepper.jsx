/* eslint-disable react/prop-types */
import React from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

import { SimpleStepper } from 'src/sections/subtrip/widgets/subtrip-completion-stepper';

const STATUS_ORDER = ['open', 'inprogress', 'completed'];

const STATUS_DESCRIPTIONS = {
  open: 'Work order has been created and is awaiting action',
  inprogress: 'Work is currently in progress / active',
  completed: 'Work order is completed and closed',
};

const STATUS_LABELS = {
  open: 'Created',
  inprogress: 'In Progress',
  completed: 'Completed',
};

const ICONS = {
  open: 'solar:file-check-bold',
  inprogress: 'solar:clock-circle-bold',
  completed: 'solar:check-circle-bold',
};

export function WorkOrderStatusStepper({ status }) {
  const currentStep = STATUS_ORDER.indexOf(status) !== -1 ? STATUS_ORDER.indexOf(status) : 0;

  const stepLabels = STATUS_ORDER.map((statusKey) => {
    const label = STATUS_LABELS[statusKey];
    const description = STATUS_DESCRIPTIONS[statusKey];

    return (
      <Tooltip key={statusKey} title={description} arrow>
        <span>{label}</span>
      </Tooltip>
    );
  });

  const icons = STATUS_ORDER.map((statusKey) => {
    const iconName = ICONS[statusKey];
    const description = STATUS_DESCRIPTIONS[statusKey];

    return (
      <Tooltip key={statusKey} title={description} arrow>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon={iconName} width={24} />
        </Box>
      </Tooltip>
    );
  });

  return <SimpleStepper steps={stepLabels} icons={icons} currentStep={currentStep} />;
}
