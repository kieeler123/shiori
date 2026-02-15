import { cn } from "@/shared/ui/utils/cn";

export function PageSection({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-8 space-y-4", className)} {...props} />;
}
