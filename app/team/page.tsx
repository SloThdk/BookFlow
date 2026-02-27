"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appt { id: string; time: string; client: string; service: string; barber: string; duration: number; notes?: string; }
interface Msg   { id: string; sender: string; text: string; ts: number; }
interface Swap  { id: string; barber: string; apptId: string; time: string; service: string; client: string; duration: number; targetBarber: string; note: string; ts: number; claimedBy?: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAM = [
  { name: "Marcus", fullName: "Marcus Holst",   role: "Senior Barber",           color: "#B8985A",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face" },
  { name: "Emil",   fullName: "Emil Strand",    role: "Barber",                  color: "#7BA3C4",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face" },
  { name: "Sofia",  fullName: "Sofia Krag",     role: "Barber & Farvespecialist", color: "#C49BBF",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face" },
] as const;

const MANAGER = { name: "Manager", fullName: "Nordklip — Ejeren", role: "Ejer", color: "#B8985A",
  photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop&crop=face" };

type MemberName = "Marcus" | "Emil" | "Sofia";
const MEMBER = Object.fromEntries(TEAM.map(m => [m.name, m])) as Record<MemberName, typeof TEAM[number]>;

const SVC_COLOR: Record<string, string> = {
  "Classic Cut": "#B8985A", "Beard Sculpt": "#7BA3C4", "Cut & Beard": "#C4977A",
  "Hot Towel Shave": "#7BBFA5", "Junior Cut": "#A0B89A", "Farve & Stil": "#C49BBF",
};

const SCHEDULE_BASE: Appt[] = [
  { id:"a1", time:"09:00", client:"Casper Møller",    service:"Classic Cut",     barber:"Marcus", duration:45 },
  { id:"a2", time:"10:00", client:"Erik Svendsen",    service:"Beard Sculpt",    barber:"Emil",   duration:30 },
  { id:"a3", time:"10:30", client:"Laura Winther",    service:"Farve & Stil",    barber:"Sofia",  duration:90, notes:"Fuld highlights, lappetest udført" },
  { id:"a4", time:"11:00", client:"Viktor Hansen",    service:"Classic Cut",     barber:"Marcus", duration:45 },
  { id:"a5", time:"11:30", client:"Frederik Lund",    service:"Cut & Beard",     barber:"Emil",   duration:70 },
  { id:"a6", time:"13:00", client:"Nikolaj Borg",     service:"Hot Towel Shave", barber:"Marcus", duration:40 },
  { id:"a7", time:"13:30", client:"Anna Kristiansen", service:"Farve & Stil",    barber:"Sofia",  duration:90 },
  { id:"a8", time:"14:30", client:"Daniel Westh",     service:"Classic Cut",     barber:"Emil",   duration:45 },
  { id:"a9", time:"15:30", client:"Sofie Andersen",   service:"Junior Cut",      barber:"Marcus", duration:30 },
  { id:"a10",time:"16:00", client:"Magnus Brandt",    service:"Beard Sculpt",    barber:"Emil",   duration:30 },
  { id:"a11",time:"17:00", client:"Jakob Møller",     service:"Cut & Beard",     barber:"Marcus", duration:70, notes:"Foretrækker kun saks, ingen maskine" },
];

const WORK_HOURS: Record<string, Record<string, string>> = {
  Marcus: { Man:"09:00–17:30", Tir:"09:00–17:30", Ons:"09:00–17:30", Tor:"09:00–17:30", Fre:"09:00–17:30", Lør:"10:00–15:00", Søn:"Fri" },
  Emil:   { Man:"09:00–17:30", Tir:"09:00–17:30", Ons:"11:00–19:30", Tor:"11:00–19:30", Fre:"09:00–17:30", Lør:"10:00–15:00", Søn:"Fri" },
  Sofia:  { Man:"10:00–18:30", Tir:"10:00–18:30", Ons:"10:00–18:30", Tor:"10:00–18:30", Fre:"10:00–18:30", Lør:"10:00–16:00", Søn:"Fri" },
};

// ─── Storage ───────────────────────────────────────────────────────────────────
function chatKey(a: string, b: string) {
  if (a === "all")     return "bf_chat_all";
  if (b === "Manager") return `bf_dm_${a.toLowerCase()}_manager`;
  const [x, y] = [a, b].sort();
  return `bf_dm_${x.toLowerCase()}_${y.toLowerCase()}`;
}
function loadLS<T>(key: string, fb: T): T { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function saveLS(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }
function uid() { return Math.random().toString(36).slice(2,10); }
function timeFmt(ts: number) { return new Date(ts).toLocaleTimeString("da-DK", { hour:"2-digit", minute:"2-digit" }); }
function getNow() { const n=new Date(); return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`; }
function getToday() { return new Date().toLocaleDateString("da-DK", { weekday:"long", day:"numeric", month:"long" }); }

// ─── Login ─────────────────────────────────────────────────────────────────────
function TeamLogin({ onLogin }: { onLogin:(n:string)=>void }) {
  const [sel, setSel] = useState<string|null>(null);
  const [pin, setPin] = useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  function submit(e:React.FormEvent) {
    e.preventDefault();
    if (!sel||!pin.trim()){setErr("Vælg dit navn og skriv en pinkode.");return;}
    setLoading(true); setTimeout(()=>{setLoading(false);onLogin(sel);},700);
  }
  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"25%",left:"50%",transform:"translateX(-50%)",width:"600px",height:"400px",background:"radial-gradient(ellipse,rgba(74,222,128,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:"420px",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <span style={{fontFamily:"var(--font-playfair)",fontSize:"30px",fontWeight:700,color:"var(--text)"}}>Nordklip</span>
          <div style={{marginTop:"8px",display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:"4px",padding:"3px 10px"}}>
            <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#4ade80"}}/>
            <span style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"#4ade80"}}>Team Portal</span>
          </div>
        </div>
        <div style={{background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"14px",padding:"28px",boxShadow:"0 24px 80px rgba(0,0,0,0.4)"}}>
          <h1 style={{fontSize:"16px",fontWeight:700,color:"var(--text)",marginBottom:"4px"}}>Log ind som medarbejder</h1>
          <p style={{fontSize:"12px",color:"var(--text-muted)",marginBottom:"22px"}}>Vælg dit navn og indtast din pinkode.</p>
          <div style={{display:"flex",gap:"10px",marginBottom:"20px"}}>
            {TEAM.map(m=>(
              <button key={m.name} onClick={()=>{setSel(m.name);setErr("");}} style={{
                flex:1,padding:"12px 8px",borderRadius:"10px",cursor:"pointer",
                background:sel===m.name?`${m.color}14`:"var(--surface-2)",
                border:`1px solid ${sel===m.name?m.color+"44":"var(--border-strong)"}`,
                display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",transition:"all 0.12s",
              }}>
                <img src={m.photo} alt={m.name} style={{width:"44px",height:"44px",borderRadius:"50%",objectFit:"cover",border:`2px solid ${sel===m.name?m.color:"var(--border-strong)"}`,opacity:sel===m.name?1:0.6}}/>
                <span style={{fontSize:"12px",fontWeight:sel===m.name?700:500,color:sel===m.name?"var(--text)":"var(--text-muted)"}}>{m.name}</span>
              </button>
            ))}
          </div>
          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div>
              <label style={{display:"block",fontSize:"10px",fontWeight:700,color:"var(--text-muted)",marginBottom:"7px",letterSpacing:"0.08em",textTransform:"uppercase" as const}}>Pinkode</label>
              <input type="password" placeholder="••••" value={pin} onChange={e=>{setPin(e.target.value);setErr("");}} style={{letterSpacing:"0.3em",fontSize:"18px"}}/>
              {err&&<p style={{fontSize:"12px",color:"#ef4444",marginTop:"5px"}}>{err}</p>}
            </div>
            <button type="submit" disabled={loading||!sel} style={{
              background:loading||!sel?"var(--surface-2)":"#4ade80",
              color:loading||!sel?"var(--text-muted)":"#0A0A0A",
              border:"none",borderRadius:"8px",padding:"13px 24px",fontSize:"14px",fontWeight:700,
              cursor:loading||!sel?"default":"pointer",transition:"all 0.15s",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            }}>
              {loading?<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{animation:"spin 0.7s linear infinite"}}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/></svg>Logger ind...</>:"Log ind"}
            </button>
          </form>
          <div style={{marginTop:"14px",padding:"10px 12px",background:"rgba(74,222,128,0.05)",border:"1px solid rgba(74,222,128,0.12)",borderRadius:"8px"}}>
            <p style={{fontSize:"11px",color:"var(--text-muted)",margin:0,lineHeight:1.55}}>
              <span style={{color:"#4ade80",fontWeight:600}}>Demo — </span>vælg et navn og skriv en vilkårlig pinkode.
            </p>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:"16px"}}>
          <Link href="/owner" style={{fontSize:"12px",color:"var(--text-muted)",textDecoration:"none"}}>Ejer? Log ind via ejersystemet →</Link>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ─── ApptRow ───────────────────────────────────────────────────────────────────
function ApptRow({ appt, myName, isPast, onOfferSwap, swapOffered }: {
  appt: Appt; myName: string; isPast: boolean;
  onOfferSwap?: ()=>void; swapOffered?: boolean;
}) {
  const [open,setOpen]=useState(false);
  const color = SVC_COLOR[appt.service]||"#B8985A";
  const mc = MEMBER[appt.barber as MemberName]?.color||"var(--gold)";
  const isMe = appt.barber===myName;
  return (
    <div style={{background:isMe?`${mc}0A`:"var(--surface)",border:`1px solid ${isMe?mc+"33":"var(--border-strong)"}`,borderRadius:"8px",overflow:"hidden",opacity:isPast?0.45:1,transition:"all 0.25s"}}>
      <div style={{display:"flex",alignItems:"center",cursor:appt.notes?"pointer":"default"}} onClick={()=>appt.notes&&setOpen(o=>!o)}>
        <div style={{width:"68px",flexShrink:0,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"13px 8px",background:"rgba(0,0,0,0.15)",gap:"2px"}}>
          <span style={{fontFamily:"var(--font-playfair)",fontSize:"15px",fontWeight:700,color:isPast?"var(--text-muted)":"var(--text)"}}>{appt.time}</span>
          <span style={{fontSize:"9px",color:"var(--text-muted)"}}>{appt.duration} min</span>
        </div>
        <div style={{flex:1,padding:"12px 16px",minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:color,display:"inline-block"}}/>
            <span style={{fontFamily:"var(--font-playfair)",fontSize:"13px",fontWeight:700,color:"var(--text)"}}>{appt.service}</span>
          </div>
          <span style={{fontSize:"12px",color:"var(--text-secondary)"}}>{appt.client}</span>
          {appt.notes&&<div style={{marginTop:"2px",fontSize:"10px",color:"var(--text-muted)",fontStyle:"italic"}}>Bemærkning</div>}
        </div>
        <div style={{padding:"12px 14px",borderLeft:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"center",gap:"8px"}}>
          <img src={MEMBER[appt.barber as MemberName]?.photo} alt={appt.barber} style={{width:"28px",height:"28px",borderRadius:"50%",objectFit:"cover",border:`1px solid ${mc}55`}}/>
          <span style={{fontSize:"11px",fontWeight:600,color:isMe?mc:"var(--text-muted)"}}>{appt.barber}</span>
        </div>
        {isMe&&!isPast&&onOfferSwap&&(
          <button onClick={e=>{e.stopPropagation();onOfferSwap();}} style={{
            margin:"8px 12px 8px 0",
            background:swapOffered?"rgba(74,222,128,0.1)":"var(--surface-2)",
            border:`1px solid ${swapOffered?"rgba(74,222,128,0.35)":"var(--border-strong)"}`,
            borderRadius:"6px",padding:"5px 10px",fontSize:"10px",fontWeight:600,
            color:swapOffered?"#4ade80":"var(--text-secondary)",cursor:"pointer",whiteSpace:"nowrap",
          }}>{swapOffered?"Byt tilbudt":"Tilbyd byt"}</button>
        )}
      </div>
      {open&&appt.notes&&(
        <div style={{padding:"9px 16px",borderTop:"1px solid var(--border)",background:"rgba(184,152,90,0.04)",display:"flex",gap:"8px"}}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,marginTop:"1px",color:"var(--gold)"}}><path d="M2 2h8v7H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><line x1="4" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.1"/><line x1="4" y1="7" x2="7" y2="7" stroke="currentColor" strokeWidth="1.1"/></svg>
          <p style={{fontSize:"12px",color:"var(--text-secondary)",margin:0,lineHeight:1.55}}>{appt.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Swap Modal ────────────────────────────────────────────────────────────────
function SwapModal({ appt, myName, onClose, onConfirm }: { appt:Appt; myName:string; onClose:()=>void; onConfirm:(target:string,note:string)=>void; }) {
  const [target,setTarget]=useState<string|null>(null);
  const [note,setNote]=useState("");
  const others = TEAM.filter(m=>m.name!==myName);
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"14px",width:"100%",maxWidth:"440px",padding:"28px",boxShadow:"0 32px 80px rgba(0,0,0,0.6)"}}>
        <div style={{fontFamily:"var(--font-playfair)",fontSize:"17px",fontWeight:700,color:"var(--text)",marginBottom:"4px"}}>Tilbyd vagtbyt</div>
        <div style={{fontSize:"12px",color:"var(--text-muted)",marginBottom:"22px"}}>{appt.service} · {appt.time} · {appt.client}</div>

        <div style={{marginBottom:"18px"}}>
          <label style={{display:"block",fontSize:"10px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:"10px"}}>Hvem vil du tilbyde vagten til?</label>
          <div style={{display:"flex",gap:"10px"}}>
            {others.map(m=>(
              <button key={m.name} onClick={()=>setTarget(m.name)} style={{
                flex:1,padding:"12px 8px",borderRadius:"10px",cursor:"pointer",
                background:target===m.name?`${m.color}14`:"var(--surface-2)",
                border:`1px solid ${target===m.name?m.color+"55":"var(--border-strong)"}`,
                display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",transition:"all 0.12s",
              }}>
                <img src={m.photo} alt={m.name} style={{width:"38px",height:"38px",borderRadius:"50%",objectFit:"cover",border:`2px solid ${target===m.name?m.color:"var(--border-strong)"}`,opacity:target===m.name?1:0.65}}/>
                <span style={{fontSize:"12px",fontWeight:target===m.name?700:400,color:target===m.name?"var(--text)":"var(--text-muted)"}}>{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:"18px"}}>
          <label style={{display:"block",fontSize:"10px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase" as const,letterSpacing:"0.08em",marginBottom:"8px"}}>Besked (valgfri)</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="F.eks. 'Kan du tage denne? Tandlæge kl. 14'" style={{width:"100%",minHeight:"70px",background:"var(--surface-2)",border:"1px solid var(--border-strong)",borderRadius:"8px",color:"var(--text)",fontSize:"13px",padding:"10px 12px",resize:"vertical",boxSizing:"border-box" as const}}/>
        </div>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={onClose} style={{flex:1,padding:"11px",background:"var(--surface-2)",border:"1px solid var(--border-strong)",borderRadius:"8px",color:"var(--text-secondary)",fontSize:"13px",cursor:"pointer"}}>Annuller</button>
          <button disabled={!target} onClick={()=>target&&onConfirm(target,note)} style={{
            flex:2,padding:"11px",background:target?"#4ade80":"var(--surface-2)",
            border:"none",borderRadius:"8px",color:target?"#0A0A0A":"var(--text-muted)",
            fontSize:"13px",fontWeight:700,cursor:target?"pointer":"default",transition:"all 0.15s",
          }}>Send vagtbyt-forespørgsel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ myName }: { myName: string }) {
  type Contact = "all" | "Manager" | MemberName;
  const [contact, setContact] = useState<Contact>("all");
  const [allMsgs, setAllMsgs] = useState<Record<string, Msg[]>>({});
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const member = MEMBER[myName as MemberName]!;

  const key = chatKey(myName, contact === "all" ? "all" : contact);
  const msgs = allMsgs[key] || [];

  useEffect(()=>{
    if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight;
  }, [msgs]);

  function send() {
    if(!input.trim()) return;
    const m: Msg = { id:uid(), sender:myName, text:input.trim(), ts:Date.now() };
    setAllMsgs(prev => ({ ...prev, [key]: [...(prev[key] || []), m] }));
    setInput("");
  }

  const contacts: { id: Contact; label: string; sublabel: string; color: string; photo?: string }[] = [
    { id:"all", label:"Alle", sublabel:"Hele teamet", color:"#4ade80",
      photo:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&h=120&fit=crop" },
    ...TEAM.filter(m=>m.name!==myName).map(m=>({ id:m.name as Contact, label:m.name, sublabel:m.role, color:m.color, photo:m.photo })),
    { id:"Manager", label:"Manager", sublabel:"Nordklip — Ejeren", color:MANAGER.color, photo:MANAGER.photo },
  ];

  const currentContact = contacts.find(c=>c.id===contact);
  const getSenderPhoto = (sender: string) => {
    if(sender===myName) return member.photo;
    const tm = TEAM.find(m=>m.name===sender);
    return tm?.photo || MANAGER.photo;
  };
  const getSenderColor = (sender: string) => {
    const tm = TEAM.find(m=>m.name===sender);
    return tm?.color || MANAGER.color;
  };

  return (
    <div style={{display:"flex",height:"calc(100vh - 58px)",background:"var(--bg)"}}>
      {/* Sidebar */}
      <div style={{width:"220px",flexShrink:0,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",background:"var(--surface)"}}>
        <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)"}}>
          <p style={{fontSize:"10px",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase" as const,letterSpacing:"0.08em",margin:0}}>Samtaler</p>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
          {contacts.map(c=>{
            const active = contact===c.id;
            const dmKey = chatKey(myName, c.id==="all"?"all":c.id as string);
            const dmMsgs = allMsgs[dmKey] || [];
            const lastMsg = dmMsgs[dmMsgs.length-1];
            return (
              <button key={c.id} onClick={()=>setContact(c.id)} style={{
                width:"100%",display:"flex",alignItems:"center",gap:"10px",padding:"9px 10px",
                borderRadius:"8px",background:active?`${c.color}14`:"transparent",
                border:`1px solid ${active?c.color+"33":"transparent"}`,
                cursor:"pointer",transition:"all 0.1s",textAlign:"left",
              }}>
                <div style={{position:"relative",flexShrink:0}}>
                  <img src={c.photo} alt={c.label} style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover",border:`1px solid ${active?c.color+"55":"var(--border-strong)"}`}}/>
                  {c.id==="all"&&<div style={{position:"absolute",bottom:0,right:0,width:"10px",height:"10px",borderRadius:"50%",background:"#4ade80",border:"2px solid var(--surface)"}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"12px",fontWeight:active?700:500,color:active?"var(--text)":"var(--text-secondary)",marginBottom:"1px"}}>{c.label}</div>
                  <div style={{fontSize:"10px",color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"120px"}}>{lastMsg?lastMsg.text:c.sublabel}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{padding:"12px",borderTop:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <img src={member.photo} alt={myName} style={{width:"28px",height:"28px",borderRadius:"50%",objectFit:"cover",border:`1px solid ${member.color}55`}}/>
            <div>
              <div style={{fontSize:"11px",fontWeight:600,color:"var(--text)"}}>{myName}</div>
              <div style={{fontSize:"10px",color:"var(--text-muted)"}}>{member.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Chat header */}
        <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",background:"var(--surface)",display:"flex",alignItems:"center",gap:"12px"}}>
          {currentContact?.photo&&<img src={currentContact.photo} alt={currentContact.label} style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover",border:`1px solid ${currentContact.color}44`}}/>}
          <div>
            <div style={{fontSize:"14px",fontWeight:700,color:"var(--text)"}}>{currentContact?.label}</div>
            <div style={{fontSize:"11px",color:"var(--text-muted)"}}>{currentContact?.sublabel}{contact==="Manager"&&" · Svarer inden for 24 timer"}</div>
          </div>
          {contact==="all"&&(
            <div style={{marginLeft:"auto",display:"flex",gap:"6px"}}>
              {TEAM.map(m=><img key={m.name} src={m.photo} alt={m.name} style={{width:"22px",height:"22px",borderRadius:"50%",objectFit:"cover",border:`1px solid ${m.color}44`}}/>)}
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:"12px"}}>
          <div style={{textAlign:"center",padding:"6px 12px",background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:"6px",marginBottom:"4px"}}>
            <p style={{fontSize:"11px",color:"var(--text-muted)",margin:0}}>Beskeder gemmes ikke — chat-historik er ikke aktiv i demo</p>
          </div>
          {msgs.length===0&&(
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"200px"}}>
              <p style={{fontSize:"13px",color:"var(--text-muted)",textAlign:"center"}}>
                {contact==="all"?"Ingen beskeder til teamet endnu. Skriv noget!":contact==="Manager"?`Skriv til ejeren — svar inden for 24 timer.`:`Start en samtale med ${contact}.`}
              </p>
            </div>
          )}
          {msgs.map(m=>{
            const isMe = m.sender===myName;
            return (
              <div key={m.id} style={{display:"flex",gap:"8px",alignItems:"flex-end",flexDirection:isMe?"row-reverse":"row"}}>
                <img src={getSenderPhoto(m.sender)} alt={m.sender} style={{width:"26px",height:"26px",borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`1px solid ${getSenderColor(m.sender)}55`}}/>
                <div style={{maxWidth:"72%"}}>
                  {!isMe&&<div style={{fontSize:"10px",color:"var(--text-muted)",marginBottom:"3px",fontWeight:600}}>{m.sender} · {timeFmt(m.ts)}</div>}
                  <div style={{
                    padding:"10px 13px",borderRadius:"12px",
                    background:isMe?`${member.color}1A`:"var(--surface)",
                    border:`1px solid ${isMe?member.color+"44":"var(--border-strong)"}`,
                    fontSize:"13px",color:"var(--text)",lineHeight:1.5,
                    borderBottomRightRadius:isMe?"4px":"12px",
                    borderBottomLeftRadius:isMe?"12px":"4px",
                  }}>{m.text}</div>
                  {isMe&&<div style={{fontSize:"10px",color:"var(--text-muted)",textAlign:"right",marginTop:"3px"}}>{timeFmt(m.ts)}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",background:"var(--surface)",display:"flex",gap:"10px",alignItems:"flex-end"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder={contact==="all"?`Skriv til hele teamet...`:`Skriv til ${contact}...`}
            rows={1} style={{flex:1,background:"var(--surface-2)",border:"1px solid var(--border-strong)",borderRadius:"8px",color:"var(--text)",fontSize:"13px",padding:"10px 14px",resize:"none",outline:"none",lineHeight:1.5}}/>
          <button onClick={send} disabled={!input.trim()} style={{
            background:input.trim()?member.color:"var(--surface-2)",
            border:`1px solid ${input.trim()?"transparent":"var(--border-strong)"}`,
            borderRadius:"8px",padding:"10px 16px",cursor:input.trim()?"pointer":"default",
            color:input.trim()?"#0A0A0A":"var(--text-muted)",fontWeight:700,fontSize:"13px",transition:"all 0.12s",flexShrink:0,
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function TeamDashboard({ memberName, onLogout }: { memberName:string; onLogout:()=>void }) {
  type Tab = "min"|"team"|"timer"|"chat";
  const [tab,setTab]     = useState<Tab>("min");
  const [swaps,setSwaps] = useState<Swap[]>([]);
  const [swapTarget,setSwapTarget] = useState<Appt|null>(null);
  // Live schedule with swap overrides applied
  const [schedule,setSchedule] = useState<Appt[]>(SCHEDULE_BASE);
  const member = MEMBER[memberName as MemberName]!;

  useEffect(()=>{ setSwaps(loadLS<Swap[]>("bf_team_swaps",[])); },[]);

  // Apply claimed swaps to schedule visually
  useEffect(()=>{
    const claimed = swaps.filter(s=>s.claimedBy);
    if(claimed.length===0){setSchedule(SCHEDULE_BASE);return;}
    const updated = SCHEDULE_BASE.map(a=>{
      const c = claimed.find(s=>s.apptId===a.id);
      return c ? { ...a, barber:c.claimedBy! } : a;
    });
    setSchedule(updated);
  },[swaps]);

  function offerSwap(appt:Appt, target:string, note:string){
    const s:Swap = { id:uid(), barber:memberName, apptId:appt.id, time:appt.time, service:appt.service, client:appt.client, duration:appt.duration, targetBarber:target, note, ts:Date.now() };
    const updated = [...swaps,s]; setSwaps(updated); saveLS("bf_team_swaps",updated); setSwapTarget(null);
  }

  function claimSwap(swapId:string){
    const updated = swaps.map(s=>s.id===swapId?{...s,claimedBy:memberName}:s);
    setSwaps(updated); saveLS("bf_team_swaps",updated);
  }

  const now = getNow();
  const isPast = (t:string)=>t<now;
  const myDay = schedule.filter(a=>a.barber===memberName).sort((a,b)=>a.time.localeCompare(b.time));
  const myNext = myDay.find(a=>!isPast(a.time));
  // Swaps offered to me by others, not yet claimed
  const offeredToMe = swaps.filter(s=>s.targetBarber===memberName&&!s.claimedBy);
  // My offered (not yet claimed) swaps
  const myOffered = swaps.filter(s=>s.barber===memberName&&!s.claimedBy);

  const tabs: { key:Tab; label:string; badge?:number }[] = [
    { key:"min",   label:"Min dag" },
    { key:"team",  label:"Hele teamet" },
    { key:"timer", label:"Mine timer" },
    { key:"chat",  label:"Beskeder" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {/* Sticky topnav */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(14,12,9,0.97)",backdropFilter:"blur(14px)",borderBottom:"1px solid var(--border)",height:"58px",display:"flex",alignItems:"center",padding:"0 20px",gap:"12px",overflow:"hidden"}}>
        <span style={{fontFamily:"var(--font-playfair)",fontSize:"17px",fontWeight:700,color:"var(--text)",flexShrink:0}}>Nordklip</span>
        <div style={{background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:"4px",padding:"2px 8px",flexShrink:0}}>
          <span style={{fontSize:"9px",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"#4ade80"}}>Team</span>
        </div>
        <div style={{display:"flex",gap:"2px",overflowX:"auto",msOverflowStyle:"none",scrollbarWidth:"none" as const}}>
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{
              padding:"6px 14px",borderRadius:"6px",background:"transparent",border:"none",
              fontSize:"13px",fontWeight:tab===t.key?700:400,
              color:tab===t.key?"var(--text)":"var(--text-muted)",
              borderBottom:tab===t.key?`2px solid ${member.color}`:"2px solid transparent",
              cursor:"pointer",transition:"all 0.12s",flexShrink:0,position:"relative",
            }}>
              {t.label}
              {t.key==="min"&&offeredToMe.length>0&&<span style={{position:"absolute",top:"3px",right:"2px",width:"7px",height:"7px",borderRadius:"50%",background:"#4ade80"}}/>}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
          <img src={member.photo} alt={member.name} style={{width:"26px",height:"26px",borderRadius:"50%",objectFit:"cover",border:`1px solid ${member.color}55`}}/>
          <span style={{fontSize:"11px",fontWeight:600,color:"var(--text-secondary)",display:"block"}}>
            {member.fullName.split(" ")[0]}
          </span>
          <button onClick={onLogout} style={{background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"6px",padding:"5px 10px",fontSize:"11px",color:"var(--text-muted)",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M5 7h8M10 4.5L12.5 7 10 9.5M5.5 3H2V11h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Log ud
          </button>
        </div>
      </nav>

      {/* Content — chat fills full height */}
      {tab==="chat"
        ? <ChatPanel myName={memberName}/>
        : (
          <div style={{flex:1,maxWidth:"860px",margin:"0 auto",width:"100%",padding:"28px 20px 80px"}}>

            {/* ── MIN DAG ── */}
            {tab==="min"&&(
              <div>
                <div style={{marginBottom:"22px"}}>
                  <h1 style={{fontFamily:"var(--font-playfair)",fontSize:"22px",fontWeight:700,color:"var(--text)",marginBottom:"3px"}}>God dag, {memberName.split(" ")[0]}</h1>
                  <p style={{fontSize:"12px",color:"var(--text-muted)"}}>{getToday()}</p>
                </div>

                {/* Stats */}
                <div style={{display:"flex",gap:"10px",marginBottom:"18px",flexWrap:"wrap"}}>
                  {[{label:"Aftaler",val:myDay.length},{label:"Gennemført",val:myDay.filter(a=>isPast(a.time)).length},{label:"Tilbage",val:myDay.filter(a=>!isPast(a.time)).length}].map(({label,val})=>(
                    <div key={label} style={{flex:1,minWidth:"80px",background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"9px",padding:"14px 16px"}}>
                      <div style={{fontFamily:"var(--font-playfair)",fontSize:"22px",fontWeight:700,color:member.color,lineHeight:1,marginBottom:"4px"}}>{val}</div>
                      <div style={{fontSize:"10px",fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase" as const,letterSpacing:"0.07em"}}>{label}</div>
                    </div>
                  ))}
                  {myNext&&(
                    <div style={{flex:2,minWidth:"160px",background:`${member.color}0D`,border:`1px solid ${member.color}33`,borderRadius:"9px",padding:"14px 16px"}}>
                      <div style={{fontSize:"10px",fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase" as const,letterSpacing:"0.07em",marginBottom:"4px"}}>Næste aftale</div>
                      <div style={{fontFamily:"var(--font-playfair)",fontSize:"15px",fontWeight:700,color:"var(--text)",marginBottom:"2px"}}>{myNext.time} · {myNext.client}</div>
                      <div style={{fontSize:"11px",color:"var(--text-secondary)"}}>{myNext.service} · {myNext.duration} min</div>
                    </div>
                  )}
                </div>

                {/* Incoming swap requests */}
                {offeredToMe.length>0&&(
                  <div style={{marginBottom:"18px",background:"rgba(74,222,128,0.04)",border:"1px solid rgba(74,222,128,0.22)",borderRadius:"10px",padding:"14px 16px"}}>
                    <div style={{fontSize:"11px",fontWeight:700,color:"#4ade80",textTransform:"uppercase" as const,letterSpacing:"0.07em",marginBottom:"10px"}}>Vagtbyt-forespørgsler til dig</div>
                    {offeredToMe.map(s=>(
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:"1px solid rgba(74,222,128,0.1)"}}>
                        <img src={MEMBER[s.barber as MemberName]?.photo} alt={s.barber} style={{width:"30px",height:"30px",borderRadius:"50%",objectFit:"cover"}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"13px",fontWeight:600,color:"var(--text)"}}>{s.barber} — {s.service} kl. {s.time}</div>
                          <div style={{fontSize:"11px",color:"var(--text-secondary)"}}>{s.client} · {s.duration} min</div>
                          {s.note&&<div style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"2px",fontStyle:"italic"}}>{s.note}</div>}
                        </div>
                        <button onClick={()=>claimSwap(s.id)} style={{background:"#4ade8020",border:"1px solid rgba(74,222,128,0.3)",borderRadius:"7px",padding:"8px 14px",fontSize:"12px",fontWeight:700,color:"#4ade80",cursor:"pointer",flexShrink:0}}>Accepter byt</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Appointments */}
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {myDay.length===0
                    ?<div style={{padding:"48px",textAlign:"center",background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"10px"}}><p style={{color:"var(--text-muted)"}}>Ingen aftaler i dag.</p></div>
                    :myDay.map(a=>(
                      <ApptRow key={a.id} appt={a} myName={memberName} isPast={isPast(a.time)}
                        onOfferSwap={()=>setSwapTarget(a)}
                        swapOffered={myOffered.some(s=>s.apptId===a.id)}/>
                    ))
                  }
                </div>
              </div>
            )}

            {/* ── HELE TEAMET ── */}
            {tab==="team"&&(
              <div>
                <div style={{marginBottom:"20px"}}>
                  <h1 style={{fontFamily:"var(--font-playfair)",fontSize:"22px",fontWeight:700,color:"var(--text)",marginBottom:"3px"}}>Hele teamet</h1>
                  <p style={{fontSize:"12px",color:"var(--text-muted)"}}>{getToday()} · {schedule.length} aftaler i alt</p>
                </div>
                {TEAM.map(m=>{
                  const apts = schedule.filter(a=>a.barber===m.name).sort((a,b)=>a.time.localeCompare(b.time));
                  return (
                    <div key={m.name} style={{marginBottom:"22px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
                        <img src={m.photo} alt={m.name} style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover",border:`2px solid ${m.color}44`}}/>
                        <div>
                          <span style={{fontFamily:"var(--font-playfair)",fontSize:"15px",fontWeight:700,color:"var(--text)"}}>{m.fullName}</span>
                          <span style={{fontSize:"11px",color:m.color,marginLeft:"8px"}}>{m.role}</span>
                        </div>
                        <span style={{marginLeft:"auto",fontSize:"11px",color:"var(--text-muted)",background:"var(--surface-2)",border:"1px solid var(--border-strong)",borderRadius:"4px",padding:"2px 8px"}}>{apts.length} aftaler</span>
                      </div>
                      {apts.length===0
                        ?<div style={{padding:"14px 18px",background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"8px"}}><p style={{fontSize:"12px",color:"var(--text-muted)",margin:0}}>Ingen aftaler i dag.</p></div>
                        :<div style={{display:"flex",flexDirection:"column",gap:"6px"}}>{apts.map(a=><ApptRow key={a.id} appt={a} myName={memberName} isPast={isPast(a.time)}/>)}</div>
                      }
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── MINE TIMER ── */}
            {tab==="timer"&&(
              <div>
                <div style={{marginBottom:"20px"}}>
                  <h1 style={{fontFamily:"var(--font-playfair)",fontSize:"22px",fontWeight:700,color:"var(--text)",marginBottom:"3px"}}>Mine arbejdstider</h1>
                  <p style={{fontSize:"12px",color:"var(--text-muted)"}}>{member.fullName} · {member.role}</p>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                  <div style={{background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"10px",overflow:"hidden"}}>
                    <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
                      <div style={{fontFamily:"var(--font-playfair)",fontSize:"14px",fontWeight:700,color:"var(--text)"}}>Ugeskema</div>
                    </div>
                    <div style={{padding:"12px 20px",display:"flex",flexDirection:"column",gap:"4px"}}>
                      {Object.entries(WORK_HOURS[memberName]||{}).map(([day,hours])=>{
                        const isFri = hours==="Fri";
                        const todayDow = ["Søn","Man","Tir","Ons","Tor","Fre","Lør"][new Date().getDay()];
                        const isToday = day===todayDow;
                        return (
                          <div key={day} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderRadius:"6px",background:isToday?`${member.color}10`:isFri?"transparent":"var(--surface-2)",border:`1px solid ${isToday?member.color+"33":"transparent"}`}}>
                            <span style={{fontSize:"12px",fontWeight:isToday?700:400,color:isToday?member.color:isFri?"var(--text-muted)":"var(--text-secondary)",minWidth:"36px"}}>{day}</span>
                            <span style={{fontSize:"12px",fontWeight:isToday?700:isFri?400:600,color:isToday?"var(--text)":isFri?"var(--text-muted)":"var(--text-secondary)"}}>{hours}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{background:"var(--surface)",border:"1px solid var(--border-strong)",borderRadius:"10px",overflow:"hidden"}}>
                    <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
                      <div style={{fontFamily:"var(--font-playfair)",fontSize:"14px",fontWeight:700,color:"var(--text)"}}>Kollegernes tider</div>
                    </div>
                    <div style={{padding:"12px 20px"}}>
                      {TEAM.filter(m=>m.name!==memberName).map(col=>(
                        <div key={col.name} style={{marginBottom:"16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                            <img src={col.photo} alt={col.name} style={{width:"22px",height:"22px",borderRadius:"50%",objectFit:"cover"}}/>
                            <span style={{fontFamily:"var(--font-playfair)",fontSize:"13px",fontWeight:700,color:"var(--text)"}}>{col.name}</span>
                            <span style={{fontSize:"10px",color:col.color,fontWeight:600}}>{col.role}</span>
                          </div>
                          {Object.entries(WORK_HOURS[col.name]||{}).map(([day,hrs])=>(
                            <div key={day} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid var(--border)"}}>
                              <span style={{fontSize:"11px",color:"var(--text-muted)",minWidth:"30px"}}>{day}</span>
                              <span style={{fontSize:"11px",color:hrs==="Fri"?"var(--text-muted)":"var(--text-secondary)",fontWeight:hrs==="Fri"?400:500}}>{hrs}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }

      {tab!=="chat"&&(
        <div style={{paddingBottom:"36px",display:"flex",justifyContent:"center",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:"11px",color:"var(--text-muted)"}}>Drevet af</span>
          <span style={{fontSize:"11px",fontWeight:700,color:"var(--text-secondary)"}}>BookFlow</span>
          <span style={{fontSize:"10px",color:"var(--text-muted)"}}>·</span>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{fontSize:"11px",color:"var(--text-muted)",textDecoration:"underline",textUnderlineOffset:"2px"}}>Bygget af Sloth Studio</a>
        </div>
      )}

      {swapTarget&&<SwapModal appt={swapTarget} myName={memberName} onClose={()=>setSwapTarget(null)} onConfirm={(t,n)=>offerSwap(swapTarget,t,n)}/>}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const [member,setMember]     = useState<string|null>(null);
  const [checking,setChecking] = useState(true);
  useEffect(()=>{ try{const s=sessionStorage.getItem("bf_team");if(s)setMember(s);}catch{} setChecking(false); },[]);
  function handleLogin(name:string){try{sessionStorage.setItem("bf_team",name);}catch{} setMember(name);}
  function handleLogout(){try{sessionStorage.removeItem("bf_team");}catch{} setMember(null);}
  if(checking) return null;
  if(!member) return <TeamLogin onLogin={handleLogin}/>;
  return <TeamDashboard memberName={member} onLogout={handleLogout}/>;
}
