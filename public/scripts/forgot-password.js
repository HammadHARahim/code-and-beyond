// Forgot Password Handler
import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    let isSubmitting = false;

    // Auto-focus on email input
    emailInput.focus();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting) return;

        const email = emailInput.value.trim();

        // Validate email
        if (!email || !isValidEmail(email)) {
            showError('Please enter a valid email address');
            emailInput.focus();
            return;
        }

        // Disable button and show loading
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        hideMessages();

        try {
            // Get the current origin for redirect URL
            const redirectUrl = `${window.location.origin}/pages/reset-password.html`;

            // Request password reset email
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl
            });

            if (error) {
                showError(error.message);
                emailInput.focus();
            } else {
                // Always show success message (security: don't reveal if email exists)
                showSuccess();
                emailInput.value = '';
            }
        } catch (error) {
            showError('An unexpected error occurred. Please try again later.');
            emailInput.focus();
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showSuccess() {
        successMessage.classList.add('show');
        errorMessage.classList.remove('show');
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
    }

    function hideMessages() {
        successMessage.classList.remove('show');
        errorMessage.classList.remove('show');
    }
});
