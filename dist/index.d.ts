#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
export declare const configSchema: z.ZodObject<{
    tessie_api_token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tessie_api_token: string;
}, {
    tessie_api_token: string;
}>;
export declare const parameterSchema: z.ZodObject<{
    tessie_api_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tessie_api_token?: string | undefined;
}, {
    tessie_api_token?: string | undefined;
}>;
export default function createServer({ config }: {
    config: z.infer<typeof configSchema>;
}): Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>;
//# sourceMappingURL=index.d.ts.map