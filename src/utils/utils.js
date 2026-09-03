// Driver Payment Section
export const calculateDriverSalaryPerSubtrip = (subtrip) => {
  if (!subtrip?.expenses || !Array.isArray(subtrip?.expenses)) {
    return 0;
  }

  // Filter expenses for driver-salary type
  const driverSalaryExpenses = subtrip?.expenses.filter(
    (expense) => expense.expenseType === 'Driver Salary'
  );

  // Sum the amounts of driver-salary expenses
  const totalDriverSalary = driverSalaryExpenses.reduce(
    (accumulator, expense) => accumulator + (expense.amount || 0),
    0
  );

  return totalDriverSalary;
};

// for providing insignts while adding salary expense
export function getFixedExpensesByVehicleType(route, vehicle) {
  if (!route || !vehicle) {
    throw new Error('Route and vehicle parameters are required.');
  }

  if (!vehicle.vehicleType || !vehicle.noOfTyres) {
    throw new Error('Both vehicleType and noOfTyres parameters are required.');
  }

  // Find the vehicle-specific configuration in the route
  const vehicleConfig = route.vehicleConfiguration.find(
    (item) =>
      item.vehicleType.toLowerCase() === vehicle.vehicleType.toLowerCase() &&
      item.noOfTyres === vehicle.noOfTyres
  );

  if (!vehicleConfig) {
    throw new Error(
      `No expenses found for vehicleType: ${vehicle.vehicleType} and noOfTyres: ${vehicle.noOfTyres} in the route.`
    );
  }

  // Return combined details (useful for initializing salary expense or UI preview)
  return {
    routeName: route.routeName,
    fromPlace: route.fromPlace,
    toPlace: route.toPlace,
    distance: route.distance,
    noOfDays: route.noOfDays,
    isCustomerSpecific: route.isCustomerSpecific,
    vehicleType: vehicleConfig.vehicleType,
    noOfTyres: vehicleConfig.noOfTyres,
    fixedSalary: vehicleConfig.fixedSalary,
    percentageSalary: vehicleConfig.percentageSalary,
    fixMilage: vehicleConfig.fixMilage,
    performanceMilage: vehicleConfig.performanceMilage,
    diesel: vehicleConfig.diesel,
    adBlue: vehicleConfig.adBlue,
    advanceAmt: vehicleConfig.advanceAmt,
    tollAmt: vehicleConfig.tollAmt,
  };
}
