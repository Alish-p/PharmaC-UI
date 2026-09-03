import { useState } from 'react';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { useAddActivity } from 'src/query/use-task';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentInput({ taskId }) {
  const { user } = useAuthContext();
  const [comment, setComment] = useState('');
  const addActivity = useAddActivity();

  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      await addActivity({
        taskId,
        activity: { action: 'comment', message: comment.trim() },
      });
      setComment('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleComment();
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={{ py: 3, px: 2.5 }}>
      <Avatar src={user?.photoURL} alt={user?.displayName}>
        {user?.displayName?.charAt(0).toUpperCase()}
      </Avatar>

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
        <InputBase
          fullWidth
          multiline
          rows={2}
          placeholder="Type a message"
          sx={{ px: 1 }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Stack direction="row" alignItems="center">
          <Stack direction="row" flexGrow={1}>
            <IconButton>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>

            <IconButton>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
          </Stack>

          <Button variant="contained" onClick={handleComment} disabled={!comment.trim()}>
            Comment
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
