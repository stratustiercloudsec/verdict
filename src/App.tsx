import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import ProductionSuccessEstimator from './pages/Form/ProductionSuccessEstimator';
import CoverageReport from './pages/Form/CoverageReport';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import CoveragePortfolio from "./pages/CoveragePortfolio";
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import EstimatorDetail  from './pages/EstimatorDetail';
import AuditDetail  from './pages/AuditDetail';
import SuccessEstimatorPortfolio  from './pages/SuccessEstimatorPortfolio';
import ProductVision from './pages/ProductVision';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import SubmissionSuccess from './pages/SubmissionSuccess';

// 1. Import your new MainPage component
import MainPage from './pages/MainPage'; 

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <DefaultLayout>
      <Routes>
        {/* 2. Set MainPage as the default Home route */}
        <Route
          index
          element={
            <>
              <PageTitle title="Home | Verdict - Greenlight Production Intelligence Platform" />
              <MainPage />
            </>
          }
        />

        {/* 3. Keep ECommerce accessible via /dashboard for your sidebar links */}
        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="eCommerce Dashboard | Verdict - Greenlight Production Intelligence Platform" />
              <ECommerce />
            </>
          }
        />

        <Route
          path="/calendar"
          element={
            <>
              <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Calendar />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Profile | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Profile />
            </>
          }
        />
        <Route
          path="/forms/form-elements"
          element={
            <>
              <PageTitle title="Form Elements | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <FormElements />
            </>
          }
        />
        <Route
          path="/forms/form-layout"
          element={
            <>
              <PageTitle title="Form Layout | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <FormLayout />
            </>
          }
        />
        <Route
          path="/forms/production-success-estimator"
          element={
            <>
              <PageTitle title="Production Success Estimator | Verdict - Greenlight Production Intelligence Platform" />
              <ProductionSuccessEstimator /> 
            </>
          }
        />
        <Route
          path="/forms/coverage-report"
          element={
            <>
              <PageTitle title="Coverage Report| Verdict - Greenlight Production Intelligence Platform" />
              <CoverageReport /> 
            </>
          }
        /> 
        <Route
          path="/forms/coverage-portfolio"
          element={
            <>
              <PageTitle title="Coverage Portfolio | Verdict - Greenlight Production Intelligence Platform" />
              <CoveragePortfolio /> 
            </>
          }
        /> 
        <Route 
          path="/estimator-detail/:auditId" 
          element={
            <>
               <PageTitle title="Estimator Detail | Verdict - Greenlight Production Intelligence Platform" />
               <EstimatorDetail/>
            </>
          }
        />
        <Route 
          path="/audit-detail/:auditId" 
          element={
            <>
               <PageTitle title="Audit Detail | Verdict - Greenlight Production Intelligence Platform" />
               <AuditDetail/>
            </>
          }
        />
        <Route 
          path="/success-estimator-portfolio" 
          element={
            <>
               <PageTitle title="Success Estimator Portfolio | Verdict - Greenlight Production Intelligence Platform" />
               <SuccessEstimatorPortfolio/>
            </>
          }
        />
        <Route
          path="/product-vision"
          element={
            <>
              <PageTitle title="Product Vision | Verdict - Greenlight Production Intelligence Platform" />
              <ProductVision />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <PageTitle title="Contact StratusTier | Verdict AI" />
              <Contact />
            </>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <>
              <PageTitle title="Product Vision | Verdict - Greenlight Production Intelligence Platform" />
              <TermsOfService />
            </>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <>
              <PageTitle title="Product Vision | Verdict - Greenlight Production Intelligence Platform" />
              <PrivacyPolicy />
            </>
          }
        />
        <Route
          path="/contact/success"
          element={
            <>
              <PageTitle title="Submission Success | Verdict - Greenlight Production Intelligence Platform" />
              <SubmissionSuccess />
            </>
          }
        />
        <Route
          path="/tables"
          element={
            <>
              <PageTitle title="Tables | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Tables />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Settings />
            </>
          }
        />
        <Route
          path="/chart"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Chart />
            </>
          }
        />
        <Route
          path="/ui/alerts"
          element={
            <>
              <PageTitle title="Alerts | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Alerts />
            </>
          }
        />
        <Route
          path="/ui/buttons"
          element={
            <>
              <PageTitle title="Buttons | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Buttons />
            </>
          }
        />
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="Signup | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <SignUp />
            </>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;