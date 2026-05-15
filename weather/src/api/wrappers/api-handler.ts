import { ValidationException } from "@application/common/exceptions";
import {
  type Dependencies,
  makeDependencies,
} from "@infrastructure/dependencies";
import {
  type HackedLambdaContext,
  withTraceLogging,
} from "@shared/utils/src/tracing";

type StatusCode =
  | 200
  | 201
  | 202
  | 204
  | 301
  | 302
  | 304
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 500
  | 502
  | 503
  | 504;

type LambdaResponse = {
  statusCode: StatusCode;
  headers: { [key: string]: string };
  body: string;
};

export type APIGatewayProxyEvent = {
  body?: string | null;
  pathParameters?: unknown;
  queryStringParameters?: {
    [name: string]: string | undefined;
  };
  multiValueQueryStringParameters?: {
    [name: string]: string[] | undefined;
  };
  headers?: { [name: string]: string };
};

export type LambdaContext = HackedLambdaContext;

export function createApiHandler<TResult>(
  handler: (
    dependencies: Dependencies,
    event: APIGatewayProxyEvent,
    context?: LambdaContext,
  ) => Promise<TResult>,
  handlerConfig?: {
    successStatusCode?: 200 | 201 | 202 | 204;
    dependencies?: Dependencies;
  },
) {
  const apiHandler = async (
    event?: APIGatewayProxyEvent,
    context?: HackedLambdaContext,
  ): Promise<LambdaResponse> => {
    if (!event) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Event is required" }),
      };
    }

    const dependencies =
      handlerConfig?.dependencies ?? (await makeDependencies());

    try {
      const result = await handler(dependencies, event, context);

      return {
        statusCode: handlerConfig?.successStatusCode ?? 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      };
    } catch (error) {
      if (error instanceof ValidationException) {
        dependencies.logger.warn("Validation error", { errors: error.errors });
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "Validation failed",
            details: error.errors,
          }),
        };
      }

      dependencies.logger.error("Unhandled error", { error });

      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Internal server error" }),
      };
    } finally {
      await dependencies.rdsClient.closeConnection();
    }
  };

  return withTraceLogging(apiHandler);
}
