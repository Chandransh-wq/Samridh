import MapDesktop from "../pages/MapDesktop";
import MapMobile from "../pages/MapMobile";

interface MapProps {
  darkMode: boolean;
}

const Map: React.FC<MapProps> = ({ darkMode }) => {
  return (
    <>
      {/* Desktop (md and up) */}
      <div className="hidden md:block">
        <MapDesktop darkMode={darkMode} />
      </div>

      {/* Mobile (below md) */}
      <div className="block md:hidden">
        <MapMobile darkMode={darkMode} />
      </div>
    </>
  );
};

export default Map;
