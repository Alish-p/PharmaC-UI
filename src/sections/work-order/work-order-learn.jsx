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

export default function WorkOrderLearn({ open, onClose }) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState('overview');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const faqData = [
    {
      icon: 'solar:user-plus-bold',
      iconColor: theme.palette.info.main,
      question: 'Who can generate a work order?',
      answer: (
        <>
          Any user with the appropriate permissions can create a work order. Typically, fleet
          managers, workshop supervisors, or admin users generate work orders when a vehicle needs
          maintenance.
          <br />
          <br />
          The system records <b>who created</b> and <b>who closed</b> each work order for full audit
          trail accountability.
        </>
      ),
    },
    {
      icon: 'solar:users-group-rounded-bold',
      iconColor: theme.palette.primary.main,
      question: 'Can we assign issues to multiple assignees?',
      answer: (
        <>
          <b>Yes.</b> Each issue within a work order can have <b>multiple assignees</b>. This is
          useful when different technicians or mechanics work on different aspects of the same issue
          — e.g. one handles the electrical diagnosis while another handles the physical repair.
          <br />
          <br />
          You can also have <b>multiple issues</b> in a single work order, each with their own
          separate set of assignees.
        </>
      ),
    },
    {
      icon: 'solar:box-bold',
      iconColor: theme.palette.success.main,
      question: 'How does closing a work order impact inventory?',
      answer: (
        <>
          When you <b>close</b> a work order (mark as Completed), the system automatically{' '}
          <b>deducts</b> the quantity of each part used from your inventory at the specified part
          location.
          <br />
          <br />
          For example, if you used 2 units of &quot;Brake Pad&quot; from the &quot;Main
          Warehouse&quot;, closing the work order will reduce the stock of Brake Pads at Main
          Warehouse by 2.
          <br />
          <br />
          <b>Important:</b> Inventory is only adjusted when the work order is
          <b> closed</b>, not when parts are added to the work order. This means you can freely add
          or remove parts while the work order is still Open or In Progress without affecting stock
          levels.
        </>
      ),
    },
    {
      icon: 'solar:cart-plus-bold',
      iconColor: theme.palette.warning.main,
      question: 'What if I use a part not from inventory (ad-hoc item)?',
      answer: (
        <>
          You can add <b>custom/ad-hoc items</b> directly on the work order without selecting from
          your parts inventory. When adding a part, you can type in a custom name instead of
          selecting an existing inventory part.
          <br />
          <br />
          These ad-hoc items will <b>not</b> deduct from inventory when the work order is closed,
          since they are not linked to any inventory part. However, their cost is still included in
          the <b>total cost calculation</b> of the work order.
          <br />
          <br />
          This is useful for locally procured parts, consumables purchased on the spot, or services
          from external vendors that don&apos;t exist in your parts catalog.
        </>
      ),
    },
    {
      icon: 'solar:folder-open-bold',
      iconColor: theme.palette.secondary.main,
      question: 'What are categories?',
      answer: (
        <>
          Categories help you classify the <b>type of maintenance</b> being performed. The available
          categories are:
          <br />
          <br />• <b>Inspection</b> — Routine check-ups and assessments
          <br />• <b>Preventive Maintenance</b> — Scheduled servicing to prevent failures
          <br />• <b>Garage Work</b> — Repairs done at the garage/workshop
          <br />• <b>On Road Breakdown</b> — Repairs for vehicles that broke down in transit
          <br />• <b>On Route Maintenance</b> — Minor fixes done while the vehicle is on a route
          <br />• <b>Accidental Vehicle</b> — Repairs after an accident/collision
          <br />• <b>Breakdown</b> — General vehicle breakdowns
          <br />• <b>Damage</b> — Repair of damaged components
          <br />• <b>Upgrade</b> — Installing new features or upgrades
          <br />• <b>External Workshop</b> — Work done at a third-party workshop
          <br />• <b>Others</b> — Any maintenance that doesn&apos;t fit the above
          <br />
          <br />
          You can also type a <b>custom category</b> if none of the predefined options fit your
          needs.
        </>
      ),
    },
    {
      icon: 'solar:flag-bold',
      iconColor: theme.palette.error.main,
      question: 'What are priorities?',
      answer: (
        <>
          Priority determines how urgently the work order should be addressed:
          <br />
          <br />• <b>Scheduled</b> — For planned, non-urgent tasks like periodic servicing or
          preventive maintenance. These can wait for the next available slot.
          <br />• <b>Non Scheduled</b> — For unplanned but non-critical issues like a minor oil leak
          or squeaky brakes. Should be attended to soon but doesn&apos;t halt operations.
          <br />• <b>Emergency</b> — For critical failures that require immediate attention, such as
          brake failure, engine overheating, or on-road breakdowns. The vehicle should not operate
          until resolved.
        </>
      ),
    },
    {
      icon: 'solar:info-circle-bold',
      iconColor: theme.palette.info.main,
      question: 'What are the different statuses and what do they mean?',
      answer: (
        <>
          • <b>Open</b> — The work order has been created but work hasn&apos;t started. You can
          freely edit everything.
          <br />• <b>In Progress</b> — Work is actively in progress. The vehicle is being serviced. You
          can still make changes at this stage.
          <br />• <b>Completed</b> — The work order is finalized. Inventory has been adjusted, costs
          are locked in, and the work order is effectively closed.
          <br />
          <br />
          The status progression is typically: <code>Open → In Progress → Completed</code>, but you can
          move directly from <code>Open → Completed</code> for quick repairs.
        </>
      ),
    },
    {
      icon: 'solar:trash-bin-trash-bold',
      iconColor: theme.palette.error.main,
      question: 'Can I delete a work order?',
      answer: (
        <>
          <b>Yes</b>, you can delete a work order from the list view. However, please note:
          <br />
          <br />• If the work order is <b>Open</b> or <b>In Progress</b>, it can be deleted safely since
          inventory has not been adjusted yet.
          <br />• If the work order has been <b>Completed</b>, deleting it will <b>not reverse</b>{' '}
          the inventory deductions or expenses that were already recorded. Use deletion with caution
          for completed work orders.
          <br />
          <br />
          <b>Best practice:</b> If you need to void a completed work order, contact your admin to
          manually adjust the inventory rather than simply deleting the record.
        </>
      ),
    },
    {
      icon: 'solar:pen-bold',
      iconColor: theme.palette.warning.main,
      question: 'Can I edit a work order after creating it?',
      answer: (
        <>
          <b>Yes</b>, you can edit a work order at any time while it is <b>Open</b> or{' '}
          <b>In Progress</b>. You can change the vehicle, add/remove issues and assignees, modify parts
          and quantities, update the category, priority, dates, odometer reading, and description.
          <br />
          <br />
          Once a work order is <b>Completed</b>, editing is still possible, but be cautious —
          inventory has already been adjusted based on the parts listed at the time of closing. If
          you need to correct a completed work order, it&apos;s recommended to create a new
          corrective work order.
        </>
      ),
    },
    {
      icon: 'solar:calculator-bold',
      iconColor: theme.palette.success.main,
      question: 'How is the total cost calculated?',
      answer: (
        <>
          The work order total cost is the sum of:
          <br />
          <br />
          1. <b>Parts Cost</b> — For each part line: <code>Quantity × Price</code>. All part line
          amounts are summed together.
          <br />
          2. <b>Labour Charge</b> — A single flat amount entered for the overall labour/service
          charge.
          <br />
          <br />
          Final equation:
          <br />
          <code>Total Cost = Parts Cost + Labour Charge</code>
          <br />
          <br />
          The part price defaults to the <b>average unit cost</b> from your inventory but can be
          overridden manually for each line item.
        </>
      ),
    },
    {
      icon: 'solar:wallet-money-bold',
      iconColor: theme.palette.primary.main,
      question: 'What happens when I select "Close & Add as Vehicle Expense"?',
      answer: (
        <>
          When closing a work order, you have two options:
          <br />
          <br />
          1. <b>Close Only</b> — Simply marks the work order as Completed and adjusts inventory. No
          expense record is created.
          <br />
          2. <b>Close &amp; Add as Vehicle Expense</b> — In addition to closing and adjusting
          inventory, the system automatically creates a <b>vehicle expense</b> record for the total
          cost amount. This expense appears in the vehicle&apos;s expense history and is included in
          cost analytics.
          <br />
          <br />
          Choose option 2 when you want the maintenance cost to be tracked in the vehicle&apos;s
          overall cost of ownership and expense reports.
        </>
      ),
    },
    {
      icon: 'solar:speedometer-bold',
      iconColor: theme.palette.info.dark,
      question: 'What is the odometer reading used for?',
      answer: (
        <>
          The odometer reading captures the vehicle&apos;s <b>current mileage</b> at the time of
          service. This is useful for:
          <br />
          <br />• Tracking <b>maintenance intervals</b> (e.g. oil change every 10,000 km)
          <br />
          • Comparing part wear against distance travelled
          <br />• Generating accurate <b>cost-per-km</b> reports
          <br />
          <br />
          If the vehicle has a GPS tracker connected, the odometer reading is <b>
            auto-filled
          </b>{' '}
          from the GPS total odometer value, but you can override it manually if needed.
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
              What is a Work Order?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              A Work Order is an internal maintenance document used to track repair, inspection, or
              servicing tasks for a vehicle. It captures the reported issues, the parts consumed,
              labour charges, and the overall cost of maintenance.
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
              How are Work Order Numbers generated?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              The system auto-generates work order numbers incrementally. Each work order receives a
              unique sequential number (e.g. <code>WO-0001</code>, <code>WO-0002</code>) so you can
              easily reference them.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          What does a work order contain?
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {[
            { icon: 'solar:file-check-bold', text: 'Vehicle Link' },
            { icon: 'solar:users-group-rounded-bold', text: 'Issues & Assignees' },
            { icon: 'solar:box-bold', text: 'Parts Used & Cost' },
            { icon: 'solar:calculator-bold', text: 'Labour Charges' },
            { icon: 'solar:folder-open-bold', text: 'Category' },
            { icon: 'solar:flag-bold', text: 'Priority Level' },
            { icon: 'solar:calendar-bold', text: 'Scheduled Dates' },
            { icon: 'solar:speedometer-bold', text: 'Odometer Reading' },
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
            Work Order Statuses Explained
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Track the lifecycle of your work orders through three main stages:
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
            left: '16.6%',
            right: '16.6%',
            height: '2px',
            bgcolor: alpha(theme.palette.grey[500], 0.2),
            zIndex: 1,
          }}
        />

        {[
          {
            key: 'open',
            label: 'Open',
            color: 'info',
            icon: 'solar:file-check-bold',
            desc: 'Created & awaiting action. No work started. Freely edit details.',
          },
          {
            key: 'inprogress',
            label: 'In Progress',
            color: 'warning',
            icon: 'solar:clock-circle-bold',
            desc: 'Active maintenance. Vehicle being serviced. Can still edit.',
          },
          {
            key: 'completed',
            label: 'Completed',
            color: 'success',
            icon: 'solar:check-circle-bold',
            desc: 'Closed & finalized. Inventory adjusted. Costs locked.',
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
                  fontSize: '11.5px',
                  lineHeight: 1.5,
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
    </Card>
  );

  const renderPriorityGuide = (
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
          <Iconify icon="solar:flag-bold" width={24} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Priority Levels
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Set the urgency of maintenance tasks using these options:
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
        {[
          {
            value: 'scheduled',
            color: 'info',
            label: 'Scheduled',
            description: 'Planned maintenance (preventive servicing, tyre rotation) scheduled in advance.',
          },
          {
            value: 'non-scheduled',
            color: 'default',
            label: 'Non Scheduled',
            description: 'Unplanned repairs for minor issues and inspections arising from wear and tear.',
          },
          {
            value: 'emergency',
            color: 'error',
            label: 'Emergency',
            description: 'Critical, time-sensitive repairs (breakdowns, brake/engine failures) needing immediate attention.',
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
    { value: 'priorities', label: 'Priorities', icon: <Iconify icon="solar:flag-bold" width={16} /> },
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
            Learn: Work Orders
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
          {currentTab === 'priorities' && renderPriorityGuide}
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
