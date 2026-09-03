import { useDropzone } from 'react-dropzone';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { useUpdateTransporter, getTransporterDocumentUploadUrl } from 'src/query/use-transporter';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ---------------------------------------------------------------------------

const MAX_FILES = 5;
const MAX_SIZE_BYTES = 3145728; // 3 MB

function getFileIcon(url) {
  const ext = url?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'solar:gallery-bold';
  if (ext === 'pdf') return 'solar:file-text-bold';
  return 'solar:file-bold';
}

function getFileLabel(url) {
  if (!url) return 'Document';
  const parts = url.split('/');
  const filename = parts[parts.length - 1] || 'Document';
  // Try to extract a readable name from the S3 key pattern
  const match = filename.match(/transporter_\d+_\d+\.(\w+)$/);
  if (match) return `Document.${match[1]}`;
  return filename.length > 30 ? `${filename.slice(0, 27)}...` : filename;
}

function isImageUrl(url) {
  const ext = url?.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

// ---------------------------------------------------------------------------

function DocumentCard({ url, index, onDelete, isDeleting }) {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1.5,
        overflow: 'hidden',
        border: (theme) => `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
        bgcolor: 'background.neutral',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows?.z8 || '0 8px 16px 0 rgba(0,0,0,0.1)',
        },
        '&:hover .doc-actions': { opacity: 1 },
      }}
    >
      {/* Thumbnail / Icon area */}
      <Box
        sx={{
          height: 88,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          overflow: 'hidden',
        }}
      >
        {isImageUrl(url) ? (
          <Box
            component="img"
            src={url}
            alt={`Document ${index + 1}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Iconify
            icon={getFileIcon(url)}
            width={36}
            sx={{ color: url?.endsWith('.pdf') ? 'error.main' : 'primary.main', opacity: 0.8 }}
          />
        )}
      </Box>

      {/* File info */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          px: 1,
          py: 0.75,
          borderTop: (theme) =>
            `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'text.secondary',
          }}
        >
          {getFileLabel(url)}
        </Typography>
      </Stack>

      {/* Action buttons overlay */}
      <Box
        className="doc-actions"
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
      >
        <Tooltip title="View">
          <IconButton
            size="small"
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              width: 22,
              height: 22,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'primary.lighter', color: 'primary.main' },
            }}
          >
            <Iconify icon="solar:eye-bold" width={12} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Download">
          <IconButton
            size="small"
            component="a"
            href={url}
            download
            sx={{
              width: 22,
              height: 22,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'info.lighter', color: 'info.main' },
            }}
          >
            <Iconify icon="solar:download-minimalistic-bold" width={12} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => onDelete(url)}
            disabled={isDeleting}
            sx={{
              width: 22,
              height: 22,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'error.lighter', color: 'error.main' },
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={12} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------

function AddMoreDropzone({ onDrop, disabled }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        height: 88,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        borderRadius: 1.5,
        border: (theme) =>
          `dashed 1px ${
            isDragActive
              ? theme.vars.palette.primary.main
              : varAlpha(theme.vars.palette.grey['500Channel'], 0.32)
          }`,
        bgcolor: (theme) =>
          isDragActive
            ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
            : varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.48 : 1,
        transition: 'all 0.2s',
        '&:hover': disabled
          ? {}
          : {
              bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.06),
              borderColor: 'primary.main',
            },
      }}
    >
      <input {...getInputProps()} />
      <Iconify
        icon="solar:cloud-upload-bold"
        width={28}
        sx={{ color: isDragActive ? 'primary.main' : 'text.disabled' }}
      />
      <Typography variant="caption" color={isDragActive ? 'primary.main' : 'text.disabled'}>
        {isDragActive ? 'Drop here' : 'Add files'}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------

function EmptyDropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        py: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        borderRadius: 2,
        border: (theme) =>
          `dashed 1.5px ${
            isDragActive
              ? theme.vars.palette.primary.main
              : varAlpha(theme.vars.palette.grey['500Channel'], 0.24)
          }`,
        bgcolor: (theme) =>
          isDragActive
            ? varAlpha(theme.vars.palette.primary.mainChannel, 0.06)
            : varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
        cursor: 'pointer',
        transition: 'all 0.25s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
        },
      }}
    >
      <input {...getInputProps()} />
      <Box
        sx={{
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: (theme) =>
            isDragActive
              ? varAlpha(theme.vars.palette.primary.mainChannel, 0.16)
              : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        }}
      >
        <Iconify
          icon="solar:cloud-upload-bold"
          width={28}
          sx={{ color: isDragActive ? 'primary.main' : 'text.disabled' }}
        />
      </Box>

      <Stack alignItems="center" spacing={0.5}>
        <Typography variant="subtitle2" color={isDragActive ? 'primary.main' : 'text.primary'}>
          {isDragActive ? 'Drop files here' : 'Upload Documents'}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Drop files or click to browse · PDF or Images · Max 5 files · 3 MB each
        </Typography>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------

export function TransporterDocumentsWidget({ transporter }) {
  const { _id, docs: savedDocs } = transporter || {};
  const updateTransporter = useUpdateTransporter();

  // Local state for pending (staged) new file objects
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Saved docs = already-uploaded URLs from the transporter record
  const savedUrls = useMemo(() => savedDocs || [], [savedDocs]);
  const totalCount = savedUrls.length + pendingFiles.length;
  const canAddMore = totalCount < MAX_FILES;

  // Clear pending files when transporter changes or docs refresh
  useEffect(() => {
    setPendingFiles([]);
  }, [savedDocs]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      const remaining = MAX_FILES - totalCount;
      if (newFiles.length > remaining) {
        toast.error(`Only ${remaining} more file(s) can be added (max ${MAX_FILES})`);
      }
      setPendingFiles((prev) => [...prev, ...newFiles.slice(0, remaining)]);
    },
    [totalCount]
  );

  const handleRemovePending = useCallback((file) => {
    URL.revokeObjectURL(file.preview);
    setPendingFiles((prev) => prev.filter((f) => f !== file));
  }, []);

  const handleDeleteSaved = useCallback(
    async (url) => {
      try {
        setIsDeleting(true);
        const newDocs = savedUrls.filter((u) => u !== url);
        await updateTransporter({ id: _id, data: { docs: newDocs } });
      } catch (err) {
        console.error({ err }, 'Failed to delete document');
        toast.error('Failed to delete document');
      } finally {
        setIsDeleting(false);
      }
    },
    [_id, savedUrls, updateTransporter]
  );

  const handleUploadPending = async () => {
    if (!pendingFiles.length) return;
    try {
      setIsUploading(true);
      const uploadedUrls = await Promise.all(
        pendingFiles.map(async (file) => {
          const fileExtension = file.name.split('.').pop() || 'pdf';
          const contentType = file.type || 'application/pdf';
          const resUrl = await getTransporterDocumentUploadUrl({ contentType, fileExtension });
          const res = await fetch(resUrl.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': contentType },
            body: file,
          });
          if (!res.ok) throw new Error('Upload failed');
          return resUrl.publicUrl;
        })
      );

      const newDocs = [...savedUrls, ...uploadedUrls];
      await updateTransporter({ id: _id, data: { docs: newDocs } });
      setPendingFiles([]);
    } catch (err) {
      console.error({ err }, 'Failed to upload documents');
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const hasDocs = savedUrls.length > 0 || pendingFiles.length > 0;

  return (
    <Card>
      <CardHeader
        title="Documents"
        avatar={<Iconify icon="solar:document-bold" color="primary.main" width={24} />}
        sx={{
          '& .MuiCardHeader-avatar': { mr: 1 },
          '& .MuiCardHeader-title': { fontWeight: 'fontWeightBold' },
        }}
        action={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={`${savedUrls.length} / ${MAX_FILES}`}
              size="small"
              variant="soft"
              color={savedUrls.length >= MAX_FILES ? 'error' : 'default'}
            />
            {pendingFiles.length > 0 && (
              <LoadingButton
                size="small"
                variant="contained"
                loading={isUploading}
                onClick={handleUploadPending}
                startIcon={<Iconify icon="solar:cloud-upload-bold" width={16} />}
              >
                Upload {pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''}
              </LoadingButton>
            )}
          </Stack>
        }
      />

      {isUploading && <LinearProgress color="primary" sx={{ mx: 3 }} />}

      <Box sx={{ p: 3 }}>
        {!hasDocs ? (
          <EmptyDropzone onDrop={handleDrop} />
        ) : (
          <Grid container spacing={1.5}>
            {/* Saved document cards */}
            {savedUrls.map((url, index) => (
              <Grid key={url} item xs={12 / 3} sm={12 / 4} md={12 / 5}>
                <DocumentCard
                  url={url}
                  index={index}
                  onDelete={handleDeleteSaved}
                  isDeleting={isDeleting}
                />
              </Grid>
            ))}

            {/* Pending (staged) file cards */}
            {pendingFiles.map((file, index) => (
              <Grid key={file.name + index} item xs={12 / 3} sm={12 / 4} md={12 / 5}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: (theme) =>
                      `1px dashed ${varAlpha(theme.vars.palette.warning.mainChannel, 0.6)}`,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.04),
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    sx={{
                      height: 88,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {file.type?.startsWith('image/') ? (
                      <Box
                        component="img"
                        src={file.preview}
                        alt={file.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Iconify
                        icon="solar:file-text-bold"
                        width={32}
                        sx={{ color: 'warning.main', opacity: 0.8 }}
                      />
                    )}
                  </Box>

                  {/* Label */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      px: 1,
                      py: 0.75,
                      borderTop: (theme) =>
                        `1px solid ${varAlpha(theme.vars.palette.warning.mainChannel, 0.12)}`,
                    }}
                  >
                    <Chip
                      label="Pending"
                      size="small"
                      color="warning"
                      variant="soft"
                      sx={{ height: 18, fontSize: 10 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        flex: 1,
                        ml: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'text.secondary',
                      }}
                    >
                      {file.name.length > 16 ? `${file.name.slice(0, 13)}...` : file.name}
                    </Typography>
                  </Stack>

                  {/* Remove pending */}
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePending(file)}
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'error.lighter', color: 'error.main' },
                      }}
                    >
                      <Iconify icon="solar:close-circle-bold" width={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            ))}

            {/* Add more dropzone tile */}
            {canAddMore && (
              <Grid item xs={12 / 3} sm={12 / 4} md={12 / 5}>
                <AddMoreDropzone onDrop={handleDrop} disabled={!canAddMore} />
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Card>
  );
}

export default TransporterDocumentsWidget;
