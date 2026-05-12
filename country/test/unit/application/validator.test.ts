import { validateCountryInformationRequest } from "@application/validator";

describe("validateCountryInformationRequest", () => {
  describe("Valid Inputs", () => {
    it("should validate a simple country name", async () => {
      const result = await validateCountryInformationRequest({
        countryName: "Spain",
      });

      expect(result).toEqual({ countryName: "Spain" });
    });

    it("should validate country name with spaces", async () => {
      const result = await validateCountryInformationRequest({
        countryName: "United Kingdom",
      });

      expect(result).toEqual({ countryName: "United Kingdom" });
    });

    it("should validate country name with hyphens", async () => {
      const result = await validateCountryInformationRequest({
        countryName: "Guinea-Bissau",
      });

      expect(result).toEqual({ countryName: "Guinea-Bissau" });
    });

    it("should validate country name with mixed case", async () => {
      const result = await validateCountryInformationRequest({
        countryName: "FrAnCe",
      });

      expect(result).toEqual({ countryName: "FrAnCe" });
    });

    it("should validate single character country name", async () => {
      const result = await validateCountryInformationRequest({
        countryName: "A",
      });

      expect(result).toEqual({ countryName: "A" });
    });
  });

  describe("Invalid Inputs", () => {
    it("should reject empty string", async () => {
      await expect(
        validateCountryInformationRequest({ countryName: "" }),
      ).rejects.toThrow("Validation error");
    });

    it("should reject missing country name", async () => {
      await expect(validateCountryInformationRequest({})).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject null", async () => {
      await expect(
        validateCountryInformationRequest({ countryName: null }),
      ).rejects.toThrow("Validation error");
    });

    it("should reject undefined", async () => {
      await expect(
        validateCountryInformationRequest({ countryName: undefined }),
      ).rejects.toThrow("Validation error");
    });

    it("should reject country name with numbers", async () => {
      await expect(
        validateCountryInformationRequest({ countryName: "Spain123" }),
      ).rejects.toThrow("Validation error");
    });

    it("should reject country name with special characters", async () => {
      await expect(
        validateCountryInformationRequest({ countryName: "Spain!" }),
      ).rejects.toThrow("Validation error");
    });

    it("should reject country name that is too long", async () => {
      const longName = "A".repeat(101);
      await expect(
        validateCountryInformationRequest({ countryName: longName }),
      ).rejects.toThrow("Validation error");
    });

    it("should reject non-string values", async () => {
      await expect(
        validateCountryInformationRequest({ countryName: 123 }),
      ).rejects.toThrow("Validation error");
    });

    it("should reject boolean values", async () => {
      await expect(
        validateCountryInformationRequest({ countryName: true }),
      ).rejects.toThrow("Validation error");
    });
  });

  describe("Error Messages", () => {
    it("should provide detailed error message for empty string", async () => {
      try {
        await validateCountryInformationRequest({ countryName: "" });
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("Validation error");
      }
    });

    it("should provide detailed error message for invalid characters", async () => {
      try {
        await validateCountryInformationRequest({ countryName: "Spain123" });
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("Validation error");
      }
    });
  });
});
