// app/(user)/layout.tsx
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import SignOutButton from "./sign-out-button";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center px-6">
          {/* App Title */}
          <span
            className="text-xl font-bold tracking-tight"
          >
            Software Practice
          </span>

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

              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right-aligned links */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/developers-notes"
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Developer's Notes
            </Link>

            {user ? (
              <form action={signOut}>
                <SignOutButton />
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="">
        {children}
      </main>
    </div>
  );
}