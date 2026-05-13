import { validateLatestEarthquakesRequest } from "@application/list-latest-earthquakes/list-latest-earthquakes-query-validator";

describe("validateLatestEarthquakesRequest", () => {
  it("should accept country name with spaces", async () => {
    const result = await validateLatestEarthquakesRequest({
      countryName: "United Kingdom",
    });

    expect(result.countryName).toBe("United Kingdom");
  });

  it("should accept country name with hyphens", async () => {
    const result = await validateLatestEarthquakesRequest({
      countryName: "Guinea-Bissau",
    });

    expect(result.countryName).toBe("Guinea-Bissau");
  });

  it("should throw validation error when country name is empty", async () => {
    const run = validateLatestEarthquakesRequest({ countryName: "" });

    await expect(run).rejects.toMatchObject({
      errors: expect.arrayContaining([
        {
          path: "countryName",
          message: "Country name is required",
        },
      ]),
    });
  });

  it("should throw validation error when country name contains numbers", async () => {
    const run = validateLatestEarthquakesRequest({ countryName: "Spain2" });

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
