import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

import { bgGradient, stylesMode } from 'src/theme/styles';

import { Scrollbar } from 'src/components/scrollbar/scrollbar';

// ----------------------------------------------------------------------

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      ...bgGradient({
        color: `0deg, ${theme.vars.palette.primary.light}, ${theme.vars.palette.primary.main}`,
      }),
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      ...bgGradient({
        color: `0deg, ${theme.vars.palette.primary.light}, ${theme.vars.palette.primary.main}`,
      }),
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    borderRadius: 1,
    backgroundColor: theme.vars.palette.divider,
  },
}));

const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  zIndex: 1,
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.vars.palette.text.disabled,
  backgroundColor: theme.vars.palette.grey[300],
  [stylesMode.dark]: { backgroundColor: theme.vars.palette.grey[700] },
  ...(ownerState.active && {
    ...bgGradient({
      color: `0deg, ${theme.vars.palette.primary.light}, ${theme.vars.palette.primary.main}`,
    }),
    color: theme.vars.palette.common.white,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,0.25)',
  }),
  ...(ownerState.completed && {
    color: theme.vars.palette.common.white,
    ...bgGradient({
      color: `0deg, ${theme.vars.palette.primary.light}, ${theme.vars.palette.primary.main}`,
    }),
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;

  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {icon}
    </CustomStepIconRoot>
  );
}

// ----------------------------------------------------------------------

export function SimpleStepper({ steps, icons, currentStep }) {
  return (
    <Scrollbar sx={{ maxHeight: 150 }}>
      <Box>
        <Stepper alternativeLabel activeStep={currentStep} connector={<CustomConnector />}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={(props) => <CustomStepIcon {...props} icon={icons[index]} />}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Scrollbar>
  );
}
