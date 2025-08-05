
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
    const { remoteAddress, poolName } = form.getValues();
    
    // Simulate API call to test connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isSuccess = remoteAddress.includes('192') && poolName.length > 0;

    if (isSuccess) {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${poolName} at ${remoteAddress}.`,
      });
    } else {
      toast({
        title: "Connection Failed",
        description: "Could not connect. Check address and pool name.",
        variant: "destructive",
      });
    }
    setIsTesting(false);
  };

  const handleAddPool = async (values: AddPoolFormValues) => {
    setIsAdding(true);
    try {
        // This is a placeholder. In a real app, you would fetch real data
        // from the remote server based on `values.remoteAddress` and `values.poolName`
        // and create a new pool object.
        const newPoolData = {
            ...mockPools[0], // using mock data as a template
            id: '', // Firestore will generate ID
            name: values.poolName,
            remoteAddress: values.remoteAddress,
        };
      
      // The `id` is removed from the type before passing to the service
      const { id, ...poolInput } = newPoolData;

      await addPool(poolInput);
      
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
