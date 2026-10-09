import { type FastifyInstance } from "fastify";

import { requireAuth } from "../../middleware/requireAuth.js";

import {
  listLogsController,
  getLogController,
  createLogController,
  updateLogController,
  deleteLogController,
  restoreTrashLogController,
  listTrashLogsController,
  permanentlyDeleteLogController,
  preparePermanentDeleteController,
} from "./controller.js";

export async function shioriRoutes(fastify: FastifyInstance) {
  // 일반 글 목록
  fastify.get("/logs", { preHandler: requireAuth }, listLogsController);

  // 휴지통 목록
  fastify.get(
    "/logs/trash",
    { preHandler: requireAuth },
    listTrashLogsController,
  );

  // 글 상세
  fastify.get<{ Params: { id: string } }>(
    "/logs/:id",
    { preHandler: requireAuth },
    getLogController,
  );

  // 글 작성
  fastify.post("/logs", { preHandler: requireAuth }, createLogController);

  // 글 수정
  fastify.patch("/logs/:id", { preHandler: requireAuth }, updateLogController);

  // 휴지통 이동
  fastify.delete("/logs/:id", { preHandler: requireAuth }, deleteLogController);

  // 휴지통 복구
  fastify.post(
    "/logs/:id/restore",
    { preHandler: requireAuth },
    restoreTrashLogController,
  );

  fastify.delete(
    "/logs/:id/permanent",
    {
      preHandler: requireAuth,
    },
    permanentlyDeleteLogController,
  );

  fastify.post(
    "/logs/:id/permanent/prepare",
    {
      preHandler: requireAuth,
    },
    preparePermanentDeleteController,
  );
}
