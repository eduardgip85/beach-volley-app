import { supabase } from "../../../config/supabase";

export interface EquipmentVerificationResult {
    hasBall: boolean;
    hasNet: boolean;
    equipmentVerified: boolean;
    confidence: number;
    reason: string;
}

export async function verifyEquipmentImage(
    imageFile: File
): Promise<EquipmentVerificationResult> {
    if (imageFile.size > 3 * 1024 * 1024) {
        throw new Error("Image must be smaller than 3MB");
    }

    if (!imageFile.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
    }

    const base64 = await fileToBase64(imageFile);

    const { data, error } = await supabase.functions.invoke(
        "verify-equipment",
        {
        body: {
            image: base64,
        },
        }
    );

    if (error) {
        throw error;
    }

    return data;
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
        resolve(String(reader.result));
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}