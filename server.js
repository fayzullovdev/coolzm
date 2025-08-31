// coolzm/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const ADMIN_PWD = '846534673739926856353474';
const DATA = path.join(__dirname, 'data');
const FILE = path.join(DATA, 'reports.json');

const app = express();
app.use(cors());
app.use(express.json());

async function ensureFile() {
  await fsp.mkdir(DATA, { recursive: true });
  try { await fsp.access(FILE); }
  catch { await fsp.writeFile(FILE, JSON.stringify({ reports: [] }, null, 2)); }
}
async function readAll() {
  await ensureFile();
  const raw = await fsp.readFile(FILE, 'utf-8');
  return JSON.parse(raw || '{"reports":[]}');
}
async function writeAll(obj) { await fsp.writeFile(FILE, JSON.stringify(obj, null, 2)); }

app.get('/reports', async (req,res)=>{
  const db = await readAll();
  res.json({ reports: db.reports.sort((a,b)=> b.createdAt - a.createdAt) });
});

app.post('/reports', async (req,res)=>{
  const db = await readAll();
  const r = req.body;
  if (!r || !r.id) return res.status(400).json({error:'bad payload'});
  db.reports.unshift(r);
  await writeAll(db);
  res.json({ ok:true });
});

app.patch('/reports/:id', async (req,res)=>{
  if ((req.headers['x-admin-password']||'') !== ADMIN_PWD) return res.status(403).json({error:'forbidden'});
  const { id } = req.params;
  const patch = req.body || {};
  const db = await readAll();
  const i = db.reports.findIndex(x=>x.id === id);
  if (i === -1) return res.status(404).json({error:'not found'});
  db.reports[i] = { ...db.reports[i], ...patch, updatedAt: Date.now() };
  await writeAll(db);
  res.json({ ok:true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Reports server on http://localhost:'+PORT));
