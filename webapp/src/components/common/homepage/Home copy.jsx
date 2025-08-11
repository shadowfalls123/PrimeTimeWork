import React, { useState
//  , useEffect 
} from "react";
//import { Auth, Hub } from "aws-amplify";
//import { Hub } from '@aws-amplify/core';
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
// import ExamPaperTiles from "./ExamPaperTiles";
import ExamPackages from "./Packages/ExamPackages";
import imageUrl from "../../../srcimages/welcomepageimage.jpg";
//import ImageSlider from "../components/ImageSlider";
import { useAuth } from "../../common/Auth/AuthContext";
//import { checkIfUserLoggedIn } from "../../../util/userAuthUtils.js";

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  // const [user, setUser] = useState(null);
  const { user
//    , checkUser 
  } = useAuth();
  const [badgeContent, setBadgeContent] = useState(0);

  const handleLogin = () => {
    navigate("/login");
  };

  const updateBadgeContent = (count) => {
    setBadgeContent((prev) => Math.max(0, prev + count));
    console.log(badgeContent);
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

  //const welcomeText = "A broad selection of exams and mock exams are available to help you prepare for your exams. Whether you're a beginner or an experienced student, ExamsAreFun has everything you need to succeed."

//   const welcomeText1 = `
//   A broad selection of exams and mock exams are available to help you prepare for your exams. 
//   Whether you're a beginner or an experienced student, ExamsAreFun has everything you need to succeed.
// `;
//   const welcomeText2 = `Join the party and begin your success story today!`;

  // const renderCardContent = () => (
  //   <CardContent sx={{ flex: "1 0 50%" }}>
  //     <Typography
  //       variant="h5"
  //       align="left"
  //       gutterBottom
  //       sx={{ fontWeight: "bold" }}
  //     >
  //       Welcome to Exams Are Fun - Your Ultimate Exam Companion!
  //     </Typography>
  //     <Typography variant="body1" align="left" gutterBottom>
  //       {welcomeText1}
  //       <br />
  //       <br />
  //       {welcomeText2}
  //     </Typography>
  //   </CardContent>
  // );

  const renderCardContent = () => (
    <Box>
      {/* Welcome Section */}
      <Container maxWidth="lg" sx={{ marginY: 4 }}>
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row" }}>
            <Box flex="1" padding={isSmallScreen ? 2 : 4}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Welcome to Exams Are Fun - Your Ultimate Exam Companion!
              </Typography>
              <Typography variant="body1" gutterBottom>
                Whether you&apos;re a beginner or an experienced student, &lsquo;Exams Are Fun&lsquo; offers a comprehensive
                range of mock exams and tools tailored to help you excel. We specialize in providing realistic
                exam simulations, detailed feedback, and insights to boost your confidence and performance.
              </Typography>
              <Button variant="contained" color="primary" onClick={handleLogin} sx={{ marginTop: 2 }}>
                Explore Now
              </Button>
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
          Ready to Begin Your Success Journey?
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/login")}
          sx={{ marginTop: 2 }}
        >
          Sign Up Now
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
              {/* <CardMedia
                component="img"
                height="245"
                image={imageUrl}
                alt="Welcome Image"
                sx={{
                  width: isSmallScreen ? "100%" : 200,
                  flex: "1 0 auto",
                }}
              /> */}
              {isSmallScreen && renderCardContent()}
            </Box>
          </CardContent>
        </Card>
      </Box>
      {/* <ImageSlider /> */}

      <Box>
      {user ? (
      <>
      <Box> 
        <Box sx={{ marginLeft: "5%" }}>
          <Typography
            variant="h5"
            align="left"
            gutterBottom
            sx={{ mt: 2, padding: "2px", fontWeight: "bold" }}
          >
            Here are our top packages for you! 
          </Typography>
          <ExamPackages updateBadgeContent={updateBadgeContent} />
        </Box>
      </Box>
      </>
    ) : (
      <Box>
        {/* <Box sx={{ marginLeft: "5%" }}>
          <Typography
            variant="h6"
            align="left"
            gutterBottom
            sx={{ mt: 2, padding: "2px", fontWeight: "bold" }}
          >
            You are not Logged In. Login to see our top picks for you!  
          </Typography>
          <Grid item xs={6} container justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={handleLogin} sx={{marginBottom: "10%"}}>
              Login Here
            </Button>
          </Grid>
        </Box> */}
      </Box>
    )}
      </Box>
      {/* <Box>
              <Testimonials testimonials={testimonialsData} />
            </Box> */}

    </Box>
  );
};

export default Home;
