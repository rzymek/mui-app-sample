import { JobApplicationFormData, RegistrationFormData } from '../types';

export const submitRegistration = async (data: RegistrationFormData): Promise<{ success: boolean; id: string }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  if (data.email.includes('error')) {
    throw new Error('Simulated server error');
  }

  return { success: true, id: Math.random().toString(36).substring(7) };
};

export const submitJobApplication = async (data: JobApplicationFormData): Promise<{ success: boolean; ref: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log('Submitting job application:', data);
  return { success: true, ref: `JOB-${Date.now()}` };
};