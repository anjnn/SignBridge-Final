import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Recognizer from "./pages/Recognizer";

function App() {
return ( <BrowserRouter> <Routes>
<Route path="/" element={<Home />} />
<Route path="/recognizer" element={<Recognizer />} /> </Routes> </BrowserRouter>
);
}

export default App;
