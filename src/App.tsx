import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/test" element={<Test />} /> */}
      </Routes>
    </div>
  );
};

export default App;
