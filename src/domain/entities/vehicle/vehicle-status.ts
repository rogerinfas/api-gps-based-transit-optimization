export const VehicleStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const;

export type VehicleStatus = (typeof VehicleStatuses)[number];
