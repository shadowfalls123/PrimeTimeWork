import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

const cmeContent = {
  title: "Experience success like never before - Unlock Your Potential with Exams Are Fun!",
  brief:
    "Welcome to <strong>Exams Are Fun</strong>, your dedicated partner in conquering exams and certifications. Our mission is simple yet powerful: to transform exam preparation into a structured, engaging, and confidence-boosting journey. Specializing in high-quality mock exams, we provide a platform that empowers individuals to test their knowledge, identify areas for improvement, and step into their exams with unwavering confidence.",
  mission:
    "At Exams Are Fun, we understand the importance of practice and precision. That’s why our platform is meticulously designed to simulate real exam conditions, giving you an authentic preparation experience. Our mock exams come with personalized feedback and insights that help you refine your strategies and maximize your performance. Whether you're preparing for competitive exams, certifications, or academic tests, we aim to be the cornerstone of your success.",
  vision:
    "To be the ultimate resource for anyone striving to excel in their exams, providing unparalleled tools and support that make the path to success not only achievable but enjoyable.",
  joinUs:
    "Exams Are Fun is here to redefine how you prepare for exams. With a focus on innovation and excellence, we are committed to being your trusted partner, every step of the way.",
  whatSetsUsApart: [
    {
      title: "Exclusive Mock Exam Focus",
      description:
        "We believe in the power of practice. Our sole focus on mock exams ensures that you get the most realistic and effective preparation experience.",
    },
    {
      title: "Data-Driven Insights",
      description:
        "With detailed performance analysis, our platform helps you pinpoint strengths and work on areas that need improvement.",
    },
    {
      title: "User-Centric Experience",
      description:
        "We are committed to making exam preparation stress-free, efficient, and enjoyable.",
    },
  ],
};

const AboutUs = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: "4rem" }}>
      <Typography variant="h4" gutterBottom>
        About Us
      </Typography>

      {/* About Us Title */}
      <Typography
        variant="body1"
        paragraph
        dangerouslySetInnerHTML={{ __html: `<strong>${cmeContent.title}</strong>` }}
      />

      {/* Brief */}
      <Typography
        variant="body1"
        paragraph
        dangerouslySetInnerHTML={{ __html: cmeContent.brief }}
      />

      {/* Mission */}
      <Typography variant="h6" gutterBottom>
        Why Choose Us?
      </Typography>
      <Typography
        variant="body1"
        paragraph
        dangerouslySetInnerHTML={{ __html: cmeContent.mission }}
      />

      {/* What Sets Us Apart */}
      <Typography variant="h6" gutterBottom>
        What Sets Us Apart?
      </Typography>
      <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
        {cmeContent.whatSetsUsApart.map((feature, index) => (
          <li key={index} style={{ marginBottom: "1rem" }}>
            <Typography variant="body1" gutterBottom>
              <strong>{feature.title}:</strong> {feature.description}
            </Typography>
          </li>
        ))}
      </ul>

      {/* Vision */}
      <Typography variant="h6" gutterBottom>
        Our Vision
      </Typography>
      <Typography
        variant="body1"
        paragraph
        dangerouslySetInnerHTML={{ __html: cmeContent.vision }}
      />

      {/* Join Us */}
      <Typography variant="h6" gutterBottom>
        Join Us on the Journey to Success
      </Typography>
      <Typography
        variant="body1"
        paragraph
        dangerouslySetInnerHTML={{ __html: cmeContent.joinUs }}
      />

      {/* Contact Info */}
      <Typography variant="body1" paragraph>
        Have questions or feedback? We’d love to hear from you! Your input helps us grow and
        serve you better. Thank you for choosing Exams Are Fun—we look forward to helping
        you achieve your goals.
      </Typography>
    </Container>
  );
};

export default AboutUs;
