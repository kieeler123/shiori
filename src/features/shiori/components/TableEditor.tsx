import { Button } from "@/shared/ui/primitives/Button";
import type { SingleTable, TableData } from "../type/logs";
import { useI18n } from "@/shared/i18n/LocaleProvider";

type Props = {
  tableData: TableData | null;
  setTableData: React.Dispatch<React.SetStateAction<TableData | null>>;
  tableId?: string;
};

export default function TableEditor({
  tableData,
  setTableData,
  tableId = "1",
}: Props) {
  const { t } = useI18n();
  const table = getSafeTable(tableData, tableId, t);

  function createDefaultTable(
    t: (key: string, vars?: Record<string, any>) => string,
  ): SingleTable {
    return {
      columns: [
        { id: "c1", label: t("logs.table.defaultColumn", { n: 1 }) },
        { id: "c2", label: t("logs.table.defaultColumn", { n: 2 }) },
      ],
      rows: [
        {
          id: "r1",
          cells: {
            c1: "",
            c2: "",
          },
        },
      ],
    };
  }

  function getSafeTable(
    tableData: TableData | null,
    tableId: string,
    t: any,
  ): SingleTable {
    return tableData?.tables?.[tableId] ?? createDefaultTable(t);
  }
  function updateTable(nextTable: SingleTable) {
    setTableData((prev) => ({
      tables: {
        ...(prev?.tables ?? {}),
        [tableId]: nextTable,
      },
    }));
  }

  function handleChangeColumnLabel(columnId: string, nextLabel: string) {
    const nextColumns = table.columns.map((col) =>
      col.id === columnId ? { ...col, label: nextLabel } : col,
    );

    updateTable({
      ...table,
      columns: nextColumns,
    });
  }

  function handleChangeCell(rowId: string, columnId: string, value: string) {
    const nextRows = table.rows.map((row) =>
      row.id === rowId
        ? {
            ...row,
            cells: {
              ...row.cells,
              [columnId]: value,
            },
          }
        : row,
    );

    updateTable({
      ...table,
      rows: nextRows,
    });
  }

  function handleAddColumn() {
    const nextIndex = table.columns.length + 1;
    const newColumnId = `c${nextIndex}`;

    const nextColumns = [
      ...table.columns,
      { id: newColumnId, label: `항목 ${nextIndex}` },
    ];

    const nextRows = table.rows.map((row) => ({
      ...row,
      cells: {
        ...row.cells,
        [newColumnId]: "",
      },
    }));

    updateTable({
      columns: nextColumns,
      rows: nextRows,
    });
  }

  function handleAddRow() {
    const nextIndex = table.rows.length + 1;
    const newRowId = `r${nextIndex}`;

    const cells = Object.fromEntries(table.columns.map((col) => [col.id, ""]));

    const nextRows = [
      ...table.rows,
      {
        id: newRowId,
        cells,
      },
    ];

    updateTable({
      ...table,
      rows: nextRows,
    });
  }

  function handleRemoveColumn(columnId: string) {
    if (table.columns.length <= 1) return;

    const nextColumns = table.columns.filter((col) => col.id !== columnId);

    const nextRows = table.rows.map((row) => {
      const nextCells = { ...row.cells };
      delete nextCells[columnId];
      return {
        ...row,
        cells: nextCells,
      };
    });

    updateTable({
      columns: nextColumns,
      rows: nextRows,
    });
  }

  function handleRemoveRow(rowId: string) {
    if (table.rows.length <= 1) return;

    const nextRows = table.rows.filter((row) => row.id !== rowId);

    updateTable({
      ...table,
      rows: nextRows,
    });
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="soft" onClick={handleAddColumn}>
          {t("logs.table.addColumn")}
        </Button>

        <Button type="button" variant="soft" onClick={handleAddRow}>
          {t("logs.table.addRow")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color:var(--border-soft)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {table.columns.map((col) => (
                <th
                  key={col.id}
                  className="border-b px-3 py-2 align-top text-left"
                >
                  <div className="flex min-w-[140px] items-center gap-2">
                    <input
                      value={col.label}
                      onChange={(e) =>
                        handleChangeColumnLabel(col.id, e.target.value)
                      }
                      className="w-full rounded-md border border-[color:var(--border-soft)] px-2 py-1"
                      placeholder={t("logs.table.headerPlaceholder")}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveColumn(col.id)}
                    >
                      {t("logs.table.removeColumn")}
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {table.rows.map((row) => (
              <tr key={row.id}>
                {table.columns.map((col) => (
                  <td key={col.id} className="border-b px-3 py-2 align-top">
                    <textarea
                      value={row.cells[col.id] ?? ""}
                      onChange={(e) =>
                        handleChangeCell(row.id, col.id, e.target.value)
                      }
                      rows={2}
                      className="w-full min-w-[140px] rounded-md border border-[color:var(--border-soft)] px-2 py-1"
                      placeholder={t("logs.table.cellPlaceholder")}
                    />
                  </td>
                ))}

                <td className="border-b px-3 py-2 align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(row.id)}
                  >
                    {t("logs.table.removeRow")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
