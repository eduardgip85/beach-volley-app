import { supabase } from "../../../config/supabase";

interface UpdateProfileLocationInput {
    userId: string;
    country: string | null;
    city: string | null;
}

export async function updateProfileLocation({
    userId,
    country,
    city,
}: UpdateProfileLocationInput) {
    const normalizedCountry = country?.trim() ? country.trim() : null;
    const normalizedCity = city?.trim() ? city.trim() : null;

    const { error } = await supabase
        .from("profiles")
        .update({
            country: normalizedCountry,
            city: normalizedCity,
        })
        .eq("id", userId);

    if (error) throw error;
}
