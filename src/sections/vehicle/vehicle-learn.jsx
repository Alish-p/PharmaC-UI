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

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function VehicleLearn({ open, onClose }) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('overview');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const faqData = [
    {
      icon: 'solar:pause-circle-bold',
      iconColor: theme.palette.warning.main,
      question: 'What happens when I mark a vehicle as Inactive?',
      answer: (
        <>
          An inactive vehicle is <b>hidden from all creation forms</b> — you cannot create new Jobs,
          Trips, Expenses, Work Orders, or mount new Tyres on it. Historical data (past trips,
          expenses, reports) remains fully accessible for viewing and filtering in list views. Think
          of it as &quot;retired but not deleted&quot;.
        </>
      ),
    },
    {
      icon: 'solar:restart-bold',
      iconColor: theme.palette.info.main,
      question: 'What about tyres already mounted on an inactive vehicle?',
      answer: (
        <>
          Existing tyres stay mounted — they are <b>not</b> automatically unmounted. No new tyres
          can be assigned, but current assignments are preserved. To reuse those tyres, reactivate
          the vehicle first, unmount the tyres, then deactivate again.
        </>
      ),
    },
    {
      icon: 'solar:delivery-bold',
      iconColor: theme.palette.success.main,
      question: 'What is the difference between Own and Market vehicles?',
      answer: (
        <>
          <b>Own</b> vehicles belong to your company — trips create driver advances, fuel tracking,
          vehicle expenses, and salary entries. <b>Market</b> vehicles belong to an external
          transporter — trips create transporter payments instead. Expenses, work orders, and tyre
          management are available only for own vehicles.
        </>
      ),
    },
    {
      icon: 'solar:refresh-circle-bold',
      iconColor: theme.palette.primary.main,
      question: 'Can I reactivate an inactive vehicle?',
      answer: (
        <>
          Yes. Go to the vehicle&apos;s detail page and toggle the Active status back on. Once
          reactivated, the vehicle will immediately appear in all creation dropdowns.
        </>
      ),
    },
    {
      icon: 'solar:trash-bin-trash-bold',
      iconColor: theme.palette.error.main,
      question: 'Should I delete or deactivate a vehicle?',
      answer: (
        <>
          <b>Always prefer deactivating</b> over deleting. Deactivating keeps all historical records
          (trips, P&L, expenses) intact and searchable. Deleting permanently removes the vehicle and
          may orphan linked trip records.
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
              What is a Vehicle?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              A Vehicle represents a truck, tractor, or trailer in your fleet. Vehicles are linked to
              trips, jobs, fuel, maintenance work orders, and tyre layout assignments.
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
            <Iconify icon="solar:shield-check-bold" width={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Fleet Ownership Models
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Vehicles are classified as either <b>Own</b> (internal fleet) or <b>Market</b>{' '}
              (third-party hired trucks), determining how expenses and trip settlements are tracked.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Key Vehicle Properties
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[
            { icon: 'solar:delivery-bold', text: 'Vehicle Registration No' },
            { icon: 'solar:box-bold', text: 'Vehicle Category / Type' },
            { icon: 'solar:user-bold', text: 'Ownership (Own / Market)' },
            { icon: 'solar:settings-bold', text: 'Tyre Count & Layout' },
            { icon: 'solar:speedometer-bold', text: 'Odometer Mileage' },
            { icon: 'solar:document-text-bold', text: 'Chassis & Engine No' },
            { icon: 'solar:wrench-bold', text: 'Work Order History' },
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
            <TableCell sx={{ fontWeight: 600 }}>Vehicle No</TableCell>
            <TableCell align="center">
              <Chip label="Required" color="error" size="small" sx={{ fontWeight: 600 }} />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Unique registration / plate number
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Vehicle Type</TableCell>
            <TableCell align="center">
              <Chip label="Required" color="error" size="small" sx={{ fontWeight: 600 }} />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Category (e.g. Trailer, Tanker, Tipper)
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>No of Tyres</TableCell>
            <TableCell align="center">
              <Chip label="Required" color="error" size="small" sx={{ fontWeight: 600 }} />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Total tyre count for axle layout mapping
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Own / Market</TableCell>
            <TableCell align="center">
              <Chip label="Required" color="error" size="small" sx={{ fontWeight: 600 }} />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Own = internal fleet. Market = third-party vehicle
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Chassis / Engine</TableCell>
            <TableCell align="center">
              <Chip label="Optional" size="small" variant="outlined" />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>
              Vehicle serial identification numbers
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );

  const renderOwnershipGuide = (
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
          <Iconify icon="solar:user-bold" width={24} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Own vs Market Vehicles
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Comparison of vehicle ownership types in Tranzit:
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
        {[
          {
            color: 'info',
            label: 'Own Vehicles',
            description: 'Operated directly by your fleet. Tracks driver advances, fuel receipts, maintenance work orders, tyre mounting, and actual trip expenses.',
          },
          {
            color: 'primary',
            label: 'Market Vehicles',
            description: 'Outsourced from external transporters. Billed via Transporter Payment Receipts. Maintenance, tyre tracking, and driver salary tools are bypassed.',
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
    { value: 'fields', label: 'Key Fields', icon: <Iconify icon="solar:checklist-bold" width={16} /> },
    { value: 'ownership', label: 'Ownership', icon: <Iconify icon="solar:user-bold" width={16} /> },
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
            Learn: Vehicles
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
          {currentTab === 'ownership' && renderOwnershipGuide}
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
