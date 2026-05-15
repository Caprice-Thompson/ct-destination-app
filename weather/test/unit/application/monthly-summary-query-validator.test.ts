import { validateMonthlyWeatherSummaryRequest } from "@application/monthly-weather-summary/monthly-summary-query-validator";

describe("validateMonthlyWeatherSummaryRequest", () => {
  it("should accept month 12", async () => {
    const result = await validateMonthlyWeatherSummaryRequest({
      countryName: "Norway",
      month: "12",
    });

    expect(result).toEqual({ countryName: "Norway", month: "12" });
  });

  it("should throw validation error when month is zero", async () => {
    const run = validateMonthlyWeatherSummaryRequest({
      countryName: "Norway",
      month: "0",
    });

    await expect(run).rejects.toMatchObject({
      errors: [
        {
          path: "month",
          message: "Month must be a number between 1 and 12",
        },
      ],
    });
  });

  it("should throw validation error when country name has invalid characters", async () => {
    const run = validateMonthlyWeatherSummaryRequest({
      countryName: "Norway!",
      month: "4",
    });

    await expect(run).rejects.toMatchObject({
      errors: [
        {
          path: "countryName",
          message:
            "Country name must contain only letters, spaces, and hyphens",
        },
      ],
    });
  });
});
