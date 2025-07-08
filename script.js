document.addEventListener('DOMContentLoaded', function() {
    // LOGIN LOGIC
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const otpGroup = document.getElementById('otpGroup');
    const otpInput = document.getElementById('otpInput');
    const loginMessage = document.getElementById('loginMessage');
    let loginEmail = document.getElementById('loginEmail');
    let loginPassword = document.getElementById('loginPassword');
    let currentEmail = '';

    if (loginForm) {
        // Hide OTP UI initially if present
        if (otpGroup) otpGroup.style.display = 'none';
        if (verifyOtpBtn) verifyOtpBtn.style.display = 'none';

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (loginMessage) loginMessage.textContent = '';
            if (loginBtn) loginBtn.disabled = true;
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            currentEmail = email;
            // Login request
            try {
                const res = await fetch('http://localhost:3000/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    if (data.user && (data.user.is_verified === 1 || data.user.is_verified === '1')) {
                        window.location.href = 'dashboard.html';
                    } else if (data.user && (data.user.is_verified === 0 || data.user.is_verified === '0')) {
                        // Not verified, show OTP UI and request OTP ONCE
                        if (otpGroup) otpGroup.style.display = '';
                        if (verifyOtpBtn) verifyOtpBtn.style.display = '';
                        if (loginBtn) loginBtn.style.display = 'none';
                        if (loginPassword) loginPassword.disabled = true;
                        if (loginEmail) loginEmail.disabled = true;
                        // Request OTP only once after login
                        if (!window.otpRequested) {
                            await fetch('http://localhost:3000/auth/request-otp', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                            });
                            window.otpRequested = true;
                        }
                        if (loginMessage) {
                            loginMessage.style.color = '#6a040f';
                            loginMessage.textContent = 'OTP sent to your email. Please enter it below.';
                        }
                    } else {
                        if (loginMessage) {
                            loginMessage.style.color = '#b00';
                            loginMessage.textContent = 'Unexpected login response.';
                        }
                    }
                } else {
                    if (loginMessage) {
                        loginMessage.style.color = '#b00';
                        loginMessage.textContent = data.error || 'Login failed.';
                    }
                }
            } catch (err) {
                if (loginMessage) {
                    loginMessage.style.color = '#b00';
                    loginMessage.textContent = 'Network error.';
                }
            }
            if (loginBtn) loginBtn.disabled = false;
        });
    }

    // Always attach OTP verification handler if button exists
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', async function() {
            if (loginMessage) loginMessage.textContent = '';
            verifyOtpBtn.disabled = true;
            const otp = otpInput.value.trim();
            if (!otp) {
                if (loginMessage) loginMessage.textContent = 'Please enter the OTP.';
                verifyOtpBtn.disabled = false;
                return;
            }
            try {
                const res = await fetch('http://localhost:3000/auth/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentEmail, otp })
                });
                const data = await res.json();
                if (res.ok) {
                    if (otpInput) otpInput.disabled = true;
                    verifyOtpBtn.disabled = true;
                    if (loginMessage) {
                        loginMessage.style.color = '#2e7d32';
                        loginMessage.textContent = 'OTP verified! Redirecting...';
                    }
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    if (loginMessage) {
                        loginMessage.style.color = '#b00';
                        loginMessage.textContent = data.error || 'OTP verification failed.';
                    }
                    verifyOtpBtn.disabled = false;
                }
            } catch (err) {
                if (loginMessage) {
                    loginMessage.style.color = '#b00';
                    loginMessage.textContent = 'Network error.';
                }
                verifyOtpBtn.disabled = false;
            }
        });
    }

    // SIGNUP LOGIC
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const signupMessage = document.getElementById('signupMessage');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (signupMessage) signupMessage.textContent = '';
            if (signupBtn) signupBtn.disabled = true;
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            // Frontend validation
            if (!name || !email || !password || !confirmPassword) {
                if (signupMessage) signupMessage.textContent = 'All fields are required.';
                if (signupBtn) signupBtn.disabled = false;
                return;
            }
            if (password.length < 6) {
                if (signupMessage) signupMessage.textContent = 'Password must be at least 6 characters long.';
                if (signupBtn) signupBtn.disabled = false;
                return;
            }
            if (password !== confirmPassword) {
                if (signupMessage) signupMessage.textContent = 'Passwords do not match.';
                if (signupBtn) signupBtn.disabled = false;
                return;
            }
            // Send to backend
            try {
                const res = await fetch('http://localhost:3000/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    if (signupMessage) {
                        signupMessage.style.color = '#2e7d32';
                        signupMessage.textContent = 'Registration successful! Redirecting to login...';
                    }
                    setTimeout(() => {
                        window.location.href = 'loginPage.html';
                    }, 1500);
                } else {
                    if (signupMessage) {
                        signupMessage.style.color = '#b00';
                        signupMessage.textContent = data.error || 'Registration failed.';
                    }
                }
            } catch (err) {
                if (signupMessage) {
                    signupMessage.style.color = '#b00';
                    signupMessage.textContent = 'Network error.';
                }
            }
            if (signupBtn) signupBtn.disabled = false;
        });
    }
});
