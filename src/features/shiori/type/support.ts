import type { Uuid, IsoDate } from "./common";

export type TicketStatus = "open" | "answered" | "closed";

export type SupportTicket = {
  id: Uuid;
  user_id: Uuid;
  title: string;
  body: string;
  status: TicketStatus;
  created_at: IsoDate;
  updated_at: IsoDate | null;
  deleted_at: IsoDate | null;
};

// 목록용 타입
export type SupportFaqRow = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  sort_order: number;
  updated_at: string;
};

export type SupportTicketListRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SupportTicketDetailRow = {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SupportTrashListRow = {
  id: string;
  title: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
};
