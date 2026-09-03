import { toast } from 'sonner';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Divider, CardHeader, Typography, CircularProgress } from '@mui/material';

import { getTenantLogoUrl } from 'src/utils/tenant-branding';

import { saveTenantLogo, getTenantLogoUploadUrl } from 'src/query/use-tenant';

import { UploadAvatar } from 'src/components/upload';

import { useAuthContext } from 'src/auth/hooks';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

function getExtension(file) {
  const fromName = file?.name?.split('.')?.pop()?.toLowerCase();
  if (fromName) return fromName;
  // fallback from content-type
  if (!file?.type) return '';
  const map = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  return map[file.type] || '';
}

export default function TenantLogoCard({ tenant }) {
  const queryClient = useQueryClient();
  const { checkUserSession } = useAuthContext();

  const [isUploading, setUploading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [localFile, setLocalFile] = useState(null);

  const hasRealLogo = !!tenant?.logoUrl;
  const currentLogoUrl = getTenantLogoUrl(tenant, { fallback: false });

  const doUpload = async (file) => {
    try {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error('Invalid file type. Allowed: PNG, JPG, WEBP, SVG');
        return;
      }
      const extension = getExtension(file);
      if (!extension) {
        toast.error('Could not detect file extension');
        return;
      }

      setUploading(true);
      const { key, uploadUrl } = await getTenantLogoUploadUrl({
        contentType: file.type,
        extension,
      });

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!res.ok) {
        throw new Error('Upload failed');
      }

      setSaving(true);
      const updatedTenant = await saveTenantLogo({ fileKey: key });

      // Update cache and auth context for immediate UI reflection
      queryClient.setQueryData(['tenant'], updatedTenant);
      queryClient.invalidateQueries(['tenant']);
      checkUserSession?.();
      toast.success('Logo updated');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Logo upload failed');
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const handleDrop = async (acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;
    setLocalFile(file);
    await doUpload(file);
    setLocalFile(null);
  };

  const handleRemove = async () => {
    try {
      setSaving(true);
      const updatedTenant = await saveTenantLogo({ fileKey: null });
      queryClient.setQueryData(['tenant'], updatedTenant);
      queryClient.invalidateQueries(['tenant']);
      checkUserSession?.();
      toast.success('Logo removed');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Failed to remove logo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Branding" subheader="Upload your company logo" sx={{ mb: 1 }} />
      <Divider />
      <Stack spacing={2} alignItems="flex-start" sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <UploadAvatar
              value={localFile || (hasRealLogo ? currentLogoUrl : null)}
              onDrop={handleDrop}
              disabled={isUploading || isSaving}
              accept={{
                'image/png': [],
                'image/jpeg': [],
                'image/webp': [],
                'image/svg+xml': [],
              }}
              fallback={
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {(tenant?.name?.trim?.()?.[0] || '?').toUpperCase()}
                </Typography>
              }
              sx={{ width: 124, height: 124 }}
            />

            {(isUploading || isSaving) && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.6)',
                  borderRadius: '50%',
                }}
              >
                <CircularProgress size={28} thickness={5} />
              </Box>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          {hasRealLogo && (
            <LoadingButton color="error" variant="soft" onClick={handleRemove} loading={isSaving}>
              Remove
            </LoadingButton>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
