import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Login from "./pages/Login";
import SplashScreen from "./pages/SplashScreen";
import ChooseRole from "./pages/ChooseRole";

import "./index.css";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col w-screen h-screen p-0 m-0">
        <Switch>
          {/* Redirect root to /splash */}
          <Route exact path="/">
            <Redirect to="/splash" />
          </Route>

          <Route path="/splash" component={SplashScreen} />
          <Route path="/chooserole" component={ChooseRole} />
          <Route path="/login" component={Login} />

          
        </Switch>
      </div>
    </Router>
  );
};

export default App;
