import homepage from "./en-includes/homepage";
import dashboard from "./en-includes/dashboard";

const messages = {
  common: {
    brand: "Skrambol",
    login: "Login",
    about: "About",
  },
  ...homepage,
  ...dashboard,
};

export default messages;
