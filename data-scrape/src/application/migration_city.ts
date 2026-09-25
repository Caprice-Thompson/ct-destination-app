import postgres from 'postgres';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabaseUrl, getSslConfig } from './db.js';
import { config } from 'dotenv';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from repo root .env.local first, then data-scrape/.env.local
config({ path: resolve(__dirname, '..', '.env.local') });
config({ path: resolve(__dirname, '.env.local') });

export interface RawNationalDishCSV {
  country_name: string;
  dish_name: string;
  image_url: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RawCityPopulationCSV {
  city: string;
  country: string;
  population: string; // CSV might have commas, e.g., "10,044,894"
  createdAt: string;
}
export interface DatabaseCityPopulation {
  country_name: string;
  country_code: string;
  city_name: string;
  population: number;
  created_at: string;
  updated_at: string;
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&ouml;': 'ö',
    '&Ouml;': 'Ö',
    '&auml;': 'ä',
    '&Auml;': 'Ä',
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
    '&szlig;': 'ß',
    '&eacute;': 'é',
    '&Eacute;': 'É',
    '&egrave;': 'è',
    '&Egrave;': 'È',
    '&ecirc;': 'ê',
    '&Ecirc;': 'Ê',
    '&aacute;': 'á',
    '&Aacute;': 'Á',
    '&agrave;': 'à',
    '&Agrave;': 'À',
    '&acirc;': 'â',
    '&Acirc;': 'Â',
    '&iacute;': 'í',
    '&Iacute;': 'Í',
    '&igrave;': 'ì',
    '&Igrave;': 'Ì',
    '&icirc;': 'î',
    '&Icirc;': 'Î',
    '&oacute;': 'ó',
    '&Oacute;': 'Ó',
    '&ograve;': 'ò',
    '&Ograve;': 'Ò',
    '&ocirc;': 'ô',
    '&Ocirc;': 'Ô',
    '&uacute;': 'ú',
    '&Uacute;': 'Ú',
    '&ugrave;': 'ù',
    '&Ugrave;': 'Ù',
    '&ucirc;': 'û',
    '&Ucirc;': 'Û',
    '&ntilde;': 'ñ',
    '&Ntilde;': 'Ñ',
    '&ccedil;': 'ç',
    '&Ccedil;': 'Ç',
    '&aring;': 'å',
    '&Aring;': 'Å',
    '&oslash;': 'ø',
    '&Oslash;': 'Ø',
    '&aelig;': 'æ',
    '&AElig;': 'Æ',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&copy;': '©',
    '&reg;': '®',
    '&deg;': '°',
    '&mdash;': '—',
    '&ndash;': '–',
    '&rsquo;': '\u2019',
    '&lsquo;': '\u2018',
    '&rdquo;': '\u201D',
    '&ldquo;': '\u201C',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }

  // Decode numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return result;
}

async function migrate() {
  const databaseUrl = getDatabaseUrl();
  const sslConfig = getSslConfig(databaseUrl);

  console.log(`Connecting to database (SSL: ${sslConfig ? 'enabled' : 'disabled'})...`);

  const sql = postgres(databaseUrl, {
    ssl: sslConfig,
  });

  const csvFilePath = path.resolve(__dirname, 'city_population.csv');
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true,
        relax_column_count: true,
      }),
    );

  console.log('Starting city population migration...');

  try {
    let batch: DatabaseCityPopulation[] = [];

    for await (const record of parser as AsyncIterable<RawCityPopulationCSV>) {
      if (!record.city || !record.country || !record.population) {
        continue;
      }

      const populationValue = parseInt(record.population.replace(/,/g, ''), 10);
      if (Number.isNaN(populationValue)) {
        continue;
      }

      const countryCode = record.country.substring(0, 2).toUpperCase();

      batch.push({
        country_name: decodeHtmlEntities(record.country.trim()),
        country_code: countryCode,
        city_name: decodeHtmlEntities(record.city.trim()),
        population: populationValue,
        created_at: record.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (batch.length >= 100) {
        await insertBatch(sql, batch);
        batch = [];
      }
    }

    if (batch.length > 0) await insertBatch(sql, batch);

    console.log('City population migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

function deduplicateBatch(cities: DatabaseCityPopulation[]): DatabaseCityPopulation[] {
  const seen = new Map<string, DatabaseCityPopulation>();
  for (const city of cities) {
    const key = `${city.country_name}|${city.city_name}`;
    const existing = seen.get(key);
    if (!existing || city.population > existing.population) {
      seen.set(key, city);
    }
  }
  return Array.from(seen.values());
}

async function insertBatch(sql: postgres.Sql, cities: DatabaseCityPopulation[]) {
  const unique = deduplicateBatch(cities);
  return sql`
    INSERT INTO city_populations ${sql(unique, 'country_name', 'country_code', 'city_name', 'population', 'created_at', 'updated_at')}
    ON CONFLICT (city_name, country_name)
    DO UPDATE SET 
      country_code = EXCLUDED.country_code,
      population = EXCLUDED.population,
      created_at = EXCLUDED.created_at,
      updated_at = CURRENT_TIMESTAMP
  `;
}

migrate();
