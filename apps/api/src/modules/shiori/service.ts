import {
  deleteLogRepository,
  findLogById,
  findLogForPermanentDelete,
  findLogsPage,
  findTrashLogsMine,
  permanentlyDeleteLogRow,
  restoreTrashLog,
  updateLogRepository,
  type ListLogsQuery,
} from "./repository.js";

import { validateCreate, validateContentBlocks } from "@shiori/domain";

import { insertLog } from "./repository.js";
import type { CreateLogInput, createLogSchema } from "./createSchema.js";

export async function listLogs(accessToken: string, query: ListLogsQuery) {
  return findLogsPage(accessToken, query);
}

export async function getLogById(accessToken: string, id: string) {
  return findLogById(accessToken, id);
}

export async function createLog(
  accessToken: string,
  userId: string,
  input: CreateLogInput,
) {
  // 1. 제목, 본문, 태그 검증 및 정규화
  const normalized = validateCreate({
    title: input.title,
    content: input.content,
    tags: input.tags,
  });

  // 2. 본문에 포함된 첨부파일/링크 참조 검증
  validateContentBlocks({
    content: normalized.content,
    attachments: input.attachments,
    links: input.links,
  });

  // 3. 검증 및 정규화된 값으로 저장 데이터 생성
  const normalizedInput: CreateLogInput = {
    ...input,
    title: normalized.title,
    content: normalized.content,
    tags: normalized.tags,
  };

  // 4. 중복 확인 및 DB 저장
  const result = await insertLog(accessToken, userId, normalizedInput);

  if (result.kind === "duplicate") {
    return {
      kind: "duplicate" as const,
    };
  }

  // 5. 저장된 글 상세 조회
  const row = await getLogById(accessToken, result.id);

  // 6. View에서 조회되지 않는 경우
  if (!row) {
    return {
      kind: "hidden" as const,
      createdId: result.id,
    };
  }

  // 7. 글 생성 성공
  return {
    kind: "created" as const,
    row,
  };
}

type UpdateLogInput = CreateLogInput;

export async function updateLogService(args: {
  id: string;
  userId: string;
  accessToken: string;
  input: UpdateLogInput;
}) {
  // 1. 제목, 본문, 태그 검증
  const normalized = validateCreate({
    title: args.input.title,
    content: args.input.content,
    tags: args.input.tags,
  });

  // 2. 첨부파일과 링크 참조 검증
  validateContentBlocks({
    content: normalized.content,
    attachments: args.input.attachments,
    links: args.input.links ?? [],
  });

  // 3. 기존 Shiori 저장 규칙 적용
  const normalizedInput = {
    title: normalized.title,
    content: normalized.content,
    tags: normalized.tags,
    table_data: args.input.table_data ?? null,
    attachments: args.input.attachments,
    links: args.input.links ?? [],
    source_filename:
      args.input.source_filename?.normalize("NFC").trim() || null,
    import_source: args.input.import_source ?? null,
  };

  // 4. DB 수정
  const updated = await updateLogRepository({
    id: args.id,
    userId: args.userId,
    accessToken: args.accessToken,
    input: normalizedInput,
  });

  if (!updated) {
    return {
      status: "NOT_FOUND" as const,
    };
  }

  // 5. 기존 dbUpdate와 동일하게 View에서 다시 조회
  const row = await getLogById(args.accessToken, args.id);

  if (!row) {
    return {
      status: "HIDDEN_BY_VIEW" as const,
    };
  }

  return {
    status: "OK" as const,
    row,
  };
}

export async function deleteLogService(args: {
  id: string;
  userId: string;
  accessToken: string;
}) {
  const deleted = await deleteLogRepository(args);

  if (!deleted) {
    return {
      status: "NOT_FOUND" as const,
    };
  }

  return {
    status: "DELETED" as const,
  };
}

/** 내 휴지통 목록 */
export async function listTrashLogsService(
  accessToken: string,
  userId: string,
) {
  return findTrashLogsMine(accessToken, userId);
}

/** 휴지통에서 복구 */
export async function restoreTrashLogService(args: {
  id: string;
  userId: string;
  accessToken: string;
}) {
  const restored = await restoreTrashLog(args);

  if (!restored) {
    return {
      status: "NOT_FOUND" as const,
    };
  }

  return {
    status: "RESTORED" as const,
  };
}

export async function permanentlyDeleteLogService(args: {
  id: string;
  userId: string;
  accessToken: string;
}) {
  const row = await findLogForPermanentDelete(args);

  if (!row) {
    return { status: "NOT_FOUND" as const };
  }

  // 파일이 남아 있는 글의 DB 행을 실수로 먼저 삭제하지 않도록 방어
  if (Array.isArray(row.attachments) && row.attachments.length > 0) {
    return { status: "ATTACHMENTS_EXIST" as const };
  }

  const deleted = await permanentlyDeleteLogRow(args);

  if (!deleted) {
    return { status: "NOT_FOUND" as const };
  }

  return { status: "DELETED" as const };
}

export async function preparePermanentDeleteService(args: {
  id: string;
  userId: string;
  accessToken: string;
}) {
  const row = await findLogForPermanentDelete(args);

  if (!row) {
    return {
      status: "NOT_FOUND" as const,
    };
  }

  const attachments = Array.isArray(row.attachments) ? row.attachments : [];

  return {
    status: "READY" as const,
    attachments,
  };
}
