import { ThemeToggle } from "./dashboard/theme-toggle";
import { Layers3 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <div className="flex items-center gap-2 font-semibold font-headline">
          <Layers3 className="h-6 w-6 text-primary" />
          <span>ZFS Notifier</span>
       </div>
       <div className="ml-auto">
        <ThemeToggle />
       </div>
    </header>
  );
}
