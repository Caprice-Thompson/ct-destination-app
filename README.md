# ct-destination-app

Tool designed for traveler's and researchers

It compiles comprehensive information about various destinations in Europe, including activities, largest cities, UNESCO World Heritage Sites, and climate data. Destination-App provides up-to-date and detailed information to help users plan their travels.

## Prerequisites
NVM (Node Version Manager) - to manage Node.js versions
Docker Desktop
BiomeJS - for code formatting and linting in your editor

## Setup
Install the required Node.js version using NVM:

nvm install

Set the Node.js version for the project:

nvm use

Install project dependencies:

npm install

Compose docker:

docker compose up 

Start up backend:

cd local-server 

npm run dev

Run frontend:

cd frontend 

npm run dev

## Scripts
Run Integration Tests
Open a database tunnel to RDS

./dev-tools/scripts/db_connect.sh
Navigate to the lambda directory

cd lambda/publish-orchestrator
Run the integration tests

npm run test:integration
Unit Tests
To run unit tests, use:

npm run test-all

## Linting and Formatting

To lint and format the code, run:

npm run lint:fix