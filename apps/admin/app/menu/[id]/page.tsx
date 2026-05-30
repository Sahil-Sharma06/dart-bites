"use client";

import { MenuItem, getClientFirestore } from "@dartbites/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AdminShell } from "../../../components/admin-shell";
import { AuthGuard } from "../../../components/auth-guard";
import { MenuForm } from "../../../components/menu-form";

export default function EditMenuPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      const db = getClientFirestore();
      const snap = await getDoc(doc(db, "menu", params.id));
      if (snap.exists()) {
        setItem({ ...(snap.data() as MenuItem), id: snap.id });
      }
    };
    fetchItem();
  }, [params.id]);

  if (!item) {
    return (
      <AuthGuard>
        <AdminShell>Loading...</AdminShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminShell>
        <h1 className="font-sora mb-4 text-2xl font-extrabold uppercase tracking-tight text-white">Edit Menu Item</h1>
        <MenuForm mode="edit" initial={item} />
      </AdminShell>
    </AuthGuard>
  );
}
