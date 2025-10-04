import { createUploadthing } from "uploadthing/next";


const f = createUploadthing();

const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
        .onUploadComplete(async ({ file }) => {
            return { url: file.url };
        }),
};

module.exports = { ourFileRouter };
