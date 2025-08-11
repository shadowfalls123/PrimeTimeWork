import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { Rating } from '@mui/material';
import { getPackDetails } from "../../../../services"; // Import your API function

const PackDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { packId } = useParams();
  const [paperDetails, setPaperDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const [averageRating, setAverageRating] = useState(0);

  // Extract pack data from location state or set default values
  const packData = location.state?.pkg || {};

  useEffect(() => {
    const fetchPackDetails = async () => {
      try {
        const response = await getPackDetails(packData.selectedPapers);
        setPaperDetails(response);
        // Calculate the average rating
//        const totalRating = response.reduce((sum, paper) => sum + paper.rating, 0);
//        const avgRating = response.length > 0 ? totalRating / response.length : 0;
//        setAverageRating(avgRating);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch pack details");
        setLoading(false);
      }
    };

    fetchPackDetails();
  }, [packId, packData.selectedPapers]);

  const handleBack = () => {
    navigate(-1);
  };
  
  const getUserColor = (firstName, lastName) => {
    const fullName = firstName.toLowerCase() + lastName.toLowerCase();
    const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#F44336', '#9C27B0', '#2196F3', '#FFEB3B', '#4CAF50', '#FF5722'];
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

    // Calculate the average rating and the count of rated papers
    //Calculate the Pack Rating: Filter the papers to get only those with a rating greater than zero and calculate the average rating using reduce.
    const ratedPapers = paperDetails.filter(paper => paper.rating > 0);
    const averageRating = ratedPapers.length
      ? ratedPapers.reduce((sum, paper) => sum + paper.rating, 0) / ratedPapers.length
      : 0;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" sx={{ marginBottom: "20px", fontWeight: "bold" }}>
        Pack Details
      </Typography>
      {packData && (
        <Paper sx={{ padding: 4, marginBottom: 4 }}>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            {packData.packTitle}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {packData.packDesc}
          </Typography>
          {/* <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Rating: {averageRating.toFixed(2)}
          </Typography>
                  <Rating value={averageRating.toFixed(2)} precision={0.5} readOnly /> */}
                  <Box sx={{ mt: 2 }}>
            {/* <Rating name="packrating" value={averageRating.toFixed(1)} precision={0.1} readOnly />
            <Typography variant="body2">
              {`${averageRating.toFixed(1)} (${ratedPapers.length}/${paperDetails.length} rated)`}
            </Typography> */}

            <Rating name="packrating" value={averageRating} precision={0.1} readOnly />
            <Typography variant="body2">
              {`${averageRating.toFixed(1)} (${ratedPapers.length}/${paperDetails.length} rated)`}
            </Typography>

          </Box>
        </Paper>
      )}
      <Typography variant="h5" sx={{ marginBottom: "20px", fontWeight: "bold" }}>
        Papers in this Pack
      </Typography>
      <Grid container spacing={3}>
        {paperDetails.map((paper) => (
          <Grid item xs={12} sm={6} md={4} key={paper.pid}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid', borderRadius: 1 }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  // onClick={() => handleTitleClick(paper)}
                  gutterBottom
                  // sx={{ textDecoration: "underline", color: "black", cursor: "pointer" }}
                >
                  {paper.papertitle}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" component="p" gutterBottom>
                    by {paper.firstname} {paper.lastname}
                  </Typography>
                  <Avatar
                    sx={{ backgroundColor: getUserColor(paper.firstname, paper.lastname), color: "#fff" }}
                  >
                    {paper.firstname.charAt(0)}{paper.lastname.charAt(0)}
                  </Avatar>
                </Box>
                <Typography variant="body1" component="p" color="textSecondary">
                  {paper.paperdesc}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Rating name={`rating-${paper.pid}`} value={paper.rating} precision={0.1} readOnly />
                  <Typography variant="body2">
                    {`${paper.rating} (${paper.noofreviews} ${paper.noofreviews === 1 ? 'rating' : 'ratings'})`}
                  </Typography>
                  {/* <Typography variant="h6" sx={{ mt: 1 }}>{`₹ ${paper.price}`}</Typography> */}
                </Box>
              </CardContent>
              {/* <CardActions>
                {packData.userCourses?.some((course) => course.pid === paper.pid) ? (
                  <Button variant="contained" color="primary" size="small" disabled>
                    Course Already Purchased
                  </Button>
                ) : paper.isInCart ? (
                  <Button variant="contained" color="primary" size="small" onClick={handleGoToCart}>
                    Go to cart
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" size="small" startIcon={<AddShoppingCart />} onClick={() => handleAddToCart(paper)}>
                    Add to cart
                  </Button>
                )}
              </CardActions> */}
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* <Grid container spacing={3}>
        {paperDetails.map((paper) => (
          <Grid item xs={12} sm={6} md={4} key={paper.pid}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6">{paper.papertitle}</Typography>
              <Typography variant="body2" sx={{ marginBottom: 1 }}>
                {paper.paperdesc}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Number of Questions: {paper.qcount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Duration: {paper.examtime} minutes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Price: ${paper.price}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid> */}
              <Grid spacing={3}>
                <br></br>
                <Button variant="contained" color="primary" onClick={handleBack}>
                    Back
                </Button>
              </Grid>
    </Container>
  );
};

export default PackDetails;
