import { notifications } from "../assets/DemoData";
import { Theme } from "../assets/Theme";
import DropDown from "./DropDown";

interface notificationProps {
  darkMode: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
}

const Notification: React.FC<notificationProps> = ({
  darkMode,
  open,
  setOpen,
}) => {
  return (
    <DropDown
      darkMode={darkMode}
      open={open}
      setOpen={setOpen}
      elements={notifications}
      title="Notifications"
      className={`-translate-x-82 w-[calc(100%-1rem)] z-0  flex-wrap translate-y-5 rounded-t-none ${
        darkMode ? Theme.dark.secondary : "bg-gray-500"
      }`}
    />
  );
};

export default Notification;
