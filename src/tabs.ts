/**
 * Shared tab navigation types.
 */
export type TabParamList = {
  Services: undefined;
  Book: { serviceId?: string } | undefined;
  Quotes: { serviceId?: string } | undefined;
  Invoices: undefined;
};
