"use client";
export const dynamic = "force-dynamic";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AboutRedirect() { const r = useRouter(); useEffect(() => { r.push('/profile'); }, []); return null; }
