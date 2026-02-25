"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Filter, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
    const [workers, setWorkers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoriesAndWorkers = async () => {
            setLoading(true);

            // 1. Fetch categories
            const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true);
            if (cats) setCategories(cats);

            // 2. Fetch worker profiles
            // In a real app, this query would be more complex and join with user table to get full_name
            const { data: workerProfiles, error } = await supabase
                .from('worker_profiles')
                .select(`
                    *,
                    profiles:id (full_name, avatar_url)
                `);

            if (workerProfiles) {
                setWorkers(workerProfiles);
            }

            setLoading(false);
        };

        fetchCategoriesAndWorkers();
    }, []);

    const filteredWorkers = workers.filter(w => {
        const matchesName = w.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkillContext = w.bio?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesName || matchesSkillContext;
    });

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* Search Header */}
            <div className="bg-slate-900 border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-6">Find Trusted Professionals</h1>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-4 border-none rounded-lg text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none shadow-sm text-lg"
                                placeholder="What service do you need?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-4 border-none rounded-lg text-slate-900 focus:ring-2 focus:ring-primary focus:outline-none shadow-sm text-lg"
                                placeholder="Your city"
                                defaultValue="New York"
                            />
                        </div>
                        <button className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                            <Filter className="w-5 h-5" /> Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Categories */}
                    <div className="w-full md:w-64 shrink-0">
                        <h3 className="font-semibold text-slate-900 mb-4 text-lg">Categories</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-6 text-slate-800">
                            {filteredWorkers.length} {filteredWorkers.length === 1 ? 'Professional' : 'Professionals'} found
                        </h2>

                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 h-40"></div>
                                ))}
                            </div>
                        ) : filteredWorkers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredWorkers.map(worker => (
                                    <Link href={`/worker/${worker.id}`} key={worker.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer group block">
                                        <div className="p-6 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm group-hover:border-primary transition-colors">
                                                        {worker.profiles?.avatar_url ? (
                                                            <img src={worker.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl uppercase">
                                                                {worker.profiles?.full_name?.charAt(0) || 'W'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
                                                            {worker.profiles?.full_name || 'Anonymous Worker'}
                                                        </h3>
                                                        <div className="flex items-center text-slate-500 text-sm mt-1">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            {worker.location_city || 'Location unavailable'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {worker.is_police_verified && (
                                                    <div className="bg-green-50 text-green-700 p-2 rounded-full shadow-sm" title="Police Verified">
                                                        <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-slate-600 text-sm line-clamp-2 mt-4">
                                                {worker.bio || 'This professional has not added a bio yet.'}
                                            </p>
                                        </div>

                                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1 text-yellow-500 font-semibold text-sm">
                                                <Star className="w-4 h-4 fill-current" />
                                                {worker.average_rating > 0 ? worker.average_rating.toFixed(1) : 'New'}
                                                <span className="text-slate-400 font-normal text-xs ml-1">({worker.total_jobs_completed} jobs)</span>
                                            </div>

                                            <div className="flex items-center text-primary font-medium text-sm group-hover:underline">
                                                View Profile <ChevronRight className="w-4 h-4 ml-1" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-1">No professionals found</h3>
                                <p className="text-slate-500">Try adjusting your search criteria or changing categories.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
