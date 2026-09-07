import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { ADMIN_COOKIE_NAME } from "@/app/api/admin/auth/route";
import cloudinary, { CLOUDINARY_FOLDER } from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import path from "path";

// Supported file extensions
const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
  ".pdf",
];

const RESOURCE_TYPES = ["image", "video", "raw"] as const;

function resourceTypeForExt(ext: string): (typeof RESOURCE_TYPES)[number] {
  if (ext === ".mp4" || ext === ".webm") return "video";
  if (ext === ".pdf") return "raw";
  return "image";
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie?.value) return false;
  const payload = await verifyJWT(sessionCookie.value);
  return !!payload && payload.role === "admin";
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const sanitizedBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const publicId = `${sanitizedBase}_${Date.now()}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          public_id: publicId,
          resource_type: resourceTypeForExt(ext),
        },
        (error, uploaded) => {
          if (error || !uploaded) return reject(error ?? new Error("Upload failed"));
          resolve(uploaded);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      fileName: `${publicId}${ext}`,
      sizeBytes: result.bytes,
      mimeType: file.type,
      uploadedAt: result.created_at,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process and save file upload" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const resultsByType = await Promise.all(
      RESOURCE_TYPES.map((resourceType) => cloudinary.api.resources({
        type: "upload", resource_type: resourceType,
        prefix: `${CLOUDINARY_FOLDER}/`, max_results: 100,
      }))
    );

    const files = resultsByType.flatMap((r) => r.resources).map((resource) => ({
      name: resource.public_id.split("/").pop() + (resource.format ? `.${resource.format}` : ""),
      url: resource.secure_url as string,
      sizeBytes: resource.bytes as number,
      createdAt: resource.created_at as string,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Fetch files error:", error);
    return NextResponse.json({ files: [] });
  }
}
