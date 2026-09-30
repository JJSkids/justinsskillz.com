/**
 * Classroom Dojo Central Auth & Guard System
 * Path: /classrooms/guard.js
 */
const DojoAuth = {
  KEY: 'dojo_session',
  SESSION_MAX_AGE_MS: 24 * 60 * 60 * 1000, // Session auto-expires in 24 hours

  /**
   * Retrieve active session from localStorage with expiration verification
   */
  getSession() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;

      const session = JSON.parse(raw);
      const isExpired = (Date.now() - session.authenticatedAt) > this.SESSION_MAX_AGE_MS;

      if (isExpired) {
        this.clearSession();
        return null;
      }
      return session;
    } catch (e) {
      this.clearSession();
      return null;
    }
  },

  /**
   * Store new authenticated session timestamp
   */
  setSession(data) {
    const session = {
      role: data.role,             // 'student' or 'teacher'
      classId: data.classId,       // e.g. 'CLASS101'
      studentId: data.studentId || null,
      email: data.email,
      authenticatedAt: Date.now()
    };
    localStorage.setItem(this.KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Wipe session & return to login
   */
  clearSession() {
    localStorage.removeItem(this.KEY);
  },

  logout() {
    this.clearSession();
    window.location.href = '/classrooms/login.html';
  },

  /**
   * Primary Security Guard logic to run at top of protected pages.
   * Redirects unauthorized visits or URL tampering attempts immediately.
   */
  protect(options = {}) {
    const session = this.getSession();
    const urlParams = new URLSearchParams(window.location.search);
    const targetClassId = urlParams.get('classId');
    const targetStudentId = urlParams.get('studentId');

    // 1. Unauthenticated direct access attempt -> Redirect to Login
    if (!session) {
      let loginUrl = '/classrooms/login.html';
      if (targetClassId) loginUrl += `?classId=${encodeURIComponent(targetClassId)}`;
      if (targetStudentId) loginUrl += `${targetClassId ? '&' : '?'}studentId=${encodeURIComponent(targetStudentId)}`;
      window.location.href = loginUrl;
      return null;
    }

    // 2. Class ID mismatch (e.g. user logged into CLASS101 but URL says CLASS999)
    if (targetClassId && session.classId !== targetClassId) {
      window.location.href = `/classrooms/login.html?classId=${encodeURIComponent(targetClassId)}`;
      return null;
    }

    // 3. Student Profile Tampering Check (Student attempting to view another student's ID)
    if (session.role === 'student' && targetStudentId && session.studentId !== targetStudentId) {
      window.location.href = '/404.html';
      return null;
    }

    // 4. Role Guard (if page requires teacher-only or student-only access)
    if (options.requiredRole && session.role !== options.requiredRole) {
      window.location.href = '/404.html';
      return null;
    }

    return session;
  }
};