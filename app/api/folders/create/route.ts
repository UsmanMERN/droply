import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const body = await request.json();
        const { name, path, size, type, fileUrl, thumbnailUrl, parentId = null, userId: bodyUserId } = body;

        if (bodyUserId !== userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }


        if (!name || typeof name !== "string" || name.trim() === "") {
            return new Response(JSON.stringify({ error: "Invalid folder name" }), { status: 400 });
        }

        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),
                        eq(files.userId, userId),
                        eq(files.isFolder, true)
                    )
                )
            if (!parentFolder) {
                return new Response(JSON.stringify({ error: "Parent folder not found" }), { status: 404 });
            }
        }

        const folderData = { id: uuidv4(), name: name.trim(), path: `/folders/${userId}/${uuidv4()}`, size: 0, type: "folder", fileUrl: fileUrl || "", thumbnailUrl: thumbnailUrl || "", userId: userId, parentId, isFolder: true, isStarred: false, isTrashed: false, createdAt: new Date(), updatedAt: new Date() };

        const [newFolder] = await db
            .insert(files).values(folderData)
            .returning();

        return NextResponse.json({ success: true, message: "Folder created successfully", folder: newFolder });
    } catch (error) {

    }
}