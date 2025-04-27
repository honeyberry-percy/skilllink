"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Box, Chip, CircularProgress, Button, Stack, Paper, Divider } from "@mui/material";
import { useFirebase } from "../layout";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function ProfilePage() {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        setProfile(docSnap.exists() ? docSnap.data() : null);
        // Fetch completed tasks for students
        getDocs(collection(db, "tasks")).then(snapshot => {
          const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
          setTaskHistory(allTasks.filter(t => t.status === "completed" && t.assignedTo === firebaseUser.uid));
        });
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
        {profile.type === "student" && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }}>Task History</Divider>
            {taskHistory.length === 0 ? (
              <Typography color="text.secondary">No completed tasks yet.</Typography>
            ) : (
              <Stack spacing={2}>
                {taskHistory.map(task => (
                  <Paper key={task.id} elevation={1} sx={{ p: 2, borderRadius: 3, bgcolor: "#FAFAFA" }}>
                    <Typography variant="subtitle1" fontWeight={700}>{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                    <CompanyInfo companyId={task.postedBy} />
                    <Typography variant="body2" sx={{ color: '#FF5A5F', fontWeight: 700 }}>XP: 100</Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

// Helper component to show company info
function CompanyInfo({ companyId }: { companyId: string }) {
  const { db } = useFirebase();
  const [company, setCompany] = useState<any>(null);
  useEffect(() => {
    getDoc(doc(db, "users", companyId)).then(snap => {
      setCompany(snap.exists() ? snap.data() : null);
    });
  }, [db, companyId]);
  if (!company) return <Typography variant="body2">Loading company info...</Typography>;
  return (
    <Typography variant="body2" sx={{ mt: 1 }}>
      Company: {company.name} ({company.email})
    </Typography>
  );
} 