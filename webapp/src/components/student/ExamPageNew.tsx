import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Timer
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { saveResult, getExamQuestions } from "../../services";
import logger from "../../util/logger";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface ExamData {
  examTime: number;
  selectedPack: any;
  selectedPaper: any;
}

interface Answer {
  [questionId: string]: string;
}

const ExamPageNew: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [reviewedQuestions, setReviewedQuestions] = useState<number[]>([]);
  
  // Modal states
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize exam data from parent window
  useEffect(() => {
    let listenerAdded = false;

    const sendHandshake = () => {
      logger.log("[Child] Sending handshake to parent.");
      if (window.opener) {
        window.opener.postMessage("childReady", window.location.origin);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.warn("Ignoring message from untrusted origin:", event.origin);
        return;
      }

      logger.log("[Child] Received message:", event.data);

      if (event.data.type === "examData") {
        const { examTime, selectedPack, selectedPaper } = event.data.payload;
        logger.log("[Child] Received exam data:", { examTime, selectedPack, selectedPaper });
        setExamData({ examTime, selectedPack, selectedPaper });
        setRemainingTime(examTime * 60); // Convert to seconds
      }
    };

    if (!listenerAdded) {
      logger.log("[Child] Adding message listener.");
      window.addEventListener("message", handleMessage);
      listenerAdded = true;
      sendHandshake();
    }

    return () => {
      logger.log("[Child] Removing message listener.");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Fetch exam questions
  useEffect(() => {
    const fetchExamQuestions = async () => {
      if (!examData) return;

      try {
        setIsLoading(true);
        const { selectedPaper, selectedPack } = examData;

        if (!selectedPaper?.pid || !selectedPack?.packid) {
          setErrorMessage("Missing exam details. Please return to the previous page.");
          setShowErrorModal(true);
          return;
        }

        logger.log("Fetching questions for:", { pid: selectedPaper.pid, packid: selectedPack.packid });
        const response = await getExamQuestions(selectedPaper.pid, selectedPack.packid);
        
        if (!response || response.length === 0) {
          setErrorMessage("Exam questions not available");
          setShowErrorModal(true);
          return;
        }

        setQuestions(response);
        setShowWarningModal(true); // Show initial warning
        logger.log("Questions loaded:", response);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setErrorMessage("Failed to fetch exam questions");
        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamQuestions();
  }, [examData]);

  // Timer countdown
  useEffect(() => {
    if (remainingTime <= 0 || showResults) return;

    const interval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, showResults]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    setShowResults(true);
    handleSubmitExam();
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigation functions
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleQuestionJump = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
  };

  // Mark question for review
  const handleMarkForReview = () => {
    const questionIndex = currentQuestion;
    setReviewedQuestions(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(q => q !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  // Submit exam
  const handleSubmitExam = async () => {
    try {
      if (!examData) return;

      const resultData = {
        answers,
        examTime: examData.examTime,
        selectedPaper: examData.selectedPaper,
        selectedPack: examData.selectedPack,
        timeSpent: examData.examTime * 60 - remainingTime,
      };

      await saveResult(resultData);
      navigate("/result", { state: { resultData, questions } });
    } catch (error) {
      console.error("Error submitting exam:", error);
      setErrorMessage("Failed to submit exam. Please try again.");
      setShowErrorModal(true);
    }
  };

  // Get question status
  const getQuestionStatus = (index: number) => {
    const isAnswered = answers[questions[index]?.id];
    const isReviewed = reviewedQuestions.includes(index);
    const isCurrent = index === currentQuestion;

    if (isCurrent) return 'current';
    if (isReviewed) return 'review';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-sage-500 text-white';
      case 'answered': return 'bg-green-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-4">Unable to load exam questions.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const reviewCount = reviewedQuestions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-sage-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {examData?.selectedPaper?.papertitle || 'Exam'}
              </h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Badge variant="success">{answeredCount} Answered</Badge>
              <Badge variant="warning">{reviewCount} Marked</Badge>
              <Badge variant="outline">{questions.length - answeredCount} Remaining</Badge>
            </div>
            
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              remainingTime < 300 ? 'bg-red-100 text-red-700' : 'bg-sage-100 text-sage-700'
            }`}>
              <Timer className="h-4 w-4" />
              <span className="font-mono font-semibold">
                {formatTime(remainingTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Question {currentQuestion + 1}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkForReview}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {reviewedQuestions.includes(currentQuestion) ? 'Unmark' : 'Mark for Review'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <p className="text-gray-900 text-lg leading-relaxed">
                    {currentQuestionData.question}
                  </p>
                </div>

                <div className="space-y-3">
                  {currentQuestionData.options?.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionData.id}`}
                        value={option}
                        checked={answers[currentQuestionData.id] === option}
                        onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
                        className="mt-1 h-4 w-4 text-sage-600 focus:ring-sage-500"
                      />
                      <span className="text-gray-900 flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleMarkForReview}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Mark & Next
                </Button>
                
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowSubmitModal(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Exam
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleNextQuestion}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Question Navigator</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuestionJump(index)}
                        className={`w-8 h-8 text-xs font-medium rounded transition-colors ${getStatusColor(status)}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-sage-500 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full mt-4"
                  onClick={() => setShowSubmitModal(true)}
                >
                  Submit Exam
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Exam Instructions"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">Important Instructions:</p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Do not close the window or navigate away</li>
                <li>• This will result in automatic submission</li>
                <li>• Make sure you have a stable internet connection</li>
                <li>• All the best for your exam!</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowWarningModal(false)}>
              I Understand
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Exam"
      >
        <div className="space-y-4">
          <p className="text-gray-900">
            Are you sure you want to submit your exam? You have answered {answeredCount} out of {questions.length} questions.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitExam}>
              Submit Exam
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-gray-900">{errorMessage}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamPageNew;