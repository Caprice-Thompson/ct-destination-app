import type { ZodError } from "zod";

export class ConfigurationException extends Error {
  constructor(error: ZodError) {
    const errors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    super(
      `Invalid environment configuration: ${errors
        .map((e) => `${e.path} (${e.message})`)
        .join(", ")}`,
    );
    this.name = "ConfigurationException";
    this.errors = errors;
  }

  errors: { path: string; message: string }[];
}
