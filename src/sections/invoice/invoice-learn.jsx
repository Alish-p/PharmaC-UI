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

export default function InvoiceLearn({ open, onClose }) {
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
          The net amount calculation works as follows:
          <br />
          <br />
          1. For each job (subtrip), the gross freight is calculated:{' '}
          <code>Rate × Loading Weight</code> (or Unloading Weight/Fixed based on the freight model).
          <br />
          2. The <b>Shortage Amount</b> for each trip is recorded as a deduction item.
          <br />
          3. All trip amounts are summed into the <b>Taxable Amount</b> (Total Amount Before Tax).
          <br />
          4. <b>GST Tax</b> is calculated based on the Taxable Amount.
          <br />
          5. Any manual <b>Extra Charges</b> are added.
          <br />
          <br />
          Final equation:
          <br />
          <code>Net Total = Taxable Amount + GST Taxes + Extra Charges</code>
        </>
      ),
    },
    {
      icon: 'solar:document-medicine-bold',
      iconColor: theme.palette.secondary.main,
      question: 'How does Tax (GST) mapping work?',
      answer: (
        <>
          Taxes are dynamically generated using your Tenant and Customer configuration mapping. If
          the Customer has <b>GST Enabled</b>, the system compares the Customer state to the Tenant
          state:
          <br />
          <br />• <b>Intra-state</b> (Same State): Applied evenly across <b>CGST</b> and <b>SGST</b>.
          <br />• <b>Inter-state</b> (Different State): Applied entirely as <b>IGST</b>.
        </>
      ),
    },
    {
      icon: 'solar:pen-bold',
      iconColor: theme.palette.warning.main,
      question: 'What do I do if I made a mistake on a billed job?',
      answer: (
        <>
          You cannot directly edit a Job (subtrip) that has already been billed via an invoice. If you
          realize there was an error with shortages, rates, or freight details:
          <br />
          <br />
          1. Select the Invoice and mark it as <b>Cancelled</b>.
          <br />
          2. This releases the jobs and resets their status to <b>Received</b>.
          <br />
          3. Go to the Trips section, edit the newly un-billed job to correct the details.
          <br />
          4. Finally, generate a brand new Invoice for those jobs.
        </>
      ),
    },
    {
      icon: 'solar:trash-bin-trash-bold',
      iconColor: theme.palette.error.main,
      question: 'Can I delete an Invoice completely?',
      answer: (
        <>
          There is no hard &quot;Delete&quot; for an invoice. Instead, you <b>Cancel</b> it.
          Cancelling an invoice completely neutralizes it from your payment ledgers and revenue
          analytics, while safely maintaining financial compliance audit trails linking the old jobs.
        </>
      ),
    },
    {
      icon: 'solar:card-transfer-bold',
      iconColor: theme.palette.info.main,
      question: 'What happens when a customer pays in installments?',
      answer: (
        <>
          When a customer makes a partial payment, record the transaction under the Invoice&apos;s
          payment ledger. The invoice status automatically transitions to <b>Partial Received</b>,
          and the outstanding balance is tracked in real-time.
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
            <Iconify icon="solar:document-text-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              What is an Invoice?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              An Invoice is a formal billing document sent to your Customer. It aggregates freight
              charges, deductions, shortages, and taxes for selected trips within a billing period into
              a single structured payment statement.
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
              How are Invoice Numbers generated?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Invoice numbers are auto-generated incrementally per customer based on their settings.
              The format is: <code>[Prefix][Current Serial Number][Suffix]</code> (e.g.{' '}
              <code>INV-2024-001</code>).
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          What does an Invoice contain?
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
            { icon: 'solar:delivery-bold', text: 'Billed Subtrips / Jobs' },
            { icon: 'solar:calculator-bold', text: 'Gross Freight Charges' },
            { icon: 'solar:scale-bold', text: 'Shortage Deductions' },
            { icon: 'solar:document-medicine-bold', text: 'GST Taxes (CGST/SGST/IGST)' },
            { icon: 'solar:wallet-money-bold', text: 'Extra Charges' },
            { icon: 'solar:card-transfer-bold', text: 'Customer Advances' },
            { icon: 'solar:bill-list-bold', text: 'Payment Ledger & Balance' },
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
            Invoice Statuses Explained
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage and track the payment lifecycle of your invoices through these stages:
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
            left: '16%',
            right: '16%',
            height: '2px',
            bgcolor: alpha(theme.palette.grey[500], 0.2),
            zIndex: 1,
          }}
        />

        {[
          {
            key: 'pending',
            label: 'Pending',
            color: 'info',
            icon: 'solar:clock-circle-bold',
            desc: 'Invoice generated & sent. Awaiting customer payment.',
          },
          {
            key: 'partial',
            label: 'Partial Received',
            color: 'warning',
            icon: 'solar:pie-chart-2-bold',
            desc: 'Partial payment received. Balance remaining.',
          },
          {
            key: 'received',
            label: 'Received',
            color: 'success',
            icon: 'solar:check-circle-bold',
            desc: 'Paid in full. Invoice fully settled & closed.',
          },
        ].map((step) => {
          const stepColor = theme.palette[step.color].main;
          return (
            <Box
              key={step.key}
              sx={{
                width: '30%',
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

      {/* Cancelled Status Box */}
      <Box sx={{ display: 'flex', gap: 2, bgcolor: alpha(theme.palette.grey[500], 0.08), p: 2, borderRadius: 1.5 }}>
        <Iconify icon="solar:close-circle-bold" color={theme.palette.text.secondary} width={24} sx={{ flexShrink: 0 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700 }}>
            Cancelled Invoices
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '13px' }}>
            Voiding an invoice removes it from payment ledgers while preserving financial audit records.
            <b> Important:</b> Cancelling frees up the underlying jobs back to &quot;Received&quot; status so they can be edited and billed again.
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  const renderTaxesGuide = (
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
            How transport billing, deductions, and tax rates are structured:
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
        {[
          {
            color: 'info',
            label: 'Gross Freight',
            description: 'Sum of all subtrips calculated as Rate × Loading Weight (or Unloading Weight / Fixed depending on freight model).',
          },
          {
            color: 'error',
            label: 'Shortage Deduction',
            description: 'Trip shortages recorded as penalty deductions or cargo loss items.',
          },
          {
            color: 'primary',
            label: 'Taxable Amount',
            description: 'Base billable total calculated from freight charges prior to applying taxes.',
          },
          {
            color: 'success',
            label: 'Intra-State GST',
            description: 'Applied when Customer & Tenant operate in the same state: split 50/50 between CGST and SGST.',
          },
          {
            color: 'warning',
            label: 'Inter-State GST',
            description: 'Applied when Customer & Tenant operate in different states: charged entirely under IGST.',
          },
          {
            color: 'secondary',
            label: 'Net Total',
            description: 'Final equation: Net Total = Taxable Amount + GST Taxes + Extra Charges.',
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
    { value: 'taxes', label: 'Taxes & Calculation', icon: <Iconify icon="solar:calculator-bold" width={16} /> },
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
            Learn: Invoices
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
          {currentTab === 'taxes' && renderTaxesGuide}
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
