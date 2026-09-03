import React from 'react';
import { useNavigate } from 'react-router-dom';

import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

export default function TenantAdminTableRow({ row, onViewRow, onEditRow, onDeleteRow }) {
  const popover = usePopover();
  const navigate = useNavigate();

  const handleView = () => {
    if (onViewRow) onViewRow(row._id);
    else navigate(paths.dashboard.tenants.details(row._id));
  };

  const handleEdit = () => {
    if (onEditRow) onEditRow(row._id);
    else navigate(paths.dashboard.tenants.edit(row._id));
  };

  const handleDelete = () => {
    if (onDeleteRow) onDeleteRow(row._id);
  };

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ cursor: 'pointer' }} onClick={handleView}>
          <Link underline="hover" sx={{ cursor: 'pointer' }} onClick={handleView}>
            {row?.name}
          </Link>
        </TableCell>
        <TableCell>{row?.slug}</TableCell>
        <TableCell>{row?.address?.city || '-'}</TableCell>
        <TableCell>{row?.contactDetails?.phone || '-'}</TableCell>
        <TableCell>{row?.contactDetails?.email || '-'}</TableCell>
        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        anchorEl={popover.anchorEl}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              handleView();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleEdit();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDelete();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
