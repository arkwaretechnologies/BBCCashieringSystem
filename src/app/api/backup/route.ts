import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/get-session";
import { getDatabaseFilePath } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const dbPath = getDatabaseFilePath();

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Database file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    const filename = `bbc-cashier-${new Date().toISOString().slice(0, 10)}.db`;

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const confirmation = formData.get("confirmation");

    if (confirmation !== "RESTORE") {
      return NextResponse.json(
        { error: "Confirmation phrase must be RESTORE" },
        { status: 400 }
      );
    }

    if (!file || !file.name.endsWith(".db")) {
      return NextResponse.json({ error: "Invalid backup file" }, { status: 400 });
    }

    const dbPath = getDatabaseFilePath();
    const backupPath = `${dbPath}.before-restore-${Date.now()}`;

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dbPath, buffer);

    return NextResponse.json({
      success: true,
      message: "Database restored. Please restart the server.",
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
