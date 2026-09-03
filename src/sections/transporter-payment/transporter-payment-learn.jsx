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

export default function TransporterPaymentLearn({ open, onClose }) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('overview');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const faqData = [
    {
      icon: 'solar:calculator-bold',
      iconColor: theme.palette.success.main,
      question: 'How is the total calculated?',
      answer: (
        <>
          The final net amount calculation works per job as follows:
          <br />
          <br />
          1. <b>Effective Freight Rate</b> = <code>Rate - Commission Rate</code>
          <br />
          2. <b>Total Freight</b> = <code>Effective Freight Rate × Loading Weight</code>
          <br />
          3. <b>Pre-Tax Income</b> = <code>Total Freight - Expenses - Shortages</code>
          <br />
          4. <b>Net Income</b> = <code>Pre-Tax Income - TDS + Additional Charges</code>
        </>
      ),
    },
    {
      icon: 'solar:document-medicine-bold',
      iconColor: theme.palette.secondary.main,
      question: 'How are TDS and GST calculated?',
      answer: (
        <>
          • <b>TDS</b>: Tax Deduction at Source is dynamically calculated based on the Transporter&apos;s{' '}
          <code>TDS Percentage</code> setting and applied to Total Freight.
          <br />
          <br />• <b>GST</b>: Since transporters operate under a Reverse Charge Mechanism (RCM),{' '}
          <b>GST is NOT added to the Total Net Amount.</b> Instead, GST breakdowns (CGST/SGST vs
          IGST) are shown purely for accounting reference.
        </>
      ),
    },
    {
      icon: 'solar:pen-bold',
      iconColor: theme.palette.warning.main,
      question: 'What do I do if I made a mistake on a billed job?',
      answer: (
        <>
          You cannot edit a job once it is linked to a Transporter Payment. If you need to make changes:
          <br />
          <br />
          1. Select the specific Payment Receipt from the list and <b>Delete</b> it.
          <br />
          2. This resets all jobs in that receipt back to the pool.
          <br />
          3. Go to Trips section and edit the newly un-linked jobs.
          <br />
          4. Re-generate a new payment receipt for them.
        </>
      ),
    },
    {
      icon: 'solar:trash-bin-trash-bold',
      iconColor: theme.palette.error.main,
      question: 'Can I delete a Payment Receipt completely?',
      answer: (
        <>
          Yes. Deleting a Transporter Payment Receipt removes it from ledgers and unlinks all
          underlying market jobs so they can be re-billed with updated rates.
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
              What is a Transporter Payment?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              A Transporter Payment Receipt is a financial document generated to settle dues with
              third-party / market vehicle transporters for completed freight trips.
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
              How are Payment IDs generated?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Payment numbers are auto-generated sequentially upon creation to ensure precise ledger
              tracking for each transporter account.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          What a Payment Receipt Contains
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[
            { icon: 'solar:user-bold', text: 'Transporter Details' },
            { icon: 'solar:delivery-bold', text: 'Billed Market Trips' },
            { icon: 'solar:calculator-bold', text: 'Effective Freight Rate' },
            { icon: 'solar:tag-bold', text: 'Commission Deductions' },
            { icon: 'solar:scale-bold', text: 'Shortages & Deductions' },
            { icon: 'solar:document-medicine-bold', text: 'TDS Tax Deductions' },
            { icon: 'solar:wallet-money-bold', text: 'Extra Charges / Bonuses' },
            { icon: 'solar:bill-list-bold', text: 'Net Payable Amount' },
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
            Payment Statuses Explained
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Track transporter settlements through these stages:
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
            color: 'warning',
            icon: 'solar:clock-circle-bold',
            desc: 'Receipt created & finalized. Awaiting payment disbursement.',
          },
          {
            key: 'paid',
            label: 'Paid',
            color: 'success',
            icon: 'solar:check-circle-bold',
            desc: 'Payment logged covering full amount owed to transporter.',
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
            Taxes & Calculations
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Transporter freight and tax equations:
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
        {[
          {
            color: 'info',
            label: 'Effective Rate',
            description: 'Calculated as (Rate - Commission Rate) negotiated with transporter.',
          },
          {
            color: 'primary',
            label: 'Total Freight',
            description: 'Calculated as Effective Freight Rate × Loading Weight (or Unloading Weight).',
          },
          {
            color: 'warning',
            label: 'TDS Deduction',
            description: 'Tax Deducted at Source applied to Total Freight based on Transporter TDS % settings.',
          },
          {
            color: 'secondary',
            label: 'RCM GST',
            description: 'Reverse Charge Mechanism (RCM): GST is not added to net payable total, but shown for accounting audit.',
          },
          {
            color: 'success',
            label: 'Net Income',
            description: 'Final Net Income = Pre-Tax Income - TDS + Additional Charges.',
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
    { value: 'statuses', label: 'Statuses', icon: <Iconify icon="solar:info-circle-bold" width={16} /> },
    { value: 'calculations', label: 'Calculations & Taxes', icon: <Iconify icon="solar:calculator-bold" width={16} /> },
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
            Learn: Transporter Payments
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
