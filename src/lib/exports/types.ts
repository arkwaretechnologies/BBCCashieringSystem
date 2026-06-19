export type ExpenseReportRow = {
  categoryName: string;
  total: number;
};

export type CashFlowRow = {
  month: string;
  collections: number;
  expenses: number;
  net: number;
};
