// src/math-tracker.js

async function markLessonComplete(lessonNum) {
  lessonNum = parseInt(lessonNum, 10);

  // 1. Update localStorage immediately (supporting all common fallback keys)
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

  // 2. Sync globally with Supabase
  try {
    if (window.supabase && window.mySupabaseInstance) {
      let userId = sessionStorage.getItem('justin_guest_id');
      if (!userId) {
        userId = `Guest-${Math.floor(10000 + Math.random() * 90000)}`;
        sessionStorage.setItem('justin_guest_id', userId);
      }

      const { data: { session } } = await window.mySupabaseInstance.auth.getSession();
      if (session && session.user) {
        userId = session.user.email ? session.user.email.toLowerCase() : session.user.id;
      }

      if (userId) {
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
    console.error("Error syncing lesson completion to Supabase:", err);
  }
}