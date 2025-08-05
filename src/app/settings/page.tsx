
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Server } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application settings and notification preferences.
          </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Remote Server
                </CardTitle>
                <CardDescription>
                    Configure the connection to the remote server you want to monitor.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="server-address">Server Address</Label>
                    <Input id="server-address" placeholder="user@192.168.1.100" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="server-user">Username</Label>
                    <Input id="server-user" placeholder="root" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="server-password">Password / Key Passphrase</Label>
                    <Input id="server-password" type="password" />
                </div>
                 <div className="flex items-center space-x-2">
                    <Button>Save Configuration</Button>
                    <Button variant="secondary">Test Connection</Button>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Telegram Notifications</CardTitle>
            <CardDescription>
              Configure your Telegram bot to receive real-time alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram-token">Bot Token</Label>
              <Input id="telegram-token" placeholder="Enter your Telegram bot token" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chat-id">Chat ID</Label>
              <Input id="chat-id" placeholder="Enter your Telegram chat ID" />
            </div>
            <div className="flex items-center space-x-2">
                <Button>Save</Button>
                <Button variant="secondary">Test Connection</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                    Customize which events trigger a notification.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">Pool Degraded</p>
                        <p className="text-sm text-muted-foreground">Receive an alert when a pool becomes degraded.</p>
                    </div>
                    <Switch defaultChecked/>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">Pool Faulted</p>
                        <p className="text-sm text-muted-foreground">Receive an alert when a pool becomes faulted (critical).</p>
                    </div>
                    <Switch defaultChecked/>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">Disk Errors</p>
                        <p className="text-sm text-muted-foreground">Notify on new disk read, write, or checksum errors.</p>
                    </div>
                    <Switch />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="font-medium">SMART Failures</p>
                        <p className="text-sm text-muted-foreground">Alert when SMART data predicts an imminent disk failure.</p>
                    </div>
                    <Switch defaultChecked/>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
