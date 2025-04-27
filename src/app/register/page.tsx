"use client";
import { useState } from "react";
import { Box, Button, Container, TextField, Typography, Alert, Radio, RadioGroup, FormControlLabel, FormLabel, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        type: userType,
        skills: [],
        xpPoints: 0,
      });
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, bgcolor: "#fff" }}>
        <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>Register</Typography>
          <Divider sx={{ mb: 2 }} />
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required fullWidth />
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
          <FormLabel>User Type</FormLabel>
          <RadioGroup row value={userType} onChange={e => setUserType(e.target.value)}>
            <FormControlLabel value="student" control={<Radio />} label="Student" />
            <FormControlLabel value="company" control={<Radio />} label="Company" />
          </RadioGroup>
          <Button type="submit" variant="contained" color="primary" size="large" fullWidth>Register</Button>
          <Typography textAlign="center" variant="body2" sx={{ mt: 2 }}>
            Already have an account? <MuiLink component={Link} href="/login">Login</MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 