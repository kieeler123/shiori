import type { FastifyReply, FastifyRequest } from "fastify";

import { z } from "zod";

import {
  createLog,
  listLogs,
  getLogById,
  deleteLogService,
  restoreTrashLogService,
  listTrashLogsService,
  permanentlyDeleteLogService,
  preparePermanentDeleteService,
} from "./service.js";

import { createLogSchema } from "./createSchema.js";

import { updateLogService } from "./service.js";

// ========================================
// 1. 글 목록 조회
// ========================================

const listLogsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),

  offset: z.coerce.number().int().min(0).default(0),

  orderBy: z
    .enum(["display_date", "view_count", "comment_count", "created_at"])
    .default("display_date"),

  ascending: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  userId: z.string().uuid().optional(),
});

export async function listLogsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = listLogsSchema.safeParse(request.query);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "INVALID_QUERY",
      details: parsed.error.flatten(),
    });
  }

  if (!request.accessToken) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  try {
    const logs = await listLogs(request.accessToken, parsed.data);

    return reply.send(logs);
  } catch (error) {
    request.log.error({ err: error }, "Failed to list logs");

    return reply.code(500).send({
      error: "LIST_LOGS_FAILED",
    });
  }
}

// ========================================
// 2. 글 상세 조회
// ========================================

const logIdSchema = z.string().uuid();

export async function getLogController(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
) {
  const parsed = logIdSchema.safeParse(request.params.id);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "INVALID_LOG_ID",
      message: "올바른 글 ID가 아닙니다.",
    });
  }

  if (!request.accessToken) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  try {
    const log = await getLogById(request.accessToken, parsed.data);

    if (!log) {
      return reply.code(404).send({
        error: "LOG_NOT_FOUND",
        message: "글을 찾을 수 없습니다.",
      });
    }

    return reply.send(log);
  } catch (error) {
    request.log.error({ err: error }, "Failed to get log");

    return reply.code(500).send({
      error: "GET_LOG_FAILED",
    });
  }
}

// ========================================
// 3. 글 생성
// ========================================

export async function createLogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // 1. 로그인 확인
  if (!request.accessToken || !request.userId) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  // 2. 요청 데이터 형식 검증
  const parsed = createLogSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "INVALID_LOG_INPUT",
      details: parsed.error.flatten(),
    });
  }

  try {
    // 3. 도메인 검증 및 DB 저장
    const result = await createLog(
      request.accessToken,
      request.userId,
      parsed.data,
    );

    // 4. 중복 글
    if (result.kind === "duplicate") {
      return reply.code(409).send({
        error: "DUPLICATE_LOG",
      });
    }

    // 5. 저장됐지만 View에서 조회되지 않는 글
    if (result.kind === "hidden") {
      return reply.code(201).send({
        ok: false,
        reason: "HIDDEN_BY_VIEW",
        createdId: result.createdId,
      });
    }

    // 6. 정상 생성
    return reply.code(201).send({
      ok: true,
      row: result.row,
    });
  } catch (error) {
    // 7. 공유 도메인 검증 오류 처리
    if (error instanceof Error) {
      const validationMessages = [
        "제목을 입력해주세요.",
        "내용을 입력해주세요.",
        "내용이 너무 짧습니다.",
      ];

      const isValidationError =
        validationMessages.includes(error.message) ||
        error.message.startsWith("INVALID_ATTACHMENT_REFERENCE:") ||
        error.message.startsWith("INVALID_LINK_REFERENCE:");

      if (isValidationError) {
        return reply.code(400).send({
          error: "INVALID_LOG_INPUT",
          message: error.message,
        });
      }
    }

    // 8. 예상하지 못한 서버 오류
    request.log.error({ err: error }, "Failed to create log");

    return reply.code(500).send({
      error: "CREATE_LOG_FAILED",
    });
  }
}

const updateParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateBodySchema = createLogSchema;

export async function updateLogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // 1. 인증 확인
  if (!request.userId || !request.accessToken) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  // 2. 글 ID 검증
  const paramsResult = updateParamsSchema.safeParse(request.params);

  if (!paramsResult.success) {
    return reply.code(400).send({
      error: "INVALID_LOG_ID",
      message: "올바른 글 ID가 아닙니다.",
    });
  }

  // 3. 수정 요청 데이터 검증
  const bodyResult = updateBodySchema.safeParse(request.body);

  if (!bodyResult.success) {
    return reply.code(400).send({
      error: "INVALID_UPDATE_INPUT",
      issues: bodyResult.error.issues,
    });
  }

  try {
    // 4. 서비스 호출
    const result = await updateLogService({
      id: paramsResult.data.id,
      userId: request.userId,
      accessToken: request.accessToken,
      input: bodyResult.data,
    });

    // 5. 수정 대상이 없거나 본인 글이 아닌 경우
    if (result.status === "NOT_FOUND") {
      return reply.code(404).send({
        error: "NOT_FOUND",
        message: "수정할 글을 찾을 수 없거나 수정 권한이 없습니다.",
      });
    }

    // 6. 수정은 됐지만 View에서 조회되지 않는 경우
    if (result.status === "HIDDEN_BY_VIEW") {
      return reply.code(409).send({
        error: "HIDDEN_BY_VIEW",
        message: "글은 수정되었지만 목록 표시 조건을 충족하지 못했습니다.",
      });
    }

    // 7. 정상 수정
    return reply.code(200).send(result.row);
  } catch (error) {
    // 8. 도메인 검증 오류
    if (error instanceof Error) {
      const validationMessages = [
        "제목을 입력해주세요.",
        "내용을 입력해주세요.",
        "내용이 너무 짧습니다.",
      ];

      const isValidationError =
        validationMessages.includes(error.message) ||
        error.message.startsWith("INVALID_ATTACHMENT_REFERENCE:") ||
        error.message.startsWith("INVALID_LINK_REFERENCE:");

      if (isValidationError) {
        return reply.code(400).send({
          error: "INVALID_UPDATE_INPUT",
          message: error.message,
        });
      }
    }

    // 9. 예상하지 못한 서버 오류
    request.log.error({ err: error }, "Failed to update log");

    return reply.code(500).send({
      error: "UPDATE_LOG_FAILED",
      message: "글 수정 중 서버 오류가 발생했습니다.",
    });
  }
}

export async function deleteLogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.userId || !request.accessToken) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  const paramsResult = updateParamsSchema.safeParse(request.params);

  if (!paramsResult.success) {
    return reply.code(400).send({
      error: "INVALID_LOG_ID",
      message: "올바른 글 ID가 아닙니다.",
    });
  }

  try {
    const result = await deleteLogService({
      id: paramsResult.data.id,
      userId: request.userId,
      accessToken: request.accessToken,
    });

    if (result.status === "NOT_FOUND") {
      return reply.code(404).send({
        error: "NOT_FOUND",
        message: "삭제할 글을 찾을 수 없거나 삭제 권한이 없습니다.",
      });
    }

    return reply.code(204).send();
  } catch (error) {
    request.log.error({ err: error }, "Failed to move log to trash");

    return reply.code(500).send({
      error: "DELETE_LOG_FAILED",
      message: "휴지통 이동 중 서버 오류가 발생했습니다.",
    });
  }
}

/** GET /api/logs/trash */
export async function listTrashLogsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.userId || !request.accessToken) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  try {
    const rows = await listTrashLogsService(
      request.accessToken,
      request.userId,
    );

    return reply.code(200).send(rows);
  } catch (error) {
    request.log.error({ err: error }, "Failed to list trash logs");

    return reply.code(500).send({
      error: "LIST_TRASH_LOGS_FAILED",
    });
  }
}

/** POST /api/logs/:id/restore */
export async function restoreTrashLogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.userId || !request.accessToken) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  const paramsResult = updateParamsSchema.safeParse(request.params);

  if (!paramsResult.success) {
    return reply.code(400).send({
      error: "INVALID_LOG_ID",
      message: "올바른 글 ID가 아닙니다.",
    });
  }

  try {
    const result = await restoreTrashLogService({
      id: paramsResult.data.id,
      userId: request.userId,
      accessToken: request.accessToken,
    });

    if (result.status === "NOT_FOUND") {
      return reply.code(404).send({
        error: "NOT_FOUND",
        message: "복구할 글을 찾을 수 없거나 복구 권한이 없습니다.",
      });
    }

    return reply.code(204).send();
  } catch (error) {
    request.log.error({ err: error }, "Failed to restore trash log");

    return reply.code(500).send({
      error: "RESTORE_TRASH_LOG_FAILED",
    });
  }
}

export async function permanentlyDeleteLogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.userId || !request.accessToken) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  const paramsResult = updateParamsSchema.safeParse(request.params);

  if (!paramsResult.success) {
    return reply.code(400).send({
      error: "INVALID_LOG_ID",
    });
  }

  try {
    const result = await permanentlyDeleteLogService({
      id: paramsResult.data.id,
      userId: request.userId,
      accessToken: request.accessToken,
    });

    if (result.status === "NOT_FOUND") {
      return reply.code(404).send({
        error: "NOT_FOUND",
        message: "완전 삭제할 글을 찾을 수 없습니다.",
      });
    }

    if (result.status === "ATTACHMENTS_EXIST") {
      return reply.code(409).send({
        error: "ATTACHMENTS_EXIST",
        message:
          "첨부파일이 있는 글은 아직 Fastify 완전 삭제를 지원하지 않습니다.",
      });
    }

    return reply.code(204).send();
  } catch (error) {
    request.log.error({ err: error }, "Failed to permanently delete log");

    return reply.code(500).send({
      error: "PERMANENT_DELETE_FAILED",
    });
  }
}

export async function preparePermanentDeleteController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.userId || !request.accessToken) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
    });
  }

  const params = updateParamsSchema.safeParse(request.params);

  if (!params.success) {
    return reply.code(400).send({
      error: "INVALID_LOG_ID",
    });
  }

  try {
    const result = await preparePermanentDeleteService({
      id: params.data.id,
      userId: request.userId,
      accessToken: request.accessToken,
    });

    if (result.status === "NOT_FOUND") {
      return reply.code(404).send({
        error: "NOT_FOUND",
      });
    }

    return reply.code(200).send({
      attachments: result.attachments,
    });
  } catch (error) {
    request.log.error({ err: error }, "Failed to prepare permanent delete");

    return reply.code(500).send({
      error: "PREPARE_PERMANENT_DELETE_FAILED",
    });
  }
}
