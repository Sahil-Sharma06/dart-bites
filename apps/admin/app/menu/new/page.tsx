"use client";

import { AdminShell } from "../../../components/admin-shell";
import { AuthGuard } from "../../../components/auth-guard";
import { MenuForm } from "../../../components/menu-form";

export default function NewMenuItemPage() {
  return (
    <AuthGuard>
      <AdminShell>
        <h1 className="mb-4 text-xl font-black">Add Menu Item</h1>
        <MenuForm mode="create" />
      </AdminShell>
    </AuthGuard>
  );
}
