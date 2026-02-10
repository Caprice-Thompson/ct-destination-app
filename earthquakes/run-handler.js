const { handler } = require("./dist/handlers/scheduled-ingest.js");

(async () => {
  try {
    console.log("Invoking scheduled-ingest handler...\n");
    const result = await handler();
    console.log("\nHandler result:", JSON.stringify(result, null, 2));
    process.exit(result.statusCode === 200 ? 0 : 1);
  } catch (error) {
    console.error("Error invoking handler:", error);
    process.exit(1);
  }
})();
