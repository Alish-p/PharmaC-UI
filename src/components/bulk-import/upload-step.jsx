import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

export function UploadStep({ onUpload, onDownloadTemplate }) {
  const theme = useTheme();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
  });

  return (
    <Stack spacing={5}>
      <Box
        {...getRootProps()}
        sx={{
          p: 5,
          outline: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
          border: (t) => `1px dashed ${alpha(t.palette.grey[500], 0.2)}`,
          transition: (t) => t.transitions.create(['opacity', 'padding']),
          '&:hover': {
            opacity: 0.72,
          },
          ...(isDragActive && {
            opacity: 0.72,
          }),
        }}
      >
        <input {...getInputProps()} />

        <Stack spacing={3} alignItems="center" justifyContent="center">
          <Iconify icon="eva:cloud-upload-fill" width={64} color={theme.palette.primary.main} />

          <Stack spacing={1} textAlign="center">
            <Typography variant="h6">Drop or Select file</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Drop files here or click to browse through your machine
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Stack direction="row" justifyContent="center">
        <Button
          onClick={onDownloadTemplate}
          variant="outlined"
          startIcon={<Iconify icon="eva:download-fill" />}
        >
          Download Template
        </Button>
      </Stack>
    </Stack>
  );
}
