
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Login from "./pages/Login";
import Register from "./pages/Register";
import SplashScreen from "./pages/SplashScreen";
import ChooseRole from "./pages/ChooseRole";

import "./index.css";

// Fade animation for splash screen
const splashVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const splashTransition = {
  duration: 0.6,
  ease: "easeInOut",
};

// Slide from right for choose role
const chooseRoleVariants = {
  initial: { opacity: 0, x: "100%" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "-50%" },
};

const chooseRoleTransition = {
  type: "spring",
  stiffness: 260,
  damping: 25,
};

// Slide up with scale for login
const loginVariants = {
  initial: { opacity: 0, y: "100%", scale: 0.9 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: "-50%", scale: 0.95 },
};

const loginTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location.pathname}>
        <Route exact path="/">
          <Redirect to="/splash" />
        </Route>
        <Route path="/splash">
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={splashVariants}
            transition={splashTransition}
            className="h-full"
          >
            <SplashScreen />
          </motion.div>
        </Route>
        <Route path="/chooserole">
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={chooseRoleVariants}
            transition={chooseRoleTransition}
            className="h-full"
          >
            <ChooseRole />
          </motion.div>
        </Route>
        <Route path="/login">
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={loginVariants}
            transition={loginTransition}
            className="h-full"
          >
            <Login />
          </motion.div>
        </Route>
        <Route path="/register">
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={loginVariants}
            transition={loginTransition}
            className="h-full"
          >
            <Register />
          </motion.div>
        </Route>
      </Switch>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <div className="flex flex-col w-screen h-screen p-0 m-0">
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default App;
