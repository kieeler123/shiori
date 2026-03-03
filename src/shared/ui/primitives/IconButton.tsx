// IconButton.tsx
import type { ButtonProps } from "./Button";
import { Button } from "./Button";

type Props = Omit<ButtonProps, "variant">;

export function IconButton(props: Props) {
  return <Button variant="icon" {...props} />;
}
