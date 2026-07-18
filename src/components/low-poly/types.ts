export type LowPolyVariant = 'login' | 'student' | 'teacher';
export type SceneMode = 'static' | 'css' | 'webgl';

export type ScenePolicyInput = {
  reducedMotion: boolean;
  webGLAvailable: boolean;
  viewportWidth: number;
  documentVisible: boolean;
};

export type LowPolyBackdropProps = {
  variant: LowPolyVariant;
  scene?: boolean;
  children: React.ReactNode;
  className?: string;
};
