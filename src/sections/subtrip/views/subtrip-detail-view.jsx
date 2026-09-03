import 'leaflet/dist/leaflet.css';

import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

import { Box, Grid, Stack, Button, Dialog, DialogActions } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber, fCurrency } from 'src/utils/format-number';
import { generateStaticMapImage } from 'src/utils/generate-static-map';

import IndentPdf from 'src/pdfs/petrol-pump-indent';
import { DashboardContent } from 'src/layouts/dashboard';
import { useEwaybillByNumber } from 'src/query/use-ewaybill';
import { useSubtripEvents } from 'src/query/use-subtrip-events';

import { Iconify } from 'src/components/iconify';
import { HeroHeader } from 'src/components/hero-header-card';

import { calculateInvoicePerSubtrip } from 'src/sections/invoice/utills/invoice-calculation';

import { useTenantContext } from 'src/auth/tenant';

import { SUBTRIP_STATUS } from '../constants';
// PDFs
import LRPDF from '../pdfs/lorry-reciept-pdf';
import EntryPassPdf from '../pdfs/entry-pass-pdf';
import ESignedLRPDF from '../pdfs/esigned-lr-pdf';
import { mapExpensesToChartData } from '../utils';
import LRInfo from '../widgets/subtrip-info-widget';
import { EpodInfoCard } from '../widgets/epod-info-card';
import DriverPaymentPdf from '../pdfs/driver-payment-pdf';
import { SubtripTimeline } from '../widgets/subtrip-timeline';
import AnalyticsWidgetSummary from '../widgets/summary-widget';
import { ExpenseChart } from '../widgets/expense-chart-widget';
import TransporterPayment from '../pdfs/transporter-payment-pdf';
import IncomeWidgetSummary from '../widgets/income-expense-widget';
import { BasicExpenseTable } from '../widgets/basic-expense-table';
import { SUBTRIP_EXPENSE_TYPES } from '../../expense/expense-config';
import { ResolveSubtripDialog } from '../subtrip-resolve-dialogue-form';
import { SubtripStatusStepper } from '../widgets/subtrip-status-stepper';
import { FinancialLinksWidget } from '../widgets/financial-links-widget';
import { SubtripRouteMapWidget } from '../widgets/subtrip-route-map-widget';
import { EmptySubtripStatusStepper } from '../widgets/empty-subtrip-status-stepper';

// ----------------------------------------------------------------------

// Helper to get freight amount display and explanation description
const getFreightDisplay = (subtrip) => {
  const {
    freightModel = 'per_ton',
    rate = 0,
    freightAmount: serverFreightAmount,
    startKm = 0,
    endKm,
    baseKm = 0,
  } = subtrip?.freightDetails || {};

  const isPending =
    ['per_hour', 'per_km', 'hybrid'].includes(freightModel) &&
    !['received', 'billed'].includes(subtrip?.subtripStatus);

  if (isPending) {
    let formula = '';
    if (freightModel === 'per_hour') formula = `${fCurrency(rate)}/hour`;
    else if (freightModel === 'per_km') formula = `${fCurrency(rate)}/KM`;
    else if (freightModel === 'hybrid') formula = `Hybrid (Base + Extra KM)`;

    return {
      value: 'Pending Receive',
      description: `Rate: ${formula} (calculated at receive stage)`,
    };
  }

  const { freightAmount } = calculateInvoicePerSubtrip(subtrip);

  let description = '';
  const formattedRate = fCurrency(rate || 0);
  const loadingWt = subtrip.loadingWeight || 0;

  if (freightModel === 'per_ton' || freightModel === 'per_kl') {
    const unit = freightModel === 'per_kl' ? 'KL' : 'MT';
    description = `Freight: ${formattedRate} × ${fNumber(loadingWt)} ${unit}`;
  } else if (freightModel === 'per_km') {
    const diffKm = endKm && startKm && endKm > startKm ? endKm - startKm : 0;
    description = `Freight: ${formattedRate} × ${fNumber(diffKm)} KM (KM: ${startKm} to ${endKm || startKm})`;
  } else if (freightModel === 'per_hour') {
    let diffInHours = 0;
    if (subtrip.startDate && subtrip.endDate) {
      const start = new Date(subtrip.startDate).getTime();
      const end = new Date(subtrip.endDate).getTime();
      diffInHours = Math.ceil((end - start) / (1000 * 60 * 60));
    }
    description = `Freight: ${formattedRate} × ${fNumber(diffInHours)} Hr (Duration: ${diffInHours} hours)`;
  } else if (freightModel === 'hybrid') {
    const totalKm = endKm && startKm && endKm > startKm ? endKm - startKm : 0;
    const extraKm = totalKm > baseKm ? totalKm - baseKm : 0;
    const baseFreight = serverFreightAmount || 0;
    description = `Freight: Base ₹${fNumber(baseFreight)} (${baseKm} km) + Extra ${extraKm} km × ${formattedRate}/km`;
  } else if (freightModel === 'fixed') {
    description = `Fixed Freight Amount`;
  } else {
    const unit = freightModel === 'per_kl' ? 'KL' : 'MT';
    description = `Freight: ${formattedRate} × ${fNumber(loadingWt)} ${unit}`;
  }

  return {
    value: freightAmount, // will be formatted to currency by widget
    description,
  };
};

// Helper to get commission display and explanation description
const getCommissionDisplay = (subtrip) => {
  const { commissionRate = 0, commissionAmount = 0 } = subtrip?.commissionDetails || {};
  const { freightDetails } = subtrip || {};
  const freightModel = freightDetails?.freightModel || 'per_ton';

  const isPending = !['received', 'billed'].includes(subtrip?.subtripStatus);

  if (isPending) {
    return {
      value: 'Pending Receive',
      description: 'Transporter commission calculated at receive stage',
    };
  }

  let description = '';
  if ((freightModel === 'per_ton' || freightModel === 'per_kl') && commissionRate > 0) {
    const unit = freightModel === 'per_kl' ? 'KL' : 'MT';
    description = `Commission: ${fCurrency(commissionRate)} × ${fNumber(subtrip.loadingWeight || 0)} ${unit}`;
  } else {
    description = `Fixed Transporter Commission`;
  }

  return {
    value: commissionAmount, // will be formatted to currency by widget
    description,
  };
};

export function SubtripDetailView({ subtrip, publicMode = false }) {
  const navigate = useNavigate();

  // State for dialog visibility
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  // Close dialog removed

  // Function to check if editing is allowed based on status and financial documents
  const isEditingAllowed = () => {
    const restrictedStatuses = [SUBTRIP_STATUS.BILLED];
    if (restrictedStatuses.includes(subtrip.subtripStatus)) return false;
    if (subtrip.invoiceId || subtrip.driverSalaryId || subtrip.transporterPaymentReceiptId)
      return false;
    return true;
  };

  const { data: events = [] } = useSubtripEvents(subtrip._id);

  const { data: ewaybillData } = useEwaybillByNumber(subtrip?.ewayBill);
  const consignorPincode = ewaybillData?.pincode_of_consignor;
  const consigneePincode = ewaybillData?.pincode_of_consignee;

  console.log(consignorPincode, consigneePincode);

  // For market vehicles, use advances; for own vehicles, use expenses (exclude cancelled)
  const isMarketVehicle = subtrip?.vehicleId?.isOwn === false;
  const rawDeductionItems = isMarketVehicle ? subtrip?.advances || [] : subtrip?.expenses || [];
  const deductionItems = rawDeductionItems.filter(
    (item) => item.status !== 'cancelled' && item.status !== 'Cancelled' && !item.isDeleted
  );

  const totalExpenses = deductionItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalDieselLtr = deductionItems.reduce((sum, item) => {
    const itemType = item.advanceType || item.expenseType;
    return sum + (itemType === SUBTRIP_EXPENSE_TYPES.DIESEL ? item.dieselLtr || 0 : 0);
  }, 0);

  const freightDisplay = getFreightDisplay(subtrip);
  const commissionDisplay = isMarketVehicle ? getCommissionDisplay(subtrip) : null;

  const expenseDescription = isMarketVehicle
    ? `Total advances paid to transporter`
    : `Total expenses incurred on this job`;

  const expenseChartData = mapExpensesToChartData(deductionItems);

  // Route-based insights removed

  const { _id, subtripNo, vehicleId = {}, driverId = {}, subtripStatus } = subtrip;

  // Trip may be absent for Market vehicles; guard trip-dependent UI
  const hasTrip = Boolean(subtrip?.tripId?._id);

  const viewLR = useBoolean();
  const viewESignedLR = useBoolean();
  const viewIntent = useBoolean();
  const viewEntryPass = useBoolean();
  const viewDriverPayment = useBoolean();
  const viewTransporterPayment = useBoolean();
  const tenant = useTenantContext();

  const hasDieselIntent = subtrip?.intentFuelPump;
  const hasEntryPass = subtrip?.diNumber;
  const hasTransporterPayment = !subtrip?.vehicleId?.isOwn;
  const hasEpod = Boolean(subtrip?.podSignature);

  // Pre-generate static map image for EPOD PDF
  const [mapImageUrl, setMapImageUrl] = useState(null);
  useEffect(() => {
    if (subtrip?.podGeoLocation?.latitude && subtrip?.podGeoLocation?.longitude) {
      generateStaticMapImage(subtrip.podGeoLocation.latitude, subtrip.podGeoLocation.longitude)
        .then(setMapImageUrl)
        .catch(() => setMapImageUrl(null));
    }
  }, [subtrip?.podGeoLocation?.latitude, subtrip?.podGeoLocation?.longitude]);

  const getActions = () => {
    if (subtrip.isEmpty || publicMode || subtrip.subtripStatus === SUBTRIP_STATUS.CANCELLED) {
      return [];
    }

    const actions = [
      {
        label: 'Receive',
        action: () =>
          navigate(
            `${paths.dashboard.subtrip.receive}?currentSubtrip=${subtrip._id}&redirectTo=${encodeURIComponent(window.location.pathname)}`
          ),
        disabled: subtrip.subtripStatus !== SUBTRIP_STATUS.LOADED,
      },
      {
        label: 'Resolve',
        action: () => setShowResolveDialog(true),
        disabled: subtrip.subtripStatus !== SUBTRIP_STATUS.ERROR,
      },
    ];

    // EPOD: only show when tenant has EPOD enabled and job is loaded
    if (tenant?.integrations?.epod?.enabled && subtrip.subtripStatus === SUBTRIP_STATUS.LOADED) {
      actions.push({
        label: subtrip.podSignature ? 'EPOD ✅ Signed' : 'Share EPOD Link',
        action: () => {
          const epodUrl = `${window.location.origin}${paths.public.epod(subtrip._id)}`;
          navigator.clipboard.writeText(epodUrl);
          toast.success('EPOD link copied to clipboard!');
        },
        disabled: false,
      });
    }

    return actions;
  };

  return (
    <>
      <DashboardContent>
        <HeroHeader
          offsetTop={70}
          title={`Job #${subtripNo}`}
          status={subtripStatus}
          icon="mdi:routes"
          meta={[
            {
              icon: 'mdi:truck-outline',
              label: isMarketVehicle
                ? `${vehicleId?.vehicleNo} ( Market )`
                : `${vehicleId?.vehicleNo} ( Own )`,
              href: vehicleId?._id ? paths.dashboard.vehicle.details(vehicleId._id) : undefined,
            },
            {
              icon: 'mdi:account',
              label: driverId?.driverName,
              href: driverId?._id ? paths.dashboard.driver.details(driverId._id) : undefined,
            },
            // Show Trip only when associated (non-market vehicles)
            ...(hasTrip
              ? [
                  {
                    icon: 'mdi:routes',
                    label: `Trip #${subtrip.tripId.tripNo}`,
                    href: paths.dashboard.trip.details(subtrip.tripId._id),
                  },
                ]
              : []),
          ].filter((m) => (publicMode ? m.label !== 'Actions' : true))}
          menus={[
            {
              label: 'Actions',
              icon: 'eva:settings-2-fill',
              items: getActions().map((a) => ({
                label: a.label,
                onClick: a.action,
                disabled: a.disabled,
              })),
            },
            {
              label: 'View',
              icon: 'solar:eye-bold',
              items: [
                {
                  label: 'Lorry Receipt (LR)',
                  icon: 'mdi:file-document-outline',
                  onClick: () => viewLR.onTrue(),
                  disabled: subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE,
                },
                hasDieselIntent && {
                  label: 'Petrol Pump Intent',
                  icon: 'mdi:file-document-outline',
                  onClick: () => viewIntent.onTrue(),
                  disabled: subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE,
                },
                hasEntryPass && {
                  label: 'Entry Pass',
                  icon: 'mdi:file-document-outline',
                  onClick: () => viewEntryPass.onTrue(),
                },
                {
                  label: 'Driver Payment',
                  icon: 'mdi:file-document-outline',
                  onClick: () => viewDriverPayment.onTrue(),
                  disabled: subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE,
                },
                hasTransporterPayment && {
                  label: 'Transporter Payment',
                  icon: 'mdi:file-document-outline',
                  onClick: () => viewTransporterPayment.onTrue(),
                  disabled: subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE,
                },
                ...(subtrip.docs || []).map((doc, index) => ({
                  label: `Document ${index + 1}`,
                  icon: 'mdi:file-document-outline',
                  onClick: () => window.open(doc, '_blank', 'noopener,noreferrer'),
                })),
                hasEpod && {
                  label: 'E-Signed LR (EPOD)',
                  icon: 'mdi:signature-freehand',
                  onClick: () => viewESignedLR.onTrue(),
                },
              ].filter(Boolean),
            },
            {
              label: 'Download',
              icon: 'material-symbols:download',
              items: [
                {
                  label: 'Lorry Receipt (LR)',
                  render: ({ close }) => (
                    <PDFDownloadLink
                      document={<LRPDF subtrip={subtrip} tenant={tenant} />}
                      fileName={`${subtrip.subtripNo}_lr.pdf`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                      onClick={() => setTimeout(close, 0)}
                    >
                      {({ loading }) => (
                        <>
                          <Iconify
                            icon={loading ? 'line-md:loading-loop' : 'eva:download-fill'}
                            sx={{ mr: 2 }}
                          />
                          Lorry Receipt (LR)
                        </>
                      )}
                    </PDFDownloadLink>
                  ),
                  disabled: subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE,
                },
                hasDieselIntent && {
                  label: 'Petrol Pump Indent',
                  render: ({ close }) => (
                    <PDFDownloadLink
                      document={<IndentPdf subtrip={subtrip} tenant={tenant} />}
                      fileName={`${subtrip.subtripNo}_indent.pdf`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                      onClick={() => setTimeout(close, 0)}
                    >
                      {({ loading }) => (
                        <>
                          <Iconify
                            icon={loading ? 'line-md:loading-loop' : 'eva:download-fill'}
                            sx={{ mr: 2 }}
                          />
                          Petrol Pump Indent
                        </>
                      )}
                    </PDFDownloadLink>
                  ),
                  disabled: subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE,
                },
                hasEntryPass && {
                  label: 'Entry Pass',
                  render: ({ close }) => (
                    <PDFDownloadLink
                      document={<EntryPassPdf subtrip={subtrip} tenant={tenant} />}
                      fileName={`${subtrip.subtripNo}_entry_pass.pdf`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                      onClick={() => setTimeout(close, 0)}
                    >
                      {({ loading }) => (
                        <>
                          <Iconify
                            icon={loading ? 'line-md:loading-loop' : 'eva:download-fill'}
                            sx={{ mr: 2 }}
                          />
                          Entry Pass
                        </>
                      )}
                    </PDFDownloadLink>
                  ),
                },
                {
                  label: 'Driver Payment',
                  render: ({ close }) => (
                    <PDFDownloadLink
                      document={<DriverPaymentPdf subtrip={subtrip} tenant={tenant} />}
                      fileName={`${subtrip.subtripNo}_driver_payment.pdf`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                      onClick={() => setTimeout(close, 0)}
                    >
                      {({ loading }) => (
                        <>
                          <Iconify
                            icon={loading ? 'line-md:loading-loop' : 'eva:download-fill'}
                            sx={{ mr: 2 }}
                          />
                          Driver Payment
                        </>
                      )}
                    </PDFDownloadLink>
                  ),
                  disabled: subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE,
                },
                hasTransporterPayment && {
                  label: 'Transporter Payment',
                  render: ({ close }) => (
                    <PDFDownloadLink
                      document={<TransporterPayment subtrip={subtrip} tenant={tenant} />}
                      fileName={`${subtrip.subtripNo}_transporter_payment.pdf`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                      onClick={() => setTimeout(close, 0)}
                    >
                      {({ loading }) => (
                        <>
                          <Iconify
                            icon={loading ? 'line-md:loading-loop' : 'eva:download-fill'}
                            sx={{ mr: 2 }}
                          />
                          Transporter Payment
                        </>
                      )}
                    </PDFDownloadLink>
                  ),
                  disabled: subtrip.subtripStatus === SUBTRIP_STATUS.IN_QUEUE,
                },
                hasEpod && {
                  label: 'E-Signed LR (EPOD)',
                  render: ({ close }) => (
                    <PDFDownloadLink
                      document={
                        <ESignedLRPDF subtrip={subtrip} tenant={tenant} mapImageUrl={mapImageUrl} />
                      }
                      fileName={`${subtrip.subtripNo}_esigned_lr.pdf`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                      onClick={() => setTimeout(close, 0)}
                    >
                      {({ loading }) => (
                        <>
                          <Iconify
                            icon={loading ? 'line-md:loading-loop' : 'eva:download-fill'}
                            sx={{ mr: 2 }}
                          />
                          E-Signed LR (EPOD)
                        </>
                      )}
                    </PDFDownloadLink>
                  ),
                },
              ].filter(Boolean),
            },
          ]}
          actions={
            !publicMode
              ? [
                  {
                    label: 'Edit',
                    icon: 'solar:pen-bold',
                    onClick: () => navigate(paths.dashboard.subtrip.edit(subtrip._id)),
                    disabled: !isEditingAllowed(),
                  },
                ]
              : undefined
          }
        />

        {/* PDF Viewers */}
        <Dialog fullScreen open={viewLR.value}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="primary" variant="outlined" onClick={viewLR.onFalse}>
                Close
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <LRPDF subtrip={subtrip} tenant={tenant} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>

        {/* E-Signed LR Viewer */}
        <Dialog fullScreen open={viewESignedLR.value}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="primary" variant="outlined" onClick={viewESignedLR.onFalse}>
                Close
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <ESignedLRPDF subtrip={subtrip} tenant={tenant} mapImageUrl={mapImageUrl} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>

        <Dialog fullScreen open={viewIntent.value}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="primary" variant="outlined" onClick={viewIntent.onFalse}>
                Close
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <IndentPdf subtrip={subtrip} tenant={tenant} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>

        <Dialog fullScreen open={viewEntryPass.value}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="primary" variant="outlined" onClick={viewEntryPass.onFalse}>
                Close
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <EntryPassPdf subtrip={subtrip} tenant={tenant} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>

        <Dialog fullScreen open={viewDriverPayment.value}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="primary" variant="outlined" onClick={viewDriverPayment.onFalse}>
                Close
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <DriverPaymentPdf subtrip={subtrip} tenant={tenant} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>

        <Dialog fullScreen open={viewTransporterPayment.value}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="primary" variant="outlined" onClick={viewTransporterPayment.onFalse}>
                Close
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <TransporterPayment subtrip={subtrip} tenant={tenant} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>

        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3} direction={{ xs: 'column', md: 'column' }}>
              {/* Status stepper */}
              {subtrip.isEmpty ? (
                <EmptySubtripStatusStepper status={subtrip?.subtripStatus} />
              ) : (
                <SubtripStatusStepper status={subtrip?.subtripStatus} />
              )}

              {/* Insights removed as route-based analysis is deprecated */}

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <IncomeWidgetSummary
                  title="Freight Amount"
                  type="income"
                  color="primary"
                  icon="eva:diagonal-arrow-right-up-fill"
                  total={freightDisplay.value}
                  description={freightDisplay.description}
                  badge={isMarketVehicle ? 'Market Vehicle' : 'Own Vehicle'}
                  badgeColor={isMarketVehicle ? 'secondary' : 'primary'}
                  chart={{
                    series: [7, 208, 76, 48, 74, 54, 157, 84],
                  }}
                />
                {isMarketVehicle && (
                  <IncomeWidgetSummary
                    title="Commission Income"
                    type="income"
                    color="success"
                    icon="eva:diagonal-arrow-right-up-fill"
                    total={commissionDisplay.value}
                    description={commissionDisplay.description}
                    badge="Market Vehicle"
                    badgeColor="secondary"
                    chart={{
                      series: [7, 208, 76, 48, 74, 54, 157, 84],
                    }}
                  />
                )}
                <IncomeWidgetSummary
                  title={isMarketVehicle ? 'Advances' : 'Expenses'}
                  type="expense"
                  color="warning"
                  icon="eva:diagonal-arrow-right-up-fill"
                  total={-totalExpenses || 0}
                  description={expenseDescription}
                  badge={isMarketVehicle ? 'Market Vehicle' : 'Own Vehicle'}
                  badgeColor={isMarketVehicle ? 'secondary' : 'primary'}
                  chart={{
                    series: [7, 208, 76, 48, 74, 54, 157, 84],
                  }}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <AnalyticsWidgetSummary
                  title="Total Diesel Liters"
                  total={totalDieselLtr || 0}
                  color="warning"
                  icon="ant-design:fire-filled"
                  sx={{ flexGrow: { xs: 0, sm: 1 }, flexBasis: { xs: 'auto', sm: 0 } }}
                />
                <AnalyticsWidgetSummary
                  title="Total Adblue Liters"
                  total={subtrip.detentionTime || 0}
                  color="info"
                  icon="ant-design:clock-circle-filled"
                  sx={{ flexGrow: { xs: 0, sm: 1 }, flexBasis: { xs: 'auto', sm: 0 } }}
                />
                <FinancialLinksWidget
                  subtrip={subtrip}
                  isMarketVehicle={isMarketVehicle}
                  sx={{ flexGrow: { xs: 0, sm: 1 }, flexBasis: { xs: 'auto', sm: 0 } }}
                />
              </Stack>
              <Grid item>
                <BasicExpenseTable selectedSubtrip={subtrip} withAdd={!publicMode} />
              </Grid>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <ExpenseChart
                  title={isMarketVehicle ? 'Advance Details' : 'Expense Details'}
                  chart={{
                    series: expenseChartData || [],
                  }}
                  sx={{ flexGrow: { xs: 0, sm: 1 }, flexBasis: { xs: 'auto', sm: 0 } }}
                  noDataMessage={
                    isMarketVehicle ? 'No advances recorded yet' : 'No expenses recorded yet'
                  }
                />
              </Stack>
              <Stack>
                <SubtripRouteMapWidget payload={ewaybillData} />
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4} gap={2}>
            <LRInfo subtrip={subtrip} />

            <SubtripTimeline events={events} />

            <EpodInfoCard subtrip={subtrip} />
          </Grid>

          <Grid item xs={12} md={6} lg={4} />
        </Grid>
      </DashboardContent>

      {/* Resolve Subtrip Dialogue */}
      {!publicMode && (
        <ResolveSubtripDialog
          showDialog={showResolveDialog}
          setShowDialog={setShowResolveDialog}
          subtripId={subtrip._id}
        />
      )}

      {/* Close Subtrip Dialogue removed */}

      {/* Empty job close flow has been removed */}
    </>
  );
}
