import { io } from "socket.io-client";
import { API_BASE } from "./api";

export const connectSocket = () => io(API_BASE, { transports: ["websocket", "polling"] });
