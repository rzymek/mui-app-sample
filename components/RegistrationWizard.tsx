import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { registrationSchema, RegistrationFormData } from '../types';
import { submitRegistration } from '../services/api';

const steps = ['Account Details', 'Personal Info', 'Preferences'];

export const RegistrationWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const {
    control,
    trigger,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      notifications: false,
      newsletter: true,
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];
    
    if (activeStep === 0) {
      fieldsToValidate = ['email', 'password', 'confirmPassword'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'address', 'city'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitRegistration(data);
      setSuccessId(result.id);
      setActiveStep(steps.length); // Move to completed state
    } catch (error) {
      setSubmitError("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeStep === steps.length) {
    return (
      <Paper className="p-8 max-w-2xl mx-auto mt-8 text-center" elevation={3}>
        <Typography variant="h4" className="text-green-600 mb-4">
          Registration Complete!
        </Typography>
        <Typography variant="body1">
          Thank you for signing up. Your reference ID is <strong>{successId}</strong>.
        </Typography>
        <Button 
          variant="contained" 
          className="mt-6" 
          onClick={() => window.location.reload()}
        >
          Start Over
        </Button>
      </Paper>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Stepper activeStep={activeStep} className="mb-8">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} className="p-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {submitError && <Alert severity="error" className="mb-4">{submitError}</Alert>}

          {activeStep === 0 && (
            <div className="flex flex-col gap-4">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Confirm Password"
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              />
            </div>
          )}

          {activeStep === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </div>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address (Optional)"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City (Optional)"
                    fullWidth
                  />
                )}
              />
            </div>
          )}

          {activeStep === 2 && (
            <div className="flex flex-col gap-4">
               <Typography variant="h6" className="mb-2">
                Preferences
              </Typography>
              <Controller
                name="newsletter"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Subscribe to our newsletter"
                  />
                )}
              />
              <Controller
                name="notifications"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Enable push notifications"
                  />
                )}
              />
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <Typography variant="subtitle2" className="text-gray-600">Summary</Typography>
                <Typography variant="body2">Email: {control._formValues.email}</Typography>
                <Typography variant="body2">Name: {control._formValues.firstName} {control._formValues.lastName}</Typography>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </div>
        </form>
      </Paper>
    </div>
  );
};