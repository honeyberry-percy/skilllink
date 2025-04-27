"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode, createContext, useContext } from "react";
import { auth, db } from "../firebaseConfig";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Nunito } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "700"] });

const FirebaseContext = createContext({ auth, db });
export const useFirebase = () => useContext(FirebaseContext);

function FirebaseProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider value={{ auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
}

const theme = createTheme({
  palette: {
    primary: { main: "#FF5A5F" },
    secondary: { main: "#484848" },
    background: { default: "#fff" },
    info: { main: "#00A699" },
  },
  typography: {
    fontFamily: `${nunito.style.fontFamily}, Arial, sans-serif`,
    button: { textTransform: "none", fontWeight: 700, borderRadius: 24 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          fontWeight: 700,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#fff",
          color: "#484848",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        },
      },
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${nunito.className} antialiased`}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <FirebaseProvider>
            <AppBar position="static" color="default" elevation={0} sx={{ mb: 4 }}>
              <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Typography variant="h6" color="primary" fontWeight={700} component={Link} href="/" sx={{ textDecoration: "none" }}>
                    SkillLink
                  </Typography>
                  <Button component={Link} href="/tasks" color="inherit">Tasks</Button>
                  <Button component={Link} href="/tasks/new" color="inherit">Post Task</Button>
                  <Button component={Link} href="/tasks/my" color="inherit">My Tasks</Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button component={Link} href="/profile" color="inherit">Profile</Button>
                  <Button component={Link} href="/login" color="inherit">Login</Button>
                  <Button component={Link} href="/register" color="inherit">Register</Button>
                </Box>
              </Toolbar>
            </AppBar>
            {children}
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
