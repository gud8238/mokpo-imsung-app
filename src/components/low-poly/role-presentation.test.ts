import { describe, expect, it } from 'vitest';
import { ROLE_PRESENTATION } from './role-presentation';

describe('ROLE_PRESENTATION', () => {
  it('keeps student and teacher navigation distinct', () => {
    expect(ROLE_PRESENTATION.student.title).toBe('BOOK돋움 질문도감');
    expect(ROLE_PRESENTATION.teacher.title).toBe('BOOK돋움 교사 관찰소');
    expect(ROLE_PRESENTATION.student.variant).toBe('student');
    expect(ROLE_PRESENTATION.teacher.variant).toBe('teacher');
  });
});
