import { supabase } from "../../../config/supabase";

export type EquipmentTarget = "ball" | "net";

export interface EquipmentVerificationResult {
  target: EquipmentTarget;
  detected: boolean;
  confidence: number;
  reason: string;
}

export async function verifyEquipmentImage(
  imageFile: File,
  target: EquipmentTarget
): Promise<EquipmentVerificationResult> {

  if (!imageFile.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const base64 = await fileToBase64(imageFile);

  const { data, error } = await supabase.functions.invoke(
    "verify-equipment",
    {
      body: {
        image: base64,
        target,
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