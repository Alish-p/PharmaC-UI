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

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function PurchaseOrderLearn({ open, onClose }) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('overview');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const faqData = [
    {
      icon: 'solar:user-check-bold',
      iconColor: theme.palette.info.main,
      question: 'Who can approve or reject a PO?',
      answer: (
        <>
          Any user who has the <code>purchaseOrder &gt; update</code> permission can approve or
          reject a purchase order. The system records who approved/rejected it and when.
          <br />
          <br />
          <b>Important:</b> Only POs in <b>Pending Approval</b> status can be approved or
          rejected. Once a PO moves past this stage, the approval decision is locked.
        </>
      ),
    },
    {
      icon: 'solar:box-bold',
      iconColor: theme.palette.success.main,
      question: 'What happens when I receive items?',
      answer: (
        <>
          Receiving items triggers several important actions:
          <br />
          <br />
          1. The <b>Quantity Received</b> on each PO line is incremented by the amount you enter.
          <br />
          2. The physical <b>Part Stock</b> at the designated warehouse location is increased.
          <br />
          3. An <b>Inventory Transaction</b> (audit trail) is recorded for compliance.
          <br />
          4. The <b>Average Unit Cost</b> (Moving Average Price) for that part is automatically
          recalculated using a weighted average formula:
          <br />
          <code>
            New Avg Cost = (Current Stock × Old Avg Cost + New Qty × New Unit Cost) ÷ Total Qty
          </code>
          <br />
          <br />
          If all lines are fully received, the PO moves to <b>Received</b>. If only some lines are
          done, it moves to <b>Partially Received</b>.
        </>
      ),
    },
    {
      icon: 'solar:document-text-bold',
      iconColor: theme.palette.info.main,
      question: 'What is a Goods Receipt Note (GRN)?',
      answer: (
        <>
          A <b>Goods Receipt Note (GRN)</b> is generated each time you receive items. It records
          exactly what was received, when, and by whom.
          <br />
          <br />
          <b>Price Variances:</b> When receiving, you can override the original PO cost with the
          actual unit cost paid. The GRN captures this actual cost and calculates the variance.
          Your inventory valuation (Moving Average Price) will update using the <b>Actual Cost</b>,
          not the PO cost.
          <br />
          <br />
          <b>Over-Receiving:</b> You are allowed to receive more quantity than originally ordered
          if needed (e.g., vendor sent extra items). A warning will be displayed, but the system
          will accept the items and generate the GRN correctly.
        </>
      ),
    },
    {
      icon: 'solar:calculator-bold',
      iconColor: theme.palette.secondary.main,
      question: 'How is the PO total calculated?',
      answer: (
        <>
          The total is built up from the line items:
          <br />
          <br />
          1. <b>Subtotal</b> = Sum of (Quantity Ordered × Unit Cost) for each line.
          <br />
          2. <b>Discount</b> is subtracted (can be a fixed amount or a percentage of subtotal).
          <br />
          3. <b>Tax</b> is added (can be a fixed amount or a percentage of the discounted amount).
          <br />
          4. <b>Shipping</b> cost is added.
          <br />
          <br />
          <code>Total = Subtotal - Discount + Tax + Shipping</code>
        </>
      ),
    },
    {
      icon: 'solar:pen-bold',
      iconColor: theme.palette.warning.main,
      question: 'Can I edit a PO after items are received?',
      answer: (
        <>
          <b>No.</b> Once any line item on a PO has received even a partial quantity, the entire
          PO becomes locked for editing. This protects the integrity of your inventory records and
          cost calculations.
          <br />
          <br />
          You also cannot edit a PO that is in <b>Received</b> or <b>Rejected</b> status.
          <br />
          <br />
          If you need to make changes, you must create a new purchase order with the corrected
          details.
        </>
      ),
    },
    {
      icon: 'solar:trash-bin-trash-bold',
      iconColor: theme.palette.error.main,
      question: 'Can I delete a Purchase Order?',
      answer: (
        <>
          You can only delete a PO if it has <b>not</b> been purchased, partially received, or
          fully received. Once any stock movement has been made against a PO, it cannot be deleted
          to maintain inventory audit integrity.
          <br />
          <br />
          POs in <b>Pending Approval</b> or <b>Approved</b> status can be safely deleted. A user
          with <code>purchaseOrder &gt; delete</code> permission is required.
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
            <Iconify icon="solar:cart-large-2-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              What is a Purchase Order?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              A Purchase Order (PO) is a formal request document used to order spare parts or
              inventory items from a Vendor. It tracks the entire procurement lifecycle — from
              requesting approval, making payment, to physically receiving items into your warehouse.
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
              How are PO Numbers generated?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              The system automatically assigns a unique, sequential PO number when you create a new
              purchase order. This provides an audit trail for accounting.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          What does a Purchase Order contain?
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[
            { icon: 'solar:user-bold', text: 'Vendor Details' },
            { icon: 'solar:map-draw-bold', text: 'Warehouse Location' },
            { icon: 'solar:box-bold', text: 'Ordered Parts & Qty' },
            { icon: 'solar:calculator-bold', text: 'Unit Costs & Totals' },
            { icon: 'solar:wallet-money-bold', text: 'Discounts & Taxes' },
            { icon: 'solar:delivery-bold', text: 'Shipping Charges' },
            { icon: 'solar:user-check-bold', text: 'Approval Records' },
            { icon: 'solar:gallery-check-bold', text: 'Goods Receipts (GRNs)' },
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
            Purchase Order Statuses
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            A PO progresses through these main stages in order:
          </Typography>
        </Box>
      </Box>

      {/* Horizontal Pipeline Diagram */}
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', mt: 2, mb: 4 }}>
        {/* Connector Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: '10%',
            right: '10%',
            height: '2px',
            bgcolor: alpha(theme.palette.grey[500], 0.2),
            zIndex: 1,
          }}
        />

        {[
          {
            key: 'pending-approval',
            label: 'Pending',
            color: 'warning',
            icon: 'solar:clock-circle-bold',
            desc: 'Awaiting approval.',
          },
          {
            key: 'approved',
            label: 'Approved',
            color: 'info',
            icon: 'solar:shield-check-bold',
            desc: 'Review approved.',
          },
          {
            key: 'purchased',
            label: 'Purchased',
            color: 'primary',
            icon: 'solar:card-bold',
            desc: 'Payment completed.',
          },
          {
            key: 'partial-received',
            label: 'Partial',
            color: 'warning',
            icon: 'solar:pie-chart-2-bold',
            desc: 'Some items arrived.',
          },
          {
            key: 'received',
            label: 'Received',
            color: 'success',
            icon: 'solar:check-circle-bold',
            desc: 'All items received.',
          },
        ].map((step) => {
          const stepColor = theme.palette[step.color].main;
          return (
            <Box
              key={step.key}
              sx={{
                width: '18%',
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
                  width: 40,
                  height: 40,
                  border: `2px solid ${stepColor}`,
                }}
              >
                <Iconify icon={step.icon} width={20} />
              </Avatar>

              <Typography variant="subtitle2" sx={{ mt: 1.5, fontSize: '12px', fontWeight: 700, color: `${step.color}.main` }}>
                {step.label}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                  fontSize: '10.5px',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
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

      {/* Alternate Statuses */}
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
        Alternative States
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: alpha(theme.palette.grey[500], 0.06), borderRadius: 1.5 }}>
          <Iconify icon="solar:lock-password-bold" color={theme.palette.text.secondary} width={24} sx={{ flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700 }}>
              Closed
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '13px' }}>
              The PO is manually locked and closed. No further items can be received, even if some ordered items are still pending.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: alpha(theme.palette.error.main, 0.06), borderRadius: 1.5 }}>
          <Iconify icon="solar:close-circle-bold" color={theme.palette.error.main} width={24} sx={{ flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 700 }}>
              Rejected
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '13px' }}>
              A reviewer denied the purchase request. Rejected POs cannot be edited or processed further.
            </Typography>
          </Box>
        </Box>
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
            Learn: Purchase Orders
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
