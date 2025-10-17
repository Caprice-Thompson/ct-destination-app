# Country

Application

- app/providers, app/repositories, and app/useCases Directories

Domain

- domain/dtos, domain/entities, domain/enums, and domain/valueObjects

Infrastructure

- infra/databases, infra/providers, infra/repositories, infra/services, and infra/utils Directories



TODO:
1) Finalise Country Data structure, currently:

example:
{
  "countryName": "Spain",
  "countryCode": "SP",
  "capitalCity": "Madrid",
  "topCities": [
    { "name": "Madrid", "population": 100009000 },
    { "name": "Seville", "population": 5698000 },
    { "name": "Malaga", "population": null }
  ],
  "languagesSpoken": ["Spanish", "Catalan"],
  "currencyName": "Euro",
  "currencySymbol": null,
  "flagUrl": null,
  "nationalDish": null,
  "volcanoes": []
}

2) Implement mongodb set up and look into security, volume, scale etc 
3) Set up Api Infra 
4) Look into api docs/contracts 
5) Set up CI/CD 
6) Implement Tests