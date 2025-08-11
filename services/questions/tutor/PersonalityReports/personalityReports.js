
// Helper function: Map Selected Answer to Trait Score
const mapAnswerToScore = (selectedAns) => {
  // Scoring based on the response
  const scoreMapping = {
    1: 3, // Strongly Agree
    2: 2, // Agree
    3: -2, // Disagree
    4: -3, // Strongly Disagree
  };
  return scoreMapping[selectedAns] || 0; // Default to 0 if invalid
};

// // Helper function: Get Trait Mappings
// const getTraitMappings = async (paperid) => {
//   // Replace this with a DB fetch or external service call as needed
//   const traitMappingByQuestionText = {
//     "You enjoy social gatherings and meeting new people.": "Extraversion", // Q1
//     "You prefer tasks that involve working alone rather than in a team.": "Introversion", // Q2
//     "You often make decisions based on logic rather than emotions.": "Logical Thinking", // Q3
//     "You feel stressed when deadlines are approaching.": "Stress Management", // Q4
//     "You rely more on gut feelings than facts when making decisions.": "Intuition", // Q5
//     "You enjoy trying new activities and meeting people from different cultures.": "Openness", // Q6
//     "You like having a clear schedule and following it.": "Structure Preference", // Q7
//     "You feel drained after spending time in large crowds.": "Energy Levels", // Q8
//     "You find it easy to empathize with other people's feelings.": "Empathy", // Q9
//     "You frequently plan your tasks and follow a structured routine.": "Planning Skills", // Q10
//   };

//   // Simulate a fetch based on paperid if needed (e.g., to fetch mappings for different papers)
//   return traitMappingByQuestionText;
// };

// Helper function: Get Trait Mappings
const getTraitMappings = async (paperid) => {
  // Replace with a DB fetch if needed
  return {
    "01JGVN316F8REY74FQHP45GXVR": "Extraversion", // Q1
    "01JGVN319KTRBY9B1N4F9254P1": "Introversion", // Q2
    "01JGVN31BF0QTBWJS9XMNQPSX6": "Logical Thinking", // Q3
    "01JGVN31DB92TFBK42W438KYQ8": "Stress Management", // Q4
    "01JGVN31F78A22N82ZYB5A7EE4": "Intuition", // Q5
    "01JGVN31H3VJQT8RG1QRZXAAM6": "Openness", // Q6
    "01JGVN31KK5NZFA0YY72WSR8DQ": "Structure Preference", // Q7
    "01JGVN31PQ05725365M7NZXH90": "Energy Levels", // Q8
    "01JGVN31QYS2AK4DKY52P7GE56": "Empathy", // Q9
    "01JGVN31STFSM4A8Q6F3V826SN": "Planning Skills", // Q10
  };
};

// Helper function: Get Trait Description
// Helper function: Get Trait Description
const getTraitDescription = (trait, score) => {
  // Define thresholds and descriptions for each trait
  const traitDescriptions = {
    Extraversion: {
      low: "You prefer solitude or small gatherings over large social settings.",
      medium: "You balance socializing with moments of introspection.",
      high: "You thrive in social settings and enjoy meeting new people.",
    },
    Introversion: {
      low: "You are highly extroverted and enjoy being around people.",
      medium: "You have a balanced mix of socializing and introspection.",
      high: "You are introverted and prefer quiet environments or close-knit groups.",
    },
    "Logical Thinking": {
      low: "You often rely on emotions over logic when making decisions.",
      medium: "You balance logical reasoning with emotional considerations.",
      high: "You rely on logic and facts to make decisions.",
    },
    "Stress Management": {
      low: "You handle deadlines calmly and thrive under pressure.",
      medium: "You feel some stress near deadlines but manage it effectively.",
      high: "You feel significant stress when deadlines approach.",
    },
    Intuition: {
      low: "You base decisions on facts and evidence over gut feelings.",
      medium: "You use a mix of intuition and factual evidence to make decisions.",
      high: "You rely heavily on gut feelings when making decisions.",
    },
    Openness: {
      low: "You prefer familiar routines and activities over trying new things.",
      medium: "You enjoy occasional new activities and cultural experiences.",
      high: "You are highly open to new experiences and cultural diversity.",
    },
    "Structure Preference": {
      low: "You are flexible and adapt well to changes in schedule.",
      medium: "You like a mix of clear schedules and spontaneous activities.",
      high: "You prefer having a clear, structured schedule to follow.",
    },
    "Energy Levels": {
      low: "You feel energized after spending time in large social settings.",
      medium: "You balance social interactions with personal recharge time.",
      high: "You feel drained after spending time in large crowds.",
    },
    Empathy: {
      low: "You find it challenging to empathize with others' feelings.",
      medium: "You empathize with others but keep emotional boundaries.",
      high: "You easily empathize with others and deeply understand their emotions.",
    },
    "Planning Skills": {
      low: "You prefer spontaneous actions over structured planning.",
      medium: "You plan tasks but allow flexibility in execution.",
      high: "You are highly organized and excel at structured planning.",
    },
  };

  // Threshold values for categorizing scores
  const thresholds = {
    low: -10,
    medium: 0,
    high: 10,
  };

  // Determine the category (low, medium, high) based on the score
  let category = "low";
  if (score > thresholds.medium && score <= thresholds.high) category = "medium";
  if (score > thresholds.high) category = "high";

  // Return the description for the trait and category
  return traitDescriptions[trait]?.[category] || "Description not available for this trait.";
};


// Helper function: Analyze Personality Assessment
export const analyzePersonalityAssessment = async (examUserAnswers, paperDetails) => {
  const analysisResults = {};
  const traitMappings = await getTraitMappings(paperDetails.paperid);
  const traitScores = {};

  // Initialize scores for all traits
  for (const trait of Object.values(traitMappings)) {
    traitScores[trait] = 0;
  }

  // Analyze user answers
  examUserAnswers.forEach((answer) => {
    const questionTrait = traitMappings[answer.quesid];
    if (questionTrait && answer.selectedAns) {
      const score = mapAnswerToScore(parseInt(answer.selectedAns, 10));
      traitScores[questionTrait] += score;
    }
  });

  // Generate descriptive report
  for (const [trait, score] of Object.entries(traitScores)) {
    const description = getTraitDescription(trait, score);
    analysisResults[trait] = { score, description };
  }

  return {
    category: paperDetails.category,
    subcategory: paperDetails.subcategory,
    traits: analysisResults,
    date: new Date().toISOString(),
  };
};

