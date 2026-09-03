import React from 'react';
import { toast } from 'sonner';

import Link from '@mui/material/Link';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axios from 'src/utils/axios';
import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { getStatusMeta, getExpiryStatus } from '../utils/document-utils';

function AttachmentDownloadLink({ row }) {
  const [loading, setLoading] = React.useState(false);
  const fileName = React.useMemo(() => {
    const path = row?.fileKey || row?.fileUrl || '';
    if (!path) return '';
    const clean = path.split('#')[0].split('?')[0];
    try {
      return decodeURIComponent(clean.split('/').pop()) || 'Download file';
    } catch (e) {
      return clean.split('/').pop() || 'Download file';
    }
  }, [row]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    const vehicleId = row?.vehicleId || row?.vehicle?._id || (typeof row?.vehicle === 'string' ? row.vehicle : null);
    const docId = row?._id;

    if (!row?.fileKey && !row?.fileUrl) {
      toast.error('No attachment available');
      return;
    }

    if (!vehicleId || !docId) {
      if (row?.fileUrl) {
        window.open(row.fileUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`/api/documents/${vehicleId}/${docId}/download`);
      const downloadUrl = data?.url || row?.fileUrl;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('No download link found');
      }
    } catch (err) {
      if (row?.fileUrl) {
        window.open(row.fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Failed to get download link');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      component="button"
      onClick={handleDownload}
      disabled={loading}
      variant="body2"
      sx={{
        color: 'primary.main',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
        cursor: 'pointer',
        textAlign: 'center',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        maxWidth: 280,
        minWidth: 150,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={14} sx={{ mr: 0.5 }} />
          Loading...
        </>
      ) : (
        <>
          <Iconify icon="eva:file-text-outline" width={16} sx={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileName}
          </span>
        </>
      )}
    </Link>
  );
}

export const TABLE_COLUMNS = [
  {
    id: 'vehicle',
    label: 'Vehicle',
    defaultVisible: true,
    disabled: true,
    getter: (row) => row?.vehicle?.vehicleNo || row?.vehicleNo || '-',
    render: (row) => {
      const id = row?.vehicle?._id || row?.vehicleId || row?._id;
      const vehicleNo = row?.vehicle?.vehicleNo || row?.vehicleNo || '-';
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ListItemText
            disableTypography
            primary={
              <Link
                component={RouterLink}
                to={id ? paths.dashboard.vehicle.details(id) : '#'}
                variant="body2"
                noWrap
                sx={{
                  color: id ? 'primary.main' : 'text.primary',
                  pointerEvents: id ? 'auto' : 'none',
                }}
              >
                {vehicleNo}
              </Link>
            }
          />
        </div>
      );
    },
  },
  {
    id: 'docType',
    label: 'Type',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row?.docType || '-',
    render: (row) => (
      <Label variant="soft" color="info" sx={{ textTransform: 'capitalize' }}>
        {row?.docType || '-'}
      </Label>
    ),
  },
  {
    id: 'docNumber',
    label: 'Number',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row?.docNumber || '-',
  },
  {
    id: 'issuer',
    label: 'Issuer',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row?.issuer || '-',
  },
  {
    id: 'issueDate',
    label: 'Issue Date',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    sortable: true,
    getter: (row) => row?.issueDate || '-',
    render: (row) => (
      <ListItemText
        primary={row?.issueDate ? fDate(new Date(row.issueDate)) : '-'}
        secondary={row?.issueDate ? fTime(new Date(row.issueDate)) : ''}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
      />
    ),
  },
  {
    id: 'expiryDate',
    label: 'Expiry Date',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => row?.expiryDate || '-',
    sortable: true,
    render: (row) => (
      <ListItemText
        primary={row?.expiryDate ? fDate(new Date(row.expiryDate)) : '-'}
        secondary={row?.expiryDate ? fTime(new Date(row.expiryDate)) : ''}
        primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
      />
    ),
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => getExpiryStatus(row?.expiryDate) || (row?.status === 'missing' || row?.missing ? 'Missing' : '-') || '-',
    render: (row) => {
      const status = getExpiryStatus(row?.expiryDate) || (row?.status === 'missing' || row?.missing ? 'Missing' : null);
      const meta = status ? getStatusMeta(status) : null;
      if (!meta) return '-';
      return (
        <Label variant="soft" color={meta.color} startIcon={undefined}>
          {status}
        </Label>
      );
    },
  },
  {
    id: 'attachment',
    label: 'Attachment',
    defaultVisible: true,
    disabled: false,
    align: 'center',
    getter: (row) => (row?.fileKey || row?.fileUrl ? 'Yes' : 'No'),
    render: (row) => {
      if (!row?.fileKey && !row?.fileUrl) return '-';
      return <AttachmentDownloadLink row={row} />;
    },
  },
  {
    id: 'createdBy',
    label: 'Created By',
    defaultVisible: false,
    disabled: false,
    align: 'center',
    getter: (row) => row?.createdBy?.name || row?.createdByName || '-',
  },
];
