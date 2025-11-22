import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography, AppBar, Toolbar, Container } from '@mui/material';
import { RegistrationWizard } from './components/RegistrationWizard';
import { JobApplicationForm } from './components/JobApplicationForm';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const App: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AppBar position="static" className="bg-indigo-600">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Enterprise Forms Portal
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" className="mt-8">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
          <Tabs value={value} onChange={handleChange} centered>
            <Tab icon={<PersonAddIcon />} label="Registration Wizard" />
            <Tab icon={<DescriptionIcon />} label="Job Application" />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <RegistrationWizard />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <JobApplicationForm />
        </TabPanel>
      </Container>
    </div>
  );
};

export default App;