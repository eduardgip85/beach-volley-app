const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

export async function readAvatarFileAsDataUrl(file: File) {
    if (!file.type.startsWith("image/")) {
        throw new Error("Please choose an image file");
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
        throw new Error("Avatar image must be smaller than 2MB");
    }

    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }

            reject(new Error("Could not read image file"));
        };

        reader.onerror = () => {
            reject(new Error("Could not read image file"));
        };

        reader.readAsDataURL(file);
    });
}
