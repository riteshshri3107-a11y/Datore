"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Star, ShieldCheck, CheckCircle2, AlertTriangle, CalendarDays, Clock, MessageSquare, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function WorkerProfile({ params }: { params: { id: string } }) {
    const [worker, setWorker] = useState<any>(null);
    const [skills, setSkills] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const workerId = params.id;

    useEffect(() => {
        const fetchWorkerData = async () => {
            setLoading(true);

            // Fetch base worker profile + user info
            const { data: profile } = await supabase
                .from('worker_profiles')
                .select(`
                    *,
                    profiles:id (full_name, avatar_url, created_at)
                `)
                .eq('id', workerId)
                .single();

            if (profile) {
                setWorker(profile);

                // Fetch skills
                const { data: skillsData } = await supabase
                    .from('worker_skills')
                    .select(`
                        *,
                        categories (name, icon)
                    `)
                    .eq('worker_id', workerId);

                if (skillsData) setSkills(skillsData);

                // Fetch recent reviews (mock or real)
                const { data: reviewsData } = await supabase
                    .from('reviews')
                    .select(`
                        *,
                        profiles!reviewer_id (full_name, avatar_url)
                    `)
                    .eq('target_id', workerId)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (reviewsData) setReviews(reviewsData);
            }

            setLoading(false);
        };

        if (workerId) {
            fetchWorkerData();
        }
    }, [workerId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <AlertTriangle className="w-16 h-16 text-slate-300 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Profile Not Found</h1>
                <p className="text-slate-500 mt-2">The professional you are looking for does not exist or has been removed.</p>
                <Link href="/search" className="mt-8 text-primary hover:underline flex items-center">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Search
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Cover Banner */}
            <div className="h-48 md:h-64 bg-slate-900 w-full relative">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
                    <Link href="/search" className="absolute top-6 left-4 sm:left-6 lg:left-8 text-white/80 hover:text-white flex items-center bg-black/20 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Search
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 text-black">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left Column: Avatar & Summary */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
                            <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full border-4 border-white shadow-lg overflow-hidden relative">
                                {worker.profiles?.avatar_url ? (
                                    <img src={worker.profiles.avatar_url} alt={worker.profiles.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold uppercase">
                                        {worker.profiles?.full_name?.charAt(0) || 'W'}
                                    </div>
                                )}
                            </div>

                            <h1 className="mt-4 text-2xl font-bold text-slate-900">{worker.profiles?.full_name}</h1>

                            <div className="flex items-center justify-center text-slate-500 mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {worker.location_city || 'Location unspecified'}
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {worker.is_police_verified && (
                                    <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                                        Police Verified
                                    </div>
                                )}
                                <div className="inline-flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                    <Star className="w-4 h-4 mr-1.5 fill-current" />
                                    {worker.average_rating > 0 ? worker.average_rating.toFixed(1) : 'New'} ({worker.total_jobs_completed} jobs)
                                </div>
                            </div>

                            <hr className="my-6 border-slate-100" />

                            <div className="space-y-4">
                                <button className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 animate-pulse-slow">
                                    Book This Professional
                                </button>
                                <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl shadow-sm border border-slate-200 transition-colors flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                                    Send Message
                                </button>
                            </div>

                            <p className="mt-6 text-xs text-slate-400">
                                Member since {new Date(worker.profiles?.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Bio, Skills, Reviews */}
                    <div className="w-full md:w-2/3 space-y-6">

                        {/* About Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">About Me</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {worker.bio || 'This professional has not written a bio yet.'}
                            </p>
                        </div>

                        {/* Services & Pricing */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Services Offered</h2>

                            {skills.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {skills.map(skill => (
                                        <div key={skill.id} className="border border-slate-100 rounded-xl p-4 hover:border-primary/30 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-800">{skill.categories?.name}</h3>
                                                <div className="text-primary font-bold">${skill.rate_per_hour}/hr</div>
                                            </div>
                                            {skill.is_licensed && (
                                                <span className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Licensed Pro
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No specific services listed yet.</p>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Recent Reviews</h2>
                                <span className="text-slate-500 text-sm">{reviews.length} reviews viewing</span>
                            </div>

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                                                        {review.profiles?.avatar_url ? (
                                                            <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-600 font-medium">
                                                                {review.profiles?.full_name?.charAt(0) || 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{review.profiles?.full_name || 'Customer'}</div>
                                                        <div className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="mt-3 text-slate-600 text-sm">
                                                {review.review_text || 'No written feedback provided.'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-500">No reviews yet for this professional.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
