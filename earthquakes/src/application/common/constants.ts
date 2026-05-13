const currentDate = new Date();
const eqHistoryYears = 20;
export const formattedEndDate = currentDate.toISOString().split("T")[0];
currentDate.setFullYear(currentDate.getFullYear() - eqHistoryYears);
export const formattedStartDate = currentDate.toISOString().split("T")[0];
export const maxRadiusKm = 2;
export const limit = 5;
export const minMagnitude = 4;
