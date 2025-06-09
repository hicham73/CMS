export interface CareerStep {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  subSteps: SubStep[];
}

export interface SubStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}
