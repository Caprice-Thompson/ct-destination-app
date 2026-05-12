import { UNESCOSites } from "@domain/entities/unesco-sites";

describe("UNESCOSites Entity", () => {
  describe("Constructor", () => {
    it("should create a UNESCO site with all fields", () => {
      const site = new UNESCOSites(
        "ES",
        "Spain",
        "Andalusia",
        "Alhambra",
        "A palace and fortress complex located in Granada",
      );

      expect(site.countryCode).toBe("ES");
      expect(site.countryName).toBe("Spain");
      expect(site.areaName).toBe("Andalusia");
      expect(site.site).toBe("Alhambra");
      expect(site.description).toBe(
        "A palace and fortress complex located in Granada",
      );
    });

    it("should create a UNESCO site without description", () => {
      const site = new UNESCOSites(
        "IT",
        "Italy",
        "Lazio",
        "Colosseum",
        undefined,
      );

      expect(site.countryCode).toBe("IT");
      expect(site.countryName).toBe("Italy");
      expect(site.areaName).toBe("Lazio");
      expect(site.site).toBe("Colosseum");
      expect(site.description).toBeUndefined();
    });

    it("should handle empty string description", () => {
      const site = new UNESCOSites(
        "FR",
        "France",
        "Île-de-France",
        "Eiffel Tower",
        "",
      );

      expect(site.description).toBe("");
    });

    it("should handle special characters in site names", () => {
      const site = new UNESCOSites(
        "FR",
        "France",
        "Île-de-France",
        "Palace of Versailles",
        "Royal château",
      );

      expect(site.areaName).toBe("Île-de-France");
      expect(site.description).toBe("Royal château");
    });
  });

  describe("toJSON", () => {
    it("should serialize to JSON with all fields", () => {
      const site = new UNESCOSites(
        "GB",
        "United Kingdom",
        "England",
        "Stonehenge",
        "Prehistoric monument",
      );

      const json = site.toJSON();

      expect(json).toEqual({
        countryCode: "GB",
        countryName: "United Kingdom",
        areaName: "England",
        site: "Stonehenge",
        description: "Prehistoric monument",
      });
    });

    it("should serialize to JSON without description", () => {
      const site = new UNESCOSites(
        "DE",
        "Germany",
        "Bavaria",
        "Neuschwanstein Castle",
        undefined,
      );

      const json = site.toJSON();

      expect(json).toEqual({
        countryCode: "DE",
        countryName: "Germany",
        areaName: "Bavaria",
        site: "Neuschwanstein Castle",
        description: undefined,
      });
    });

    it("should handle long descriptions", () => {
      const longDescription =
        "This is a very long description that contains multiple sentences. " +
        "It provides detailed information about the UNESCO World Heritage Site. " +
        "The description can include historical context, architectural details, and cultural significance.";

      const site = new UNESCOSites(
        "EG",
        "Egypt",
        "Giza",
        "Pyramids of Giza",
        longDescription,
      );

      const json = site.toJSON();

      expect(json.description).toBe(longDescription);
    });

    it("should handle special characters in all fields", () => {
      const site = new UNESCOSites(
        "PE",
        "Peru",
        "Cusco",
        "Machu Picchu",
        "15th-century Inca citadel",
      );

      const json = site.toJSON();

      expect(json).toEqual({
        countryCode: "PE",
        countryName: "Peru",
        areaName: "Cusco",
        site: "Machu Picchu",
        description: "15th-century Inca citadel",
      });
    });
  });
});
