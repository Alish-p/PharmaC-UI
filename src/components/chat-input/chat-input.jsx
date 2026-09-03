/* eslint-disable react/prop-types */
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { FiltersBlock } from 'src/components/filters-result';

// ----------------------------------------------------------------------

// Helpers
const ensureSelectedShape = (groups) =>
  groups.reduce((acc, g) => {
    acc[g.id] = acc[g.id] ?? [];
    return acc;
  }, {});

// Default demo groups (can be overridden via props)
const DEFAULT_GROUPS = [
  {
    id: 'mode',
    label: 'Mode',
    iconName: 'mdi:sparkles',
    options: [
      { id: 'agent', label: 'Agent Mode', iconName: 'mdi:brain' },
      { id: 'creative', label: 'Creative', iconName: 'mdi:sparkles' },
      { id: 'precise', label: 'Precise', iconName: 'mdi:flash' },
      { id: 'balanced', label: 'Balanced', iconName: 'mdi:brain' },
    ],
  },
  {
    id: 'search',
    label: 'Search',
    iconName: 'mdi:web',
    options: [
      { id: 'web', label: 'Web Search', iconName: 'mdi:web' },
      { id: 'image', label: 'Image Search', iconName: 'mdi:image' },
      { id: 'news', label: 'News', iconName: 'mdi:file-document' },
      { id: 'video', label: 'Video Search', iconName: 'mdi:movie' },
    ],
  },
  {
    id: 'output',
    label: 'Output',
    iconName: 'mdi:file-document-outline',
    options: [
      { id: 'code', label: 'Code', iconName: 'mdi:code-tags' },
      { id: 'table', label: 'Table', iconName: 'mdi:table' },
      { id: 'summary', label: 'Summary', iconName: 'mdi:file-document-outline' },
      { id: 'detailed', label: 'Detailed', iconName: 'mdi:file-document-multiple-outline' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    iconName: 'mdi:tools',
    options: [
      { id: 'calculator', label: 'Calculator', iconName: 'mdi:calculator' },
      { id: 'translator', label: 'Translator', iconName: 'mdi:web' },
      { id: 'analyzer', label: 'Analyzer', iconName: 'mdi:brain' },
      { id: 'converter', label: 'Converter', iconName: 'mdi:swap-horizontal' },
    ],
  },
  {
    id: 'context',
    label: 'Context',
    iconName: 'mdi:account-group',
    options: [
      { id: 'technical', label: 'Technical', iconName: 'mdi:code-tags' },
      { id: 'business', label: 'Business', iconName: 'mdi:briefcase' },
      { id: 'casual', label: 'Casual', iconName: 'mdi:sparkles' },
      { id: 'academic', label: 'Academic', iconName: 'mdi:school' },
    ],
  },
];

// ----------------------------------------------------------------------

export default function ChatInput({
  optionGroups = DEFAULT_GROUPS,
  initialSelectedOptions,
  placeholder = 'Type your message here... (Press Enter to send, Shift+Enter for new line)',
  onSend,
  sx,
}) {
  const [message, setMessage] = useState('');
  const [openGroupId, setOpenGroupId] = useState(null);

  const [selectedOptions, setSelectedOptions] = useState(() => {
    const base = ensureSelectedShape(optionGroups);
    return { ...base, ...(initialSelectedOptions || {}) };
  });

  const [searchTerms, setSearchTerms] = useState(() =>
    optionGroups.reduce((acc, g) => {
      acc[g.id] = '';
      return acc;
    }, {})
  );

  const configDrawer = useBoolean(false);
  const configBtnRef = useRef(null);

  // Keep selectedOptions keys in sync when optionGroups change
  useEffect(() => {
    setSelectedOptions((prev) => ({ ...ensureSelectedShape(optionGroups), ...prev }));
    setSearchTerms((prev) => ({
      ...optionGroups.reduce((a, g) => ({ ...a, [g.id]: '' }), {}),
      ...prev,
    }));
  }, [optionGroups]);

  const totalActiveSelections = useMemo(
    () => Object.values(selectedOptions).reduce((sum, arr) => sum + (arr?.length || 0), 0),
    [selectedOptions]
  );

  const toggleOption = useCallback((groupId, optionId) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      const next = isSelected ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [groupId]: next };
    });
  }, []);

  const removeOption = useCallback((groupId, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter((id) => id !== optionId),
    }));
  }, []);

  const clearGroup = useCallback((groupId) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: [] }));
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend?.(trimmed, selectedOptions);
    setMessage('');
  }, [message, onSend, selectedOptions]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFilteredOptions = (group) => {
    const q = (searchTerms[group.id] || '').toLowerCase();
    if (!q) return group.options;
    return group.options.filter((opt) => opt.label.toLowerCase().includes(q));
  };

  const handleToggleGroupOpen = (groupId) => {
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  };

  return (
    <Box sx={sx}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {/* Active selections as grouped chips (re-using FiltersBlock style) */}
        {totalActiveSelections > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {optionGroups.map((group) => {
              const selectedInGroup = selectedOptions[group.id] || [];
              if (!selectedInGroup.length) return null;
              return (
                <FiltersBlock key={group.id} label={`${group.label}:`} isShow sx={{ mr: 1 }}>
                  {selectedInGroup.map((optionId) => {
                    const opt = group.options.find((o) => o.id === optionId);
                    if (!opt) return null;
                    return (
                      <Chip
                        key={optionId}
                        size="small"
                        label={opt.label}
                        onDelete={() => removeOption(group.id, optionId)}
                      />
                    );
                  })}
                </FiltersBlock>
              );
            })}
          </Box>
        )}

        {/* Input row */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    ref={configBtnRef}
                    onClick={configDrawer.onTrue}
                    color={configDrawer.value ? 'primary' : 'default'}
                    aria-label="Open configuration"
                  >
                    <Iconify icon="mdi:cog" />
                  </IconButton>
                  <IconButton
                    onClick={handleSend}
                    disabled={!message.trim()}
                    color={message.trim() ? 'primary' : 'default'}
                    aria-label="Send"
                  >
                    <Iconify icon="mdi:send" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      {/* Configuration side drawer */}
      <Drawer
        anchor="right"
        open={configDrawer.value}
        onClose={() => {
          configDrawer.onFalse();
          setOpenGroupId(null);
        }}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: { xs: 1, sm: 420, md: 480 } } }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, pr: 1, pl: 2.5, minHeight: 68 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Configuration
          </Typography>
          {!!totalActiveSelections && (
            <Tooltip title="Clear all selections">
              <IconButton
                color="error"
                onClick={() => setSelectedOptions(ensureSelectedShape(optionGroups))}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton onClick={configDrawer.onFalse}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Content */}
        <Scrollbar>
          <Box sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {optionGroups.map((group) => {
                const selectedCount = (selectedOptions[group.id] || []).length;
                const filtered = getFilteredOptions(group);
                const isOpen = openGroupId === group.id;
                return (
                  <Paper key={group.id} variant="outlined" sx={{ overflow: 'hidden' }}>
                    {/* Group header */}
                    <Box
                      role="button"
                      onClick={() => handleToggleGroupOpen(group.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        {group.iconName && <Iconify icon={group.iconName} width={18} />}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                            {group.label}
                          </Typography>
                          {!!selectedCount && (
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', fontWeight: 600 }}
                            >
                              {selectedCount} selected
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Iconify icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                    </Box>

                    {isOpen && (
                      <>
                        <Divider />
                        {/* Search */}
                        <Box sx={{ p: 1 }}>
                          <TextField
                            fullWidth
                            placeholder="Search..."
                            size="small"
                            value={searchTerms[group.id]}
                            onChange={(e) =>
                              setSearchTerms((prev) => ({ ...prev, [group.id]: e.target.value }))
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Iconify icon="mdi:magnify" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>

                        {/* Options */}
                        <MenuList dense disablePadding sx={{ maxHeight: 240, overflow: 'auto' }}>
                          {filtered.length > 0 ? (
                            filtered.map((opt) => {
                              const isSelected = (selectedOptions[group.id] || []).includes(opt.id);
                              return (
                                <MenuItem
                                  key={opt.id}
                                  onClick={() => toggleOption(group.id, opt.id)}
                                >
                                  <Checkbox
                                    edge="start"
                                    checked={isSelected}
                                    tabIndex={-1}
                                    disableRipple
                                  />
                                  {opt.iconName && <Iconify icon={opt.iconName} width={18} />}
                                  <ListItemText primary={opt.label} />
                                </MenuItem>
                              );
                            })
                          ) : (
                            <Box
                              sx={{
                                p: 2,
                                color: 'text.secondary',
                                typography: 'caption',
                                textAlign: 'center',
                              }}
                            >
                              No options found
                            </Box>
                          )}
                        </MenuList>

                        {!!selectedCount && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                            <Tooltip title="Clear group">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => clearGroup(group.id)}
                              >
                                <Iconify icon="mdi:delete-outline" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </Scrollbar>
      </Drawer>
    </Box>
  );
}
