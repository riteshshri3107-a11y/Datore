import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
    title: 'SkillConnect - Peer-to-Peer Skills Marketplace',
    description: 'Find trusted, verified professionals for any job.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
                {/* Navigation Bar */}
                <nav className="fixed w-full z-50 glass">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold text-primary">SkillConnect</span>
                            </div>
                            <div className="hidden md:flex space-x-8 items-center">
                                <a href="#" className="text-slate-600 hover:text-primary transition-colors">Find a Service</a>
                                <a href="#" className="text-slate-600 hover:text-primary transition-colors">Become a Worker</a>
                                <button className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-secondary transition-colors shadow-md hover:shadow-lg">
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-grow pt-16">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-slate-900 text-slate-400 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p>&copy; 2026 SkillConnect. All rights reserved.</p>
                    </div>
                </footer>
            </body>
        </html>
    )
}
