import { Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Papers from "./pages/Papers";
import PaperDetail from "./pages/PaperDetail";
import PaperProblem from "./pages/PaperProblem";
import Roadmap from "./pages/Roadmap";
import Reviews from "./pages/Reviews";
import Sponsors from "./pages/Sponsors";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="papers" element={<Papers />} />
        <Route path="papers/:paperId" element={<PaperDetail />} />
        <Route path="papers/:paperId/problems/:problemId" element={<PaperProblemRoute />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="sponsors" element={<Sponsors />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function PaperProblemRoute() {
  const { problemId } = useParams();
  return <PaperProblem key={problemId} />;
}
