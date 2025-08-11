import React from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
//   ListItemText,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import logger from "../../util/logger";

const PersonalityReport = () => {
  const location = useLocation();
  const { response = {} } = location.state || {}; // Safely access response
  const {
    category = "N/A",
    subcategory = "N/A",
    traits = {},
    date = new Date().toISOString(),
  } = response; // Provide defaults for each property

  logger.log("location", location);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Personality Assessment Report
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>Category:</b> {category}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>Subcategory:</b> {subcategory}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <b>Assessment Date:</b> {new Date(date).toLocaleDateString()}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" component="h3" gutterBottom>
            Traits Analysis
          </Typography>
          <List>
            {Object.entries(traits).map(([trait, details], index) => (
              <ListItem key={index} alignItems="flex-start" disableGutters>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                    padding: "10px",
                    borderRadius: "5px",
                    width: "100%",
                  }}
                >
                  <Typography variant="body1" gutterBottom>
                    <b>{trait}:</b> Score: {details.score}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {details.description}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PersonalityReport;
