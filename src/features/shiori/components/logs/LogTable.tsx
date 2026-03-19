import type { SingleTable } from "../../type";

type Props = {
  table?: SingleTable | null;
};

export default function LogTable({ table }: Props) {
  const columns = Array.isArray(table?.columns) ? table.columns : [];
  const rows = Array.isArray(table?.rows) ? table.rows : [];

  if (!table || columns.length === 0) return null;

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                className="border-b px-3 py-2 text-left font-medium"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.id} className="border-b px-3 py-2 align-top">
                  {row.cells[col.id] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
