"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Box, Chip, CircularProgress, Button } from "@mui/material";
import { useFirebase } from "../layout";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

export default function ProfilePage() {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        setProfile(docSnap.exists() ? docSnap.data() : null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, db]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>You are not logged in.</Typography>
        <Link href="/login">
          <Button variant="contained" color="primary">Login</Button>
        </Link>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5">Profile not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, bgcolor: "#fff", textAlign: "center" }}>
        {user && user.email === "admin@skilllink.com" && (
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="secondary" href="/admin">Go to Admin Dashboard</Button>
          </Box>
        )}
        <Typography variant="h4" fontWeight={700} gutterBottom>Profile</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" color="primary.main">{profile.name}</Typography>
        <Typography variant="body1" color="text.secondary">{profile.email}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{profile.type === "student" ? "Student" : "Company"}</Typography>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Skills:</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center", mb: 2 }}>
          {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill: string, idx: number) => (
            <Chip key={idx} label={skill} color="secondary" />
          )) : <Typography variant="body2" color="text.secondary">No skills listed.</Typography>}
        </Box>
        <Typography variant="subtitle1" sx={{ color: "#FF5A5F", fontWeight: 700 }}>XP Points: <b>{profile.xpPoints}</b></Typography>
      </Paper>
    </Container>
  );
} 