import Header from "./Header";
import Home from "./Home";
import Services from "./Services";
import About from "./About";
import Pricing from "./Pricing";
import Location from "./Location";
import Contact from "./Contact";
import Footer from "./Footer";
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 ">
      <Header />
      <Home />
      <Services />
      <About />
      {/* <Pricing /> */}
      <Location />
      <Contact />
    </div>
  );
};

export default HomePage;
