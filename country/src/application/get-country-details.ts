export async function getCountryDetails(countryCode: string) {
  console.log('Starting get country details for country code: ', countryCode);

  // await validateCountryCode(countryCode);

  return { code: countryCode };
}
