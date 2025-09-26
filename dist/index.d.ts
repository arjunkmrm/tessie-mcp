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
export default function ({ config }: {
    config?: z.infer<typeof configSchema>;
}): {
    start(): Promise<Server<{
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
    }>>;
    stop(): Promise<void>;
};
//# sourceMappingURL=index.d.ts.map