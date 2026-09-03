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

export default function JobLearn({ open, onClose }) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('overview');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const faqData = [
    {
      icon: 'solar:user-plus-bold',
      iconColor: theme.palette.info.main,
      question: 'Who can create a Job?',
      answer: (
        <>
          Fleet managers, logistics operators, dispatch officers, and admin users create jobs to
          coordinate and track vehicle consignments.
          <br />
          <br />
          The system records <b>who dispatched</b> and <b>who received</b> each job for full audit
          trail accountability.
        </>
      ),
    },
    {
      icon: 'solar:document-bold',
      iconColor: theme.palette.primary.main,
      question: 'What is an E-way Bill and is it mandatory?',
      answer: (
        <>
          <b>Yes.</b> The E-way Bill (Electronic Way Bill) is a mandatory document required under GST
          rules for transporting goods. The system tracks the e-way bill number and its expiry date.
          <br />
          <br />
          <b>Alerts:</b> If a job is active and the e-way bill is close to expiry, the system displays
          clear warnings to dispatchers to prevent transit penalties.
        </>
      ),
    },
    {
      icon: 'solar:box-bold',
      iconColor: theme.palette.success.main,
      question: 'How does shortage calculation work?',
      answer: (
        <>
          Shortage occurs if the unloading weight is less than the loading weight.
          <br />
          <br />
          Formula:
          <br />
          <code>Shortage Weight = Loading Weight - Unloading Weight</code>
          <br />
          <br />
          If shortage weight is positive, you can enter the <b>shortage amount (penalty)</b>.
          This penalty is deducted from the transporter&apos;s final payout or recorded as a cargo loss.
        </>
      ),
    },
    {
      icon: 'solar:delivery-bold',
      iconColor: theme.palette.warning.main,
      question: 'What is the difference between Own vs Market Vehicles?',
      answer: (
        <>
          The system supports two vehicle ownership types:
          <br />
          <br />
          1. <b>Own Vehicles</b> — Operated internally. The system tracks actual route expenses (fuel,
          tolls, maintenance) and driver salaries to calculate actual Job profitability.
          <br />
          2. <b>Market Vehicles</b> — Outsourced from third-party transporters. You negotiate a
          freight rate with the customer, pay the transporter a rate minus your commission, and track
          outbound transporter advances.
        </>
      ),
    },
    {
      icon: 'solar:wallet-money-bold',
      iconColor: theme.palette.secondary.main,
      question: 'How is driver advance tracked?',
      answer: (
        <>
          Driver advances are cash or fuel allocations given to drivers to cover transit costs:
          <br />
          <br />• <b>Self Advance</b> — Cash or bank transfers paid directly by your organization.
          <br />• <b>Fuel Pump Advance</b> — Fuel vouchers or pump cards assigned to the driver at
          partner pumps.
          <br />
          <br />
          These advances are settled and reconciled when the driver submits receipts after delivery.
        </>
      ),
    },
    {
      icon: 'solar:gallery-check-bold',
      iconColor: theme.palette.success.main,
      question: 'What is EPOD?',
      answer: (
        <>
          EPOD stands for <b>Electronic Proof of Delivery</b>. When a consignment is received, the
          unloading officer uploads a signed delivery receipt or digital signature.
          <br />
          <br />
          Once EPOD is uploaded and unloading weight is confirmed, the Job status changes to
          <b> Received</b>, preparing it for invoicing and billing.
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
            <Iconify icon="solar:delivery-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              What is a Job?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              A Job (Subtrip) represents a single logistics and transit transaction to deliver a
              consignment of goods from a loading point to an unloading point. It coordinates
              customers, vehicles, drivers, transporters, cargo weights, and financial records.
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
              How are Job Numbers generated?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Job numbers are auto-generated and incremented sequentially (e.g. <code>JOB-0001</code>)
              by the system upon creation. This acts as a unique transit identifier.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          What does a Job contain?
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[
            { icon: 'solar:user-bold', text: 'Customer Details' },
            { icon: 'solar:delivery-bold', text: 'Vehicle & Driver' },
            { icon: 'solar:box-bold', text: 'Material & Quantity' },
            { icon: 'solar:scale-bold', text: 'Loading Weight' },
            { icon: 'solar:scale-bold', text: 'Unloading Weight' },
            { icon: 'solar:calculator-bold', text: 'Freight Pricing Model' },
            { icon: 'solar:wallet-money-bold', text: 'Driver Advances' },
            { icon: 'solar:gallery-check-bold', text: 'EPOD & Shortages' },
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
            Job Statuses Explained
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Track the lifecycle of your jobs through these transit stages:
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
            left: '12.5%',
            right: '12.5%',
            height: '2px',
            bgcolor: alpha(theme.palette.grey[500], 0.2),
            zIndex: 1,
          }}
        />

        {[
          {
            key: 'in-queue',
            label: 'In-Queue',
            color: 'warning',
            icon: 'solar:clock-circle-bold',
            desc: 'Created & assigned a vehicle. Awaiting loading.',
          },
          {
            key: 'loaded',
            label: 'Loaded',
            color: 'info',
            icon: 'solar:delivery-bold',
            desc: 'Fully loaded & departed. In transit to destination.',
          },
          {
            key: 'received',
            label: 'Received',
            color: 'primary',
            icon: 'solar:gallery-check-bold',
            desc: 'Unloaded at destination. EPOD signature confirmed.',
          },
          {
            key: 'billed',
            label: 'Billed',
            color: 'success',
            icon: 'solar:check-circle-bold',
            desc: 'Invoice generated. Job finalized & locked.',
          },
        ].map((step) => {
          const stepColor = theme.palette[step.color].main;
          return (
            <Box
              key={step.key}
              sx={{
                width: '22%',
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
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {step.desc}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Error Status Box */}
      <Box sx={{ display: 'flex', gap: 2, bgcolor: alpha(theme.palette.error.main, 0.06), p: 2, borderRadius: 1.5 }}>
        <Iconify icon="solar:danger-bold" color={theme.palette.error.main} width={24} sx={{ flexShrink: 0 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 700 }}>
            Error Status
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '13px' }}>
            Indicates a critical transit issue (e.g. document mismatch, major shortages, vehicle
            breakdown). It halts the billing pipeline until resolved.
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  const renderFreightGuide = (
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
            Freight Rate Models
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure how transport costs are calculated for billing:
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
        {[
          {
            value: 'per_ton',
            color: 'info',
            label: 'Per Ton',
            description: 'Billed based on unloading weight in tons (Loading Weight is used if unloading weight is missing).',
          },
          {
            value: 'per_kl',
            color: 'info',
            label: 'Per KL',
            description: 'Billed based on unloading volume in Kilolitres (typically for liquid/gas commodities).',
          },
          {
            value: 'fixed',
            color: 'primary',
            label: 'Fixed Rate',
            description: 'A pre-negotiated fixed freight amount, regardless of weight, volume, or distance.',
          },
          {
            value: 'per_km',
            color: 'warning',
            label: 'Per KM',
            description: 'Billed dynamically based on trip distance: (End KM - Start KM) × rate per KM.',
          },
          {
            value: 'per_hour',
            color: 'secondary',
            label: 'Per Hour',
            description: 'Time-based billing: duration of the transit hours × hourly rate.',
          },
          {
            value: 'hybrid',
            color: 'default',
            label: 'Hybrid',
            description: 'A custom blended rate calculation incorporating multiple base variables.',
          },
        ].map((item) => (
          <Box key={item.value} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ width: 120, flexShrink: 0, pt: 0.2 }}>
              <Label variant="soft" color={item.color} fullWidth sx={{ textTransform: 'capitalize', py: 1.5 }}>
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
    { value: 'freight', label: 'Freight Models', icon: <Iconify icon="solar:calculator-bold" width={16} /> },
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
            Learn: Jobs
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
          {currentTab === 'freight' && renderFreightGuide}
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
