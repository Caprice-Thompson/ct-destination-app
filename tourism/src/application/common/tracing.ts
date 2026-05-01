import { logger } from "@infrastructure/logger";


export enum TracedProperties {
    amazonTraceId = "amazonTraceId",
}
export type TracingInfo = Record<TracedProperties, string>;

export interface HackedLambdaContext {
    clientContext?: Record<string, TracingInfo>;
    invokedFunctionArn: string;
}

export const initializeTracingInfo = (tracingInfo?: Record<string, Partial<TracingInfo>>) => {
    logger.defaultMeta.tracingInfo = tracingInfo;
};
/**
 * Wrapper around a lambda handler that populates log metadata with information received
 * in the lambda context. The main benefit is that the handler and any handler tests don't
 * need to know about the context at all.
 *
 * If you are using the lambda context then the handler function can still take in the context as a second argument,
 * but it must be of type HackedLambdaContext NOT Context as defined by AWS.
 *
 * You can add any properties to the HackedLambdaContext type that you want to access.
 */
export const withTraceLogging = <Input, Output>(
    handler: (event?: Input, context?: HackedLambdaContext) => Promise<Output>,
) => {
    return (event?: Input, context?: HackedLambdaContext) => {
        initializeTracingInfo(context?.clientContext);
        return handler(event, context);
    };
};
