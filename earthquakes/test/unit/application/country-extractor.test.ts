import { findCountryInString } from "@application/common/country-extractor";

describe("findCountryInString", () => {
  describe("European countries", () => {
    it("should return the country matched by the last comma suffix", () => {
      expect(findCountryInString("12 km NE of Paris, France")).toBe("France");
    });

    it("should be case-insensitive when matching the suffix", () => {
      expect(findCountryInString("5 km SW of Athens, greece")).toBe("Greece");
    });

    it("should return the suffix-matched country when multiple European countries appear in the string", () => {
      expect(findCountryInString("Near France border, Germany")).toBe(
        "Germany",
      );
    });

    it("should fall back to whole-string search when suffix does not match any known country", () => {
      expect(findCountryInString("3 km SSW of Cërrik, Albania - region")).toBe(
        "Albania",
      );
    });

    it("should handle multi-word European country names", () => {
      expect(
        findCountryInString("10 km E of Sarajevo, Bosnia and Herzegovina"),
      ).toBe("Bosnia and Herzegovina");
    });

    it("should return correct country for real USGS place format", () => {
      expect(findCountryInString("3 km SSW of Cërrik, Albania")).toBe(
        "Albania",
      );
    });
  });

  describe("United States locations", () => {
    it("should return United States for a US state abbreviation suffix", () => {
      expect(findCountryInString("8 km WNW of Cobb, CA")).toBe("United States");
    });

    it("should return United States for a full US state name suffix", () => {
      expect(findCountryInString("3 km NW of Venersborg, Washington")).toBe(
        "United States",
      );
    });

    it("should return United States for two-letter DC abbreviation", () => {
      expect(findCountryInString("2 km N of Georgetown, DC")).toBe(
        "United States",
      );
    });

    it("should return United States for a territory abbreviation like PR", () => {
      expect(findCountryInString("5 km SE of Ponce, PR")).toBe("United States");
    });

    it("should return United States for a state whose name overlaps with a word elsewhere in the string", () => {
      expect(findCountryInString("10 km NE of Portland, Oregon")).toBe(
        "United States",
      );
    });
  });

  describe("unknown or unrecognised locations", () => {
    it("should return empty string when no known country or US state is found", () => {
      expect(findCountryInString("unknown region, middle of ocean")).toBe("");
    });

    it("should return empty string for an empty string input", () => {
      expect(findCountryInString("")).toBe("");
    });

    it("should return empty string when place has no comma and no recognisable country name", () => {
      expect(findCountryInString("deep ocean ridge")).toBe("");
    });
  });
});
