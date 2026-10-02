import { getNewEarthquakes } from "@application/get-new-earthquakes/get-real-time-earthquakes";
import type { EarthquakeEvent } from "@infrastructure/services/earthquakes-api-service";

describe("getNewEarthquakesUseCase", () => {
  const buildDependencies = () => ({
    earthquakeEventsRepository: {
      findEarthquakesAfterDate: jest.fn(),
    },
    userRepository: {
      getLastNotificationsCheckedAt: jest.fn(),
      updateLastNotificationsCheckedAt: jest.fn(),
    },
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-06-17T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("should return events since the user's last notification check", async () => {
    const dependencies = buildDependencies();
    const lastChecked = new Date("2026-06-17T11:00:00.000Z");
    const events: EarthquakeEvent[] = [
      {
        id: "eq-1",
        magnitude: 4.2,
        location: "Near Lisbon, Portugal",
        occurredAt: new Date("2026-06-17T11:30:00.000Z"),
      },
    ];

    dependencies.userRepository.getLastNotificationsCheckedAt.mockResolvedValue(
      lastChecked,
    );
    dependencies.earthquakeEventsRepository.findEarthquakesAfterDate.mockResolvedValue(
      events,
    );

    const result = await getNewEarthquakes({ userId: "user-1" }, dependencies);

    expect(
      dependencies.earthquakeEventsRepository.findEarthquakesAfterDate,
    ).toHaveBeenCalledWith(lastChecked);
    expect(
      dependencies.userRepository.updateLastNotificationsCheckedAt,
    ).toHaveBeenCalledWith("user-1", new Date("2026-06-17T12:00:00.000Z"));
    expect(result).toEqual({
      newEvents: events,
      lastChecked: new Date("2026-06-17T12:00:00.000Z"),
    });
  });

  it("should initialise first-time users without returning historical events", async () => {
    const dependencies = buildDependencies();
    const now = new Date("2026-06-17T12:00:00.000Z");

    dependencies.userRepository.getLastNotificationsCheckedAt.mockResolvedValue(
      null,
    );
    dependencies.earthquakeEventsRepository.findEarthquakesAfterDate.mockResolvedValue(
      [],
    );

    const result = await getNewEarthquakes({ userId: "user-2" }, dependencies);

    expect(
      dependencies.earthquakeEventsRepository.findEarthquakesAfterDate,
    ).toHaveBeenCalledWith(now);
    expect(
      dependencies.userRepository.updateLastNotificationsCheckedAt,
    ).toHaveBeenCalledWith("user-2", now);
    expect(result.newEvents).toEqual([]);
    expect(result.lastChecked).toEqual(now);
  });
});
