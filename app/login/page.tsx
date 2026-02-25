"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (isSignUp: boolean) => {
        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: role,
                            full_name: email.split('@')[0],
                        }
                    }
                });
                if (error) throw error;
                setMessage('Registration successful! Check your email to verify.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                setMessage('Logged in successfully!');
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Shield className="mx-auto h-16 w-16 text-primary" />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Join SkillConnect Today
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Join our proud community of trusted experts and satisfied customers
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 glass">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email address</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Choose Your Path</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-slate-700 shadow-sm"
                            >
                                <option value="customer">I want to hire professionals</option>
                                <option value="worker">I want to post my skills</option>
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <button
                                disabled={loading}
                                onClick={() => handleAuth(false)}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                Sign In
                            </button>
                            <button
                                disabled={loading}
                                onClick={() => handleAuth(true)}
                                className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                Register
                            </button>
                        </div>

                        {message && (
                            <div className={`mt-4 text-center text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                                {message}
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-center text-sm text-slate-500">
                            <Lock className="w-4 h-4 mr-1" />
                            Secure Authentication via Supabase
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
