<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Session-based Locale Loader
        $locale = session()->get('locale', 'en');
        App::setLocale($locale);

        // 2. Global Referral Code Capture (Saves 'ref' parameter from any landing URL)
        if ($request->has('ref')) {
            session()->put('referred_by_code', $request->query('ref'));
        }

        return $next($request);
    }
}