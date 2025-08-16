
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { addPool } from "@/services/pool-service";
import { mockPools } from "@/lib/mock-data";

const addPoolSchema = z.object({
  remoteAddress: z.string().min(1, "Remote address is required."),
  poolName: z.string().min(1, "Pool name is required."),
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

type AddPoolFormValues = z.infer<typeof addPoolSchema>;

interface AddPoolDialogProps {
    onPoolAdded: () => void;
}

export function AddPoolDialog({ onPoolAdded }: AddPoolDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddPoolFormValues>({
    resolver: zodResolver(addPoolSchema),
    defaultValues: {
      remoteAddress: "",
      poolName: "",
    },
  });

  const handleTestConnection = async () => {
    setIsTesting(true);
    const { remoteAddress, poolName, username, password } = form.getValues();

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remoteAddress, poolName, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: data.message,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    setIsTesting(false);
  };

  const handleAddPool = async (values: AddPoolFormValues) => {
        setIsAdding(true);
        try {
            const newPoolData: Omit<PoolInput, 'status' | 'size' | 'allocated' | 'free' | 'vdevs' | 'logs'> = {
                name: values.poolName,
                remoteAddress: `${values.username}:${values.password}@${values.remoteAddress}`,
            };

          await addPool(newPoolData as PoolInput);
          
          toast({
            title: "Pool Added",
            description: `Started monitoring ${values.poolName}.`,
          });
          onPoolAdded();
          setIsOpen(false);
          form.reset();

        } catch (error) {
           toast({
            title: "Failed to Add Pool",
            description: "An error occurred while adding the new pool.",
            variant: "destructive",
          });
          console.error(error);
        } finally {
          setIsAdding(false);
        }
      };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusCircle className="h-5 w-5" />
          <span className="sr-only">Add New Pool</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New ZFS Pool</DialogTitle>
          <DialogDescription>
            Enter the details of the remote system and ZFS pool to monitor.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddPool)} className="grid gap-4 py-4">
             <FormField
                control={form.control}
                name="remoteAddress"
                render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Remote Address</FormLabel>
                        <FormControl className="col-span-3">
                            <Input placeholder="user@192.168.1.100" {...field} />
                        </FormControl>
                         <FormMessage className="col-span-4 pl-24" />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="poolName"
                render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Pool Name</FormLabel>
                        <FormControl className="col-span-3">
                            <Input placeholder="tank" {...field} />
                        </FormControl>
                        <FormMessage className="col-span-4 pl-24" />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Username</FormLabel>
                        <FormControl className="col-span-3">
                            <Input placeholder="root" {...field} />
                        </FormControl>
                        <FormMessage className="col-span-4 pl-24" />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Password</FormLabel>
                        <FormControl className="col-span-3">
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage className="col-span-4 pl-24" />
                    </FormItem>
                )}
            />

            <DialogFooter>
                 <Button type="button" variant="secondary" onClick={handleTestConnection} disabled={isTesting}>
                    {isTesting ? "Testing..." : "Test Connection"}
                </Button>
                <Button type="submit" disabled={isAdding}>
                    {isAdding ? "Adding..." : "Start Monitoring"}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
