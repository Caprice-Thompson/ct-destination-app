import postgres from "postgres";
import { getDatabaseUrl, getSslConfig } from "./db.js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from repo root .env.local first, then data-scrape/.env.local
config({ path: resolve(__dirname, "..", ".env.local") });
config({ path: resolve(__dirname, ".env.local") });

const API_URL = process.env.REST_COUNTRIES_API_URL;
const API_TOKEN = process.env.REST_COUNTRIES_AUTHORIZATION;

if (!API_TOKEN) {
  console.error("REST_COUNTRIES_AUTHORIZATION is not set.");
  process.exit(1);
}

interface ApiCountry {
  names: {
    common: string;
  };
  codes: {
    alpha_2: string;
  };
  capitals?: Array<{ name: string }>;
  languages?: Array<{ iso639_1: string; name: string }>;
  currencies?: Array<{ code: string; name: string; symbol: string }>;
  coordinates: {
    lat: number;
    lng: number;
  };
  links: {
    google_maps: string;
    open_street_maps: string;
  };
  flag: {
    url_svg: string;
    url_png: string;
  };
  timezones: string[];
  calling_codes?: string[];
  cars?: {
    driving_side: string;
    signs?: string[];
  };
  memberships?: {
    schengen?: boolean;
    eu?: boolean;
  };
}

interface ApiResponse {
  data: {
    objects: ApiCountry[];
    total: number;
  };
}

interface DbCountry {
  country_code: string;
  country_name: string;
  capital: string | null;
  languages: Array<{ iso639_1: string; name: string }> | null;
  currencies: Array<{ code: string; name: string; symbol: string }> | null;
  flag_svg: string | null;
  flag_png: string | null;
  lat: number | null;
  lng: number | null;
  google_maps_url: string | null;
  open_street_maps_url: string | null;
  timezones: string[] | null;
  calling_codes: string[] | null;
  driving_side: string | null;
  is_schengen: boolean;
  is_eu: boolean;
}

async function fetchEuropeanCountries(): Promise<ApiCountry[]> {
  console.log("Fetching European countries from REST Countries API...");

  const allCountries: ApiCountry[] = [];
  let offset = 0;
  const limit = 55;
  let total = 0;

  do {
    const url = `${API_URL}?region=Europe&limit=${limit}&offset=${offset}`;
    console.log(`Fetching page: offset=${offset}, limit=${limit}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `API responded ${response.status}: ${await response.text()}`,
      );
    }

    const body = (await response.json()) as ApiResponse;
    const countries = body.data?.objects ?? [];
    total = body.data?.total ?? countries.length;

    allCountries.push(...countries);
    console.log(
      `Fetched ${countries.length} countries (${allCountries.length}/${total} total)`,
    );

    offset += limit;

    // Break if we got fewer results than requested or we have all countries
    if (countries.length < limit || allCountries.length >= total) {
      break;
    }
  } while (true);

  console.log(`Completed: fetched ${allCountries.length} European countries.`);
  return allCountries;
}

function toDbRow(c: ApiCountry): DbCountry {
  return {
    country_code: c.codes.alpha_2,
    country_name: c.names.common,
    capital: c.capitals?.[0]?.name ?? null,
    languages: c.languages?.length ? c.languages : null,
    currencies: c.currencies?.length ? c.currencies : null,
    flag_svg: c.flag?.url_svg ?? null,
    flag_png: c.flag?.url_png ?? null,
    lat: c.coordinates?.lat ?? null,
    lng: c.coordinates?.lng ?? null,
    google_maps_url: c.links?.google_maps ?? null,
    open_street_maps_url: c.links?.open_street_maps ?? null,
    timezones: c.timezones?.length ? c.timezones : null,
    calling_codes: c.calling_codes?.length ? c.calling_codes : null,
    driving_side: c.cars?.driving_side ?? null,
    is_schengen: c.memberships?.schengen ?? false,
    is_eu: c.memberships?.eu ?? false,
  };
}

async function migrate() {
  const databaseUrl = getDatabaseUrl();
  const sslConfig = getSslConfig(databaseUrl);

  console.log(
    `Connecting to database (SSL: ${sslConfig ? "enabled" : "disabled"})...`,
  );

  const sql = postgres(databaseUrl, { ssl: sslConfig });

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS country_information (
        id SERIAL PRIMARY KEY,
        country_code VARCHAR(2) NOT NULL UNIQUE,
        country_name VARCHAR(255) NOT NULL,
        capital VARCHAR(255),
        languages JSONB,
        currencies JSONB,
        flag_svg TEXT,
        flag_png TEXT,
        lat NUMERIC,
        lng NUMERIC,
        google_maps_url TEXT,
        open_street_maps_url TEXT,
        timezones TEXT[],
        calling_codes TEXT[],
        driving_side VARCHAR(10),
        is_schengen BOOLEAN DEFAULT false,
        is_eu BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const countries = await fetchEuropeanCountries();
    const rows = countries.map(toDbRow);

    console.log(
      `Upserting ${rows.length} countries into country_information...`,
    );

    for (const row of rows) {
      await sql`
        INSERT INTO country_information ${sql(row)}
        ON CONFLICT (country_code) DO UPDATE SET
          country_name         = EXCLUDED.country_name,
          capital              = EXCLUDED.capital,
          languages            = EXCLUDED.languages,
          currencies           = EXCLUDED.currencies,
          flag_svg             = EXCLUDED.flag_svg,
          flag_png             = EXCLUDED.flag_png,
          lat                  = EXCLUDED.lat,
          lng                  = EXCLUDED.lng,
          google_maps_url      = EXCLUDED.google_maps_url,
          open_street_maps_url = EXCLUDED.open_street_maps_url,
          timezones            = EXCLUDED.timezones,
          calling_codes        = EXCLUDED.calling_codes,
          driving_side         = EXCLUDED.driving_side,
          is_schengen          = EXCLUDED.is_schengen,
          is_eu                = EXCLUDED.is_eu,
          updated_at           = CURRENT_TIMESTAMP
      `;
    }

    console.log("Country information migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

migrate();
