import { supabase } from "@/lib/supabaseClient";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001"
).replace(/\/$/, "");

export async function apiGet<T>(path: string): Promise<T> {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API 요청 실패 (${response.status})`);
  }

  return (await response.json()) as T;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => null);

    if (response.status === 409) {
      throw new Error("DUPLICATE_LOG");
    }

    throw new ApiError(
      response.status,
      responseBody?.message ?? `API 요청 실패 (${response.status})`,
    );
  }

  return (await response.json()) as TResponse;
}

export async function apiPatch<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => null);

    throw new ApiError(
      response.status,
      typeof responseBody?.message === "string"
        ? responseBody.message
        : `글 수정 API 요청 실패 (${response.status})`,
    );
  }

  return (await response.json()) as TResponse;
}

export async function apiDelete(path: string): Promise<void> {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => null);

    throw new ApiError(
      response.status,
      responseBody?.message ?? `휴지통 이동 API 요청 실패 (${response.status})`,
    );
  }
}

export async function apiPostNoContent(path: string): Promise<void> {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => null);

    throw new ApiError(
      response.status,
      typeof responseBody?.message === "string"
        ? responseBody.message
        : `API 요청 실패 (${response.status})`,
    );
  }
}
