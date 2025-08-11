import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, FormControl, RadioGroup, Radio, FormControlLabel, FormLabel, Checkbox, InputAdornment } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
  },
  addButton: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    marginBottom: theme.spacing(2),
  },
  correctAnswerCheckBox: {
    marginLeft: 0,
  },
  answerTextField: {
    marginBottom: theme.spacing(2),
  },
  explanationTextField: {
    marginBottom: theme.spacing(2),
  },
}));

const BrowseQuestions = () => {
//function BrowseQuestions() {
  const classes = useStyles();
  const { paperid } = useParams();
  const [openDialog, setOpenDialog] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [questions, setQuestions] = useState([
    {
      question: 'What is React?',
      options: ['A Framework', 'A Library', 'A Language', 'An Operating System'],
      correctAnswer: 'A Library',
      explanation: 'React is a JavaScript library for building user interfaces.',
    },
    {
      question: 'What is JSX?',
      options: ['A syntax extension for JavaScript', 'A type of HTML', 'A new programming language', 'A backend technology'],
      correctAnswer: 'A syntax extension for JavaScript',
      explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
    },
    {
      question: 'What is a component in React?',
      options: ['A JavaScript function or class', 'A DOM element', 'A CSS selector', 'A variable'],
      correctAnswer: 'A JavaScript function or class',
      explanation: 'In React, a component is a JavaScript function or class that returns a piece of UI.',
    },
  ]);

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleEditQuestion = () => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex] = {
        question,
        options,
        correctAnswer,
        explanation,
      };
      return updatedQuestions;
    });
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setExplanation('');
    setOpenDialog(false);
  };

  const handleAddOption = () => {
    setOptions((prevOptions) => [...prevOptions, '']);
  };

  const handleDeleteOption = (optionIndex) => {
    setOptions((prevOptions) => prevOptions.filter((_, index) => index !== optionIndex));
  };

  const handleOptionChange = (optionIndex, field, value) => {
    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      options: prevQuestion.options.map((option, index) =>
        index === optionIndex ? { ...option, [field]: value } : option
      ),
    }));
  };

  return (
    <Box className={classes.root}>
      <Paper className={classes.paper}>
        <Box mb={2}>
          <Typography variant="h6">Question {questionIndex + 1}</Typography>
          <TextField
            label="Question"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={question.text}
            onChange={(event) => handleQuestionChange("text", event.target.value)}
          />
        </Box>

        {question.options.map((option, optionIndex) => (
          <Box key={optionIndex} className={classes.option}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={option.isCorrect}
                  onChange={(event) => handleOptionChange(optionIndex, "isCorrect", event.target.checked)}
                  color="primary"
                />
              }
            />
            <TextField
              label={`Option ${optionIndex + 1}`}
              variant="outlined"
              fullWidth
              value={option.text}
              onChange={(event) => handleOptionChange(optionIndex, "text", event.target.value)}
            />
            <IconButton aria-label="delete" onClick={() => handleDeleteOption(optionIndex)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button variant="outlined" color="primary" onClick={handleAddOption}>
          Add Option
        </Button>

        <Box mt={2}>
          <Typography variant="h6">Explanation</Typography>
          <TextField
            label="Explanation"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={question.explanation}
            onChange={(event) => handleQuestionChange("explanation", event.target.value)}
          />
        </Box>
      </Paper>
    </Box>
  )
}

export default BrowseQuestions;