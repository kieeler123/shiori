export type Uuid = string;
export type IsoDate = string;

export type HeaderProps = {
  title?: string;
  versionText?: string;
  searchOpen: boolean;
  onToggleSearch: () => void;
  onCloseSearch: () => void;
};
