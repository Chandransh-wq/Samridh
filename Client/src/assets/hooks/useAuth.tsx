import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../Services/auth.service";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("tokens", data.token);
      // Redirect or update global state here
    },
  });
};
