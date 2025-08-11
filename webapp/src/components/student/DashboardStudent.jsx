import React from "react";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const StudentDashboard = () => {
  // Mock Data
  const progressData = [
    { name: "Jan", Completed: 4 },
    { name: "Feb", Completed: 7 },
    { name: "Mar", Completed: 10 },
    { name: "Apr", Completed: 8 },
    { name: "May", Completed: 11 },
  ];

  const comparisonData = [
    { name: "You", value: 90 },
    { name: "Others", value: 75 },
  ];

  const courseCompletion = 80; // Example progress percentage
  const topPercentage = 2; // User is in the top 2%
  const userScore = 92; // Example user score
  const percentileAchieved = 98; // Comparative percentile

  const colors = ["#8884d8", "#82ca9d"];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Motivational Insights */}
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 4 }}>
        <Typography variant="h6" color="primary">
          You&apos;re doing great!
        </Typography>
        <Typography>
          You&apos;ve completed {courseCompletion}% of your courses! Keep up the
          momentum to reach your goals.
        </Typography>
        <Typography color="text.secondary">
          You are among the top {topPercentage}% of users with a score of {userScore}.
        </Typography>
        <Typography>
          {percentileAchieved}% of users have achieved marks similar or less than you!
        </Typography>
      </Paper>

      {/* Dashboard Metrics */}
      <Grid container spacing={4}>
        {/* Bar Chart: Monthly Progress */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Progress
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Completed" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart: Comparison */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              How You Compare to Others
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={comparisonData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Circular Progress: Course Completion */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Course Completion
            </Typography>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress variant="determinate" value={courseCompletion} size={150} />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6">{courseCompletion}%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
