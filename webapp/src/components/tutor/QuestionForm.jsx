/* ---Seems to be not used
import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import PropTypes from "prop-types";

const QuestionForm = ({ examId, examTitle, examDescription, numQuestions, allocatedTime, examPrice, onSubmit }) => {
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [answerExplanation, setAnswerExplanation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const questionData = {
      question,
      options: [option1, option2, option3, option4],
      correctOption,
      answerExplanation,
    };

    onSubmit(questionData);

    setQuestion("");
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setCorrectOption("");
    setAnswerExplanation("");
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f5f5" }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Exam Details
      </Typography>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1">
          Exam ID: {examId} | Exam Title: {examTitle} | Exam Description:{" "}
          {examDescription} | Number of Questions: {numQuestions} | Allocated
          Time: {allocatedTime} minutes | Exam Price: {examPrice}
        </Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Add Question
        </Typography>
        <TextField
          fullWidth
          required
          label="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          required
          label="Option 1"
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          required
          label="Option 2"
          value={option2}
          onChange={(e) => setOption2(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          required
          label="Option 3"
          value={option3}
          onChange={(e) => setOption3(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          required
          label="Option 4"
          value={option4}
          onChange={(e) => setOption4(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          required
          label="Correct Option (1, 2, 3, or 4)"
          value={correctOption}
          onChange={(e) => setCorrectOption(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          required
          label="Answer Explanation"
          value={answerExplanation}
          onChange={(e) => setAnswerExplanation(e.target.value)}
          sx={{ marginBottom: 2 }}
          multiline
          rows={4}
        />
        <Button type="submit" variant="contained" color="primary">
        Submit
</Button>
</form>
</Box>
);
};

QuestionForm.propTypes = {
  examId: PropTypes.string.isRequired,
  examTitle: PropTypes.string.isRequired,
  examDescription: PropTypes.string.isRequired,
  numQuestions: PropTypes.number.isRequired,
  allocatedTime: PropTypes.number.isRequired,
  examPrice: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
};


export default QuestionForm;

*/