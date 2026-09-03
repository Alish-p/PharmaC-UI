import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';

import axios, { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export default function PosBillingPage() {

  const [batches, setBatches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Cash');

  useEffect(() => {
    async function loadData() {
      try {
        const [batchesRes, custRes] = await Promise.all([
          axios.get(endpoints.batches, { params: { status: 'active' } }),
          axios.get(endpoints.customers),
        ]);
        setBatches(batchesRes.data.data || []);
        setCustomers(custRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = () => {
    if (!selectedBatchId) {
      toast.error('Please select a medicine batch');
      return;
    }

    const batch = batches.find((b) => b._id === selectedBatchId);
    if (!batch) return;

    if (batch.quantity <= 0) {
      toast.error('This batch is out of stock');
      return;
    }

    const existingIndex = cart.findIndex((item) => item.batchId === batch._id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      if (updated[existingIndex].qty + 1 > batch.quantity) {
        toast.error(`Only ${batch.quantity} units available in this batch`);
        return;
      }
      updated[existingIndex].qty += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          batchId: batch._id,
          batchNumber: batch.batchNumber,
          medicineName: batch.medicine?.name || 'Medicine',
          genericName: batch.medicine?.genericName || '',
          unit: batch.medicine?.unit || 'Strip',
          maxStock: batch.quantity,
          price: batch.salePrice,
          gstRate: batch.gstRate || 12,
          qty: 1,
        },
      ]);
    }
    setSelectedBatchId('');
    toast.success(`${batch.medicine?.name} added to bill`);
  };

  const updateQty = (index, delta) => {
    const updated = [...cart];
    const newQty = updated[index].qty + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else if (newQty > updated[index].maxStock) {
      toast.error(`Max stock available is ${updated[index].maxStock}`);
      return;
    } else {
      updated[index].qty = newQty;
    }
    setCart(updated);
  };

  const removeItem = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxAmount = cart.reduce((acc, item) => acc + (item.price * item.qty * item.gstRate) / 100, 0);
  const grandTotal = subtotal + taxAmount;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Add medicines first.');
      return;
    }
    toast.success(`Bill generated successfully! Total: ${fCurrency(grandTotal)} (${paymentMode})`);
    setCart([]);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4">POS Counter & Rapid Billing</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Search medicine batches, dispense prescriptions, and generate instant customer invoices
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Side: Product Selection & Bill Items */}
        <Grid xs={12} lg={8}>
          {/* Add Item Bar */}
          <Card sx={{ p: 2.5, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <FormControl fullWidth>
                <InputLabel>Select Medicine Batch to Dispense</InputLabel>
                <Select
                  value={selectedBatchId}
                  label="Select Medicine Batch to Dispense"
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                >
                  <MenuItem value="">-- Select Medicine Batch --</MenuItem>
                  {batches.map((b) => (
                    <MenuItem key={b._id} value={b._id} disabled={b.quantity <= 0}>
                      {b.medicine?.name} ({b.medicine?.genericName}) • Batch: {b.batchNumber} • Stock: {b.quantity} • ₹{b.salePrice}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:cart-plus-bold" />}
                onClick={handleAddToCart}
                sx={{ minWidth: 160, height: 54 }}
              >
                Add to Cart
              </Button>
            </Stack>
          </Card>

          {/* Cart Table */}
          <Card>
            <CardHeader title="Current Invoice Items" subheader={`${cart.length} distinct item(s)`} />
            <Scrollbar>
              <Table sx={{ minWidth: 650, mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Medicine / Item</TableCell>
                    <TableCell>Batch No</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Rate (₹)</TableCell>
                    <TableCell align="right">Total (₹)</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        <Iconify icon="solar:cart-large-4-bold" sx={{ fontSize: 40, mb: 1, color: 'text.disabled' }} />
                        <Typography variant="body2">No medicines in current cart.</Typography>
                        <Typography variant="caption">Select a batch above and click Add to Cart.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((item, index) => (
                      <TableRow key={item.batchId} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{item.medicineName}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {item.genericName}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Label color="default">{item.batchNumber}</Label>
                        </TableCell>

                        <TableCell align="center">
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <IconButton size="small" onClick={() => updateQty(index, -1)}>
                              <Iconify icon="solar:minus-circle-bold" />
                            </IconButton>
                            <Typography variant="subtitle2">{item.qty}</Typography>
                            <IconButton size="small" onClick={() => updateQty(index, 1)}>
                              <Iconify icon="solar:add-circle-bold" />
                            </IconButton>
                          </Stack>
                        </TableCell>

                        <TableCell align="right">{fCurrency(item.price)}</TableCell>

                        <TableCell align="right">
                          <Typography variant="subtitle2">{fCurrency(item.price * item.qty)}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <IconButton color="error" size="small" onClick={() => removeItem(index)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </Card>
        </Grid>

        {/* Right Side: Customer & Invoice Summary */}
        <Grid xs={12} lg={4}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Customer Details
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Registered Customer</InputLabel>
              <Select
                value={selectedCustomer}
                label="Select Registered Customer"
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <MenuItem value="">Walk-in Customer</MenuItem>
                {customers.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name} ({c.phone || 'No phone'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={paymentMode}
                label="Payment Mode"
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="UPI">UPI / QR Code</MenuItem>
                <MenuItem value="Card">Credit / Debit Card</MenuItem>
                <MenuItem value="Credit">Store Credit / Pay Later</MenuItem>
              </Select>
            </FormControl>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Bill Calculation
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subtotal
                </Typography>
                <Typography variant="body2">{fCurrency(subtotal)}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  GST / Taxes
                </Typography>
                <Typography variant="body2">{fCurrency(taxAmount)}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: (t) => `1px dashed ${t.palette.divider}` }}>
                <Typography variant="h6">Grand Total</Typography>
                <Typography variant="h6" color="primary.main">
                  {fCurrency(grandTotal)}
                </Typography>
              </Stack>
            </Stack>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
              onClick={handleCheckout}
            >
              Generate Bill & Print
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
