"use client";

import { createContext, useContext } from "react";

// A server-rendered portfolio may be passed through the gate without becoming
// a client component. Only its interactive islands consume this signal.
export const EntranceContext = createContext(false);
export const useEntranceActive = () => useContext(EntranceContext);
