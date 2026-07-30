<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();
        $translationFile = base_path("lang/{$locale}.json");
        $translations = [];

        if (file_exists($translationFile)) {
            $translations = json_decode(file_get_contents($translationFile), true) ?: [];
        }

        // Fetch dynamic site configurations safely (failsafe fallback if DB is not ready during migrations)
        $appName = 'Metastake';
        $appLogo = null;
        try {
            if (Schema::hasTable('settings')) {
                $appName = Setting::where('key', 'app_name')->value('value') ?: 'Metastake';
                $appLogo = Setting::where('key', 'app_logo')->value('value');
            }
        } catch (\Exception $e) {
            // Fail silently
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'locale' => $locale,
            'translations' => $translations,
            
            // Globally shared branding settings
            'appName' => $appName,
            'appLogo' => $appLogo,
        ];
    }
}