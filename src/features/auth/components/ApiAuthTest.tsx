import { useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/apiClient";

type AuthResponse = {
  authenticated: boolean;
  userId: string;
};

type LogSummary = {
  id: string;
  title: string;
  tags: string[] | null;
  created_at: string;
};

type CreateTestResponse =
  | {
      ok: true;
      row: {
        id: string;
        title: string;
        content: string;
        tags: string[] | null;
      };
    }
  | {
      ok: false;
      reason: "HIDDEN_BY_VIEW";
      createdId: string;
    };

type TestResult = {
  name: string;
  passed: boolean;
  message: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "알 수 없는 오류가 발생했습니다.";
}

export default function ApiAuthTest() {
  const [authMessage, setAuthMessage] = useState("");
  const [logs, setLogs] = useState<LogSummary[]>([]);
  const [logsMessage, setLogsMessage] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [validationResults, setValidationResults] = useState<TestResult[]>([]);

  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);

  // 1. API 인증 테스트
  async function testAuth() {
    setLoadingAuth(true);
    setAuthMessage("인증 확인 중...");

    try {
      const result = await apiGet<AuthResponse>("/api/auth/me");

      setAuthMessage(
        result.authenticated
          ? `Fastify 인증 성공 (사용자 ID: ${result.userId})`
          : "인증 실패",
      );
    } catch (error) {
      setAuthMessage(getErrorMessage(error));
    } finally {
      setLoadingAuth(false);
    }
  }

  // 2. 글 목록 API 조회
  async function testLogs(): Promise<LogSummary[]> {
    setLoadingLogs(true);
    setLogsMessage("글 목록 조회 중...");

    try {
      const result = await apiGet<LogSummary[]>(
        "/api/logs?limit=10&offset=0&orderBy=display_date&ascending=false",
      );

      setLogs(result);
      setLogsMessage(`조회 성공: ${result.length}개`);

      return result;
    } catch (error) {
      setLogs([]);
      setLogsMessage(`글 목록 조회 실패: ${getErrorMessage(error)}`);

      throw error;
    } finally {
      setLoadingLogs(false);
    }
  }

  // 버튼에서 직접 호출할 때 발생한 오류는
  // testLogs 내부에서 이미 화면에 표시하므로 여기서 처리합니다.
  async function handleTestLogs() {
    try {
      await testLogs();
    } catch {
      // 오류 메시지는 testLogs에서 표시합니다.
    }
  }

  // 3. 잘못된 입력 검증 테스트
  async function testCreateValidation() {
    const testCases = [
      {
        name: "제목 누락",
        body: {
          title: "",
          content: "테스트 본문",
          tags: [],
        },
      },
      {
        name: "본문 1자",
        body: {
          title: "테스트 제목",
          content: "a",
          tags: [],
        },
      },
      {
        name: "잘못된 첨부파일 참조",
        body: {
          title: "테스트 제목",
          content: "본문 [[attach:missing-id]]",
          tags: [],
        },
      },
      {
        name: "잘못된 링크 참조",
        body: {
          title: "테스트 제목",
          content: "본문 [[link:missing-id]]",
          tags: [],
        },
      },
    ];

    setLoadingValidation(true);
    setValidationResults([]);

    const results: TestResult[] = [];

    try {
      for (const testCase of testCases) {
        try {
          await apiPost<unknown, typeof testCase.body>(
            "/api/logs",
            testCase.body,
          );

          results.push({
            name: testCase.name,
            passed: false,
            message:
              "예상과 달리 요청이 성공했습니다. DB 저장 여부를 확인하세요.",
          });
        } catch (error) {
          if (error instanceof ApiError && error.status === 400) {
            results.push({
              name: testCase.name,
              passed: true,
              message: "HTTP 400 반환",
            });
          } else {
            results.push({
              name: testCase.name,
              passed: false,
              message: getErrorMessage(error),
            });
          }
        }

        setValidationResults([...results]);
      }
    } finally {
      setLoadingValidation(false);
    }
  }

  // 4. API 테스트 글 생성
  async function testCreateLog() {
    if (loadingCreate) return;

    setLoadingCreate(true);
    setCreateMessage("");

    const uniqueId = Date.now();

    // View의 일반 글 본문 길이 조건(30자 이상)을 충족하도록 작성
    const body = {
      title: `API 생성 테스트 ${uniqueId}`,
      content:
        "Fastify API를 통해 새로운 글을 생성하고, " +
        "데이터베이스에 정상적으로 저장된 뒤 " +
        "Shiori 글 목록 조회 API에서도 표시되는지 확인하는 테스트입니다.",
      tags: ["api", "test"],
      attachments: [],
      links: [],
      table_data: null,
      source_filename: null,
      import_source: null,
    };

    try {
      const result = await apiPost<CreateTestResponse, typeof body>(
        "/api/logs",
        body,
      );

      if (!result.ok) {
        setCreateMessage(
          `DB에는 저장되었지만 View에서 조회되지 않습니다. ID: ${result.createdId}`,
        );
        return;
      }

      const createdId = result.row.id;

      setCreateMessage(`글 생성 성공: ${result.row.title} (ID: ${createdId})`);

      console.log("[성공] 글 생성 완료", result.row);

      // 생성된 글을 실제 GET API 결과로 다시 확인합니다.
      try {
        // GET /api/logs를 한 번만 호출합니다.
        const latestLogs = await testLogs();

        // 반환된 조회 결과에서 방금 생성한 글을 찾습니다.
        const exists = latestLogs.some((log) => log.id === createdId);

        setCreateMessage(
          exists
            ? `글 생성 및 목록 조회 성공: ${result.row.title}`
            : `글 생성 성공. 다만 최신 10개 목록에서 찾지 못했습니다. ID: ${createdId}`,
        );
      } catch (error) {
        setCreateMessage(
          `글은 생성되었지만 목록 재조회에 실패했습니다: ${getErrorMessage(error)}`,
        );
      }
    } catch (error) {
      console.error("[실패] 글 생성 API 오류", error);
      setCreateMessage(`글 생성 실패: ${getErrorMessage(error)}`);
    } finally {
      setLoadingCreate(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Fastify API 테스트</h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={testAuth}
          disabled={loadingAuth}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {loadingAuth ? "인증 확인 중..." : "API 인증 테스트"}
        </button>

        <button
          type="button"
          onClick={handleTestLogs}
          disabled={loadingLogs || loadingCreate}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {loadingLogs ? "조회 중..." : "글 목록 API 테스트"}
        </button>

        <button
          type="button"
          onClick={testCreateValidation}
          disabled={loadingValidation || loadingCreate}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {loadingValidation ? "검증 중..." : "글 생성 검증 테스트"}
        </button>

        <button
          type="button"
          onClick={testCreateLog}
          disabled={loadingCreate || loadingValidation}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {loadingCreate ? "글 생성 중..." : "API 테스트 글 생성"}
        </button>
      </div>

      {authMessage && <p className="text-sm">{authMessage}</p>}

      {createMessage && <p className="text-sm font-medium">{createMessage}</p>}

      {validationResults.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-semibold">입력 검증 결과</h3>

          <ul className="space-y-1 text-sm">
            {validationResults.map((result) => (
              <li key={result.name}>
                {result.passed ? "✓ 통과" : "✗ 실패"} — {result.name}:{" "}
                {result.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="font-semibold">글 목록 API 결과</h3>

        <p className="text-sm">{logsMessage}</p>

        <ul className="space-y-1 text-sm">
          {logs.map((log) => (
            <li key={log.id} className="rounded border p-2">
              <div className="font-medium">{log.title}</div>
              <div className="text-xs opacity-60">ID: {log.id}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
