import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function InvoicePaymentTimeline({ payments = [] }) {
  return payments.length ? (
    <Timeline
      sx={{
        m: 0,
        p: 0,
        [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 },
      }}
    >
      {payments.map((payment, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color="success" />
            {index === payments.length - 1 ? null : <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="subtitle2" color="primary">
              {fCurrency(payment.amount)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {fDateTime(payment.paidAt)}
            </Typography>
            {payment.paidBy && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Payment Recorded by {payment.paidBy?.name || payment.paidBy}
              </Typography>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  ) : (
    <Typography variant="body2" sx={{ p: 1, color: 'text.secondary' }}>
      No payments recorded yet
    </Typography>
  );
}
