// src/math-tracker.js

async function markLessonComplete(lessonNum) {
  lessonNum = parseInt(lessonNum, 10);

  // 1. Always update localStorage immediately (works 100% reliably for guests and offline)
  let completedList = [];
  try {
    completedList = JSON.parse(localStorage.getItem('completed_math_lessons') || '[]');
  } catch (e) {
    completedList = [];
  }

  if (!completedList.includes(lessonNum)) {
    completedList.push(lessonNum);
  }

  localStorage.setItem('completed_math_lessons', JSON.stringify(completedList));
  localStorage.setItem(`lesson_${lessonNum}_completed`, 'true');
  localStorage.setItem(`math_lesson_${lessonNum}`, 'completed');
  localStorage.setItem(`completed_lesson_${lessonNum}`, 'true');

  // 2. Only sync with Supabase if there is a verified logged-in user session (prevents 401 errors for guests)
  try {
    if (window.supabase && window.mySupabaseInstance) {
      const { data: { session } } = await window.mySupabaseInstance.auth.getSession();
      
      if (session && session.user) {
        const userId = session.user.email ? session.user.email.toLowerCase() : session.user.id;

        const { data: existing } = await window.mySupabaseInstance
          .from('user_math_stats')
          .select('completed_lessons')
          .eq('user_id', userId)
          .single();

        let dbLessons = existing?.completed_lessons || [];
        if (!dbLessons.includes(lessonNum)) {
          dbLessons.push(lessonNum);
        }

        await window.mySupabaseInstance
          .from('user_math_stats')
          .upsert({
            user_id: userId,
            completed_lessons: dbLessons,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    }
  } catch (err) {
    // Gracefully handle any network or auth issues in guest mode
    console.log("Running in guest mode; progress saved locally.");
  }
}