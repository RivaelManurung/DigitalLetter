'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar-nav';

/** Sidebar versi layar sempit — dibuka lewat tombol di header. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Buka navigasi" />
        }
      >
        <Menu size={16} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Navigasi</DialogTitle>
          <DialogDescription className="sr-only">
            Pindah antar halaman dashboard
          </DialogDescription>
        </DialogHeader>

        <SidebarNav onNavigate={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
