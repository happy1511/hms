export const SYSTEM_BILLING_SECTION_KEYS = {
  CONSULTATION_CHARGES: "CONSULTATION_CHARGES",
  ROOM_CHARGES: "ROOM_CHARGES",
  OTHER_CHARGES: "OTHER_CHARGES",
} as const;

export const SYSTEM_BILLING_SECTION_NAMES = {
  [SYSTEM_BILLING_SECTION_KEYS.CONSULTATION_CHARGES]: "Consultation Charges",
  [SYSTEM_BILLING_SECTION_KEYS.ROOM_CHARGES]: "Room Charges",
  [SYSTEM_BILLING_SECTION_KEYS.OTHER_CHARGES]: "Other Charges",
} as const;

export const isProtectedBillingSection = (section: {
  systemKey?: string | null;
}) => Boolean(section.systemKey);

export const isProtectedService = (service: {
  consultingDoctorId?: number | null;
  roomId?: number | null;
}) => Boolean(service.consultingDoctorId || service.roomId);
