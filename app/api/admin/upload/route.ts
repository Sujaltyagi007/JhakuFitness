import path from "path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import { verifyJWT, ADMIN_COOKIE_NAME } from "@/lib/jwt";
import cloudinary, { CLOUDINARY_FOLDER } from "@/lib/cloudinary";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".pdf"];
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
    if (!(await requireAdmin())) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const replacePublicId = formData.get("publicId") as string | null;
    const replaceResourceType = formData.get("resourceType") as (typeof RESOURCE_TYPES)[number] | null;

    if (!file) { return NextResponse.json({ error: "No file uploaded" }, { status: 400 }) }
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the maximum limit of 5 MB." }, { status: 400 });
    }
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` }, { status: 400 }
      );
    }

    const sanitizedBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const isReplacing = Boolean(replacePublicId);
    const publicId = replacePublicId || `${sanitizedBase}_${Date.now()}`;
    const resourceType = replaceResourceType || resourceTypeForExt(ext);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        invalidate: true,
      };

      // Only specify folder when creating new asset without existing publicId
      if (!isReplacing) {
        uploadOptions.folder = CLOUDINARY_FOLDER;
      }

      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, uploaded) => {
        if (error || !uploaded) return reject(error ?? new Error("Upload failed"));
        resolve(uploaded);
      });
      stream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      fileName: `${publicId}${ext}`,
      sizeBytes: result.bytes,
      mimeType: file.type,
      uploadedAt: result.created_at,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process and save file upload" }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!(await requireAdmin())) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    const resultsByType = await Promise.all(
      RESOURCE_TYPES.map((resourceType) => cloudinary.api.resources({
        type: "upload", resource_type: resourceType,
        prefix: `${CLOUDINARY_FOLDER}/`, max_results: 100,
      }))
    );

    const files = resultsByType.flatMap((r) => r.resources).map((resource) => ({
      name: resource.public_id.split("/").pop() + (resource.format ? `.${resource.format}` : ""),
      publicId: resource.public_id,
      resourceType: resource.resource_type,
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

export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin())) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
    const body = await req.json();
    const { publicId, resourceType } = body;

    if (!publicId) {
      return NextResponse.json({ error: "publicId is required to delete asset" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "image",
      invalidate: true,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
