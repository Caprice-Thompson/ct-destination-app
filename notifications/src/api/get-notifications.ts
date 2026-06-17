import { getNewEarthquakesUseCase } from "@application/get-new-earthquakes/get-new-earthquakes-use-case";
import type { Dependencies } from "@infrastructure/dependencies";
import { resolveAuthenticatedUserId } from "./auth";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

export function getNotificationsHandler(
  dependencies: Dependencies,
  event: APIGatewayProxyEvent,
) {
  const userId = resolveAuthenticatedUserId(event);

  return getNewEarthquakesUseCase({ userId }, {
    earthquakeEventsRepository: dependencies.earthquakeEventsRepository,
    userRepository: dependencies.userRepository,
    logger: dependencies.logger,
  });
}

export const handler = createApiHandler(getNotificationsHandler, {
  successStatusCode: 200,
});
