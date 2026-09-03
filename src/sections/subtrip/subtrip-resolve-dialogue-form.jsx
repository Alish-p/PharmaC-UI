import { z as zod } from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

// form components
import { Form, Field } from 'src/components/hook-form';

import { useUpdateSubtripResolveInfo } from '../../query/use-subtrip';

const validationSchema = zod.object({
  remarks: zod.string().optional(),
});

const defaultValues = {
  remarks: '',
};

export function ResolveSubtripDialog({ showDialog, setShowDialog, subtripId }) {
  const resolveLR = useUpdateSubtripResolveInfo();

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const handleReset = () => {
    reset(defaultValues);
  };

  const onSubmit = async (data) => {
    try {
      await resolveLR({ id: subtripId, data });
      handleReset();
      setShowDialog(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!showDialog) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDialog]);

  return (
    <Dialog
      open={showDialog}
      onClose={() => setShowDialog(false)}
      fullWidth
      maxWidth={false}
      PaperProps={{ sx: { maxWidth: 720 } }}
    >
      <DialogTitle>Resolve Job</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: '6px' }}>
          <Form methods={methods} onSubmit={onSubmit}>
            <Field.Editor name="remarks" label="Remarks" fullItem sx={{ maxHeight: 480 }} />
          </Form>
        </Box>
      </DialogContent>
      <DialogActions>
        {' '}
        <Stack direction="row" spacing={1}>
          <Button type="reset" onClick={handleReset} variant="outlined" loading={isSubmitting}>
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Resolve
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
