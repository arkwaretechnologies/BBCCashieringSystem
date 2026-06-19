import ExcelJS from "exceljs";
import type { CashFlowRow, ExpenseReportRow } from "./types";

export async function exportExpenseReportToExcel(
  rows: ExpenseReportRow[],
  yearMonth: string
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Monthly Expenses");

  sheet.columns = [
    { header: "Category", key: "categoryName", width: 30 },
    { header: "Total", key: "total", width: 16 },
  ];

  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export async function exportCashFlowToExcel(rows: CashFlowRow[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Cash Flow");

  sheet.columns = [
    { header: "Month", key: "month", width: 14 },
    { header: "Collections", key: "collections", width: 16 },
    { header: "Expenses", key: "expenses", width: 16 },
    { header: "Net", key: "net", width: 16 },
  ];

  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
