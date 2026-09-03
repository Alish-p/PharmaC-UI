import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import InputBase from '@mui/material/InputBase';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog, { dialogClasses } from '@mui/material/Dialog';

import { useRouter } from 'src/routes/hooks';
import { isExternalLink } from 'src/routes/utils';

import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';

import { ResultItem } from './result-item';
import { groupItems, applyFilter, getAllItems } from './utils';

// ----------------------------------------------------------------------

export function Searchbar({ data: navItems = [], sx, ...other }) {
  const theme = useTheme();

  const router = useRouter();

  const search = useBoolean();

  const [searchQuery, setSearchQuery] = useState('');

  const [activeIndex, setActiveIndex] = useState(0);

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
    setActiveIndex(0);
  }, [search]);

  const handleKeyDown = (event) => {
    if (event.key === 'k' && event.metaKey) {
      search.onToggle();
      setSearchQuery('');
      setActiveIndex(0);
    }
  };

  useEventListener('keydown', handleKeyDown);

  const handleClick = useCallback(
    (path) => {
      if (isExternalLink(path)) {
        window.open(path);
      } else {
        router.push(path);
      }
      handleClose();
    },
    [handleClose, router]
  );

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
    setActiveIndex(0);
  }, []);

  const dataFiltered = applyFilter({
    inputData: getAllItems({ data: navItems }),
    query: searchQuery,
  });

  const visualOrderedFiltered = useMemo(() => {
    const dataGroups = groupItems(dataFiltered);
    const orderedGroups = Array.from(new Set(dataFiltered.map((item) => item.group)));
    return orderedGroups.flatMap((group) => dataGroups[group]);
  }, [dataFiltered]);

  const handleInputKeyDown = useCallback(
    (event) => {
      if (visualOrderedFiltered.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, visualOrderedFiltered.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const activeItem = visualOrderedFiltered[activeIndex];
        if (activeItem) {
          handleClick(activeItem.path);
        }
      }
    },
    [visualOrderedFiltered, activeIndex, handleClick]
  );

  const notFound = searchQuery && !visualOrderedFiltered.length;

  const renderItems = () => {
    const dataGroups = groupItems(visualOrderedFiltered);
    const orderedGroups = Array.from(new Set(visualOrderedFiltered.map((item) => item.group)));

    return orderedGroups.map((group, index) => (
      <Box
        component="ul"
        key={`${group}-${index}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          p: 0,
          m: 0,
          mb: 2.5,
          listStyle: 'none',
        }}
      >
        <Box
          component="li"
          sx={{
            px: 1.5,
            py: 0.5,
            typography: 'overline',
            fontSize: 10,
            color: 'primary.main',
            fontWeight: 'bold',
            letterSpacing: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&::after': {
              content: '""',
              flexGrow: 1,
              height: '1px',
              bgcolor: varAlpha(theme.vars.palette.divider, 0.5),
            },
          }}
        >
          {group}
        </Box>

        {dataGroups[group].map((item) => {
          const { title, path, breadcrumbs, icon } = item;

          const flatIndex = visualOrderedFiltered.indexOf(item);
          const isActive = flatIndex === activeIndex;

          const partsTitle = parse(title, match(title, searchQuery));

          const partsBreadcrumbs = parse(breadcrumbs, match(breadcrumbs, searchQuery));

          return (
            <Box component="li" key={`${title}${path}`} sx={{ display: 'flex' }}>
              <ResultItem
                isActive={isActive}
                icon={icon}
                breadcrumbs={partsBreadcrumbs}
                title={partsTitle}
                onClickItem={() => handleClick(path)}
              />
            </Box>
          );
        })}
      </Box>
    ));
  };

  const renderButton = (
    <Box
      display="flex"
      alignItems="center"
      onClick={search.onTrue}
      sx={{
        pr: { sm: 1 },
        borderRadius: { sm: 1.5 },
        cursor: { sm: 'pointer' },
        bgcolor: { sm: varAlpha(theme.vars.palette.grey['500Channel'], 0.08) },
        ...sx,
      }}
      {...other}
    >
      <IconButton disableRipple>
        {/* https://icon-sets.iconify.design/eva/search-fill/ */}
        <SvgIcon sx={{ width: 20, height: 20 }}>
          <path
            fill="currentColor"
            d="m20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8a7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42M5 11a6 6 0 1 1 6 6a6 6 0 0 1-6-6"
          />
        </SvgIcon>
      </IconButton>

      <Label
        sx={{
          fontSize: 12,
          color: 'grey.800',
          bgcolor: 'common.white',
          boxShadow: theme.customShadows.z1,
          display: { xs: 'none', sm: 'inline-flex' },
        }}
      >
        ⌘K
      </Label>
    </Box>
  );

  return (
    <>
      {renderButton}

      <Dialog
        fullWidth
        disableRestoreFocus
        maxWidth="sm"
        open={search.value}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{ sx: { mt: 15, overflow: 'unset' } }}
        sx={{ [`& .${dialogClasses.container}`]: { alignItems: 'flex-start' } }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.vars.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleInputKeyDown}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={<Label sx={{ letterSpacing: 1, color: 'text.secondary' }}>esc</Label>}
            inputProps={{ sx: { typography: 'h6' } }}
          />
        </Box>

        {notFound ? (
          <SearchNotFound query={searchQuery} sx={{ py: 15 }} />
        ) : (
          <Scrollbar sx={{ px: 3, pb: 3, pt: 2, height: 400 }}>{renderItems()}</Scrollbar>
        )}
      </Dialog>
    </>
  );
}
