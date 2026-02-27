"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
export default function ProfileAboutPage() { const router = useRouter(); router.push("/profile"); return null; }
