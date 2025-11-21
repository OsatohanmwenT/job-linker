import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
    API_BASE_URL: process.env.API_BASE_URL,
    API_KEY: process.env.API_KEY,
}