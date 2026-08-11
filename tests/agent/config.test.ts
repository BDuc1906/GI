// tests/agent/config.test.ts
import { describe, expect, it, afterEach } from "vitest";
import { validateConfig } from "@/agent/core/config";

const ORIGINAL = {
  MODEL: process.env.AGENT_LLM_MODEL,
  OPENAI: process.env.OPENAI_API_KEY,
  ANTHROPIC: process.env.ANTHROPIC_API_KEY,
  DB: process.env.DATABASE_URL,
  USE_DB: process.env.AGENT_USE_DB,
};

afterEach(() => {
  for (const [key, envKey] of Object.entries({
    MODEL: "AGENT_LLM_MODEL",
    OPENAI: "OPENAI_API_KEY",
    ANTHROPIC: "ANTHROPIC_API_KEY",
    DB: "DATABASE_URL",
    USE_DB: "AGENT_USE_DB",
  })) {
    const val = ORIGINAL[key as keyof typeof ORIGINAL];
    if (val === undefined) delete process.env[envKey];
    else process.env[envKey] = val;
  }
});

describe("validateConfig", () => {
  it("báo lỗi khi dùng model OpenAI mà thiếu OPENAI_API_KEY", () => {
    process.env.AGENT_LLM_MODEL = "gpt-4o";
    delete process.env.OPENAI_API_KEY;
    const errors = validateConfig();
    expect(errors.some((e) => e.includes("OPENAI_API_KEY"))).toBe(true);
  });

  it("không báo lỗi model khi đã có đúng API key tương ứng", () => {
    process.env.AGENT_LLM_MODEL = "claude-sonnet-4-6";
    process.env.ANTHROPIC_API_KEY = "sk-test";
    const errors = validateConfig();
    expect(errors.some((e) => e.includes("ANTHROPIC_API_KEY"))).toBe(false);
  });

  it("báo lỗi khi bật AGENT_USE_DB nhưng thiếu DATABASE_URL", () => {
    process.env.AGENT_USE_DB = "true";
    delete process.env.DATABASE_URL;
    const errors = validateConfig();
    expect(errors.some((e) => e.includes("DATABASE_URL"))).toBe(true);
  });
});
