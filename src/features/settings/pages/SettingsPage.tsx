import {
    Earth,
    ShieldCheck,
    UserCog,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { EquipmentVerificationCard } from "../../profile/components/EquipmentVerificationCard";
import { AccountSettingsSection } from "../components/AccountSettingsSection";
import { LocationSettingsForm } from "../components/LocationSettingsForm";
import { PreferencesSettingsForm } from "../components/PreferencesSettingsForm";
import { ProfileSettingsForm } from "../components/ProfileSettingsForm";
import { SettingsSection } from "../components/SettingsSection";
import { useSettings } from "../hooks/useSettings";

export function SettingsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { form, canManage, statuses, updateField, actions } = useSettings(profile);

    if (!profile || !form || !canManage) {
        return <p className="text-slate-500">{t("settings.loading")}</p>;
    }

    return (
        <section className="space-y-6 md:space-y-8">
            <SettingsSection
                icon={<UserCog size={24} />}
                title={t("settings.profile.title")}
                description={t("settings.profile.description")}
                defaultOpen
            >
                <ProfileSettingsForm
                    fullName={form.fullName}
                    avatarUrl={form.avatarUrl}
                    status={statuses.profile}
                    onFullNameChange={(value) => updateField("fullName", value)}
                    onAvatarUrlChange={(value) => updateField("avatarUrl", value)}
                    onSave={actions.saveProfileSection}
                />
                <div className="my-6 h-px bg-slate-200" />
                <LocationSettingsForm
                    country={form.country}
                    city={form.city}
                    status={statuses.location}
                    onCountryChange={(value) => updateField("country", value)}
                    onCityChange={(value) => updateField("city", value)}
                    onSave={actions.saveLocationSection}
                />
                <div className="my-6 h-px bg-slate-200" />
                <PreferencesSettingsForm
                    preferredLanguage={form.preferredLanguage}
                    status={statuses.preferences}
                    onPreferredLanguageChange={(value) =>
                        updateField("preferredLanguage", value)
                    }
                    onSave={actions.savePreferencesSection}
                />
            </SettingsSection>

            <SettingsSection
                icon={<ShieldCheck size={24} />}
                title={t("settings.equipment.title")}
                description={t("settings.equipment.description")}
            >
                <EquipmentVerificationCard embedded collapsible={false} />
            </SettingsSection>

            <SettingsSection
                icon={<Earth size={24} />}
                title={t("settings.account.title")}
                description={t("settings.account.description")}
            >
                <AccountSettingsSection
                    status={statuses.account}
                    onChangePassword={actions.updatePassword}
                    onLogoutAllSessions={async () => {
                        const ok = await actions.logoutEverywhere();

                        if (ok) {
                            navigate("/login", { replace: true });
                        }

                        return ok;
                    }}
                    onDeleteAccount={async (confirmationText) => {
                        const ok = await actions.removeAccount(confirmationText);

                        if (ok) {
                            navigate("/", { replace: true });
                        }

                        return ok;
                    }}
                />
            </SettingsSection>
        </section>
    );
}
