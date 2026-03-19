import type { TableData } from "../../type";
import LogTable from "./LogTable";

type Props = {
  content: string;
  tableData?: TableData | null;
};

const TABLE_TOKEN_REGEX = /(\[\[table:([^\]]+)\]\])/g;

function TextBlock({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="whitespace-pre-wrap break-words text-sm t4 leading-relaxed">
      {text}
    </div>
  );
}

export default function LogContentRenderer({ content, tableData }: Props) {
  if (!content) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(TABLE_TOKEN_REGEX)) {
    const fullMatch = match[1];
    const tableId = match[2];
    const start = match.index ?? 0;
    const end = start + fullMatch.length;

    // 토큰 전 텍스트
    const textBefore = content.slice(lastIndex, start);
    if (textBefore) {
      parts.push(
        <TextBlock key={`text-${lastIndex}-${start}`} text={textBefore} />,
      );
    }

    // 토큰에 해당하는 표
    const table = tableData?.tables?.[tableId];

    if (table) {
      parts.push(<LogTable key={`table-${tableId}-${start}`} table={table} />);
    } else {
      // 표가 없으면 토큰을 그대로 보여줄지, 숨길지 선택 가능
      parts.push(
        <div
          key={`missing-${tableId}-${start}`}
          className="my-3 rounded-md border border-dashed px-3 py-2 text-xs t6"
        >
          table {tableId} not found
        </div>,
      );
    }

    lastIndex = end;
  }

  // 마지막 남은 텍스트
  const rest = content.slice(lastIndex);
  if (rest) {
    parts.push(<TextBlock key={`text-rest-${lastIndex}`} text={rest} />);
  }

  return <div className="space-y-4">{parts}</div>;
}
