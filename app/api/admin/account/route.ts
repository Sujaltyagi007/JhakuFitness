import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRBACSession } from "@/lib/rbac";
import { hashPassword, verifyPassword } from "@/lib/crypto";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getRBACSession(request);
    
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Update Name
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json({ error: "Valid name is required" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    // Update Password
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }
      
      const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
      }

      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    // If nothing to update, return success early
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: "Nothing to update" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("PATCH /api/admin/account error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
