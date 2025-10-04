import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { BUCKET_NAME, publicUrlForKey } from '../../../../../lib/r2';
import sharp from 'sharp';
import prisma from '../../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

// Configure Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    },
    forcePathStyle: false, // Important for R2
});

// BUCKET_NAME is imported from lib/r2
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const domainId = formData.get('domainId');

        if (!file || !domainId) {
            return NextResponse.json({ error: 'File and domain ID are required' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
        }

        // Verify domain ownership
        const domain = await prisma.domain.findFirst({
            where: {
                id: domainId,
                userId: session.user.id,
            },
        });

        if (!domain) {
            return NextResponse.json({ error: 'Domain not found or unauthorized' }, { status: 403 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Compress image using Sharp
        const compressedBuffer = await sharp(buffer)
            .resize(1200, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toBuffer();

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        const fileName = `${originalName}-${timestamp}.jpg`;

        // R2 path: codexprime/{domain}/{userId}/images/{fileName}
        const key = `${domain.domain || 'localhost'}/${session.user.id}/images/${fileName}`;

        try {
            // Upload to Cloudflare R2
            const uploadCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: compressedBuffer,
                ContentType: 'image/jpeg',
                Metadata: {
                    originalName: file.name,
                    userId: session.user.id,
                    domainId: domainId,
                    uploadedAt: new Date().toISOString(),
                },
            });

            const result = await s3Client.send(uploadCommand);

            // Generate public URL according to configured path style
            const imageUrl = publicUrlForKey(key);

            // Store image record in database
            const imageRecord = await prisma.image.create({
                data: {
                    url: imageUrl,
                    key: key,
                    originalName: file.name,
                    size: compressedBuffer.length,
                    mimeType: 'image/jpeg',
                    userId: session.user.id,
                    domainId: domainId,
                },
            });

            return NextResponse.json({
                success: true,
                imageUrl: imageUrl,
                imageId: imageRecord.id,
                key: key,
                size: compressedBuffer.length,
                originalSize: file.size,
                compressionRatio: Math.round((1 - compressedBuffer.length / file.size) * 100),
                publicHostUsed: new URL(imageUrl).origin,
            });

        } catch (r2Error) {
            // Log a concise error for server logs
            console.error('R2 upload failed:', r2Error?.message || r2Error);

            // Development fallback: Use base64 data URL
            if (process.env.NODE_ENV === 'development') {
                const base64Image = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

                // Store image record in database with base64 URL
                const imageRecord = await prisma.image.create({
                    data: {
                        url: base64Image,
                        key: `dev-${Date.now()}-${fileName}`,
                        originalName: file.name,
                        size: compressedBuffer.length,
                        mimeType: 'image/jpeg',
                        userId: session.user.id,
                        domainId: domainId,
                    },
                });

                return NextResponse.json({
                    success: true,
                    imageUrl: base64Image,
                    imageId: imageRecord.id,
                    key: imageRecord.key,
                    size: compressedBuffer.length,
                    originalSize: file.size,
                    compressionRatio: Math.round((1 - compressedBuffer.length / file.size) * 100),
                    fallback: 'development-base64'
                });
            } else {
                throw r2Error;
            }
        }

    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('imageId');
        const key = searchParams.get('key');

        if (!imageId && !key) {
            return NextResponse.json({ error: 'Image ID or key is required' }, { status: 400 });
        }

        // Find image record
        let imageRecord;
        if (imageId) {
            imageRecord = await prisma.image.findFirst({
                where: {
                    id: imageId,
                    userId: session.user.id,
                },
            });
        } else {
            imageRecord = await prisma.image.findFirst({
                where: {
                    key: key,
                    userId: session.user.id,
                },
            });
        }

        if (!imageRecord) {
            return NextResponse.json({ error: 'Image not found or unauthorized' }, { status: 404 });
        }

        // Delete from R2
        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: imageRecord.key,
        });

        await s3Client.send(deleteCommand);

        // Delete from database
        await prisma.image.delete({
            where: { id: imageRecord.id },
        });

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully',
        });

    } catch (error) {
        console.error('Image deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}