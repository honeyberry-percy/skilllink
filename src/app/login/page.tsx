"use client";
import { useState } from "react";
import { Box, Button, Container, TextField, Typography, Alert, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 12 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, bgcolor: "#fff" }}>
        <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>Login</Typography>
          <Divider sx={{ mb: 2 }} />
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" color="primary" size="large" fullWidth>Login</Button>
          <Typography textAlign="center" variant="body2" sx={{ mt: 2 }}>
            Don&apos;t have an account? <MuiLink component={Link} href="/register">Register</MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 