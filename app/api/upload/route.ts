export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm, Fields, Files } from 'formidable';
import { Readable } from 'stream';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function POST(req: NextRequest) {
  try {
    const form = new IncomingForm();
    // formidable expects a Node.js req, so we need to get the raw body
    const buffers = [];
    for await (const chunk of req.body as any) {
      buffers.push(chunk);
    }
    const bodyBuffer = Buffer.concat(buffers);
    // Parse the form from the buffer
    // Convert Headers to plain object for formidable
    const headersObj = Object.fromEntries((req.headers as Headers).entries());
    // Create a Readable stream from the body buffer and cast as IncomingMessage
    const stream = new Readable() as unknown as import('http').IncomingMessage;
    stream.push(bodyBuffer);
    stream.push(null);
    stream.headers = headersObj;
    stream.method = req.method;
    stream.url = req.url || '/api/upload';
    const parsed = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(stream, (err: any, fields: Fields, files: Files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    const file = parsed.files.image;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    // formidable returns file as array or object
    const fileObj = Array.isArray(file) ? file[0] : file;
    const fileBuffer = await fs.promises.readFile(fileObj.filepath);
    // Wrap Cloudinary upload_stream in a promise and resolve with the correct response
    const response = await new Promise<NextResponse>((resolve) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'professionals' },
        (error: any, result: any) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            resolve(NextResponse.json({ error: 'Cloudinary upload failed', details: error?.message || error }, { status: 500 }));
          } else {
            resolve(NextResponse.json({ url: result.secure_url }, { status: 200 }));
          }
        }
      );
      bufferToStream(fileBuffer).pipe(stream);
    });
    return response;
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error?.message || error }, { status: 500 });
  }
}
