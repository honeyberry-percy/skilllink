"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Box, Chip, CircularProgress, Button } from "@mui/material";
import { useFirebase } from "../layout";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

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
        <Link href="/login" passHref legacyBehavior>
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
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Profile</Typography>
        <Typography variant="h6" color="primary.main">{profile.name}</Typography>
        <Typography variant="body1" color="text.secondary">{profile.email}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{profile.type === "student" ? "Student" : "Company"}</Typography>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Skills:</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center", mb: 2 }}>
          {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill: string, idx: number) => (
            <Chip key={idx} label={skill} color="secondary" />
          )) : <Typography variant="body2" color="text.secondary">No skills listed.</Typography>}
        </Box>
        <Typography variant="subtitle1">XP Points: <b>{profile.xpPoints}</b></Typography>
      </Box>
    </Container>
  );
} 