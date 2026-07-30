import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Guest({ children }) {
    const props = usePage().props;
    const appName = props.appName || 'MetaStake';
    const appLogo = props.appLogo || null;
    const [logoError, setLogoError] = useState(false);

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-950 text-slate-100 relative overflow-hidden select-none">
            {/* Ambient Glowing Background Radial Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-950/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Dynamic Branding Logo */}
            <div className="relative z-10 mb-6">
                <Link href="/">
                    {appLogo && !logoError ? (
                        <img 
                            src={`/storage/${appLogo}`} 
                            alt={appName} 
                            onError={() => setLogoError(true)}
                            className="max-h-16 w-auto object-contain" 
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <svg className="h-10 w-auto fill-current text-emerald-500" viewBox="0 0 24 24">
                                <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                            </svg>
                            <span className="font-extrabold tracking-wider text-2xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
                                {appName}
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Glassmorphic Container Card */}
            <div className="w-full sm:max-w-md mt-4 px-8 py-8 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl overflow-hidden sm:rounded-2xl relative z-10">
                {children}
            </div>
        </div>
    );
}