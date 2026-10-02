import type { Dependencies } from "@infrastructure/dependencies";
import { makeNationalDishRepository } from "@infrastructure/repositories/national-dish-repository";

describe("makeNationalDishRepository", () => {
  it("maps the image URL and other fields from the database row", async () => {
    const row = {
      country_name: "Spain",
      country_code: "ES",
      dish_name: "Paella",
      image_url: "https://example.com/paella.jpg",
      description: "A traditional Spanish rice dish",
    };
    const querySingleRowOptional = jest.fn().mockResolvedValue(row);
    const dependencies = {
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      rdsClient: {
        querySingleRowOptional,
      },
    } as unknown as Pick<Dependencies, "logger" | "rdsClient">;
    const repository = makeNationalDishRepository(dependencies);

    const result = await repository.getNationalDish("Spain");

    expect(result?.toJSON()).toEqual({
      countryCode: "ES",
      countryName: "Spain",
      dishName: "Paella",
      imageUrl: "https://example.com/paella.jpg",
      description: "A traditional Spanish rice dish",
    });
    expect(querySingleRowOptional).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining(
          "SELECT country_name, country_code, dish_name, image_url, description",
        ),
        bindVariables: ["Spain"],
      }),
    );
  });
});
