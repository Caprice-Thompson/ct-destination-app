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

export interface DatabaseNationalDish {
  country_name: string;
  dish_name: string;
  image_url: string | null;
  description: string | null;
}

function cleanOptional(value: string | undefined): string | null {
  const cleaned = value?.trim();
  return !cleaned || cleaned === '\\N' ? null : cleaned;
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

function deduplicateBatch(records: DatabaseNationalDish[]): DatabaseNationalDish[] {
  const seen = new Map<string, DatabaseNationalDish>();
  for (const record of records) {
    seen.set(record.country_name, record);
  }
  return Array.from(seen.values());
}

async function migrate() {
  const databaseUrl = getDatabaseUrl();
  const sslConfig = getSslConfig(databaseUrl);

  console.log(`Connecting to database (SSL: ${sslConfig ? 'enabled' : 'disabled'})...`);

  const sql = postgres(databaseUrl, {
    ssl: sslConfig,
  });

  const csvFilePath = path.resolve(__dirname, 'national_dishes.csv');
  const parser = fs.createReadStream(csvFilePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }),
  );

  console.log('Starting national dishes migration...');

  try {
    let batch: DatabaseNationalDish[] = [];

    for await (const record of parser as AsyncIterable<RawNationalDishCSV>) {
      if (!record.country_name?.trim() || !record.dish_name?.trim()) {
        continue;
      }

      batch.push({
        country_name: decodeHtmlEntities(record.country_name.trim()),
        dish_name: decodeHtmlEntities(record.dish_name.trim()),
        image_url: cleanOptional(record.image_url),
        description: cleanOptional(record.description) ? decodeHtmlEntities(cleanOptional(record.description)!) : null,
      });

      if (batch.length >= 100) {
        await insertBatch(sql, batch);
        batch = [];
      }
    }

    if (batch.length > 0) await insertBatch(sql, batch);

    console.log('National dishes migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

async function insertBatch(sql: postgres.Sql, nationalDishes: DatabaseNationalDish[]) {
  const unique = deduplicateBatch(nationalDishes);
  return sql`
    INSERT INTO national_dish ${sql(unique, 'country_name', 'dish_name', 'image_url', 'description')}
    ON CONFLICT (country_name)
    DO UPDATE SET 
      dish_name = EXCLUDED.dish_name,
      image_url = EXCLUDED.image_url,
      description = EXCLUDED.description,
      updated_at = CURRENT_TIMESTAMP
  `;
}

migrate();
