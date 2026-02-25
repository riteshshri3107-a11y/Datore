import Image from 'next/image';

export default function Home() {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 py-32 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 left-0 translate-y-24 -translate-x-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2000ms' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
                        Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">Trusted Experts</span><br /> for Any Job
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                        The safe, reliable marketplace connecting you with police-verified professionals at affordable rates.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="/search" className="bg-primary hover:bg-secondary text-white text-lg font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 block max-w-xs mx-auto sm:mx-0">
                            Hire a Professional
                        </a>
                        <a href="/login" className="bg-white hover:bg-slate-50 text-primary border-2 border-primary/20 text-lg font-semibold px-8 py-4 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-1 block max-w-xs mx-auto sm:mx-0">
                            Post Your Skills
                        </a>
                    </div>
                </div>
            </section>

            {/* Trust & Safety Section */}
            <section className="w-full py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">Built on Trust and Safety</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: 'Police Verified', desc: 'Every worker with a green badge has passed a rigorous background and police clearance check.' },
                            { title: 'Secure Payments', desc: 'Payments are held in escrow until the job is completed to your satisfaction.' },
                            { title: 'QR Safety System', desc: 'Scan your worker\'s QR code in person to instantly verify their identity and safety rating.' }
                        ].map((feature, i) => (
                            <div key={i} className="glass p-8 rounded-2xl flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-6 text-2xl font-bold border-4 border-white shadow-sm">
                                    {i + 1}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories CTA */}
            <section className="w-full bg-slate-900 text-white py-24 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
                    <p className="text-lg text-slate-300 mb-8">Join thousands of users on the Detore platform today.</p>
                    <a href="/login" className="inline-block bg-accent hover:bg-yellow-400 text-slate-900 font-bold px-8 py-4 rounded-full transition-colors text-lg">
                        Become a Verified Professional
                    </a>
                </div>
            </section>
        </div>
    );
}
