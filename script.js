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


// Student Profiles Search and Display Logic

document.addEventListener('DOMContentLoaded', function() {
    // Only run this code on studentProfiles.html
    if (!document.querySelector('.students-grid')) return;

    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-box input');
    const genderSelect = document.querySelector('.filters select:nth-child(1)');
    const collegeSelect = document.querySelector('.filters select:nth-child(2)');
    const studentsGrid = document.querySelector('.students-grid');

    async function fetchStudents() {
        const gender = genderSelect.value;
        const college = collegeSelect.value;
        const search = searchInput.value.trim();
        let url = `http://localhost:3000/students?`;
        if (gender) url += `gender=${encodeURIComponent(gender)}&`;
        if (college) url += `college=${encodeURIComponent(college)}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;

        try {
            const res = await fetch(url);
            const students = await res.json();
            studentsGrid.innerHTML = '';
            if (students.length === 0) {
                studentsGrid.innerHTML = '<p style="text-align:center;width:100%">No students found.</p>';
                return;
            }
            students.forEach(student => {
                const card = document.createElement('a');
                card.className = 'student-card';
                card.href = 'studentDetail.html?id=' + student.id;
                card.innerHTML = `
                    <img src="user-stud.png" alt="Student">
                    <h3>${student.name}</h3>
                    <p>${student.program || ''}</p>
                `;
                studentsGrid.appendChild(card);
            });
        } catch (err) {
            studentsGrid.innerHTML = '<p style="color:red;text-align:center;width:100%">Failed to load students.</p>';
        }
    }

    searchBtn.addEventListener('click', fetchStudents);
    genderSelect.addEventListener('change', fetchStudents);
    collegeSelect.addEventListener('change', fetchStudents);
    // Optionally, fetch on Enter in search
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            // Reset dropdowns to default
            genderSelect.selectedIndex = 0;
            collegeSelect.selectedIndex = 0;
            // Fetch students using only the search bar value
            fetchStudents();
        }
    });
    // Initial load
    fetchStudents();
});