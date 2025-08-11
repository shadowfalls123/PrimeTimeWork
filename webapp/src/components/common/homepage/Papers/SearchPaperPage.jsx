import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { makeStyles } from '@mui/styles';
import { Grid, Typography, Card, CardContent, CardActions, Button, Avatar } from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { Rating } from '@mui/material';
import { addToCart } from "../../../../store";
import { searchExam} from "../../../../services";
import { RingLoadingIcon } from '../../LoadingIcon';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      overflowX: 'scroll',
      padding: theme.spacing(2),
      '&::-webkit-scrollbar': {
        height: '0.5em',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.grey[500],
        borderRadius: '1em',
      },
      '&::-webkit-scrollbar-track': {
        borderRadius: '1em',
      },
    },
    card: {
      minWidth: 200,
      maxWidth: 250,
      margin: theme.spacing(1),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      transition: 'box-shadow 0.3s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      height: '100%',
      overflow: 'hidden',
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flex: 1,
      overflowY: 'auto',
    },
    avatar: {
      width: theme.spacing(5),
      height: theme.spacing(5),
    },
    button: {
      marginTop: theme.spacing(2),
    },
  }));
  

const SearchPaperPage = () => {
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { searchText } = state;

  const classes = useStyles();

  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    //#PROD logger.log("Useeffect ran");
    fetchSearchedPapers();
  }, [searchText]);

  const fetchSearchedPapers = async () => {
    setIsLoading(true);
    try {
      const response = await searchExam(searchText);
      //#PROD logger.log(" In Header fetchSearchedPapers response is -> ", response);
      const data = await response;
      //#PROD logger.log(" In fetchSearchedPapers data is -> ", data);
      setPapers(data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleAddToCart = (paper) => {
    const price = paper.price;
    //#PROD logger.log(`Added exam paper with id ${paper.pid} to cart`);
    dispatch(addToCart({ item: paper, price: parseFloat(price) }));
  };

  return (
    <div className={classes.root}>
      {isLoading && <div> <RingLoadingIcon/></div>}
      <Grid container>
        {papers.length > 0 ? (
        papers.map((paper) => (
          <Grid item key={paper.pid}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <div>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {paper.papertitle}
                  </Typography>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="subtitle1" component="p" gutterBottom>
					by {paper.guruname}
					</Typography>
					<Avatar src={paper.avatarUrl} alt={paper.guruname} className={classes.avatar} />
					</div>
					<Typography variant="body1" component="p" color="textSecondary">
					{paper.paperdesc}
					</Typography>
				</div>
                <div>
                  <Typography variant="body2">
                    {paper.guruname}
                  </Typography>
                  <Avatar
                    alt={paper.guruname}
                    src={paper.avatarUrl}
                    className={classes.avatar}
                  />
                </div>
                <div>
                  <Typography variant="body2">
                    {`${paper.rating} (${paper.noofreviews})`}
                    </Typography>
                    <Typography variant="body2">
                    <Rating name={`rating-${paper.pid}`} value={paper.rating} precision={0.1} readOnly />
                  </Typography>
                  <Typography variant="h6">
                    {`$${paper.price}`}
                  </Typography>
                </div>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddShoppingCart />}
                  className={classes.button}
                  onClick={() => handleAddToCart(paper)}
                >
                  Add to cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))) : (
    // Render a message if there are no matching papers
    <Grid item xs={12}>
      <Typography variant="body1">No matching papers found.</Typography>
    </Grid>
          )
      }
      </Grid>
    </div>
  );
};

export default SearchPaperPage;
