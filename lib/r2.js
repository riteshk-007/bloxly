import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Centralized R2 client and helpers
export const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME || 'blogs-media';

export function getPublicHost() {
    const envHost = process.env.CLOUDFLARE_R2_PUBLIC_HOST || `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev`;
    return envHost.startsWith('http') ? envHost.replace(/\/$/, '') : `https://${envHost.replace(/\/$/, '')}`;
}

// Some setups require bucket name in the path (pub-*.r2.dev/<bucket>/<key>),
// others bind the host directly to a single bucket (<custom-domain>/<key>).
// Control with CLOUDFLARE_R2_PATH_STYLE: 'bucket' (default) or 'bucketless'.
export function publicUrlForKey(key) {
    const host = getPublicHost();
    const style = (process.env.CLOUDFLARE_R2_PATH_STYLE || 'bucket').toLowerCase();
    if (style === 'bucketless') return `${host}/${encodeKey(key)}`;
    return `${host}/${BUCKET_NAME}/${encodeKey(key)}`;
}

function encodeKey(key) {
    // Ensure spaces and special chars are encoded per segment
    return key.split('/').map(encodeURIComponent).join('/');
}

export const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false,
});

export async function deleteR2ObjectByKey(key) {
    if (!key) return { ok: false, skipped: true };
    try {
        const cmd = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key });
        await s3Client.send(cmd);
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e?.message || String(e) };
    }
}

// Try to derive R2 key from a full public URL like: <publicHost>/<bucket>/<key>
export function keyFromPublicUrl(url) {
    try {
        const host = getPublicHost();
        const withBucket = `${host}/${BUCKET_NAME}/`;
        if (url.startsWith(withBucket)) return decodeURIComponent(url.slice(withBucket.length));
        const bucketless = `${host}/`;
        if (url.startsWith(bucketless)) return decodeURIComponent(url.slice(bucketless.length));
    } catch { /* ignore */ }
    return null;
}

// Normalize any public URL (either bucket style or bucketless) to match current config
export function normalizePublicUrl(url) {
    try {
        // If it's already a full URL, ensure it uses the correct public host and includes bucket when required
        const u = new URL(url);
        const host = getPublicHost();
        const hostUrl = new URL(host);

        if (u.hostname === hostUrl.hostname) {
            const needsBucket = (process.env.CLOUDFLARE_R2_PATH_STYLE || 'bucket').toLowerCase() === 'bucket';
            if (needsBucket) {
                // If path does not start with /<BUCKET_NAME>/, insert it to avoid upstream 404s
                if (!u.pathname.startsWith(`/${BUCKET_NAME}/`)) {
                    return `${host}/${BUCKET_NAME}${u.pathname}${u.search}`;
                }
                // Ensure host matches configured host exactly
                return `${host}${u.pathname}${u.search}`;
            } else {
                // Bucketless style: just keep host consistent
                return `${host}${u.pathname}${u.search}`;
            }
        }

        // Otherwise, try to derive key from any known public URL format
        const key = keyFromPublicUrl(url);
        if (!key) return url;
        return publicUrlForKey(key);
    } catch {
        return url;
    }
}
