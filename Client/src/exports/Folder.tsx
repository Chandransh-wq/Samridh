import FolderDesktop from "../pages/FolderDesktop";
import FolderMobile from "../pages/FolderMobile";

interface FolderProps {
  darkMode: boolean;
}

const Folder: React.FC<FolderProps> = ({ darkMode }) => {
  return (
    <>
      {/* Desktop (md and up) */}
      <div className="hidden md:block">
        <FolderDesktop darkMode={darkMode} />
      </div>

      {/* Mobile (below md) */}
      <div className="block md:hidden">
        <FolderMobile darkMode={darkMode} />
      </div>
    </>
  );
};

export default Folder;
