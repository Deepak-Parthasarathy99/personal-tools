import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EmiCalculator from "./pages/EmiCalculator";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/emi-calculator" element={<EmiCalculator />} />
    </Routes>
  );
}

export default App;
