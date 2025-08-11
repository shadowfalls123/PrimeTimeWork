import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Card, CardContent, Divider, Rating, Button, CircularProgress } from "@mui/material";
import { getUserFeedback } from "../../../../services";
import { useLocation } from "react-router-dom";

const ExamTilesWithFeedback = () => {
  const navigate = useNavigate();
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true); // State variable for loading indicator
  const { state } = useLocation();
  const { paper } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserFeedback(paper.pid); // Replace with your API call to fetch exam data
        setExamData(data);
        setLoading(false); // Set loading state to false once data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleGoBack = () => {
    navigate("/");
  };

  const renderFeedback = (feedback) => {
    return feedback.map((entry, index) => (
      <div key={index}>
        <Typography variant="body2" gutterBottom>
          User: {entry.userFullName}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Rating: {entry.userRating}
        </Typography>
        <Typography variant="body2" gutterBottom>
          User Reviews: {entry.userFeedback}
        </Typography>
        <Typography variant="body2" gutterBottom>
          Date: {entry.currentdate}
        </Typography>
        <Divider />
      </div>
    ));
  };

  return (
    <div>
      <Typography
        variant="h5"
        align="left"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        {paper.papertitle} - User Reviews
      </Typography>
      <Card variant="outlined">
        <CardContent>
          {/* <Typography variant="h6" gutterBottom>
            {paper.papertitle}
          </Typography> */}
          <Typography variant="body2">
            <Rating
              name={`rating-${paper.pid}`}
              value={paper.rating}
              precision={0.1}
              readOnly
            />
          </Typography>
          <Typography variant="body1" gutterBottom>
            <span style={{ color: "black" }}> Exam Brief: </span>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {" "}
              {paper.paperdesc}
            </span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <span style={{ color: "black" }}> Tutor: </span>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {" "}
              {paper.firstname} {paper.lastname}
            </span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <span style={{ color: "black" }}> Category: </span>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {" "}
              {paper.category}
            </span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <span style={{ color: "black" }}> Sub Category: </span>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {paper.subcategory}
            </span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <span style={{ color: "black" }}> Sub Category Level2: </span>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {paper.subcategorylvl2}
            </span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <span style={{ color: "black" }}> Difficulty Level: </span>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {" "}
              {paper.difflvl}
            </span>
          </Typography>
          <Typography variant="body1" gutterBottom>
            <span style={{ color: "black" }}> Price: </span>
            <span style={{ color: "black", fontWeight: "bold" }}>
              {" "}
              ₹ {paper.price}
            </span>
          </Typography>

          <Button variant="outlined" onClick={handleGoBack} sx={{ marginBottom: 2 }}>
        Back to Home
      </Button>

          <Divider />
          <Typography variant="h6" gutterBottom>
            User Reviews:
          </Typography>
          {loading ? (
            <CircularProgress />
            ) : (
              <>
          {examData.length > 0 ? (
            renderFeedback(examData)
          ) : (
            <Typography variant="body2">No feedback available</Typography>
          )}
          </>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamTilesWithFeedback;
