import { notifications } from "../assets/DemoData";
import { Theme } from "../assets/Theme";
import DropDown from "./DropDown";

interface notificationProps {
  darkMode: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
}

const NotificationMobile: React.FC<notificationProps> = ({
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
      className={`max-w-80 left-43 z-0 -translate-x-82 flex-wrap translate-y-5 rounded-t-none ${
        darkMode ? Theme.dark.secondary : "bg-gray-500"
      }`}
      desClass={`w-60! flex-wrap!`}
    />
  );
};

export default NotificationMobile;
