import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  useMediaQuery,
  Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Testimonials from "./Testimonials";
import ExamPackages from "./Packages/ExamPackages";
import imageUrl from "../../../srcimages/welcomepageimage.jpg";
import { useAuth } from "../../common/Auth/AuthContext";
import logger from "../../../util/logger";

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { user } = useAuth();
  const [badgeContent, setBadgeContent] = useState(0);

  const handleLogin = () => {
    navigate("/login");
  };

  const updateBadgeContent = (count) => {
    setBadgeContent((prev) => Math.max(0, prev + count));
    logger.log(badgeContent);
  };

  const testimonialsData = [
    {
      id: 1,
      quote:
        "The mock exams provided by ExamsAreFun were a game-changer for my preparation. The realistic format and diverse question bank perfectly simulated the actual exam, boosting my confidence and performance. Highly recommended!",
      author: "Yash, Class 12, Pune",
    },
    {
      id: 2,
      quote:
        "I can not thank ExamsAreFun enough for their comprehensive mock exams. The detailed feedback and analysis helped me identify my weak areas and work on them effectively. A must-have tool for any student aiming for success!",
      author: "Saarthak, Class 7, Pune, India",
    },
    {
      id: 3,
      quote:
        "I highly recommend ExamsAreFun to all students gearing up for exams. The mock exams offered were spot-on in mirroring the actual test, and the detailed explanations helps understanding concepts better. It made exam preparation seamless and effective!",
      author: "Navin, IITM, Chicago, USA",
    },
  ];

  const renderCardContent = () => (
    <Box>
      {/* Welcome Section */}
      <Container maxWidth="lg" sx={{ marginY: 4 }}>
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row" }}>
            <Box flex="1" padding={isSmallScreen ? 2 : 4}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Welcome to Exams Are Fun - Your Ultimate Exam Companion!
              </Typography>
              <Typography variant="body1" gutterBottom>
                Whether you&apos;re a beginner or an experienced student, &lsquo;Exams Are Fun&lsquo; offers a comprehensive
                range of mock exams and tools tailored to help you excel. We specialize in providing realistic
                exam simulations, detailed feedback, and insights to boost your confidence and performance.
              </Typography>
              {!user && (
                  <>
                  <Button variant="contained" color="primary" onClick={handleLogin} sx={{ marginTop: 2 }}>
                    Explore Now
                  </Button>
                  <Typography variant="caption" color="textSecondary">
                    (Sign in required)
                  </Typography>
                  </>
              )}
            </Box>
            <CardMedia
              component="img"
              height="300"
              image={imageUrl}
              alt="Welcome Image"
              sx={{ flex: "1", maxWidth: isSmallScreen ? "100%" : "50%", objectFit: "cover" }}
            />
          </CardContent>
        </Card>
      </Container>

      {user && (
        <Container maxWidth="lg" sx={{ marginY: 4 }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            fontWeight="bold"
            sx={{ marginBottom: 2 }}
          >
            Here are our top packages for you!
          </Typography>
          <ExamPackages updateBadgeContent={updateBadgeContent} />
        </Container>
      )}

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ marginY: 4 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              title: "Comprehensive Mock Exams",
              description: "Realistic exams designed to mirror actual test conditions.",
            },
            {
              title: "Detailed Feedback",
              description: "Analyze your performance and focus on improvement areas.",
            },
            {
              title: "User-Friendly Platform",
              description: "Easy-to-use platform designed for stress-free learning.",
            },
            {
              title: "Engaging Experience",
              description: "Make exam preparation enjoyable and effective.",
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>


      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ marginY: 4 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          What Our Users Say
        </Typography>
        <Testimonials testimonials={testimonialsData} />
      </Container>

      {/* Footer Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "#fff",
          padding: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {user
            ? "Welcome back! Explore new courses and ace your exams with ease."
            : "Ready to Begin Your Success Journey? Sign Up Now and Take the First Step!"}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate(user ? "/searchpack" : "/login")}
          sx={{ marginTop: 2 }}
        >
          {user ? "Search Packages" : "Sign Up Now"}
        </Button>
      </Box>

    </Box>
  );

  return (
    <Box>
      <Box>
        {/* Card section */}
        <Card sx={{ maxWidth: 1380, margin: "auto", marginTop: 0 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
              }}
            >
              {!isSmallScreen && renderCardContent()}
              {isSmallScreen && renderCardContent()}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Home;
