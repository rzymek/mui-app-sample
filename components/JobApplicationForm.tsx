import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Button,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  IconButton,
  Chip,
  OutlinedInput,
  Box,
  Alert,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { jobApplicationSchema, JobApplicationFormData } from '../types';
import { submitJobApplication } from '../services/api';

const AVAILABLE_SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes'];
const POSITIONS = ['Frontend', 'Backend', 'Fullstack', 'DevOps'];

export const JobApplicationForm: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      fullName: '',
      position: 'Frontend',
      skills: [],
      remote: false,
      preferredLocation: '',
      experience: [{ company: '', role: '', startDate: '', current: false }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  const isRemote = watch('remote');

  const onSubmit = async (data: JobApplicationFormData) => {
    try {
      await submitJobApplication(data);
      setSubmitStatus('success');
      reset();
    } catch (e) {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Paper elevation={3} className="p-6 md:p-8">
        <Typography variant="h5" component="h2" className="mb-6 text-gray-800">
          Job Application
        </Typography>

        {submitStatus === 'success' && (
          <Alert severity="success" className="mb-6" onClose={() => setSubmitStatus('idle')}>
            Application submitted successfully!
          </Alert>
        )}
         {submitStatus === 'error' && (
          <Alert severity="error" className="mb-6" onClose={() => setSubmitStatus('idle')}>
            Something went wrong. Please try again.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                />
              )}
            />

            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.position}>
                  <InputLabel>Position Applied For</InputLabel>
                  <Select {...field} label="Position Applied For">
                    {POSITIONS.map((pos) => (
                      <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.position?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </div>

          {/* Skills Multi-Select */}
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.skills}>
                <InputLabel>Skills</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Skills" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {AVAILABLE_SKILLS.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.skills?.message}</FormHelperText>
              </FormControl>
            )}
          />

          {/* Remote & Location Logic */}
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Controller
                name="remote"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="I am applying for a remote position"
                  />
                )}
              />
            </div>

            {!isRemote && (
              <Controller
                name="preferredLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Preferred Office Location"
                    fullWidth
                    error={!!errors.preferredLocation}
                    helperText={errors.preferredLocation?.message}
                    placeholder="e.g., New York, London"
                  />
                )}
              />
            )}
          </div>

          {/* Dynamic Experience Array */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Work Experience</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={() => append({ company: '', role: '', startDate: '', current: false })}
                variant="outlined"
                size="small"
              >
                Add Job
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((item, index) => (
                <Paper key={item.id} variant="outlined" className="p-4 bg-slate-50 relative">
                  <div className="absolute top-2 right-2">
                    <IconButton onClick={() => remove(index)} color="error" size="small" aria-label="delete experience">
                      <DeleteIcon />
                    </IconButton>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <Controller
                      name={`experience.${index}.company`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company"
                          size="small"
                          fullWidth
                          error={!!errors.experience?.[index]?.company}
                          helperText={errors.experience?.[index]?.company?.message}
                        />
                      )}
                    />
                    <Controller
                      name={`experience.${index}.role`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Role"
                          size="small"
                          fullWidth
                          error={!!errors.experience?.[index]?.role}
                          helperText={errors.experience?.[index]?.role?.message}
                        />
                      )}
                    />
                    <Controller
                      name={`experience.${index}.startDate`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="Start Date"
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          fullWidth
                          error={!!errors.experience?.[index]?.startDate}
                          helperText={errors.experience?.[index]?.startDate?.message}
                        />
                      )}
                    />
                     <Controller
                      name={`experience.${index}.endDate`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="End Date"
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          fullWidth
                          disabled={watch(`experience.${index}.current`)}
                        />
                      )}
                    />
                     <Controller
                      name={`experience.${index}.current`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} size="small"/>}
                          label="I currently work here"
                        />
                      )}
                    />
                  </div>
                </Paper>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};