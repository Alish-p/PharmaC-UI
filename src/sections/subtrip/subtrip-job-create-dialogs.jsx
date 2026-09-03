import { KanbanPumpDialog } from 'src/sections/kanban/components/kanban-pump-dialog';
import { KanbanDriverDialog } from 'src/sections/kanban/components/kanban-driver-dialog';
import { KanbanVehicleDialog } from 'src/sections/kanban/components/kanban-vehicle-dialog';
import { KanbanCustomerDialog } from 'src/sections/kanban/components/kanban-customer-dialog';

export function SubtripJobCreateDialogs({
  vehicleDialog,
  driverDialog,
  customerDialog,
  pumpDialog,
  managesPumps,
  selectedVehicle,
  handleVehicleChange,
  selectedDriver,
  handleDriverChange,
  selectedCustomer,
  handleCustomerChange,
  selectedPump,
  handlePumpChange,
}) {
  return (
    <>
      <KanbanVehicleDialog
        open={vehicleDialog.value}
        onClose={vehicleDialog.onFalse}
        selectedVehicle={selectedVehicle}
        onVehicleChange={handleVehicleChange}
        onlyActive
      />

      <KanbanDriverDialog
        open={driverDialog.value}
        onClose={driverDialog.onFalse}
        selectedDriver={selectedDriver}
        onDriverChange={handleDriverChange}
        allowQuickCreate
      />

      <KanbanCustomerDialog
        open={customerDialog.value}
        onClose={customerDialog.onFalse}
        selectedCustomer={selectedCustomer}
        onCustomerChange={handleCustomerChange}
      />

      {managesPumps && (
        <KanbanPumpDialog
          open={pumpDialog.value}
          onClose={pumpDialog.onFalse}
          selectedPump={selectedPump}
          onPumpChange={handlePumpChange}
        />
      )}
    </>
  );
}
