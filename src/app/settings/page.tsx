
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSettings, saveSettings } from "@/services/settings-service";
import { testTelegramConnection } from "@/services/telegram-service";
import type { Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";


const settingsSchema = z.object({
  telegram: z.object({
    botToken: z.string().min(1, "Bot token is required."),
    chatId: z.string().min(1, "Chat ID is required."),
  }),
  notifications: z.object({
    poolDegraded: z.boolean(),
    poolFaulted: z.boolean(),
    diskErrors: z.boolean(),
    smartFailures: z.boolean(),
  }),
});


export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const { toast } = useToast();

    const form = useForm<Settings>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            telegram: { botToken: "", chatId: "" },
            notifications: {
                poolDegraded: true,
                poolFaulted: true,
                diskErrors: false,
                smartFailures: true,
            },
        },
    });

    useEffect(() => {
        async function loadSettings() {
            try {
                const settings = await getSettings();
                form.reset(settings);
            } catch (error) {
                toast({
                    title: "Error loading settings",
                    description: "Could not fetch settings from the server.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, [form, toast]);

    const handleSave = async (data: Settings) => {
        setIsSaving(true);
        try {
            await saveSettings(data);
            toast({
                title: "Settings Saved",
                description: "Your new settings have been saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Save Failed",
                description: "Could not save your settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        await form.trigger(["telegram.botToken", "telegram.chatId"]);
        const botToken = form.getValues("telegram.botToken");
        const chatId = form.getValues("telegram.chatId");

        if (!botToken || !chatId) {
             toast({
                title: "Test Failed",
                description: "Please enter both Bot Token and Chat ID.",
                variant: "destructive",
            });
            setIsTesting(false);
            return;
        }

        // Temporarily save to allow service to read it
        await saveSettings(form.getValues());

        try {
            const result = await testTelegramConnection();
            if (result.ok) {
                toast({
                    title: "Connection Successful",
                    description: "A test message was sent to your Telegram chat.",
                });
            } else {
                toast({
                    title: "Connection Failed",
                    description: result.description || "Please check your token and chat ID.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Connection Error",
                description: "An unexpected error occurred. See console for details.",
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setIsTesting(false);
        }
    };
    
    if (isLoading) {
        return (
             <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-80" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                             <div className="flex items-center space-x-2">
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-40" />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-80" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-20 w-full" />
                           <Skeleton className="h-20 w-full" />
                           <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
             </div>
        )
    }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">
                Manage your application settings and notification preferences.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Telegram Notifications</CardTitle>
                <CardDescription>
                  Configure your Telegram bot to receive real-time alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="telegram.botToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Token</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your Telegram bot token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="telegram.chatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chat ID</FormLabel>
                       <FormControl>
                        <Input placeholder="Enter your Telegram chat ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center space-x-2">
                    <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
                    <Button type="button" variant="secondary" onClick={handleTestConnection} disabled={isTesting}>{isTesting ? "Testing..." : "Test Connection"}</Button>
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
                    <FormField
                        control={form.control}
                        name="notifications.poolDegraded"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <FormLabel>Pool Degraded</FormLabel>
                                    <FormDescription>Receive an alert when a pool becomes degraded.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="notifications.poolFaulted"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <FormLabel>Pool Faulted</FormLabel>
                                    <FormDescription>Receive an alert when a pool becomes faulted (critical).</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="notifications.diskErrors"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <FormLabel>Disk Errors</FormLabel>
                                    <FormDescription>Notify on new disk read, write, or checksum errors.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="notifications.smartFailures"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <FormLabel>SMART Failures</FormLabel>
                                    <FormDescription>Alert when SMART data predicts an imminent disk failure.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </form>
      </Form>
    </div>
  );
}
