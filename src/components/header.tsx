import { ThemeToggle } from "./dashboard/theme-toggle";
import { Layers3 } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
       <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
          <Layers3 className="h-6 w-6 text-primary" />
          <span>ZFS Telegram Notifier</span>
       </Link>
       <div className="ml-auto">
        <ThemeToggle />
       </div>
    </header>
  );
}
