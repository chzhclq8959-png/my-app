import React, { useState, useEffect, useMemo } from "react";

// ───────────────────────────────────────────────────────────────
//  2030 건강 자가체크 — 또래 비교로 경각심 + 검진 전환 (프로토타입)
//  · 핵심: 나이·성별 입력 → "27세 여성 100명 중 N명" 또래 통계로 "내 일"임을 각인
//  · 결과 메인 = 또래 비교(국가암등록통계·연령/성별 기반). 디스 유형은 하단 보너스.
//  · 모든 수치는 공개 통계 기반 교육용 추정치 (의학적 진단 아님)
// ───────────────────────────────────────────────────────────────

const CSS = `
.app, .app * { box-sizing:border-box; margin:0; padding:0; }
.app {
  --ink:#1E1A17; --muted:#8C837C; --paper:#FAF6F2; --card:#fff; --line:#ECE4DD;
  --coral:#FF5A4D; --coral-deep:#E33D2E; --mint:#14C29A; --mint-deep:#0CA37F; --gold:#FFC23D;
  font-family:'Apple SD Gothic Neo','Pretendard','Malgun Gothic',system-ui,-apple-system,sans-serif;
  color:var(--ink); min-height:100vh;
  background: radial-gradient(120% 70% at 15% -10%, #FFEEE9 0%, rgba(255,238,233,0) 55%),
              radial-gradient(120% 70% at 95% 110%, #E7F6F1 0%, rgba(231,246,241,0) 55%), var(--paper);
  display:flex; justify-content:center; align-items:flex-start; padding:24px 16px 48px; -webkit-font-smoothing:antialiased;
}
.phone { width:100%; max-width:430px; background:var(--card); border-radius:34px;
  box-shadow:0 30px 80px -24px rgba(60,30,20,.35); overflow:hidden; position:relative; min-height:780px; display:flex; flex-direction:column; }
.scr { flex:1; display:flex; flex-direction:column; animation:rise .42s cubic-bezier(.2,.8,.2,1); }
@keyframes rise { from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:none;} }
@keyframes pop { 0%{transform:scale(.6); opacity:0;} 70%{transform:scale(1.1);} 100%{transform:scale(1); opacity:1;} }
@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,194,61,.6);} 50%{box-shadow:0 0 0 7px rgba(255,194,61,0);} }
@keyframes dotIn { from{transform:scale(0);} to{transform:scale(1);} }
@keyframes toastIn { from{opacity:0; transform:translate(-50%,16px);} to{opacity:1; transform:translate(-50%,0);} }

.pad { padding:26px 24px; }
.eyebrow { font-size:12px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
.h1 { font-size:36px; line-height:1.16; font-weight:900; letter-spacing:-.025em; }
.h2 { font-size:23px; line-height:1.28; font-weight:900; letter-spacing:-.02em; }
.body { font-size:15px; line-height:1.6; color:var(--muted); font-weight:500; }
.tiny { font-size:11.5px; line-height:1.5; color:var(--muted); font-weight:600; }

.btn { appearance:none; border:0; width:100%; cursor:pointer; font-family:inherit; font-weight:800; font-size:16px;
  color:#fff; background:var(--ink); padding:17px; border-radius:16px; transition:transform .12s, opacity .15s, background .15s; }
.btn:active { transform:translateY(1px) scale(.995); }
.btn:focus-visible { outline:3px solid var(--ink); outline-offset:2px; }
.btn.ghost { background:transparent; color:var(--muted); font-weight:700; font-size:14px; padding:12px; }
.btn.ghost:hover { color:var(--ink); }
.btn.line { background:transparent; color:var(--ink); border:1.5px solid var(--line); }
.btn.coral { background:var(--coral); } .btn.coral:hover { background:var(--coral-deep); }
.btn.mint { background:var(--mint); } .btn.mint:hover { background:var(--mint-deep); }

/* Landing */
.land { background:linear-gradient(168deg,#FF6A53 0%, #FF4E63 100%); color:#fff; flex:1; display:flex; flex-direction:column; }
.land .pad { flex:1; display:flex; flex-direction:column; }
.land .eyebrow { color:rgba(255,255,255,.88); }
.land .h1 { color:#fff; font-size:39px; }
.startbtn { background:#fff; color:var(--coral-deep); }
.badge { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.28);
  border-radius:99px; padding:9px 14px; font-size:13px; font-weight:700; }
.bigYou { font-size:78px; text-align:center; }

/* Quiz */
.prog { height:5px; background:rgba(0,0,0,.07); border-radius:99px; overflow:hidden; }
.prog>i { display:block; height:100%; background:var(--coral); border-radius:99px; transition:width .4s cubic-bezier(.2,.8,.2,1); }
.qtag { font-size:12px; font-weight:800; letter-spacing:.06em; padding:5px 11px; border-radius:99px; display:inline-block; }
.opt { width:100%; text-align:left; cursor:pointer; font-family:inherit; background:#fff; border:1.5px solid var(--line);
  border-radius:15px; padding:16px 17px; font-size:15.5px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:12px;
  transition:border-color .14s, background .14s, transform .1s; }
.opt:hover { border-color:var(--coral); }
.opt:active { transform:scale(.99); }

/* Result — 또래 비교(시그니처) */
.reveal { background:linear-gradient(168deg,#FF6A53,#FF4E63); color:#fff; padding:28px 24px 26px; }
.reveal .eyebrow { color:rgba(255,255,255,.88); }
.bignum { font-size:88px; font-weight:900; letter-spacing:-.04em; line-height:.95; }
.dots { display:grid; grid-template-columns:repeat(20,1fr); gap:5px; margin:18px 0 10px; }
.dot { width:100%; aspect-ratio:1; border-radius:50%; background:rgba(255,255,255,.28); animation:dotIn .28s backwards; }
.dot.on { background:#fff; }
.dot.you { background:var(--gold); box-shadow:0 0 0 2px #fff; animation:dotIn .28s backwards, pulse 1.8s 1.2s infinite; }
.src { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.16); border-radius:8px; padding:6px 10px; font-size:10.5px; font-weight:700; }
.gauge { background:#fff; border-radius:20px; padding:20px; border:1px solid var(--line); }
.bar { height:14px; border-radius:99px; background:linear-gradient(90deg,#14C29A 0%, #FFC23D 50%, #FF5A4D 100%); position:relative; }
.bar .me { position:absolute; top:-7px; width:4px; height:28px; background:var(--ink); border-radius:4px; }
.bar .avg { position:absolute; top:-3px; width:2px; height:20px; background:rgba(33,28,25,.45); }
.pill { display:inline-flex; align-items:center; gap:6px; font-weight:800; font-size:13px; padding:6px 12px; border-radius:99px; }
.discl { background:#FBF7F3; border:1px solid var(--line); border-radius:13px; padding:13px 14px; }
.cta { background:var(--ink); color:#fff; border-radius:16px; padding:16px; text-align:center; font-weight:800; font-size:15.5px; cursor:pointer; transition:transform .12s; }
.cta:active { transform:translateY(1px); }
.bonus { border-radius:18px; padding:18px 18px 16px; color:#fff; }
.toast { position:fixed; left:50%; bottom:38px; transform:translateX(-50%); background:var(--ink); color:#fff;
  font-weight:700; font-size:14px; padding:12px 20px; border-radius:99px; z-index:60; animation:toastIn .25s;
  box-shadow:0 12px 30px -10px rgba(0,0,0,.5); max-width:90%; text-align:center; }
@media (prefers-reduced-motion: reduce){ .scr,.dot,.dot.you,.toast{animation:none !important;} .prog>i{transition:none !important;} }
`;

// ── 또래 갑상선 결절 보유 추정치(%) — 국가암등록통계·검진연구(연령·성별) 기반 단순 추정 ──
const NODULE = {
  "20대 초반": { f:13, m:9,  label:"20대 초반" },
  "20대 후반": { f:17, m:11, label:"20대 후반" },
  "30대 초반": { f:22, m:14, label:"30대 초반" },
  "30대 후반": { f:27, m:17, label:"30대 후반" },
};
const PEER_AVG = 36; // 또래 평균 생활습관 위험 지수(데모 기준값)
const BANDS = [
  { max:24, label:"낮음", color:"#14C29A", emoji:"🌱", line:"지금 습관, 아주 좋아요. 이대로만 유지해요." },
  { max:44, label:"보통", color:"#7DBA4A", emoji:"🙂", line:"나쁘지 않아요. 한두 개만 손보면 더 좋아져요." },
  { max:64, label:"주의", color:"#FFB02E", emoji:"⚠️", line:"또래보다 높은 편이에요. 바꿀 수 있는 게 보여요." },
  { max:999, label:"높음", color:"#FF5A4D", emoji:"🚨", line:"지금이 바꾸기 좋은 타이밍이에요. 검진부터 챙겨봐요." },
];
const bandOf = (s) => BANDS.find((b)=> s<=b.max);

// ── 디스 유형 (보너스) ──
const TYPES = {
  GOA:{name:"철벽 우등생",emoji:"🛡️",bg:"linear-gradient(135deg,#2E7D5B,#1F6147)",diss:"흠잡을 데가 없어서 정 떨어지는 타입. 그 검진 습관이 진짜 무기야.",act:"지금처럼 주기만 지키면 끝."},
  GOH:{name:"근자감 몸짱",emoji:"💪",bg:"linear-gradient(135deg,#C8511E,#A23A12)",diss:"운동은 열심인데 “내 몸은 내가 알지” 하며 검진은 패스. 근육이 결절은 못 막아.",act:"운동만큼 검진도 루틴에 넣자."},
  GWA:{name:"유리몸 걱정대장",emoji:"🫧",bg:"linear-gradient(135deg,#4A6FA5,#37548A)",diss:"관리도 검진도 잘하는데 늘 안절부절. 건강염려가 취미인 타입.",act:"걱정 대신 검진. 넌 이미 잘하고 있어."},
  GWH:{name:"쫄보 건강덕후",emoji:"🙈",bg:"linear-gradient(135deg,#7B5EA7,#604789)",diss:"관리는 잘하는데 결과가 무서워 검진은 도망치는 타입. 그게 제일 위험해.",act:"무서울수록 빨리. 검진은 ‘확인’이야."},
  BOA:{name:"운빨 막장러",emoji:"🍀",bg:"linear-gradient(135deg,#3E8E7E,#2B6B5E)",diss:"막 살면서 검진은 받는 타입. 지금까진 운으로 버틴 거야.",act:"습관 딱 하나만 끊어보자."},
  BOH:{name:"무적 착각러",emoji:"🦸",bg:"linear-gradient(135deg,#E33D2E,#B82A1D)",diss:"막 살고 + 난 안 걸린다 믿고 + 검진도 패스. 무적은 영화에만 있어.",act:"오늘 딱 하나, 검진센터 검색부터."},
  BWA:{name:"알고도 못 끊어",emoji:"🚬",bg:"linear-gradient(135deg,#8A6240,#6B4A2E)",diss:"안 좋은 거 알면서 못 끊고, 불안해서 검진은 받는 타입.",act:"끊기 어려우면 ‘줄이기’부터."},
  BWH:{name:"구글링 박사",emoji:"🔍",bg:"linear-gradient(135deg,#566270,#3F4A56)",diss:"증상 검색은 100단, 병원 가기는 0단. 새벽 3시 “목 혹 암” 검색 그만.",act:"검색 그만하고 예약. 확인이 약이야."},
};

// ── 문항 ──
const STEPS = [
  { kind:"age", q:"나이대를 골라줘요", sub:"또래 통계를 불러올게요", opts:[
    {v:"e20",t:"20대 초반"},{v:"l20",t:"20대 후반"},{v:"e30",t:"30대 초반"},{v:"l30",t:"30대 후반"}],
    map:{e20:"20대 초반",l20:"20대 후반",e30:"30대 초반",l30:"30대 후반"} },
  { kind:"sex", q:"성별이 어떻게 돼요?", opts:[{v:"f",t:"여성",ic:"👩"},{v:"m",t:"남성",ic:"👨"}] },
  { kind:"q", axis:"A", q:"평소 식사 패턴은?", opts:[
    {t:"균형 잡힌 집밥 위주",ic:"🥗",pts:0},{t:"되는대로 대충",ic:"🍙",pts:2},{t:"배달·인스턴트가 주식",ic:"🍔",pts:4}]},
  { kind:"q", axis:"A", q:"운동은 얼마나 해?", opts:[
    {t:"주 3회 이상 규칙적",ic:"🏃",pts:0},{t:"가끔 생각나면",ic:"🚶",pts:2},{t:"숨쉬기 운동 중",ic:"🛋️",pts:4}]},
  { kind:"q", axis:"A", q:"담배랑 술은?", opts:[
    {t:"둘 다 안 해",ic:"🚭",pts:0},{t:"하나는 가끔",ic:"🍺",pts:2},{t:"둘 다, 꽤 자주",ic:"🍻",pts:4}]},
  { kind:"q", axis:"B", q:"“검진에서 이상 소견” 상상하면?", opts:[
    {t:"에이 설마 나는 아니지",ic:"😎",pts:0},{t:"음 좀 신경 쓰이네",ic:"🤔",pts:2},{t:"벌써 심장 쿵",ic:"😰",pts:4}]},
  { kind:"q", axis:"B", q:"몸에서 작은 혹·통증 발견하면?", opts:[
    {t:"별거 아니겠지, 무시",ic:"🤷",pts:0},{t:"며칠 지켜봄",ic:"👀",pts:2},{t:"바로 최악 상상하며 검색",ic:"📱",pts:4}]},
  { kind:"q", axis:"C", q:"마지막 건강검진이 언제야?", opts:[
    {t:"2년 안에 받았어",ic:"✅",pts:0},{t:"꽤 오래된 듯",ic:"🕰️",pts:2},{t:"받은 기억이 없는데",ic:"🫥",pts:4}]},
  { kind:"q", axis:"C", q:"병원 가야 할 것 같을 때 너는?", opts:[
    {t:"바로 예약함",ic:"📅",pts:0},{t:"미루다 결국 감",ic:"⏳",pts:2},{t:"버티다 낫길 기도",ic:"🙏",pts:4}]},
  { kind:"q", axis:"C", q:"건강검진 안내 문자가 오면?", opts:[
    {t:"바로 날짜 잡음",ic:"📲",pts:0},{t:"일단 저장하고 잊음",ic:"📥",pts:2},{t:"읽씹",ic:"🙅",pts:4}]},
];

function compute(ans) {
  const sum = (ax) => STEPS.reduce((s,st,i)=> s + (st.kind==="q"&&st.axis===ax ? (ans.p?.[i]??0):0), 0);
  const A=sum("A"), B=sum("B"), C=sum("C");
  const code = (A>=6?"B":"G") + (B>=4?"W":"O") + (C>=6?"H":"A");
  const risk = Math.round(((A+C)/24)*100);
  const ageBand = STEPS[0].map[ans.age] || "20대 후반";
  const sexKey = ans.sex==="m" ? "m" : "f";
  const peer = (NODULE[ageBand]||NODULE["20대 후반"])[sexKey];
  return { code, risk, ageBand, sexKey, peer };
}

async function shareLink(r, showToast) {
  const sex = r.sexKey==="m" ? "남성" : "여성";
  const url = "https://health-check.2030/" + r.code;
  const text = `${r.ageBand} ${sex} 100명 중 ${r.peer}명이 이미 그렇대 😳 너 또래는 어떨까? 30초 자가체크 해봐`;
  try { if (navigator.share) { await navigator.share({title:"2030 건강 자가체크",text,url}); return; } } catch(e){}
  try { await navigator.clipboard.writeText(url); showToast("링크를 복사했어요 🔗 친구에게 보내보세요"); return; } catch(e){}
  showToast("공유 링크: " + url);
}

export default function App() {
  const [screen,setScreen]=useState("landing");
  const [step,setStep]=useState(0);
  const [ans,setAns]=useState({p:{}});
  const [toast,setToast]=useState(null);
  const reduce = typeof window!=="undefined"&&window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  const r = useMemo(()=> screen==="result" ? compute(ans) : null, [screen, ans]);
  const showToast=(m)=>{ setToast(m); setTimeout(()=>setToast(null),2200); };
  const reset=()=>{ setScreen("landing"); setStep(0); setAns({p:{}}); };

  return (
    <div className="app">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <div className="phone">
        {screen==="landing" && <Landing onStart={()=>setScreen("quiz")} />}
        {screen==="quiz" && <Quiz step={step} setStep={setStep} ans={ans} setAns={setAns}
          onDone={()=>setScreen("result")} onBack={()=> step===0?reset():setStep(step-1)} />}
        {screen==="result" && <Result r={r} reduce={reduce} onReset={reset} onToast={showToast}
          onShare={()=>shareLink(r,showToast)} />}
      </div>
    </div>
  );
}

// ───────── Landing ─────────
function Landing({ onStart }) {
  return (
    <div className="scr land">
      <div className="pad">
        <div style={{height:6}} />
        <div className="eyebrow">2030 건강 자가체크</div>
        <div style={{height:14}} />
        <div className="h1">암은 정말<br/>남의 일일까?</div>
        <div style={{height:16}} />
        <div className="body" style={{color:"rgba(255,255,255,.9)"}}>
          30초면 돼요. 같은 <b>나이·성별 또래</b>와<br/>내 위치를 비교해보고, 오늘 할 수 있는 걸 찾아봐요.
        </div>
        <div style={{height:24}} />
        <div className="bigYou">🫵</div>
        <div style={{height:18}} />
        <div className="badge">📊 국가 통계로 내 또래와 비교</div>

        <div style={{flex:1, minHeight:20}} />
        <button className="btn startbtn" onClick={onStart}>30초 자가체크 시작</button>
        <div style={{height:10}} />
        <div className="tiny" style={{color:"rgba(255,255,255,.7)", textAlign:"center"}}>공개 통계 기반 교육용 서비스 · 의학적 진단이 아니에요</div>
      </div>
    </div>
  );
}

// ───────── Quiz ─────────
function Quiz({ step, setStep, ans, setAns, onDone, onBack }) {
  const st = STEPS[step];
  const pct = Math.round((step/STEPS.length)*100);
  const next = () => step===STEPS.length-1 ? onDone() : setStep(step+1);
  const pick = (v) => {
    if (st.kind==="age") setAns({...ans, age:v});
    else if (st.kind==="sex") setAns({...ans, sex:v});
    else setAns({...ans, p:{...ans.p, [step]:v}});
    setTimeout(next, 170);
  };
  const tag = st.kind==="age" ? {t:"기본 정보",c:"#FF5A4D"} : st.kind==="sex" ? {t:"기본 정보",c:"#FF5A4D"}
    : {A:{t:"몸 관리",c:"#FF5A4D"},B:{t:"멘탈",c:"#7B5EA7"},C:{t:"검진 행동",c:"#14C29A"}}[st.axis];
  return (
    <div className="scr">
      <div className="pad" style={{paddingBottom:12}}>
        <button className="btn ghost" style={{width:"auto",padding:"4px 0",textAlign:"left"}} onClick={onBack}>← 뒤로</button>
        <div style={{height:8}} />
        <div className="prog"><i style={{width:`${pct}%`}} /></div>
        <div style={{height:22}} />
        <span className="qtag" style={{background:tag.c+"1f",color:tag.c}}>{step+1} / {STEPS.length} · {tag.t}</span>
        <div style={{height:14}} />
        <div className="h2">{st.q}</div>
        {st.sub && <div className="body" style={{marginTop:6,fontSize:14}}>{st.sub}</div>}
      </div>
      <div className="pad" style={{paddingTop:4, display:"flex", flexDirection:"column", gap:11, flex:1}}>
        {st.opts.map((o,i)=>(
          <button key={i} className="opt" onClick={()=>pick(st.kind==="q"?o.pts:o.v)}>
            {o.ic && <span style={{fontSize:21}}>{o.ic}</span>}<span>{o.t}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ───────── Result ─────────
function Result({ r, reduce, onReset, onToast, onShare }) {
  const [num,setNum]=useState(reduce?r.peer:0);
  const [lit,setLit]=useState(reduce?100:0);
  const band=bandOf(r.risk);
  const sex=r.sexKey==="m"?"남성":"여성";
  const onDots=Math.round((r.peer/100)*lit);
  useEffect(()=>{
    if(reduce) return;
    let n=0; const t=setInterval(()=>{ n+=1; setNum(n); if(n>=r.peer) clearInterval(t); },40);
    const t2=setInterval(()=> setLit(d=> d>=100?(clearInterval(t2),100):d+4), 22);
    return ()=>{ clearInterval(t); clearInterval(t2); };
  },[r.peer,reduce]);
  const findCenter=()=>{ try{ window.open("https://map.naver.com/p/search/건강검진센터","_blank","noopener"); }catch(e){ onToast("지도 앱에서 ‘건강검진센터’를 검색해보세요 🏥"); } };
  const t=TYPES[r.code];

  return (
    <div className="scr" style={{overflowY:"auto"}}>
      {/* 또래 비교 (메인) */}
      <div className="reveal">
        <div className="eyebrow">또래 비교</div>
        <div style={{height:12}} />
        <div style={{fontSize:16,fontWeight:700}}>너와 같은 <b>{r.ageBand} {sex}</b> 100명 중,</div>
        <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:4}}>
          <span className="bignum">{num}</span><span style={{fontSize:26,fontWeight:900}}>명</span>
        </div>
        <div style={{fontSize:16,fontWeight:700,marginTop:2}}>은 이미 갑상선에 결절이 있어요.</div>
        <div className="dots">
          {Array.from({length:100}).map((_,i)=>{
            const you=i===49;
            return <div key={i} className={"dot"+(you?" you":i<onDots?" on":"")} style={{animationDelay:`${i*0.006}s`}} />;
          })}
        </div>
        <div className="tiny" style={{color:"rgba(255,255,255,.9)",marginBottom:12}}>
          🟡 가운데 노란 점이 <b>당신</b>. 결절 대부분은 양성이지만, 검진해야 알 수 있어요.
        </div>
        <div className="src">📊 국가암등록통계·갑상선 검진연구 기반 (연령·성별 추정)</div>
      </div>

      <div className="pad" style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* 내 생활습관 위험 지수 */}
        <div className="gauge">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800,fontSize:15}}>내 생활습관 위험 지수</span>
            <span className="pill" style={{background:band.color+"22",color:band.color}}>{band.emoji} {band.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,margin:"10px 0 18px"}}>
            <span style={{fontSize:44,fontWeight:900,color:band.color,letterSpacing:"-.03em"}}>{r.risk}</span>
            <span style={{color:"var(--muted)",fontWeight:700,fontSize:14}}>/ 100 · 또래 평균 {PEER_AVG}</span>
          </div>
          <div className="bar">
            <div className="avg" style={{left:`${PEER_AVG}%`}} />
            <div className="me" style={{left:`calc(${Math.min(98,Math.max(2,r.risk))}% - 2px)`}} />
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <span className="tiny">낮음</span><span className="tiny">↑ 또래 평균</span><span className="tiny">높음</span>
          </div>
          <div style={{height:14}} />
          <div className="body" style={{color:"var(--ink)",fontWeight:600,fontSize:14}}>{band.line}</div>
        </div>

        <div className="discl">
          <div className="tiny" style={{color:"var(--ink)"}}>
            공개 통계와 생활습관 기반 <b>교육용 추정치</b>예요(실제 서비스에선 국가암등록통계 API 연동). 의학적 진단이 아니며, 정확한 상태는 검진으로 확인하세요.
          </div>
        </div>

        <div className="cta" onClick={findCenter}>🏥 가까운 검진센터 찾아보기</div>

        {/* 보너스: 디스 유형 */}
        <div style={{borderTop:"1px solid var(--line)",margin:"4px 0"}} />
        <div style={{fontWeight:800,fontSize:13.5,color:"var(--muted)"}}>🎁 보너스 · 내 건강 유형은?</div>
        <div className="bonus" style={{background:t.bg}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:40}}>{t.emoji}</span>
            <div style={{fontSize:21,fontWeight:900,letterSpacing:"-.02em"}}>{t.name}</div>
          </div>
          <div style={{height:10}} />
          <div style={{fontSize:14,fontWeight:600,lineHeight:1.55,opacity:.97}}>{t.diss}</div>
          <div style={{height:10}} />
          <div style={{fontSize:13.5,fontWeight:800}}>👉 {t.act}</div>
        </div>

        <div style={{height:2}} />
        <button className="btn coral" onClick={onShare}>🔗 친구 또래는 어떤지 공유하기</button>
        <button className="btn ghost" onClick={onReset}>다시 체크하기</button>
        <div style={{height:6}} />
      </div>
    </div>
  );
}
