/**
 * CLASS DOJO PLATFORM - AUTHENTICATION & SESSION GUARD
 * Included at the top of protected pages to control access.
 */

(function () {
    const CURRENT_PAGE = window.location.pathname.split('/').pop() || 'index.html';
    const SESSION_KEY = 'dojo_user_session';

    // Helper: Retrieve active session
    window.getDojoSession = function () {
        const data = localStorage.getItem(SESSION_KEY);
        try {
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    // Helper: Set session
    window.setDojoSession = function (userData) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            username: userData.username || 'Teacher',
            role: userData.role || 'teacher', // 'teacher' or 'student'
            studentId: userData.studentId || null,
            loginTime: new Date().toISOString()
        }));
    };

    // Helper: Logout
    window.logoutDojo = function () {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    };

    const session = getDojoSession();

    // Guard Logic
    if (!session && CURRENT_PAGE !== 'login.html') {
        // Redirect to login if unauthenticated
        window.location.href = 'login.html';
    } else if (session && CURRENT_PAGE === 'login.html') {
        // Redirect to dashboard if already logged in
        window.location.href = 'index.html';
    }
})();