import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // const url = new URL(request.url);
        const searchParams = request.nextUrl.searchParams;
        const queryUserId = searchParams.get("userId")
        const parentId = searchParams.get("parentId");

        if (queryUserId && queryUserId !== userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        let userFiles;

        if (parentId) {
            userFiles = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.userId, userId),
                        eq(files.parentId, parentId)
                    )
                );
        } else {
            userFiles = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.userId, userId),
                        isNull(files.parentId)
                    )
                );
        }
        return NextResponse.json({ success: true, files: userFiles });

    } catch (error) {
        console.error("Error fetching folders:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch folders" }), { status: 500 });
    }
}