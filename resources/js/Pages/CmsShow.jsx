import { Head, Link } from '@inertiajs/react';

export default function CmsShow({ page }) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden py-16 flex flex-col justify-between">
            <Head title={page.title} />

            {/* Background glowing effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                
                {/* Header Logo */}
                <div className="flex items-center gap-2 mb-12 justify-center">
                    <svg className="h-8 w-auto fill-current text-emerald-500" viewBox="0 0 24 24">
                        <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </svg>
                    <span className="font-extrabold tracking-wider text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
                        METASTAKE
                    </span>
                </div>

                {/* CMS Render Box */}
                <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm space-y-6">
                    <h1 className="text-3xl font-black text-white border-b border-slate-800 pb-4">
                        {page.title}
                    </h1>

                    {/* Safely inject the raw, Admin-edited HTML content */}
                    <div 
                        className="text-slate-300 space-y-4 leading-relaxed text-sm prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm font-semibold text-emerald-500 hover:underline">
                        &larr; Back to Landing Page
                    </Link>
                </div>

            </div>

            <footer className="relative z-10 text-center text-xs text-slate-600 mt-12">
                &copy; {new Date().getFullYear()} Metastake. Dynamic CMS Node. All rights reserved.
            </footer>
        </div>
    );
}