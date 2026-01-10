import { validateMostRecentEqRequest } from "@application/validator";

describe("validateMostRecentEqRequest", () => {
  describe("Valid Inputs", () => {
    it("should validate complete query with all parameters", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        maxRadiusKm: 300,
        minMagnitude: 4.0,
        limit: 10,
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result).toEqual(query);
    });

    it("should validate query with only required parameters", async () => {
      const query = {
        countryName: "Japan",
        startTime: "2022-01-01",
        endTime: "2023-01-01",
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result).toEqual(query);
    });

    it("should validate country name with spaces", async () => {
      const query = {
        countryName: "United Kingdom",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result.countryName).toBe("United Kingdom");
    });

    it("should validate country name with hyphens", async () => {
      const query = {
        countryName: "Guinea-Bissau",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result.countryName).toBe("Guinea-Bissau");
    });

    it("should validate minimum magnitude of -1", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        minMagnitude: -1,
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result.minMagnitude).toBe(-1);
    });

    it("should validate maximum magnitude of 10", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        minMagnitude: 10,
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result.minMagnitude).toBe(10);
    });

    it("should validate maximum radius", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        maxRadiusKm: 20001.6,
      };

      const result = await validateMostRecentEqRequest(query);

      expect(result.maxRadiusKm).toBe(20001.6);
    });
  });

  describe("Invalid Inputs", () => {
    it("should reject empty country name", async () => {
      const query = {
        countryName: "",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject missing country name", async () => {
      const query = {
        startTime: "2020-01-01",
        endTime: "2023-01-01",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject country name with numbers", async () => {
      const query = {
        countryName: "Spain123",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject country name with special characters", async () => {
      const query = {
        countryName: "Spain!",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject invalid date format", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020/01/01",
        endTime: "2023-01-01",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject invalid date", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-13-01",
        endTime: "2023-01-01",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject start time after end time", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2023-01-01",
        endTime: "2020-01-01",
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject negative max radius", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        maxRadiusKm: -1,
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject max radius exceeding limit", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        maxRadiusKm: 20002,
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject min magnitude below -1", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        minMagnitude: -2,
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject min magnitude above 10", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        minMagnitude: 11,
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject limit of 0", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        limit: 0,
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject limit exceeding maximum", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        limit: 20001,
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should reject non-integer limit", async () => {
      const query = {
        countryName: "Spain",
        startTime: "2020-01-01",
        endTime: "2023-01-01",
        limit: 10.5,
      };

      await expect(validateMostRecentEqRequest(query)).rejects.toThrow(
        "Validation error",
      );
    });
  });

  describe("Error Messages", () => {
    it("should provide detailed error message for invalid country name", async () => {
      try {
        await validateMostRecentEqRequest({
          countryName: "Spain123",
          startTime: "2020-01-01",
          endTime: "2023-01-01",
        });
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("Validation error");
      }
    });

    it("should provide detailed error message for date validation", async () => {
      try {
        await validateMostRecentEqRequest({
          countryName: "Spain",
          startTime: "2023-01-01",
          endTime: "2020-01-01",
        });
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          "Start time must be before end time",
        );
      }
    });
  });
});
