const { htmlToText } = require('html-to-text');

// Function to generate the HPI report
export const generateHPIReport = async (examUserAnswers, examQuestionDetails) => {
    const dimensionScores = {};
    const dimensionDetails = {};
  
    examUserAnswers.forEach((examUserAnswers) => {
      processUserAnswer(examUserAnswers, examQuestionDetails, dimensionScores, dimensionDetails);
    });
  
    return calculateDimensionSummary(dimensionScores, dimensionDetails);
  }
  
  // Function to process each user answer
  function processUserAnswer(examUserAnswers, examQuestionDetails, dimensionScores, dimensionDetails) {
    console.log("examUserAnswers", examUserAnswers);
    console.log("examQuestionDetails", examQuestionDetails);
    console.log("dimensionScores", dimensionScores);
    console.log("dimensionDetails", dimensionDetails);
    const questionDetails = examQuestionDetails.find(
      (q) => q.quesid === examUserAnswers.quesid
    );
  
    if (questionDetails) {
      const selectedOption = `op${examUserAnswers.selectedAns}`;
      const score = 6 - parseInt(examUserAnswers.selectedAns); // Assign higher scores to "strongly agree"
      const dimension = questionDetails.section;
  
      if (!dimensionScores[dimension]) {
        dimensionScores[dimension] = { totalScore: 0, questionCount: 0 };
        dimensionDetails[dimension] = [];
      }
  
      dimensionScores[dimension].totalScore += score;
      dimensionScores[dimension].questionCount++;
  
      // const explanation = JSON.parse(questionDetails.explanation || "{}");
       // Sanitize explanation and parse JSON
       let explanation = {};
       if (questionDetails.explanation) {
         try {
           const sanitizedExplanation = htmlToText(questionDetails.explanation, {
             wordwrap: false, // Keep JSON structure intact
             ignoreHref: true, // Ignore links if any
             ignoreImage: true, // Ignore images
           });
           explanation = JSON.parse(sanitizedExplanation); // Parse JSON
         } catch (error) {
           console.error("Failed to parse explanation JSON:", error);
         }
       }
       
      const selectedOptionText = questionDetails[selectedOption];
      const selectedExplanation = explanation[selectedOptionText] || "No explanation available";
  
      dimensionDetails[dimension].push({
        question: questionDetails.qtxt,
        selectedAnswer: selectedOptionText,
        interpretation: selectedExplanation,
      });
    }
  }
  
  // Function to calculate dimension summaries
  function calculateDimensionSummary(dimensionScores, dimensionDetails) {
    return Object.keys(dimensionScores).map((dimension) => {
      const { totalScore, questionCount } = dimensionScores[dimension];
      const averageScore = totalScore / questionCount;
  
      let summary;
      if (averageScore >= 4.5) {
        summary = "High score - Strong alignment with this trait.";
      } else if (averageScore >= 3) {
        summary = "Moderate score - Balanced traits.";
      } else {
        summary = "Low score - Weak alignment with this trait.";
      }
  
      return {
        dimension,
        averageScore,
        summary,
        questions: dimensionDetails[dimension],
      };
    });
  }
  
  // // Function to generate a detailed report
  // async function generateDetailedReport(data) {
  //   // Prepare the prompt for the AI
  //   const prompt = `
  //   You are a psychologist interpreting Hogan Personality Inventory (HPI) results. Based on the data provided, generate a detailed report including:
  //   - Key strengths and weaknesses for each dimension
  //   - Recommendations for improvement
  //   - Insights about the individual based on their scores
    
  //   Here's the data:
  //   ${JSON.stringify(data, null, 2)}
    
  //   Provide a detailed and structured report.
  //   `;
  
  //   try {
  //     const chatCompletionResponse = await openai.chat.completions.create({
  //       model: "gpt-3.5",
  //       messages: [{"role": "user", "content": prompt}],
  //       max_tokens: 2000, // Adjust based on the desired response length
  //       temperature: 0.7, // Control creativity
  //     });
  //     console.log("Detailed Report from ChatGPT:", chatCompletionResponse);
  
  //     const detailedReport = chatCompletionResponse.data.choices[0].message.content;
  //     console.log("Detailed Report from ChatGPT:", detailedReport);
  //     return detailedReport;
  //   } catch (error) {
  //     console.error("Error generating report:", error);
  //     throw new Error("Failed to generate detailed report.");
  //   }
  // }
  