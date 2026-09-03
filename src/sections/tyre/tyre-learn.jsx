import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Accordion from '@mui/material/Accordion';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function TyreLearn({ open, onClose }) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('overview');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const faqData = [
    {
      icon: 'solar:speedometer-bold',
      iconColor: theme.palette.info.main,
      question: 'Does Current KM mean actual total distance?',
      answer: (
        <>
          <b>Yes.</b> Current KM represents the total actual accumulated mileage of the tyre over its
          entire lifespan. It includes initial &quot;Opening KM&quot; (for used tyres) plus all distance
          covered while mounted on active vehicles.
        </>
      ),
    },
    {
      icon: 'solar:settings-bold',
      iconColor: theme.palette.secondary.main,
      question: 'What if a tyre is on Stepney (Spare)?',
      answer: (
        <>
          Tyres mounted in the <b>Stepney</b> position do not accumulate mileage. When unmounted
          from Stepney, the system records 0 km covered for that duration, regardless of the vehicle
          odometer change.
        </>
      ),
    },
    {
      icon: 'solar:shield-check-bold',
      iconColor: theme.palette.success.main,
      question: 'Who has access to update tyres?',
      answer: (
        <>
          Access is restricted to authorized users with <b>Tyre Management</b> permissions (Fleet
          Managers and Admins). Standard drivers cannot modify tyre records.
        </>
      ),
    },
  ];

  const renderOverview = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(
            theme.palette.info.main,
            0.02
          )} 100%)`,
          border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.16),
              color: 'info.main',
              width: 40,
              height: 40,
            }}
          >
            <Iconify icon="solar:settings-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Tyre Management Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Comprehensive tracking of fleet tyres from purchase to scrap. Track lifecycle events
              like mounting, unmounting, thread depth inspection, and retreading to optimize cost
              and performance.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
            theme.palette.primary.main,
            0.02
          )} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.16),
              color: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            <Iconify icon="solar:speedometer-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Distance & Cost per KM
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              The system automatically tracks mileage covered per tyre position to calculate cost per
              kilometer (CPKM) and predict replacement cycles.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Tyre Features & Capabilities
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[
            { icon: 'solar:settings-bold', text: 'Tyre Serial Number' },
            { icon: 'solar:box-bold', text: 'Brand, Size & Pattern' },
            { icon: 'solar:delivery-bold', text: 'Mount & Unmount History' },
            { icon: 'solar:ruler-bold', text: 'Thread Depth Readings' },
            { icon: 'solar:refresh-bold', text: 'Remold / Retread Cycles' },
            { icon: 'solar:speedometer-bold', text: 'Accrued Mileage (KM)' },
            { icon: 'solar:danger-bold', text: 'Scrap & Wear Inspection' },
            { icon: 'solar:calculator-bold', text: 'Cost Per KM Analytics' },
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  color: 'text.secondary',
                  width: 32,
                  height: 32,
                }}
              >
                <Iconify icon={item.icon} width={18} />
              </Avatar>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );

  const renderLifecycleGuide = (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.secondary.main, 0.16),
            color: 'secondary.main',
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="solar:refresh-bold" width={24} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Tyre Lifecycle Terminology
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Understanding lifecycle stages and maintenance actions:
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
        {[
          {
            color: 'info',
            label: 'Mount / Unmount',
            description: 'Mounting assigns a tyre to a specific wheel position on a vehicle layout. Unmounting returns it to Stock and logs distance covered.',
          },
          {
            color: 'warning',
            label: 'Remold / Retread',
            description: 'Adding new rubber tread to worn casings. Extends usable life, updates status to Remolded, and restores tread depth.',
          },
          {
            color: 'primary',
            label: 'Axle Layout',
            description: 'The wheel arrangement (e.g. 10 Tyre, 12 Tyre) defined in vehicle settings to validate position mapping.',
          },
          {
            color: 'error',
            label: 'Scrap',
            description: 'Retiring unusable or burst tyres past retreading limits. Scrapped tyres are locked from future mounting.',
          },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ width: 130, flexShrink: 0, pt: 0.2 }}>
              <Label variant="soft" color={item.color} fullWidth sx={{ textTransform: 'none', py: 1.5 }}>
                {item.label}
              </Label>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );

  const renderFAQs = (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.16),
            color: 'primary.main',
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="solar:chat-round-dots-bold" width={24} />
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Frequently Asked Questions
        </Typography>
      </Box>

      {faqData.map((faq, index) => (
        <Accordion
          key={index}
          variant="outlined"
          sx={{
            mb: 1,
            '&:before': { display: 'none' },
            borderRadius: 1.5,
            overflow: 'hidden',
          }}
        >
          <AccordionSummary
            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            sx={{
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.08) },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Iconify icon={faq.icon} width={20} color={faq.iconColor} />
              <Typography variant="subtitle2">{faq.question}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Card>
  );

  const TABS = [
    { value: 'overview', label: 'Overview', icon: <Iconify icon="solar:settings-bold" width={16} /> },
    { value: 'lifecycle', label: 'Lifecycle', icon: <Iconify icon="solar:refresh-bold" width={16} /> },
    { value: 'faqs', label: 'FAQs', icon: <Iconify icon="solar:chat-round-dots-bold" width={16} /> },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          boxShadow: theme.shadows[24],
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Learn: Tyre Management
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Quick reference guide & instructions
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.neutral,
          '& .MuiTab-root': {
            py: 1.5,
            minHeight: 'auto',
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>

      {/* Scrollable Content */}
      <Scrollbar sx={{ flexGrow: 1, height: 'calc(100% - 130px)' }}>
        <Box sx={{ p: 3 }}>
          {currentTab === 'overview' && renderOverview}
          {currentTab === 'lifecycle' && renderLifecycleGuide}
          {currentTab === 'faqs' && renderFAQs}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="inherit"
              size="large"
              onClick={onClose}
              startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
              sx={{
                minWidth: 200,
                fontWeight: 700,
              }}
            >
              Got it!
            </Button>
          </Box>
        </Box>
      </Scrollbar>
    </Drawer>
  );
}
