import { createSwaggerSpec } from 'next-swagger-doc';
import 'server-only';

export const getApiDocs = async () => {
    const spec: Record<string, any> = createSwaggerSpec({
        apiFolder: '/src/pages/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Imbue API Documentation',
                version: '1.0',
            },
        },
    });
    return spec;
};