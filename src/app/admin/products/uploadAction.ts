// ═══════════════════════════════════════════════════════════════
// FILE: uploadAction.ts
// PURPOSE: Server action to upload an image to ImgBB and return
//          the direct URL.
// LOCATION: src/app/admin/products/uploadAction.ts
// ═══════════════════════════════════════════════════════════════

"use server";

export async function uploadImageToImgBB(formData: FormData) {
    try {
        const file = formData.get("image") as File;
        if (!file) {
            return { success: false, error: "No image provided." };
        }

        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) {
            console.error("Missing IMGBB_API_KEY environment variable.");
            return {
                success: false,
                error: "Server configuration error: Missing API Key.",
            };
        }

        // Prepare formData for ImgBB API
        const imgbbFormData = new FormData();
        imgbbFormData.append("image", file);

        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            {
                method: "POST",
                body: imgbbFormData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("ImgBB upload failed:", errorData);
            return {
                success: false,
                error: errorData.error?.message || "Failed to upload image.",
            };
        }

        const data = await response.json();

        // data.data.url contains the direct image link
        return { success: true, url: data.data.url };

    } catch (error) {
        console.error("Upload server action error:", error);
        return { success: false, error: "An unexpected error occurred during upload." };
    }
}
