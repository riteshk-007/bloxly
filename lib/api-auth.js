import prisma from "./prisma";

export function generateApiKey() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    const moreRandomStr = Math.random().toString(36).substring(2, 15);
    return `ak_${timestamp}_${randomStr}${moreRandomStr}`;
}

export async function validateApiKey(req) {
    // Read API key deterministically; accept common variants
    const apiKey = req.headers.get('x-api-key') || req.headers.get('X-API-Key') || req.headers.get('x-apiKey') || null;


    if (!apiKey) {
        return {
            valid: false,
            error: 'API key is required',
            status: 401
        };
    }

    try {
        const domain = await prisma.domain.findUnique({
            where: { apiKey },
            include: { user: true }
        });

        if (!domain) {
            return {
                valid: false,
                error: 'Invalid API key',
                status: 401
            };
        }

        if (!domain.isActive) {
            return {
                valid: false,
                error: 'API key is disabled',
                status: 403
            };
        }


        // Rate limiting check (last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const requestCount = await prisma.apiRequest.count({
            where: {
                domainId: domain.id,
                createdAt: { gte: oneHourAgo }
            }
        });

        if (requestCount >= domain.rateLimit) {
            return {
                valid: false,
                error: 'Rate limit exceeded',
                status: 429
            };
        }

        // Log request
        await prisma.apiRequest.create({
            data: {
                domainId: domain.id,
                endpoint: req.url,
                ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'localhost',
                userAgent: req.headers.get('user-agent') || 'unknown',
                method: req.method || 'GET',
            }
        });

        return {
            valid: true,
            domain
        };
    } catch (error) {
        console.error('❌ Auth Error:', error);
        return {
            valid: false,
            error: 'Authentication failed',
            status: 500
        };
    }
}