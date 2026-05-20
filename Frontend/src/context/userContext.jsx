import { createContext, useContext, useState, useEffect } from "react";

export const userContext = createContext(null);

export const UserProvider = ({ children }) => {
  // 1. Try to get the user from LocalStorage first. 
  // If it exists, use it. If not, start as null.

  const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            return null;
        }
    });

  // 2. Whenever 'user' changes (login or logout), save it to LocalStorage automatically
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
};

export const getData = () => useContext(userContext);