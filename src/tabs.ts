/**
 * Shared tab navigation types.
 */
export type TabParamList = {
  Services: undefined;
  Book: { serviceId?: string } | undefined;
  Estimates: { serviceId?: string } | undefined;
  Invoices: undefined;
};
