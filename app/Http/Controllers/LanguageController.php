<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LanguageController extends Controller
{
    /**
     * Persist the user's language selection in the session.
     */
    public function switchLanguage($locale)
    {
        if (in_array($locale, ['en', 'es'])) {
            session()->put('locale', $locale);
        }

        return redirect()->back();
    }
}