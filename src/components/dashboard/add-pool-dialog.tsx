"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function AddPoolDialog() {
  return (
    <Dialog>
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remote-address" className="text-right">
              Remote Address
            </Label>
            <Input id="remote-address" placeholder="user@192.168.1.100" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pool-name" className="text-right">
              Pool Name
            </Label>
            <Input id="pool-name" placeholder="tank" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Start Monitoring</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
