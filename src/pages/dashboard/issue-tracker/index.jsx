import { Helmet } from 'react-helmet-async';

import { Stack } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { useTasks } from 'src/query/use-task';

import { EmptyContent } from 'src/components/empty-content';

import { KanbanView as IssueTrackerView } from 'src/sections/kanban/view';
import { KanbanColumnSkeleton } from 'src/sections/kanban/components/kanban-skeleton';

// ----------------------------------------------------------------------

const metadata = { title: `Task  | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { data: tasks, isLoading: issuesLoading, isEmpty: issuesEmpty } = useTasks();

  if (issuesLoading) {
    return (
      <Stack direction="row" alignItems="flex-start" sx={{ gap: 'var(--column-gap)' }}>
        <KanbanColumnSkeleton />
      </Stack>
    );
  }

  if (issuesEmpty) {
    return <EmptyContent filled sx={{ py: 10, maxHeight: { md: 480 } }} />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <IssueTrackerView tasks={tasks} />
    </>
  );
}
