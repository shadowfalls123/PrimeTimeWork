import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { Typography, Grid } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  testimonialContainer: {
    position: 'relative',
    minHeight: '100px', // Set a minimum height for the testimonial box
  },
  testimonial: {
    backgroundColor: theme.palette.primary.light,
    padding: theme.spacing(6),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
    marginBottom: theme.spacing(4),
    position: 'relative',
    zIndex: 0,
  },
  navigationButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '15px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    zIndex: 1,
  },

  leftButton: {
    left: '10px',
   height: '40px', // Set the height for the vertical bar
    width: '5px', // Set the width for the vertical bar
    borderRadius: '5px', // Optional: Add border-radius for rounded corners
    marginRight: '5px', // Optional: Add some spacing between bar and testimonial box
  },

  rightButton: {
    right: '10px',
   height: '40px', // Set the height for the vertical bar
    width: '5px', // Set the width for the vertical bar
    borderRadius: '5px', // Optional: Add border-radius for rounded corners
    marginLeft: '5px', // Optional: Add some spacing between bar and testimonial box
  },
  // navigationButton: {
  //   position: 'absolute',
  //   top: '50%',
  //   transform: 'translateY(-50%)',
  //   backgroundColor: theme.palette.primary.main,
  //   color: theme.palette.primary.contrastText,
  //   borderRadius: '50%',
  //   padding: '8px',
  //   cursor: 'pointer',
  //   border: 'none',
  //   outline: 'none',
  //   zIndex: 1,
  // },
  // leftButton: {
  //   left: '10px',
  // },
  // rightButton: {
  //   right: '10px',
  // },
  author: {
    marginTop: theme.spacing(2),
    fontStyle: 'italic',
  },
}));

const Testimonials = ({ testimonials }) => {
  const classes = useStyles();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [testimonialHeight, setTestimonialHeight] = useState('auto');

  useEffect(() => {
    const testimonialContainer = document.getElementById('testimonialContainer');
    if (testimonialContainer) {
      const height = testimonialContainer.clientHeight;
      setTestimonialHeight(`${height}px`);
    }
  }, [currentTestimonialIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => {
        const newIndex = prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1;
        return newIndex;
      });
    }, 5000); // Change testimonial every 5 seconds (5000 milliseconds)

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [testimonials.length]);
  
  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) => {
      const newIndex = prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1;
      return newIndex;
    });
  };

  const handlePreviousTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1;
      return newIndex;
    });
  };

  const currentTestimonial = testimonials[currentTestimonialIndex];

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} md={6}>
        <div id="testimonialContainer" className={classes.testimonialContainer}>
          <button
            className={`${classes.navigationButton} ${classes.leftButton}`}
            onClick={handlePreviousTestimonial}
            style={{ height: testimonialHeight }}
          >
            &lt; {/* Unicode character for "<" */}
          </button>
          <div className={classes.testimonial}>
            <Typography variant="body1">{currentTestimonial.quote}</Typography>
            <Typography variant="body2" className={classes.author}>
              {currentTestimonial.author}
            </Typography>
          </div>
          <button
            className={`${classes.navigationButton} ${classes.rightButton}`}
            onClick={handleNextTestimonial}
            style={{ height: testimonialHeight }}
          >
            &gt; {/* Unicode character for ">" */}
          </button>
        </div>
      </Grid>
    </Grid>
  );
};

Testimonials.propTypes = {
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({
      quote: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Testimonials;
