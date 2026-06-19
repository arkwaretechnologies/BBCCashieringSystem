"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateSchoolSettingsAction } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Settings = {
  schoolName: string;
  schoolAddress: string;
  receiptFooter: string;
};

export function SettingsClient({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);

  async function handleSettings(formData: FormData) {
    const result = await updateSchoolSettingsAction(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Settings saved");
    router.refresh();
  }

  async function handleRestore(formData: FormData) {
    setRestoring(true);
    try {
      const response = await fetch("/api/backup", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Restore failed");
        return;
      }
      toast.success(data.message);
    } catch {
      toast.error("Restore failed");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input id="schoolName" name="schoolName" defaultValue={settings.schoolName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolAddress">School Address</Label>
              <Textarea id="schoolAddress" name="schoolAddress" defaultValue={settings.schoolAddress} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptFooter">Receipt Footer</Label>
              <Textarea id="receiptFooter" name="receiptFooter" defaultValue={settings.receiptFooter} />
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download a full database backup or restore from a previous `.db` file.
            Restore requires a server restart after completion.
          </p>
          <Button asChild>
            <a href="/api/backup">Download Backup</a>
          </Button>
          <form action={handleRestore} className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="file">Restore File (.db)</Label>
              <Input id="file" name="file" type="file" accept=".db" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">Type RESTORE to confirm</Label>
              <Input id="confirmation" name="confirmation" placeholder="RESTORE" required />
            </div>
            <Button type="submit" variant="destructive" disabled={restoring}>
              {restoring ? "Restoring..." : "Restore Database"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
