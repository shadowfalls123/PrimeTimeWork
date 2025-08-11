import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import {
  Container,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
 IconButton,
  Button,
  Tooltip,
  Rating,
} from "@mui/material";
import { Edit as EditIcon,
  CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { getTutorLearningPacks } from "../../services";
import { useNavigate } from "react-router-dom";

const MyPacks = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState({});

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await getTutorLearningPacks(["01HX6Y98KSM6J0KYDP572V4ARF"]);
      const data = await response.data;
      logger.log("Packages data: ", data);
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages: ", error);
    }
    setIsLoading(false);
  };

  const handleUploadClick = (pack) => {
    navigate("/uploadPackage", { state: { pack } });
  };

  const handleViewPackClick = async (pack) => {
    navigate("/viewpack", { state: { pack } });
  };

  
  const handleExpandDescription = (index) => {
    setExpandedDesc({ ...expandedDesc, [index]: !expandedDesc[index] });
  };

  const handleEditClick = (pack) => {
    // Handle edit functionality
    logger.log("In handleEditClick MyPacks", pack);
    navigate("/editpack", { state: { pack } });
  };

  return (
    <Container sx={{ maxWidth: "100vw", margin: "1 auto" }} maxWidth={false}>
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: "20px", fontWeight: "bold" }}
      >
        My Packages
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : packages.length === 0 ? (
        <Typography variant="h6" align="center">
          No packages found
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {packages.map((pack, index) => (
            <Grid
            item
            xs={12}
            key={`${pack.userid}-${pack.packid}-${index}`}
          >
            <Card>
              <CardContent>
                <Typography variant="h6">{pack.packTitle}</Typography>
                <Typography variant="body2">
                  <Rating
                    name={`rating-${pack.packid}`}
                    value={pack.rating}
                    precision={0.1}
                    readOnly
                  />
                </Typography>
                <Typography variant="body1">
                  <b>Description:</b>{" "}
                  {pack.packDesc.length <= 200 ? (
                    pack.packDesc
                  ) : (
                    <>
                      {expandedDesc[index]
                        ? pack.packDesc
                        : `${pack.packDesc.substring(0, 200)}... `}
                      <Button
                        onClick={() => handleExpandDescription(index)}
                      >
                        {expandedDesc[index] ? "Read Less" : "Read More"}
                      </Button>
                    </>
                  )}
                </Typography>

                {/* <Typography variant="body1">Description: {paper.paperdesc}</Typography> */}
                <Typography variant="body2">
                  <b>Total Papers:</b> {pack.selectedPapers.length}
                </Typography>
                <Typography variant="body2">
                  <b>Price:</b> ₹{pack.packPrice}
                </Typography>
                <div style={{ marginTop: "10px", textAlign: "left" }}>
                  <Tooltip title="Edit" arrow>
                    <IconButton
                      onClick={() => handleEditClick(pack)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {/* <Tooltip title="Delete" arrow>
                    <IconButton
                      onClick={() => handleDeleteClick(paper)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip> */}
                  <Tooltip title="Upload" arrow>
                    <IconButton
                      onClick={() => handleUploadClick(pack)}
                      aria-label="upload"
                    >
                      <CloudUploadIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    onClick={() => handleViewPackClick(pack)}
                    aria-label="viewpack"
                  >
                    View & Publish Pack
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
          ))}
          
        </Grid>
      )}
    </Container>
  );
};

export default MyPacks;
