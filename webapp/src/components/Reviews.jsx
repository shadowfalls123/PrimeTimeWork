import React from 'react';
import { Typography, Box, Grid, Avatar } from '@material-ui/core';
import Rating from '@material-ui/core/Rating';


const reviews = [
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://picsum.photos/200',
    rating: 4.5,
    review:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed finibus pharetra mauris, vitae consequat felis sollicitudin eu.',
  },
  {
    id: 2,
    name: 'Jane Doe',
    avatar: 'https://picsum.photos/200',
    rating: 5,
    review:
      'Nulla ut aliquet tellus. Nullam eu velit sapien. Fusce sit amet tellus malesuada, dapibus ipsum in, lacinia est.',
  },
  {
    id: 3,
    name: 'Bob Smith',
    avatar: 'https://picsum.photos/200',
    rating: 4,
    review:
      'Phasellus dignissim sapien eu ornare auctor. Nunc ultricies sem at mauris volutpat convallis.',
  },
];

const Reviews = () => {
  return (
    <Box my={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Reviews
      </Typography>
      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid item xs={12} sm={6} md={4} key={review.id}>
            <Box p={2} border={1} borderRadius={10} borderColor="grey.400">
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar src={review.avatar} alt={review.name} />
                <Box ml={2}>
                  <Typography variant="subtitle1">{review.name}</Typography>
                  <Rating value={review.rating} precision={0.5} readOnly />
                </Box>
              </Box>
              <Typography variant="body1">{review.review}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Reviews;
