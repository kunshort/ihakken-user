import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SH</span>
          </div>
          <span className="font-semibold text-foreground">Serenity Hub</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Home
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Services
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="default" size="sm" className="hidden md:flex">
            Get Started
          </Button>
          <button className="md:hidden p-2">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
