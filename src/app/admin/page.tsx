"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Box, Card, CardContent, CircularProgress, Stack, Alert, Divider, Paper } from "@mui/material";
import { useFirebase } from "../layout";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const { db, auth } = useFirebase();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!user || user.email !== "admin@skilllink.com") return;
    const fetchData = async () => {
      setLoading(true);
      const usersSnap = await getDocs(collection(db, "users"));
      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const tasksSnap = await getDocs(collection(db, "tasks"));
      setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();
  }, [user, db]);

  if (!user) {
    return <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}><CircularProgress /></Container>;
  }
  if (user.email !== "admin@skilllink.com") {
    return <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}><Alert severity="error">Access denied. Admins only.</Alert></Container>;
  }
  if (loading) {
    return <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}><CircularProgress /></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, bgcolor: "#fff", textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">Admin Dashboard</Typography>
        <Divider sx={{ my: 3 }}>Users</Divider>
        <Stack spacing={2}>
          {users.map(u => (
            <Paper key={u.id} elevation={1} sx={{ p: 2, borderRadius: 3, bgcolor: "#FAFAFA" }}>
              <Typography variant="h6">{u.name} ({u.type})</Typography>
              <Typography variant="body2">Email: {u.email}</Typography>
              <Typography variant="body2" sx={{ color: "#FF5A5F", fontWeight: 700 }}>XP: {u.xpPoints}</Typography>
            </Paper>
          ))}
        </Stack>
        <Divider sx={{ my: 3 }}>Tasks</Divider>
        <Stack spacing={2}>
          {tasks.map(t => (
            <Paper key={t.id} elevation={1} sx={{ p: 2, borderRadius: 3, bgcolor: "#FAFAFA" }}>
              <Typography variant="h6">{t.title}</Typography>
              <Typography variant="body2" sx={{ color: t.status === 'open' ? '#00A699' : t.status === 'assigned' ? '#FF5A5F' : '#484848', fontWeight: 700 }}>Status: {t.status}</Typography>
              <Typography variant="body2">Assigned To: {t.assignedTo || "-"}</Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
} 