"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { ShieldCheck, LogOut, Search, User as UserIcon } from 'lucide-react';

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setUser(session.user);

                // Try to fetch profile from DB
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (data) setProfile(data);
            } else {
                window.location.href = '/login';
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="bg-slate-900 px-6 py-8 text-white relative">
                    <div className="flex justify-between items-center relative z-10">
                        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || user.email}</h1>
                        <button onClick={handleLogout} className="text-slate-300 hover:text-white flex items-center gap-2">
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 w-full">
                        <div className="glass p-6 rounded-lg mb-6 border-l-4 border-l-primary">
                            <h2 className="text-xl font-semibold mb-2 text-slate-900 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-primary" /> Profile Status
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-slate-600">
                                <div>Email: <span className="text-slate-900">{user.email}</span></div>
                                <div>Role: <span className="text-slate-900 uppercase font-medium">{profile?.role || 'Guest'}</span></div>
                                <div>Member Since: <span className="text-slate-900">{new Date(user.created_at).toLocaleDateString()}</span></div>
                            </div>
                        </div>

                        {profile?.role === 'worker' && (
                            <div className="bg-green-50 text-green-800 p-6 rounded-lg mb-6 flex items-start gap-4 border border-green-200">
                                <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                                <div>
                                    <h3 className="font-bold text-lg">Police Verification Status</h3>
                                    <p className="mt-1 opacity-90">To get the green shield badge and build trust with customers, upload your police certificate and IDs.</p>
                                    <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm font-medium transition-colors">
                                        Apply for Safety Badge
                                    </button>
                                </div>
                            </div>
                        )}

                        {(profile?.role === 'customer' || !profile?.role) && (
                            <div className="bg-blue-50 text-slate-800 p-6 rounded-lg mb-6 border border-blue-100 flex items-start gap-4">
                                <Search className="w-8 h-8 text-primary shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg">Find Trusted Professionals</h3>
                                    <p className="mt-1 text-slate-600">Search for police-verified workers nearby for affordable rates and secure guaranteed delivery.</p>
                                    <button onClick={() => window.location.href = '/search'} className="w-full bg-primary hover:bg-secondary text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                                        <Search className="w-5 h-5" /> Search Workers
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-1/3 bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <h3 className="font-semibold text-slate-900 border-b pb-4 mb-4">Recent Bookings/Jobs</h3>
                        <div className="text-center py-8 text-slate-500 text-sm">
                            <p>No active jobs found.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
