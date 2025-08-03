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
                        // Save counselor info to localStorage
                        localStorage.setItem('counselorId', data.user.counselorID);
                        localStorage.setItem('counselorName', data.user.name);
                        localStorage.setItem('counselorCollege', data.user.assignedCollege);
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
                card.href = 'studentDetail.html?id=' + student.studentID;
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

document.addEventListener('DOMContentLoaded', function() {
    // Student Detail Page Logic
    if (window.location.pathname.endsWith('studentDetail.html')) {
        (async function() {
            // Get student ID from URL
            const params = new URLSearchParams(window.location.search);
            const studentId = params.get('id');
            if (!studentId) return;
            // Fetch student details from backend
            try {
                const res = await fetch(`http://localhost:3000/students/${studentId}`);
                if (!res.ok) throw new Error('Not found');
                const student = await res.json();
                document.getElementById('studentName').textContent = student.name || 'N/A';
                document.getElementById('studentProgram').textContent = student.program || 'N/A';
                document.getElementById('studentNumber').textContent = student.studentNo || 'N/A';
                document.getElementById('studentGender').textContent = student.gender || 'N/A';
                // Optionally update image if you have a field for it
            } catch (err) {
                document.getElementById('studentName').textContent = 'Student not found';
                document.getElementById('studentProgram').textContent = '';
                document.getElementById('studentNumber').textContent = '';
                document.getElementById('studentGender').textContent = '';
            }
            // Fetch and render sessions for this student
            try {
                const res = await fetch(`http://localhost:3000/students/${studentId}/sessions`);
                const sessions = await res.json();
                const sessionList = document.querySelector('.session-list');
                sessionList.innerHTML = '';
                if (!sessions.length) {
                    sessionList.innerHTML = '<p style="text-align:center;width:100%">No sessions found.</p>';
                    return;
                }
                sessions.forEach(session => {
                    const dateObj = new Date(session.sessionDate);
                    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                    const day = ('' + dateObj.getDate()).padStart(2, '0');
                    const statusClass = session.status === 'Resolved' ? 'resolved' : (session.status === 'Cancelled' ? 'cancelled' : '');
                    const card = document.createElement('div');
                    card.className = 'session-card';
                    card.innerHTML = `
                        <div class="session-date">
                            <span class="month">${month}</span>
                            <span class="day">${day}</span>
                        </div>
                        <div class="session-details">
                            <!--<h3>Session</h3>-->
                            <h3>Session ${session.sessionID}</h3>
                            <p>${session.campus || ''}</p>
                            <p class="session-status ${statusClass}">${session.status || ''}</p>
                        </div>
                        <div class="session-link">
                            <a href="sessionDetail.html?id=${session.sessionID}&studentId=${studentId}"><i class="fas fa-external-link-alt"></i></a>
                        </div>
                    `;
                    sessionList.appendChild(card);
                });
            } catch (err) {
                const sessionList = document.querySelector('.session-list');
                sessionList.innerHTML = '<p style="color:red;text-align:center;width:100%">Failed to load sessions.</p>';
            }
        })();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Session Detail Page Logic
    if (window.location.pathname.endsWith('sessionDetail.html')) {
        (async function() {
            // Get session ID and student ID from URL
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get('id');
            const studentId = params.get('studentId');
            
            if (!sessionId || !studentId) return;
            
            // Update navigation links to preserve student ID
            const backButton = document.getElementById('backButton');
            const externalLink = document.getElementById('externalLink');
            if (backButton) backButton.href = `studentDetail.html?id=${studentId}`;
            if (externalLink) externalLink.href = `studentDetail.html?id=${studentId}`;
            
            // Fetch and display student info
            try {
                const res = await fetch(`http://localhost:3000/students/${studentId}`);
                if (!res.ok) throw new Error('Student not found');
                const student = await res.json();
                document.getElementById('studentName').textContent = student.name || 'N/A';
                document.getElementById('studentProgram').textContent = student.program || 'N/A';
                document.getElementById('studentNumber').textContent = student.studentNo || 'N/A';
                document.getElementById('studentGender').textContent = student.gender || 'N/A';
            } catch (err) {
                document.getElementById('studentName').textContent = 'Student not found';
                document.getElementById('studentProgram').textContent = '';
                document.getElementById('studentNumber').textContent = '';
                document.getElementById('studentGender').textContent = '';
            }
            
            // Fetch and display session details
            try {
                const res = await fetch(`http://localhost:3000/students/sessions/${sessionId}`);
                if (!res.ok) throw new Error('Session not found');
                const session = await res.json();
                
                // Update session header
                const headerContent = document.querySelector('.header-content');
                if (headerContent) {
                    const title = headerContent.querySelector('h2');
                    const campus = headerContent.querySelector('p:nth-child(2)');
                    const date = headerContent.querySelector('p:nth-child(3)');
                    
                    if (title) title.textContent = `Session ${session.sessionID}`;
                    if (campus) campus.textContent = session.campus || 'Campus';
                    if (date) {
                        const sessionDate = new Date(session.sessionDate);
                        const formattedDate = sessionDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        date.textContent = formattedDate;
                    }
                }
                
                // Update feedback and notes
                const feedbackContent = document.getElementById('feedbackContent');
                const notesContent = document.getElementById('notesContent');
                
                if (feedbackContent) {
                    feedbackContent.textContent = session.feedbackComments || 'No feedback available';
                }
                if (notesContent) {
                    notesContent.textContent = session.sessionNotes || '';
                }
                
                // Add auto-save functionality for notes
                if (notesContent) {
                    let saveTimeout;
                    notesContent.addEventListener('input', function() {
                        clearTimeout(saveTimeout);
                        saveTimeout = setTimeout(async function() {
                            try {
                                const res = await fetch(`http://localhost:3000/students/sessions/${sessionId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ sessionNotes: notesContent.textContent })
                                });
                                if (!res.ok) throw new Error('Failed to save notes');
                                console.log('Notes saved successfully');
                            } catch (err) {
                                console.error('Failed to save notes:', err);
                            }
                        }, 1000); // Save after 1 second of no typing
                    });
                }
            } catch (err) {
                console.error('Failed to load session details:', err);
            }
        })();
    }
});

// Dashboard Logic
document.addEventListener('DOMContentLoaded', function() {
    // Dashboard Page Logic
    if (window.location.pathname.endsWith('dashboard.html')) {
        (async function() {
            const counselorId = localStorage.getItem('counselorId');
            const counselorName = localStorage.getItem('counselorName');
            const counselorCollege = localStorage.getItem('counselorCollege');
            
            if (!counselorId) {
                // Redirect to login if not logged in
                window.location.href = 'loginPage.html';
                return;
            }
            
            // Update counselor profile
            try {
                const res = await fetch(`http://localhost:3000/students/dashboard/counselor/${counselorId}`);
                if (res.ok) {
                    const counselor = await res.json();
                    document.querySelector('.counselor-profile h3').textContent = counselor.name;
                    if (counselor.counselorImage) {
                        document.querySelector('.counselor-profile img').src = counselor.counselorImage;
                    }
                }
            } catch (err) {
                console.error('Failed to load counselor profile:', err);
            }
            
            // Load monthly sessions
            try {
                const res = await fetch(`http://localhost:3000/students/dashboard/monthly-sessions/${counselorCollege}`);
                const sessions = await res.json();
                
                const sessionsList = document.querySelector('.sessions-list');
                sessionsList.innerHTML = '';
                
                if (sessions.length === 0) {
                    sessionsList.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px; color: #666;">
                            <i class="fas fa-calendar-times" style="font-size: 48px; margin-bottom: 15px; color: #ccc;"></i>
                            <h3 style="margin: 0 0 10px 0; color: #333;">No Upcoming Sessions</h3>
                            <p style="margin: 0; font-size: 14px;">There are no scheduled sessions for this month.</p>
                        </div>
                    `;
                    // Set stats-card to zero if no sessions
                    const statsCard = document.querySelector('.stats-card h2');
                    const statsDescription = document.querySelector('.stats-card p');
                    if (statsCard) statsCard.textContent = '0';
                    if (statsDescription) statsDescription.textContent = 'No patients registered this month';
                    return;
                }
                
                sessions.forEach(session => {
                    const dateObj = new Date(session.sessionDate);
                    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                    const day = ('' + dateObj.getDate()).padStart(2, '0');
                    const time = session.sessionTime || session.appointmentTime || '';
                    
                    const sessionItem = document.createElement('div');
                    sessionItem.className = 'session-item';
                    sessionItem.innerHTML = `
                        <div class="session-time">
                            <span class="date">${month} ${day}</span>
                            <span class="time">${time}</span>
                        </div>
                        <div class="session-info">
                            <img src="user-stud.png" alt="Student">
                            <div class="student-details">
                                <h3>${session.studentName}</h3>
                                <p>Assigned Counselor: ${session.counselorName}</p>
                                <p>${session.program}</p>
                            </div>
                        </div>
                    `;
                    sessionsList.appendChild(sessionItem);
                });
            } catch (err) {
                console.error('Failed to load monthly sessions:', err);
            }
            
            // Load dashboard stats NA-DOBLE
            try {
                const res = await fetch(`http://localhost:3000/students/dashboard/stats/${counselorCollege}`);
                const stats = await res.json();
                
                const statsCard = document.querySelector('.stats-card h2');
                const statsDescription = document.querySelector('.stats-card p');
                if (statsCard) {
                    const totalPatients = stats.totalPatients || 0;
                    statsCard.textContent = totalPatients;
                    
                    // Update description based on whether there are patients
                    if (statsDescription) {
                        if (totalPatients === 0) {
                            statsDescription.textContent = 'No patients registered this month';
                        } else {
                            statsDescription.textContent = 'Total patients for this month';
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load dashboard stats:', err);
            }
        })();
    }
});