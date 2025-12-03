import HomeDesktop from "../pages/HomeDesktop";
import HomeMobile from "../pages/HomeMobile";

interface HomeProps {
  darkMode: boolean;
}

const Home: React.FC<HomeProps> = ({ darkMode }) => {
  return (
    <>
      {/* Desktop (md and up) */}
      <div className="hidden md:block">
        <HomeDesktop darkMode={darkMode} />
      </div>

      {/* Mobile (below md) */}
      <div className="block md:hidden">
        <HomeMobile darkMode={darkMode} />
      </div>
    </>
  );
};

export default Home;
