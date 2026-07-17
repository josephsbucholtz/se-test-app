// app/(user)/layout.tsx
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center px-6">
          {/* App Title */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Software Typing
          </Link>

          {/* Center Navigation */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                    <Link
                      href="/typing"
                      className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Typing
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link
                      href="/testing"
                      className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Testing
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link
                      href="/about"
                      className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      About
                    </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}