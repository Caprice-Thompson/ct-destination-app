import { AuthenticationException } from "@application/common/exceptions";
import type { APIGatewayProxyEvent } from "./wrappers";

type JwtPayload = {
  sub?: unknown;
};

function readAuthorizationHeader(event: APIGatewayProxyEvent): string | null {
  const headers = event.headers ?? {};

  return (
    headers.Authorization ??
    headers.authorization ??
    headers.AUTHORIZATION ??
    null
  );
}
// does not verify signature with supabase secrets or JWKS
export function resolveAuthenticatedUserId(
  event: APIGatewayProxyEvent,
): string {
  const authorization = readAuthorizationHeader(event);

  if (!authorization?.startsWith("Bearer ")) {
    throw new AuthenticationException();
  }

  const token = authorization.slice("Bearer ".length);
  const [, payload] = token.split(".");

  if (!payload) {
    throw new AuthenticationException("Invalid authentication token");
  }

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    ) as JwtPayload;

    if (typeof decodedPayload.sub !== "string" || !decodedPayload.sub) {
      throw new AuthenticationException("Authenticated user ID is missing");
    }

    return decodedPayload.sub;
  } catch (error) {
    if (error instanceof AuthenticationException) {
      throw error;
    }

    throw new AuthenticationException("Invalid authentication token");
  }
}
