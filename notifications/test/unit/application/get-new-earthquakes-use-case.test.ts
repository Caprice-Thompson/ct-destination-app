import { getNewEarthquakesUseCase } from "@application/get-new-earthquakes/get-new-earthquakes-use-case";
import type { EarthquakeEvent } from "@domain/entities/earthquake-event";

describe("getNewEarthquakesUseCase", () => {
  const buildDependencies = () => ({
    earthquakeEventsRepository: {
      findSince: jest.fn(),
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

  it("returns events since the user's last notification check", async () => {
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
    dependencies.earthquakeEventsRepository.findSince.mockResolvedValue(events);

    const result = await getNewEarthquakesUseCase(
      { userId: "user-1" },
      dependencies,
    );

    expect(
      dependencies.earthquakeEventsRepository.findSince,
    ).toHaveBeenCalledWith(lastChecked);
    expect(
      dependencies.userRepository.updateLastNotificationsCheckedAt,
    ).toHaveBeenCalledWith("user-1", new Date("2026-06-17T12:00:00.000Z"));
    expect(result).toEqual({
      newEvents: events,
      lastChecked: new Date("2026-06-17T12:00:00.000Z"),
    });
  });

  it("initializes first-time users without returning historical events", async () => {
    const dependencies = buildDependencies();
    const now = new Date("2026-06-17T12:00:00.000Z");

    dependencies.userRepository.getLastNotificationsCheckedAt.mockResolvedValue(
      null,
    );
    dependencies.earthquakeEventsRepository.findSince.mockResolvedValue([]);

    const result = await getNewEarthquakesUseCase(
      { userId: "user-2" },
      dependencies,
    );

    expect(
      dependencies.earthquakeEventsRepository.findSince,
    ).toHaveBeenCalledWith(now);
    expect(
      dependencies.userRepository.updateLastNotificationsCheckedAt,
    ).toHaveBeenCalledWith("user-2", now);
    expect(result.newEvents).toEqual([]);
    expect(result.lastChecked).toEqual(now);
  });
});
