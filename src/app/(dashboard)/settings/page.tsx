import { SettingsClient } from "@/components/settings/settings-client";
import { getSchoolSettingsAction } from "@/lib/actions/settings";

export default async function SettingsPage() {
  const settings = await getSchoolSettingsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">School details, backup, and restore.</p>
      </div>
      <SettingsClient settings={settings} />
    </div>
  );
}
