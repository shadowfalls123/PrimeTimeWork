import React, { useState } from "react";

const TutorRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subjects: "",
    qualifications: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to handle the form submission (e.g., send data to the server)
    //#PROD logger.log("Tutor Registration Data:", formData);
    // Optionally, reset the form after submission
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      subjects: "",
      qualifications: "",
    });
  };

  return (
    <div>
      <h2>Register as a Tutor</h2>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Last Name:
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Subjects (comma-separated):
          <input
            type="text"
            name="subjects"
            value={formData.subjects}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Qualifications:
          <textarea
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TutorRegistration;
