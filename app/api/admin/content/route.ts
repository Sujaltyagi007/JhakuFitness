import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/admin/content — return all ContentBlocks and SiteSettings */
export async function GET() {
  const [blocks, settings] = await Promise.all([
    prisma.contentBlock.findMany({ orderBy: { slug: "asc" } }),
    prisma.siteSetting.findMany({ orderBy: { key: "asc" } }),
  ]);
  return NextResponse.json({ blocks, settings });
}

/** PATCH /api/admin/content — upsert a ContentBlock or SiteSetting */
export async function PATCH(req: Request) {
  try {
    const body = await req.json() as {
      type: "block" | "setting";
      slug?: string;
      key?: string;
      title?: string;
      bodyText?: string;
      mediaUrl?: string;
      metadata?: object;
      value?: string;
    };

    if (body.type === "setting" && body.key) {
      const setting = await prisma.siteSetting.upsert({
        where: { key: body.key },
        create: { key: body.key, value: body.value ?? "" },
        update: { value: body.value ?? "" },
      });
      return NextResponse.json(setting);
    }

    if (body.type === "block" && body.slug) {
      const block = await prisma.contentBlock.upsert({
        where: { slug: body.slug },
        create: {
          slug: body.slug,
          title: body.title ?? null,
          bodyText: body.bodyText ?? null,
          mediaUrl: body.mediaUrl ?? null,
          metadata: body.metadata ?? {},
        },
        update: {
          title: body.title ?? null,
          bodyText: body.bodyText ?? null,
          mediaUrl: body.mediaUrl ?? null,
          metadata: body.metadata ?? {},
        },
      });
      return NextResponse.json(block);
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
