import { z } from "zod";

// 첨부파일과 링크는 최소한 id가 필요합니다.
// 기존 객체의 다른 속성은 제거하지 않습니다.
const referenceItemSchema = z
  .object({
    id: z.string().min(1),
  })
  .passthrough();

export const createLogSchema = z
  .object({
    // 제목: 공백 제거, 필수, 최대 300자
    title: z.string().trim().min(1).max(300),

    // 본문: 기존 validateCreate의 최소 2자 규칙
    content: z.string().min(2),

    // 태그 정규화는 공유 validateCreate에서 처리
    tags: z.array(z.string()).default([]),

    // 기존 표 데이터 구조 유지
    table_data: z.unknown().nullable().optional(),

    // 첨부파일: id 필수, 다른 필드 유지
    attachments: z.array(referenceItemSchema).default([]),

    // 링크: id 필수, 다른 필드 유지
    links: z.array(referenceItemSchema).nullable().optional(),

    source_filename: z.string().nullable().optional(),

    import_source: z.literal("markdown").nullable().optional(),
  })
  .strict();

export type CreateLogInput = z.infer<typeof createLogSchema>;
