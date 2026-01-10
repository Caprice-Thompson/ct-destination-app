import { getMostRecentEarthquakesQuery, type GetMostRecentEarthquakesQuery } from '@application/get-most-recent-eq-query';
import { makeDependencies } from '@earthquakes/dependencies';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from '../types';
import { ValidationException } from '@domain/exceptions';


export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const dependencies = await makeDependencies();

    try {
        const query = event.queryStringParameters as GetMostRecentEarthquakesQuery;

        const result = await getMostRecentEarthquakesQuery(query, dependencies);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
        };
    } catch (error) {
        if (error instanceof ValidationException) {
            dependencies.logger.warn('Validation error', { errors: error.errors });
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    error: 'Validation failed',
                    details: error.errors,
                }),
            };
        } else {
            dependencies.logger.error('Error in getMostRecentEarthquakesHandler', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            });

            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    error: 'Internal server error',
                    details: error instanceof Error ? error.stack : undefined,
                }),
            };
        }
    } finally {
        await dependencies.rdsClient.closeConnection();
    }
};
