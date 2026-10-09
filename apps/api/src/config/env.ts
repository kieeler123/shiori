import "dotenv/config";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "127.0.0.1",

  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  supabaseUrl: requiredEnv("SUPABASE_URL"),
  supabaseAnonKey: requiredEnv("SUPABASE_ANON_KEY"),

  // DB와 파일 저장소는 아직 선택 설정
  databaseUrl: process.env.DATABASE_URL,
  uploadDir: process.env.UPLOAD_DIR,
};
