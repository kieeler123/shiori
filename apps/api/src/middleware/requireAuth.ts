import type { FastifyReply, FastifyRequest } from "fastify";

import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

const supabaseAuth = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authorization = request.headers.authorization;

  if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
    return reply.code(401).send({
      error: "UNAUTHORIZED",
      message: "Access token is required",
    });
  }

  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      return reply.code(401).send({
        error: "INVALID_TOKEN",
        message: "Invalid or expired token",
      });
    }

    request.userId = data.user.id;
    request.accessToken = token;
  } catch (error) {
    request.log.error({ err: error }, "Supabase Auth verification failed");

    return reply.code(503).send({
      error: "AUTH_SERVICE_UNAVAILABLE",
      message: "Authentication service unavailable",
    });
  }
}
