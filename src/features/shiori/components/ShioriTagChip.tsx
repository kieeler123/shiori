import TagChip from "@/shared/ui/primitives/TagChip";

type Props = {
  tag: string;
  active?: boolean;
  onClick: (tag: string) => void;
  className?: string;
  titlePrefix?: string;
  children?: React.ReactNode;
};

export default function ShioriTagChip({ ...props }: Props) {
  const content = props.children ?? (
    <>
      <span className="opacity-80">#</span>
      <span>{props.tag}</span>
    </>
  );
  return <TagChip>{content}</TagChip>;
}
