import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
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

export default function DriverSalaryLearn({ open, onClose }) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('overview');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const faqData = [
    {
      icon: 'solar:calculator-bold',
      iconColor: theme.palette.success.main,
      question: 'How is it calculated?',
      answer: (
        <>
          The net salary calculation works step-by-step:
          <br />
          <br />
          1. All selected jobs/subtrips are scanned for Driver Salary expenses.
          <br />
          2. The sum of these trip salaries is grouped into <b>Trips Total</b>.
          <br />
          3. Any manual additions (like rewards or previous dues) are added as <b>Extra Income</b>.
          <br />
          4. Any manual deductions (like advance cuts or fines) are subtracted as <b>Deductions</b>.
          <br />
          <br />
          Final equation:
          <br />
          <code>Net Total = Trips Total + Extra Income - Deductions</code>
        </>
      ),
    },
    {
      icon: 'solar:copy-bold',
      iconColor: theme.palette.warning.main,
      question: 'Can I generate salary twice for the same job?',
      answer: (
        <>
          By default, when generating a new salary, the system shows you all jobs completed in that
          billing period. Always verify whether a job was already claimed. A best practice is to use
          non-overlapping billing periods for driver salary generation.
        </>
      ),
    },
    {
      icon: 'solar:trash-bin-trash-bold',
      iconColor: theme.palette.error.main,
      question: 'What happens if I delete a salary record?',
      answer: (
        <>
          Deleting a salary record permanently removes it from the database. The underlying
          subtrips <b>are NOT deleted</b>, but this payment record vanishes. Prefer setting status
          to <b>Cancelled</b> to preserve financial audit trails.
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
            <Iconify icon="solar:wallet-money-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              What is Driver Salary?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Driver Salary acts as the final ledger for settling driver payments over a specific
              billing period. It consolidates completed jobs, factors in driver advances or penalties,
              and calculates the final net payout.
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
            <Iconify icon="solar:document-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              How are Salary Records generated?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Select a driver and billing date range. The system scans all eligible trips completed
              in that timeframe, automatically accumulating base pay, trip allowances, and advances.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          What does Driver Salary include?
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[
            { icon: 'solar:user-bold', text: 'Driver Details' },
            { icon: 'solar:delivery-bold', text: 'Completed Subtrips' },
            { icon: 'solar:calculator-bold', text: 'Trip Allowances / Bata' },
            { icon: 'solar:wallet-money-bold', text: 'Driver Advances Cut' },
            { icon: 'solar:gift-bold', text: 'Extra Income & Rewards' },
            { icon: 'solar:danger-bold', text: 'Deductions & Fines' },
            { icon: 'solar:card-bold', text: 'Bank Payment Method' },
            { icon: 'solar:bill-list-bold', text: 'Net Payable Balance' },
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

  const renderStatusGuide = (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.warning.main, 0.16),
            color: 'warning.main',
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="solar:info-circle-bold" width={24} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Salary Statuses Explained
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Track the lifecycle of driver payroll through these stages:
          </Typography>
        </Box>
      </Box>

      {/* Horizontal Pipeline Diagram */}
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', mt: 2, mb: 4 }}>
        {/* Connector Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 24,
            left: '25%',
            right: '25%',
            height: '2px',
            bgcolor: alpha(theme.palette.grey[500], 0.2),
            zIndex: 1,
          }}
        />

        {[
          {
            key: 'generated',
            label: 'Generated',
            color: 'info',
            icon: 'solar:document-add-bold',
            desc: 'Draft record created. Amounts aggregated.',
          },
          {
            key: 'paid',
            label: 'Paid',
            color: 'success',
            icon: 'solar:check-circle-bold',
            desc: 'Payment deposited via bank or cash.',
          },
        ].map((step) => {
          const stepColor = theme.palette[step.color].main;
          return (
            <Box
              key={step.key}
              sx={{
                width: '40%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(stepColor, 0.12),
                  color: stepColor,
                  width: 48,
                  height: 48,
                  border: `2px solid ${stepColor}`,
                }}
              >
                <Iconify icon={step.icon} width={24} />
              </Avatar>

              <Typography variant="subtitle2" sx={{ mt: 1.5, fontWeight: 700, color: `${step.color}.main` }}>
                {step.label}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                  fontSize: '11px',
                  lineHeight: 1.4,
                }}
              >
                {step.desc}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Cancelled Box */}
      <Box sx={{ display: 'flex', gap: 2, bgcolor: alpha(theme.palette.grey[500], 0.08), p: 2, borderRadius: 1.5 }}>
        <Iconify icon="solar:close-circle-bold" color={theme.palette.error.main} width={24} sx={{ flexShrink: 0 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 700 }}>
            Cancelled Status
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '13px' }}>
            If generated by mistake or with incorrect parameters, salary records can be cancelled.
            Cancelled salaries do not contribute to final ledger totals while preserving audit logs.
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  const renderCalculationsGuide = (
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
          <Iconify icon="solar:calculator-bold" width={24} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Salary Calculations Breakdown
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Understanding salary equation components:
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
        {[
          {
            color: 'info',
            label: 'Trips Total',
            description: 'Sum of driver salary and trip bata across all completed subtrips in the period.',
          },
          {
            color: 'success',
            label: 'Extra Income',
            description: 'Performance bonuses, overtime allowances, or previous pending dues added.',
          },
          {
            color: 'error',
            label: 'Deductions',
            description: 'Cash advances, fuel over-consumption penalties, or shortage cuts subtracted.',
          },
          {
            color: 'primary',
            label: 'Net Total',
            description: 'Equation: Net Total = Trips Total + Extra Income - Deductions.',
          },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ width: 120, flexShrink: 0, pt: 0.2 }}>
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
    { value: 'statuses', label: 'Statuses', icon: <Iconify icon="solar:info-circle-bold" width={16} /> },
    { value: 'calculations', label: 'Calculations', icon: <Iconify icon="solar:calculator-bold" width={16} /> },
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
            Learn: Driver Salary
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
          {currentTab === 'statuses' && renderStatusGuide}
          {currentTab === 'calculations' && renderCalculationsGuide}
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
