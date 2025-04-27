"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Box, Chip, CircularProgress, TextField, Button, Card, CardContent, Stack, Paper, Divider } from "@mui/material";
import { useFirebase } from "../layout";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function TaskMarketplace() {
  const { db } = useFirebase();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      let q = collection(db, "tasks");
      const snapshot = await getDocs(q);
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchTasks();
  }, [db]);

  const filteredTasks = filter
    ? tasks.filter(task =>
        task.requiredSkills &&
        task.requiredSkills.some((skill: string) =>
          skill.toLowerCase().includes(filter.toLowerCase())
        )
      )
    : tasks;

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Task Marketplace</Typography>
      <Divider sx={{ mb: 3 }} />
      <TextField
        label="Filter by skill"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        fullWidth
        sx={{ mb: 4 }}
      />
      {loading ? (
        <Box sx={{ textAlign: "center", mt: 8 }}><CircularProgress /></Box>
      ) : filteredTasks.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: "center", color: "#888" }}>
          <Typography>No tasks found. Try a different skill or check back later!</Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {filteredTasks.map(task => (
            <Paper key={task.id} elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: "#fff" }}>
              <Typography variant="h6" fontWeight={600}>{task.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{task.description}</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {task.requiredSkills && task.requiredSkills.map((skill: string, idx: number) => (
                  <Chip key={idx} label={skill} size="small" color="secondary" />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: task.status === 'open' ? '#00A699' : task.status === 'assigned' ? '#FF5A5F' : '#484848', fontWeight: 700 }}>
                Status: {task.status}
              </Typography>
              <Button variant="outlined" size="small" sx={{ ml: 2 }} component={Link} href={`/tasks/${task.id}`}>
                Details
              </Button>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
} 