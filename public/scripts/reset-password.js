// Reset Password Handler
import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Password toggle buttons
    const togglePassword = document.getElementById('toggle-password');
    const toggleConfirm = document.getElementById('toggle-confirm');

    // Password strength elements
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    // Requirements elements
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');

    let isSubmitting = false;

    // Check if we have a valid session/token
    checkSession();

    // Auto-focus on new password input
    newPasswordInput.focus();

    // Password toggle functionality
    togglePassword.addEventListener('click', () => {
        togglePasswordVisibility(newPasswordInput, togglePassword);
    });

    toggleConfirm.addEventListener('click', () => {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirm);
    });

    // Password strength checker
    newPasswordInput.addEventListener('input', () => {
        const password = newPasswordInput.value;
        if (password.length > 0) {
            checkPasswordStrength(password);
            validatePasswordRequirements(password);
        } else {
            // Reset strength indicator when empty
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Enter a password';
        }
    });

    // Allow Enter key to submit from confirm password field
    confirmPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting) return;

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validate passwords
        if (!validatePasswords(newPassword, confirmPassword)) {
            return;
        }

        // Disable button and show loading
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        hideMessages();

        try {
            // Update password using Supabase
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                showError(error.message);
                newPasswordInput.focus();
            } else {
                showSuccess();
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            showError('An unexpected error occurred. Please try again.');
            newPasswordInput.focus();
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    });

    async function checkSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                showError('Invalid or expired reset link. Please request a new password reset.');
                submitBtn.disabled = true;
                newPasswordInput.disabled = true;
                confirmPasswordInput.disabled = true;
            }
        } catch (error) {
            showError('Error validating reset link. Please try again.');
            submitBtn.disabled = true;
            newPasswordInput.disabled = true;
            confirmPasswordInput.disabled = true;
        }
    }

    function togglePasswordVisibility(input, button) {
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3.98 8.223A10.477 10.477 0 001.934 10.5c-.543 1.02.588 2.5 2.5 4.5M14.648 14.648A8.5 8.5 0 0010 16c-5 0-8.27-4.11-9-7 .363-1.445 1.515-3.474 3.98-5.223m4.02-1.277c.333-.028.666-.042 1-.042 5 0 8.27 4.11 9 7-.18.713-.677 1.731-1.5 2.77M3 3l14 14" stroke="currentColor" stroke-width="2"/>
                </svg>
            `;
        } else {
            input.type = 'password';
            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
            `;
        }
    }

    function checkPasswordStrength(password) {
        let strength = 0;

        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

        strengthFill.className = 'strength-fill';

        if (strength <= 2) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
        } else if (strength <= 4) {
            strengthFill.classList.add('medium');
            strengthText.textContent = 'Medium password';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong password';
        }
    }

    function validatePasswordRequirements(password) {
        // Length check
        if (password.length >= 8) {
            reqLength.classList.add('met');
        } else {
            reqLength.classList.remove('met');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            reqUppercase.classList.add('met');
        } else {
            reqUppercase.classList.remove('met');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            reqLowercase.classList.add('met');
        } else {
            reqLowercase.classList.remove('met');
        }

        // Number check
        if (/[0-9]/.test(password)) {
            reqNumber.classList.add('met');
        } else {
            reqNumber.classList.remove('met');
        }
    }

    function validatePasswords(newPassword, confirmPassword) {
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            showError('Passwords do not match');
            confirmPasswordInput.focus();
            return false;
        }

        // Check minimum length
        if (newPassword.length < 8) {
            showError('Password must be at least 8 characters long');
            newPasswordInput.focus();
            return false;
        }

        // Check for uppercase
        if (!/[A-Z]/.test(newPassword)) {
            showError('Password must contain at least one uppercase letter');
            newPasswordInput.focus();
            return false;
        }

        // Check for lowercase
        if (!/[a-z]/.test(newPassword)) {
            showError('Password must contain at least one lowercase letter');
            newPasswordInput.focus();
            return false;
        }

        // Check for number
        if (!/[0-9]/.test(newPassword)) {
            showError('Password must contain at least one number');
            newPasswordInput.focus();
            return false;
        }

        return true;
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
