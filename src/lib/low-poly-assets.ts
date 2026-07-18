export const LOW_POLY_ASSETS = {
  background: {
    login: '/low-poly/login-forest.webp',
    student: '/low-poly/student-trail.webp',
    teacher: '/low-poly/teacher-observatory.webp',
  },
  icon: {
    book: '/low-poly/book-gem.webp',
    question: '/low-poly/question-gem.webp',
    profile: '/low-poly/profile-gem.webp',
  },
} as const;

export type LowPolyIconName = keyof typeof LOW_POLY_ASSETS.icon;
