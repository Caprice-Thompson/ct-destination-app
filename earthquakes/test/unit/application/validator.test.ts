import { validateMostRecentEqRequest } from "@application/validator";

describe("validateMostRecentEqRequest", () => {
  describe("Valid Inputs", () => {
    it("should validate complete query parameters", async () => {
      const query = {
        countryName: "Spain",
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result).toEqual(query);
    });

    it("should validate country name with spaces", async () => {
      const query = {
        countryName: "United Kingdom",
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result.countryName).toBe("United Kingdom");
    });

    it("should validate country name with hyphens", async () => {
      const query = {
        countryName: "Guinea-Bissau",
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result.countryName).toBe("Guinea-Bissau");
    });
  });

  describe("Invalid Inputs", () => {
    it("should reject empty country name", async () => {
      const query = {
        countryName: "",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject country name with numbers", async () => {
      const query = {
        countryName: "Spain123",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject country name with special characters", async () => {
      const query = {
        countryName: "Spain!",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });
  });
});
