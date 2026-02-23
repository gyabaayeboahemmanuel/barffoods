<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Display the contact page
     */
    public function index()
    {
        // Get contact information from system settings
        $contactInfo = SystemSetting::get('contact_info', [
            'email' => 'patriksolutions@gmail.com',
            'phone' => '(202) 590-1404',
            'address' => 'United States',
            'business_hours' => 'Monday - Friday: 9:00 AM - 6:00 PM'
        ]);

        return Inertia::render('contact', [
            'contactInfo' => $contactInfo,
        ]);
    }

    /**
     * Handle contact form submission
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        // TODO: Implement email sending or store in database
        // For now, just return success
        
        return redirect()->back()->with('success', 'Message sent successfully! We\'ll get back to you soon.');
    }
}
