"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <header className="border-b border-border bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={isAdmin ? "/admin/dashboard" : "/staff/log-hours"}>
              <Image
                src="/complete_logo.png"
                alt="Complete Weddings + Events"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          <nav className="flex gap-6">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === '/admin/dashboard'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/staff"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === '/admin/staff'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  Staff Management
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/staff/log-hours"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === '/staff/log-hours'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  Log Hours
                </Link>
                <Link
                  href="/staff/history"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === '/staff/history'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  My History
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
