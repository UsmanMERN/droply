import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT || "",
});


export async function GET(request: Request) {
    const user = await auth();
    const userId = user.userId;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await imagekit.getAuthenticationParameters();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error getting authentication parameters:", error);
        return NextResponse.json({ error: "Failed to get authentication parameters" }, { status: 500 });
    }
} 