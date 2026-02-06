import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express, { Request, Response } from "express";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Country API endpoint
app.get("/api/countries", async (req: Request, res: Response) => {
  try {
    const { countryName } = req.query;

    if (!countryName || typeof countryName !== "string") {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "countryName is required",
      });
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

// Tourism API endpoint
app.get("/api/tourism", async (req: Request, res: Response) => {
  try {
    const { countryName } = req.query;

    if (!countryName || typeof countryName !== "string") {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "countryName is required",
      });
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

// Earthquake API endpoint - most recent
app.get("/api/earthquakes", async (req: Request, res: Response) => {
  try {
    const { countryName } = req.query;

    if (!countryName || typeof countryName !== "string") {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "countryName is required",
      });
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

// Earthquake Statistics API endpoint
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

// Start server
app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`   - GET /api/countries?countryName=Spain`);
  console.log(`   - GET /api/tourism?countryName=Spain`);
  console.log(`   - GET /api/earthquakes?countryName=Spain&month=1`);
  console.log(`   - GET /api/earthquakes/statistics?countryName=Spain&month=1`);
  console.log(`   - GET /health`);
});
