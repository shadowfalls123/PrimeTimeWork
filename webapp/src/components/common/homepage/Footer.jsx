import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";
import { Facebook, Twitter, Instagram } from "@mui/icons-material";

function Footer() {
  return (
    <Box sx={{ bgcolor: "primary.main", color: "white", py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              KodingHut
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Trusted partners for application design and development.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Link href="#" sx={{ mr: 1 }}>
                <Facebook />
              </Link>
              <Link href="#" sx={{ mr: 1 }}>
                <Twitter />
              </Link>
              <Link href="#">
                <Instagram />
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Links
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <Link href="/" color="inherit">
                Home
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <Link href="/about" color="inherit">
                About Us
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <Link href="/terms" color="inherit">
                Terms and Conditions
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <Link href="/contact" color="inherit">
                Contact Us
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contact Us
            </Typography>
            {/* <Typography variant="body2" sx={{ mb: 2 }}>
            examsarefun.help@gmail.com
            </Typography> */}
            <Typography variant="body2" sx={{ mb: 2 }}>
            JP Nagar, Bangalore, India 560078
            </Typography>
            <Typography variant="body2">
              <Link href="tel:555-555-5555" color="inherit">
                555-555-5555
              </Link>
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ mt: 4 }}>
          &copy; {new Date().getFullYear()} Company Name. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
