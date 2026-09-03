import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import { Image } from 'src/components/image';
import { Lightbox, useLightBox } from 'src/components/lightbox';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentList({ activities }) {
  console.log({ activities });
  const slides = activities
    .filter((activity) => activity?.messageType === 'image')
    .map((slide) => ({ src: slide.message }));

  const lightbox = useLightBox(slides);

  return (
    <>
      <Stack component="ul" spacing={3}>
        {activities.map((activity) => (
          <Stack component="li" key={activity?._id} direction="row" spacing={2}>
            <Avatar src={activity?.avatarUrl} alt={activity?.user?.name} />

            <Stack spacing={activity?.messageType === 'image' ? 1 : 0.5} flexGrow={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2"> {activity?.user?.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {fToNow(activity?.createdAt)}
                </Typography>
              </Stack>

              {activity?.messageType === 'image' ? (
                <Image
                  alt={activity?.message}
                  src={activity?.message}
                  onClick={() => lightbox.onOpen(activity?.message)}
                  sx={{
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    transition: (theme) => theme.transitions.create(['opacity']),
                    '&:hover': { opacity: 0.8 },
                  }}
                />
              ) : (
                <Typography variant="body2">{activity?.message}</Typography>
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
