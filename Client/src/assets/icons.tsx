import {
  FaExclamationCircle, // Urgent
  FaInfoCircle, // Info
  FaCheckCircle, // Success
  FaExclamationTriangle, // Warning
} from "react-icons/fa";

export function iconGive(type: string, darkMode: boolean) {
  const fill = darkMode ? "white" : "black";

  switch (type) {
    case "Urgent":
      return <FaExclamationCircle fill={fill} size={24} />;

    case "Info":
      return <FaInfoCircle fill={fill} size={24} />;

    case "Success":
      return <FaCheckCircle fill={fill} size={24} />;

    case "Warning":
      return <FaExclamationTriangle fill={fill} size={24} />;

    default:
      return null;
  }
}

export function color(type: string) {
  switch (type) {
    case "Urgent":
      return "bg-red-500";

    case "Info":
      return "bg-blue-500";

    case "Success":
      return "bg-green-500";

    case "Warning":
      return "bg-yellow-500";

    default:
      return "bg-gray-500";
  }
}
