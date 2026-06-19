import { getNewEarthquakes } from "@application/get-new-earthquakes/get-real-time-earthquakes";
import type { Dependencies } from "@infrastructure/dependencies";
import { resolveAuthenticatedUserId } from "./auth";
import { type APIGatewayProxyEvent, createApiHandler } from "./wrappers";

export function getNotificationsHandler(
  dependencies: Dependencies,
  event: APIGatewayProxyEvent,
) {
  const userId = resolveAuthenticatedUserId(event);

  return getNewEarthquakes(
    { userId },
    {
      earthquakeEventsRepository: dependencies.earthquakeEventsRepository,
      userRepository: dependencies.userRepository,
      logger: dependencies.logger,
    },
  );
}

export const handler = createApiHandler(getNotificationsHandler, {
  successStatusCode: 200,
});
