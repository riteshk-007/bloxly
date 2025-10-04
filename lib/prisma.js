import { PrismaClient } from '@prisma/client';

let prisma;

if (globalThis.prisma) {
    prisma = globalThis.prisma;
} else {
    prisma = new PrismaClient();
}

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

// Export both named and default to be compatible with current import styles
export { prisma };
export default prisma;
