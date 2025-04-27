"use client";
import { Button, Container, Typography, Box } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h2" fontWeight={700} gutterBottom color="primary.main">
          SkillLink
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Connect with real companies. Gain XP. Build your future.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Micro-internships for students. Real tasks, real experience, real rewards.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Link href="/login" passHref legacyBehavior>
            <Button variant="contained" color="primary" size="large">Login</Button>
          </Link>
          <Link href="/register" passHref legacyBehavior>
            <Button variant="outlined" color="primary" size="large">Register</Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
