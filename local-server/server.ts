import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as Sentry from "@sentry/node";
import cors from "cors";
import dotenv from "dotenv";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import "./sentry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config();

const app = express();
const PORT = 3001;

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true";

const mockData = USE_MOCK_DATA
  ? {
      countries: JSON.parse(
        fs.readFileSync(path.join(__dirname, "mocks/countries.json"), "utf-8"),
      ),
      tourism: JSON.parse(
        fs.readFileSync(path.join(__dirname, "mocks/tourism.json"), "utf-8"),
      ),
      earthquakes: JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "mocks/earthquakes.json"),
          "utf-8",
        ),
      ),
      earthquakeStatistics: JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "mocks/earthquake-statistics.json"),
          "utf-8",
        ),
      ),
    }
  : null;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/countries", async (req: Request, res: Response) => {
  try {
    const { countryName } = req.query;

    if (!countryName || typeof countryName !== "string") {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "countryName is required",
      });
    }

    if (USE_MOCK_DATA && mockData) {
      const data =
        mockData.countries[countryName] || mockData.countries["Spain"];
      return res.status(200).json(data);
    }

    // @ts-ignore - built JS module
    const { listCountryInformationHandler } =
      await import("../country/dist/list-country-information.js");

    const event = {
      queryStringParameters: { countryName },
    };

    const result = await listCountryInformationHandler(event);

    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Error in /api/countries:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/tourism", async (req: Request, res: Response) => {
  try {
    const { countryName } = req.query;

    if (!countryName || typeof countryName !== "string") {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "countryName is required",
      });
    }

    if (USE_MOCK_DATA && mockData) {
      const data = mockData.tourism[countryName] || mockData.tourism["Spain"];
      return res.status(200).json(data);
    }

    // @ts-ignore - built JS module
    const { getTourismInformationHandler } =
      await import("../tourism/dist/get-tourism-information.js");

    const event = {
      queryStringParameters: { countryName },
    };

    const result = await getTourismInformationHandler(event);

    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Error in /api/tourism:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/earthquakes", async (req: Request, res: Response) => {
  try {
    const { countryName } = req.query;

    if (!countryName || typeof countryName !== "string") {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "countryName is required",
      });
    }

    if (USE_MOCK_DATA && mockData) {
      const data =
        mockData.earthquakes[countryName] || mockData.earthquakes["Spain"];
      return res.status(200).json(data);
    }

    // @ts-ignore - built JS module
    const { handler } =
      await import("../earthquakes/dist/get-most-recent-earthquakes.js");

    const event = {
      queryStringParameters: { countryName },
    };

    const result = await handler(event);

    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Error in /api/earthquakes:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/earthquakes/statistics", async (req: Request, res: Response) => {
  try {
    const { countryName, month } = req.query;

    if (!countryName || typeof countryName !== "string") {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "countryName is required",
      });
    }

    if (!month || typeof month !== "string") {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "month is required",
      });
    }

    if (USE_MOCK_DATA && mockData) {
      const countryData =
        mockData.earthquakeStatistics[countryName] ||
        mockData.earthquakeStatistics["Spain"];
      const data = countryData[month] || countryData["1"];
      return res.status(200).json(data);
    }

    // @ts-ignore - built JS module
    const { handler } =
      await import("../earthquakes/dist/get-earthquake-monthly-summary.js");

    const event = {
      queryStringParameters: { countryName, month },
    };

    const result = await handler(event);

    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Error in /api/earthquakes/statistics:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

Sentry.setupExpressErrorHandler(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).send(res.locals.sentry + "\n");
});

app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
  console.log(`Mode: ${USE_MOCK_DATA ? "MOCK DATA" : "REAL DATA"}`);
  console.log(`Available endpoints:`);
  console.log(`   - GET /api/countries?countryName=Spain`);
  console.log(`   - GET /api/tourism?countryName=Spain`);
  console.log(`   - GET /api/earthquakes?countryName=Spain`);
  console.log(`   - GET /api/earthquakes/statistics?countryName=Spain&month=1`);
  console.log(`   - GET /health`);
});
