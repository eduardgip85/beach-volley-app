import {
    Earth,
    MapPinned,
    ShieldCheck,
    Settings2,
    SlidersHorizontal,
    UserCog,
} from "lucide-react";
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
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { form, canManage, statuses, updateField, actions } = useSettings(profile);

    if (!profile || !form || !canManage) {
        return <p className="text-slate-500">Loading settings...</p>;
    }

    return (
        <section className="space-y-6 md:space-y-8">
            <div className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-sm">
                <div className="bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_100%)] px-5 py-6 sm:px-6 md:px-8 md:py-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-300">
                                Settings
                            </p>
                            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                                Manage your profile, location and account
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                                Keep your competitive identity clean, prepare your ranking
                                and location details, and handle your account from one place.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur">
                            <Settings2 size={18} className="text-blue-300" />
                            {profile.username ? `@${profile.username}` : profile.fullName}
                        </div>
                    </div>
                </div>
            </div>

            <SettingsSection
                icon={<UserCog size={24} />}
                title="Profile settings"
                description="Update your name, username and avatar image."
                defaultOpen
            >
                <ProfileSettingsForm
                    fullName={form.fullName}
                    username={form.username}
                    avatarUrl={form.avatarUrl}
                    status={statuses.profile}
                    onFullNameChange={(value) => updateField("fullName", value)}
                    onUsernameChange={(value) => updateField("username", value)}
                    onAvatarUrlChange={(value) => updateField("avatarUrl", value)}
                    onSave={actions.saveProfileSection}
                />
            </SettingsSection>

            <SettingsSection
                icon={<ShieldCheck size={24} />}
                title="Equipment verification"
                description="Verify your ball or net here so the badges stay attached to your player profile."
            >
                <EquipmentVerificationCard embedded collapsible={false} />
            </SettingsSection>

            <SettingsSection
                icon={<MapPinned size={24} />}
                title="Location settings"
                description="Set your country and city to unlock country ranking and future local discovery."
            >
                <LocationSettingsForm
                    country={form.country}
                    city={form.city}
                    status={statuses.location}
                    onCountryChange={(value) => updateField("country", value)}
                    onCityChange={(value) => updateField("city", value)}
                    onSave={actions.saveLocationSection}
                />
            </SettingsSection>

            <SettingsSection
                icon={<SlidersHorizontal size={24} />}
                title="Preferences"
                description="Store your language, match preference and availability for future smart matching."
            >
                <PreferencesSettingsForm
                    preferredLanguage={form.preferredLanguage}
                    preferredMatchMode={form.preferredMatchMode}
                    availabilityStatus={form.availabilityStatus}
                    status={statuses.preferences}
                    onPreferredLanguageChange={(value) =>
                        updateField("preferredLanguage", value)
                    }
                    onPreferredMatchModeChange={(value) =>
                        updateField("preferredMatchMode", value)
                    }
                    onAvailabilityStatusChange={(value) =>
                        updateField("availabilityStatus", value)
                    }
                    onSave={actions.savePreferencesSection}
                />
            </SettingsSection>

            <SettingsSection
                icon={<Earth size={24} />}
                title="Account"
                description="Protect your sessions, update your password, or permanently remove your account."
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
