import { saveAs } from 'file-saver';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BlobProvider } from '@react-pdf/renderer';

import { Button, CircularProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export default function PdfDownloadButton({
  getDocument,
  fileName = 'report.pdf',
  buttonText = 'PDF',
}) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);

    const DocComponent = await getDocument();
    const doc = <DocComponent />;

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const blob = await new Promise((resolve) => {
      root.render(
        <BlobProvider document={doc}>
          {({ blob: generatedBlob }) => {
            if (generatedBlob) {
              resolve(generatedBlob);
              root.unmount();
              container.remove();
            }
            return null;
          }}
        </BlobProvider>
      );
    });

    saveAs(blob, fileName);
    setGenerating(false);
  };

  return (
    <Button
      variant="outlined"
      size="small"
      color="primary"
      onClick={handleDownload}
      startIcon={generating ? <CircularProgress size={16} /> : <Iconify icon="eva:download-fill" />}
      disabled={generating}
    >
      {generating ? 'Generating...' : buttonText}
    </Button>
  );
}
