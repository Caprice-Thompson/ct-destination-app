import { findCountryInString } from "@application/common/country-extractor";

describe("findCountryInString", () => {
  it("should return matching European country when place contains country as word", () => {
    const country = findCountryInString("12 km NE of Paris, France");

    expect(country).toBe("France");
  });

  it("should return empty string when no known country appears as whole word", () => {
    const country = findCountryInString("unknown region, middle of ocean");

    expect(country).toBe("");
  });

  it("should return first matching country when several appear in the place string", () => {
    const country = findCountryInString("Near France border, Germany");

    expect(country).toBe("France");
  });
});
