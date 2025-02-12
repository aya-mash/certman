"use client";
import { createContext } from "react";

export const ApplicationContext = createContext({
  keyAuthorization: "",
  onKeyAuthorizationChange: (keyAuthorization: string) =>
    console.info(keyAuthorization),
});
