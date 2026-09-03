import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Accordion from '@mui/material/Accordion';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function DriverLearn({ open, onClose }) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('overview');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const faqData = [
    {
      icon: 'solar:trash-bin-trash-bold',
      iconColor: theme.palette.error.main,
      question: 'What happens when I delete a driver?',
      answer: (
        <>
          Deleting a driver permanently removes their profile from the active list. However,
          historical data linked to completed trips may be retained for audit purposes. Use this
          action with caution.
        </>
      ),
    },
    {
      icon: 'solar:pause-circle-bold',
      iconColor: theme.palette.warning.main,
      question: "What does 'Inactive' status mean?",
      answer: (
        <>
          Setting a driver to Inactive means they cannot be assigned to new trips and will not
          appear in selection dropdowns. Their history and profile remain accessible for reference.
          Use this for drivers on leave or temporarily unavailable.
        </>
      ),
    },
    {
      icon: 'solar:wallet-money-bold',
      iconColor: theme.palette.success.main,
      question: 'How is salary calculated?',
      answer: (
        <>
          Salary calculations (Bata, Trip Salary, Extra Dues) depend on the driver&apos;s assigned
          trips. Ensure Bank Details are configured to process payroll deposits smoothly.
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
            <Iconify icon="solar:user-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              What is a Driver?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              A Driver represents an individual who operates vehicles in your fleet. Drivers are
              essential for trip dispatching, trip advance settlements, and salary processing.
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
            <Iconify icon="solar:card-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              License & Compliance Tracking
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Record driving license numbers, expiry dates, and identity documents to prevent
              non-compliant drivers from being dispatched on active trips.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          What a Driver Profile Contains
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[
            { icon: 'solar:user-bold', text: 'Full Name & Alias' },
            { icon: 'solar:phone-bold', text: 'Mobile Contact Number' },
            { icon: 'solar:card-bold', text: 'License No & Expiry' },
            { icon: 'solar:wallet-bold', text: 'Bank Account & IFSC' },
            { icon: 'solar:delivery-bold', text: 'Assigned Vehicle / Trips' },
            { icon: 'solar:wallet-money-bold', text: 'Driver Advances' },
            { icon: 'solar:calculator-bold', text: 'Salary & Payroll History' },
            { icon: 'solar:check-circle-bold', text: 'Active / Inactive Status' },
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

  const renderFieldsGuide = (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.16),
            color: 'success.main',
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="solar:checklist-bold" width={24} />
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Key Fields Reference
        </Typography>
      </Box>

      <Table
        size="small"
        sx={{
          '& .MuiTableCell-root': {
            borderBottom: `dashed 1px ${theme.palette.divider}`,
            px: 1.5,
            py: 1.5,
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontWeight: 700,
            color: 'text.primary',
            bgcolor: alpha(theme.palette.grey[500], 0.04),
            borderBottom: `solid 2px ${theme.palette.divider}`,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Field Name</TableCell>
            <TableCell align="center">Required?</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Driver Name</TableCell>
            <TableCell align="center">
              <Chip label="Required" color="error" size="small" sx={{ fontWeight: 600 }} />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Full legal name of the driver
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Cell No</TableCell>
            <TableCell align="center">
              <Chip label="Required" color="error" size="small" sx={{ fontWeight: 600 }} />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              10-digit primary mobile contact
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>License No</TableCell>
            <TableCell align="center">
              <Chip label="Optional" size="small" variant="outlined" />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Driving license registration number
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>License Expiry</TableCell>
            <TableCell align="center">
              <Chip label="Optional" size="small" variant="outlined" />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Expiration date for renewal alerts
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Bank Details</TableCell>
            <TableCell align="center">
              <Chip label="Optional" size="small" variant="outlined" />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Account number & IFSC for salary payments
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
    { value: 'fields', label: 'Key Fields', icon: <Iconify icon="solar:checklist-bold" width={16} /> },
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
            Learn: Drivers
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
          {currentTab === 'fields' && renderFieldsGuide}
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
