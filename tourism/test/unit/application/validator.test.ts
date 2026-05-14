import { ValidationException } from "@application/common/exceptions";
import { GetTourismInformationQuery } from "@application/get-tourism-info/get-tourism-information";
import { validateGetTourismInformationRequest } from "@application/validator";

describe("Validator Integration Tests", () => {
  describe("Valid Inputs", () => {
    it("should validate a simple country name", async () => {
      const input = { countryName: "Spain" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("Spain");
    });

    it("should validate country names with spaces", async () => {
      const input = { countryName: "United Kingdom" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("United Kingdom");
    });

    it("should validate country names with hyphens", async () => {
      const input = { countryName: "United-Kingdom" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("United-Kingdom");
    });

    it("should validate country names with mixed case", async () => {
      const input = { countryName: "SpAiN" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("SpAiN");
    });

    it("should validate single character country name", async () => {
      const input = { countryName: "A" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("A");
    });

    it("should validate country name at maximum length (100 chars)", async () => {
      const longName = "A".repeat(100);
      const input = { countryName: longName };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe(longName);
    });

    it("should validate country names with multiple spaces", async () => {
      const input = { countryName: "United Arab Emirates" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("United Arab Emirates");
    });

    it("should validate country names with multiple hyphens", async () => {
      const input = { countryName: "Bosnia-Herzegovina-Test" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("Bosnia-Herzegovina-Test");
    });
  });

  describe("Invalid Inputs - Missing or Empty", () => {
    it("should reject missing countryName", async () => {
      const input = { countryName: "" };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject empty string countryName", async () => {
      const input = { countryName: "" };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject null input", async () => {
      await expect(validateGetTourismInformationRequest(null as unknown as GetTourismInformationQuery)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject undefined input", async () => {
      await expect(
        validateGetTourismInformationRequest(undefined as unknown as GetTourismInformationQuery),
      ).rejects.toThrow(ValidationException);
    });
  });

  describe("Invalid Inputs - Format Violations", () => {
    it("should reject country names with numbers", async () => {
      const input = { countryName: "Spain123" };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject country names with underscores", async () => {
      const input = { countryName: "United_Kingdom" };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject country names with periods", async () => {
      const input = { countryName: "U.S.A" };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject country names with commas", async () => {
      const input = { countryName: "Spain, Europe" };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject country names that are too long", async () => {
      const input = { countryName: "A".repeat(101) };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });
  });

  describe("Type Validation", () => {
    it("should reject numeric countryName", async () => {
      const input = { countryName: 123 as unknown as string };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject boolean countryName", async () => {
      const input = { countryName: true as unknown as string };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject array countryName", async () => {
      const input = { countryName: ["Spain"] as unknown as string };

      await expect(validateGetTourismInformationRequest(input)  ).rejects.toThrow(
        ValidationException,
      );
    });

    it("should reject object countryName", async () => {
      const input = { countryName: { name: "Spain" } as unknown as string };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });
  });

  describe("Error Message Format", () => {
    it("should include field path in error message", async () => {
      const input = { countryName: "" };

      await expect(validateGetTourismInformationRequest(input)).rejects.toThrow(
        ValidationException,
      );
    });

    it("should provide clear error message for invalid format", async () => {
      const input = { countryName: "Spain123" };

      try {
        await validateGetTourismInformationRequest(input);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        expect((error as ValidationException).errors).toEqual([{ path: "countryName", message: "Country name must contain only letters, spaces, hyphens, and apostrophes" }]);
      }
    });

    it("should provide clear error message for missing field", async () => {
      const input = { countryName: "" };

      try {
        await validateGetTourismInformationRequest(input);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        const errors = (error as ValidationException).errors;
        expect(errors.some(e => e.message === "Country name is required")).toBe(true);
      }
    });
  });

  describe("Whitespace Handling", () => {
    it("should accept country names with leading/trailing spaces (trimming handled by caller)", async () => {
      const input = { countryName: "Spain" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("Spain");
    });

    it("should accept country names with spaces between words", async () => {
      const input = { countryName: "New Zealand" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("New Zealand");
    });
  });

  describe("Edge Cases", () => {
    it("should handle extra fields gracefully", async () => {
      const input = { countryName: "Spain", extraField: "ignored" };
      const result = await validateGetTourismInformationRequest(input);

      expect(result.countryName).toBe("Spain");
      expect(
        (result as unknown as { extraField?: string }).extraField,
      ).toBeUndefined();
    });
  });
});
