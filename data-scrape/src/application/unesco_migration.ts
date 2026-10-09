import postgres from 'postgres';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabaseUrl, getSslConfig } from '../infrastructure/db.js';
import { config } from 'dotenv';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from repo root .env.local first, then data-scrape/.env.local
config({ path: resolve(__dirname, '../../..', '.env.local') });
config({ path: resolve(__dirname, '../..', '.env.local') });

export interface RawUNESCOWHCCSV {
    states_name_en: string;
    name_en: string;
    short_description_en: string;
    iso_code: string;
}

export interface DatabaseUNESCO {
    country_name: string;
    country_code: string;
    area_name: string;
    site: string;
    description: string;
}

function stripHtml(html: string): string {
    // First remove HTML tags
    let text = html.replace(/<[^>]*>/g, ' ');
    
    // Decode common named entities
    const entities: Record<string, string> = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        // Accented characters
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
        '&plusmn;': '±',
        '&mdash;': '—',
        '&ndash;': '–',
        '&laquo;': '«',
        '&raquo;': '»',
        '&rsquo;': '\u2019',
        '&lsquo;': '\u2018',
        '&rdquo;': '\u201D',
        '&ldquo;': '\u201C',
    };
    
    // Replace named entities
    for (const [entity, char] of Object.entries(entities)) {
        text = text.replace(new RegExp(entity, 'g'), char);
    }
    
    // Decode numeric entities (&#123; or &#xAB;)
    text = text.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
    text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    
    // Clean up whitespace
    return text.replace(/\s+/g, ' ').trim();
}

function deriveCountryCode(countryName: string): string {
    const trimmed = countryName.trim();
    if (trimmed.length >= 2) {
        return trimmed.substring(0, 2).toUpperCase();
    }
    return trimmed.toUpperCase();
}

function deduplicateBatch(records: DatabaseUNESCO[]): DatabaseUNESCO[] {
    const seen = new Map<string, DatabaseUNESCO>();
    for (const rec of records) {
        const key = `${rec.country_name}|${rec.site}`;
        if (!seen.has(key)) {
            seen.set(key, rec);
        }
    }
    return Array.from(seen.values());
}

async function migrate() {
    const databaseUrl = getDatabaseUrl();
    const csvPath = process.env.CSV_PATH || path.resolve(__dirname, '../data/unesco_sites.csv');

    if (!fs.existsSync(csvPath)) {
        console.error(`CSV file not found: ${csvPath}`);
        console.error('Copy whc-sites-2025.csv to unesco_sites.csv or set CSV_PATH env var');
        process.exit(1);
    }

    const sslConfig = getSslConfig(databaseUrl);

    console.log(`Connecting to database (SSL: ${sslConfig ? 'enabled' : 'disabled'})...`);
    console.log(`Reading CSV from: ${csvPath}`);

    const sql = postgres(databaseUrl, {
        ssl: sslConfig,
    });

    const parser = fs
        .createReadStream(csvPath)
        .pipe(
            parse({
                columns: true,
                skip_empty_lines: true,
                relax_quotes: true,
                trim: true,
                relax_column_count: true,
            }),
        );

    console.log('Starting UNESCO sites migration...');

    try {
        let batch: DatabaseUNESCO[] = [];

        for await (const record of parser as AsyncIterable<Record<string, string>>) {
            const statesNameEn = record.states_name_en?.trim();
            const nameEn = record.name_en?.trim();
            const shortDescEn = record.short_description_en?.trim();
            const isoCode = record.iso_code?.trim();

            if (!statesNameEn || !nameEn) continue;

            const description = shortDescEn ? stripHtml(shortDescEn) : '';
            const site = nameEn;
            const areaName = site;

            const countries = statesNameEn.split(',').map((c) => c.trim()).filter(Boolean);

            for (const countryName of countries) {
                if (!countryName) continue;

                const countryCode =
                    countries.length === 1 && isoCode
                        ? isoCode.toUpperCase()
                        : deriveCountryCode(countryName);

                batch.push({
                    country_name: countryName,
                    country_code: countryCode,
                    area_name: areaName,
                    site,
                    description,
                });
            }
        }

        const unique = deduplicateBatch(batch);
        console.log(`Migrating ${unique.length} UNESCO site records...`);

        await sql`DELETE FROM unesco_sites`;

        const batchSize = 100;
        for (let i = 0; i < unique.length; i += batchSize) {
            const chunk = unique.slice(i, i + batchSize);
            await insertBatch(sql, chunk);
        }

        console.log('UNESCO sites migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exitCode = 1;
    } finally {
        await sql.end();
    }
}

async function insertBatch(sql: postgres.Sql, records: DatabaseUNESCO[]) {
    const unique = deduplicateBatch(records);
    return sql`
    INSERT INTO unesco_sites ${sql(
        unique,
        'country_name',
        'country_code',
        'area_name',
        'site',
        'description',
    )}
  `;
}

migrate();
