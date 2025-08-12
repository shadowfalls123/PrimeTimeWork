import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./homepage/Home";
import AboutUs from "./homepage/AboutUs";
import TermsAndConditions from "./TermsAndConditions/TermsAndConditions";
import ShippingPolicy from "./TermsAndConditions/ShippingPolicy";
import ReturnPolicy from "./TermsAndConditions/ReturnPolicy";
import PrivacyPolicy from "./TermsAndConditions/PrivacyPolicy";
import CountactUs from "./homepage/ContactUs";
import UploadFileList from "../tutor/UploadFileList";
import PrivateRoutes from "./PrivateRoutes";
import LoginPageNew from "./Auth/LoginPageNew";
import CallBack from "./Auth/CallBack";
import ExamPageNew from "../student/ExamPageNew";
import MyCourses from "../student/MyCourses";
import MyLearnings from "../student/MyLearnings";
import StudentDashboardNew from "../student/DashboardStudentNew";
import TutorDashboard from "../tutor/DashboardTutor";
import ExamInstructions from "../student/ExamInstructions";
// import StudentVideoSession from "../student/StudentVideoSession";
//import TutorRegistration from "../tutor/TutorRegistration";
import CreatePackage from "../tutor/CreatePackage";
import CreateExamNew from "../tutor/CreateExamNew";
import EditExam from "../tutor/EditExam";
import EditPack from "../tutor/EditPack";
import ViewPack from "../tutor/ViewPublishPack";
//import EditQuestions from "./components/EditQuestions";
import SubmittedPapersTable from "../tutor/SubmittedPapers";
import MyPacks from "../tutor/MyPacks";
import AddQuestions from "../tutor/AddQuestions";
import ReviewQuestions from "../tutor/ReviewQuestions";
// import TutorVideoSession from "../tutor/TutorVideoSession";
import ShoppingCartNew from "../purchase/ShoppingCartNew";
import CheckOut from "../purchase/CheckOut";
import PaymentConfirmation from "../purchase/PaymentConfirmation";
import SearchPaperPage from "./homepage/Papers/SearchPaperPage";
import SearchPackagesNew from "./homepage/Packages/SearchPackagesNew";
// import SearchPage from "./homepage/Packages/SearchPage";
//import Profile from "./Profile";
import ProfilePage from "./homepage/profile/ProfilePage";
import ExamTilesWithFeedback from "./homepage/Papers/ExamTilesWithFeedback";
import PackDetails from "./homepage/Packages/PackDetails";
import ResultsDisplay from "../student/ResultsDisplay";
import PersonalityReport from "../student/PersonalityReport";
import ReviewAnswers from "../student/ReviewAnswers";
// import CatchGames from "../Fun/CatchGames";
// import ChessGame from "../Fun/Chess/ChessGameWithComputer";

const CMERoutes: React.FC = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/catchgame" element={<CatchGames />} />
        <Route path="/chess" element={<ChessGame />} /> */}
        
        <Route path="/examdtls" element={<ExamTilesWithFeedback />} />
        <Route path="/packdtls" element={<PackDetails />} />
        <Route
          path="/uploadFile"
          element={
            <PrivateRoutes>
              {" "}
              <UploadFileList />{" "}
            </PrivateRoutes>
          }
        />

        {/* Redirecting to /login in both the url calls, login and logout. /logout is configutred in the callback */}
        <Route path="/login" element={<LoginPageNew />} />
        <Route path="/logout" element={<LoginPageNew />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      
        
        <Route path="/contact" element={<CountactUs />} />

        <Route path="/callback" element={<CallBack />} />
        <Route
          path="/exam"
          element={
            <PrivateRoutes>
              <ExamPageNew />
            </PrivateRoutes>
          }
        />
        <Route
          path="/result"
          element={
            <PrivateRoutes>
              <ResultsDisplay />{" "}
            </PrivateRoutes>
          }
        />
        <Route
          path="/personality-report"
          element={
            <PrivateRoutes>
              <PersonalityReport />{" "}
            </PrivateRoutes>
          }
        />

        <Route
          path="/reviewans"
          element={
            <PrivateRoutes>
              <ReviewAnswers />{" "}
            </PrivateRoutes>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoutes>
              <ProfilePage />
            </PrivateRoutes>
          }
        />

        <Route
          path="/mycourses"
          element={
            <PrivateRoutes>
              <MyCourses />
            </PrivateRoutes>
          }
        />
        
        <Route
          path="/mylearnings"
          element={
            <PrivateRoutes>
              <MyLearnings />
            </PrivateRoutes>
          }
        />

        <Route
          path="/dashboards"
          element={
            <PrivateRoutes>
              <StudentDashboardNew />
            </PrivateRoutes>
          }
        />
        <Route
          path="/dashboardtutor"
          element={
            <PrivateRoutes>
              <TutorDashboard />
            </PrivateRoutes>
          }
        />
        {/* <Route
          path="/tutorsession"
          element={
            <PrivateRoutes>
              <TutorVideoSession />
            </PrivateRoutes>
          }
        />
        <Route
          path="/studentsession"
          element={
            <PrivateRoutes>
              <StudentVideoSession />
             </PrivateRoutes>
          }
        /> */}

        {/* <Route
          path="/registertutor"
          element={
            <PrivateRoutes>
              <TutorRegistration />
            </PrivateRoutes>
          }
        /> */}
        <Route
          path="/createpackage"
          element={
            <PrivateRoutes>
              <CreatePackage />
            </PrivateRoutes>
          }
        />
        <Route
          path="/createexam"
          element={
            <PrivateRoutes>
              <CreateExamNew />
            </PrivateRoutes>
          }
        />
        <Route
          path="/editexam"
          element={
            <PrivateRoutes>
              <EditExam />
            </PrivateRoutes>
          }
        />
        <Route
          path="/editpack"
          element={
            <PrivateRoutes>
              <EditPack />
            </PrivateRoutes>
          }
        />
        <Route
          path="/viewpack"
          element={
            <PrivateRoutes>
              <ViewPack />
            </PrivateRoutes>
          }
        />
        {/* <Route path="/editquestions" element={<PrivateRoutes><EditQuestions /></PrivateRoutes>} /> */}
        <Route
          path="/addquestions"
          element={
            <PrivateRoutes>
              <AddQuestions />
            </PrivateRoutes>
          }
        />
        <Route
          path="/reviewquestions"
          element={
            <PrivateRoutes>
              <ReviewQuestions />
            </PrivateRoutes>
          }
        />
        
        <Route path="/cart" element={<ShoppingCartNew />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/confirmation" element={<PaymentConfirmation />} />
        <Route
          path="/submittedpapers"
          element={
            <PrivateRoutes>
              <SubmittedPapersTable />
            </PrivateRoutes>
          }
        />
        <Route
          path="/mypacks"
          element={
            <PrivateRoutes>
              <MyPacks />
            </PrivateRoutes>
          }
        />

        <Route
          path="/searchpaper"
          element={
            <PrivateRoutes>
              <SearchPaperPage />
            </PrivateRoutes>
          }
        />
        <Route
          path="/searchpack"
          element={
            <PrivateRoutes>
              <SearchPackagesNew />
            </PrivateRoutes>
          }
        />

        <Route
          path="/examinstructions"
          element={
            <PrivateRoutes>
              <ExamInstructions />
            </PrivateRoutes>
          }
        />
      </Routes>
  );
};

export default CMERoutes;

// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from './views/Home';

// function CMERoutes() {
//   return (

//       <Routes>
//         <Route exact path="/" element={<Home/>} />
//       </Routes>
//   );
// }
// export default CMERoutes;
