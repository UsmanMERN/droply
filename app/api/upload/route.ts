import { auth } from "@clerk/nextjs/server";

import { files } from "@/lib/db/schema";
import { db } from "@/lib/db";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const user = await auth();
    const userId = user.userId;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { imagekit, userId: bodyUserId } = body

        if (bodyUserId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (!imagekit || !imagekit.url) {
            return NextResponse.json({ error: "Invalid file upload data" }, { status: 400 });
        }

        // Save file metadata to the database
        const fileData = {
            name: imagekit.name || "Untitled",
            path: imagekit.filePath || `droply/${userId}/${imagekit.name || "Untitled"}`,
            size: imagekit.size || 0,
            userId: userId,
            type: imagekit.fileType || "unknown",
            fileUrl: imagekit.url,
            parentId: null,
            isFolder: false,
            isStarred: false,
            isTrashed: false,
            thumbnail: imagekit.thumbnail || null,
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}