import React, { useState, useEffect, useMemo } from "react";

// ───────────────────────────────────────────────────────────────
//  암 걸리기 전에, 앎으로 예방하기 — 2030세대 암 인지도 캠페인 (최종 버전)
//  · 목표: 2030세대 암 발병률 증가 + 인지도 부족 문제 해결
//  · 결과 화면 = 연령/성별 맞춤 최신 증가율 데이터 + 공유도(디스 유형 8종) 동시 강화
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
@keyframes pop { 0%{transform:scale(.5) rotate(-8deg); opacity:0;} 70%{transform:scale(1.12) rotate(3deg);} 100%{transform:scale(1) rotate(0); opacity:1;} }
@keyframes stamp { 0%{transform:scale(2.4) rotate(-18deg); opacity:0;} 60%{transform:scale(.9) rotate(-12deg); opacity:1;} 100%{transform:scale(1) rotate(-11deg);} }
@keyframes toastIn { from{opacity:0; transform:translate(-50%,16px);} to{opacity:1; transform:translate(-50%,0);} }
@keyframes sheetIn { from{transform:translateY(100%);} to{transform:translateY(0);} }
@keyframes fadeIn { from{opacity:0;} to{opacity:1;} }

.pad { padding:26px 24px; }
.eyebrow { font-size:12px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
.h1 { font-size:34px; line-height:1.18; font-weight:900; letter-spacing:-.025em; }
.h2 { font-size:23px; line-height:1.28; font-weight:900; letter-spacing:-.02em; }
.h3 { font-size:18px; line-height:1.3; font-weight:800; letter-spacing:-.01em; }
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
.btn.outline-mint { background:#fff; color:var(--mint-deep); border:1.5px solid var(--mint); }

/* Landing */
.land { background:linear-gradient(168deg,#FF6A53 0%, #FF4E63 100%); color:#fff; flex:1; display:flex; flex-direction:column; }
.land .pad { flex:1; display:flex; flex-direction:column; }
.land .eyebrow { color:rgba(255,255,255,.88); }
.land .h1 { color:#fff; font-size:38px; }
.startbtn { background:#fff; color:var(--coral-deep); }
.badge { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.28);
  border-radius:99px; padding:9px 14px; font-size:13px; font-weight:700; }
.bigYou { font-size:72px; text-align:center; }
.preview { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:18px; padding:16px 16px; }
.previewrow { display:flex; justify-content:space-between; font-size:24px; }

/* Quiz */
.prog { height:5px; background:rgba(0,0,0,.07); border-radius:99px; overflow:hidden; }
.prog>i { display:block; height:100%; background:var(--coral); border-radius:99px; transition:width .4s cubic-bezier(.2,.8,.2,1); }
.qtag { font-size:12px; font-weight:800; letter-spacing:.06em; padding:5px 11px; border-radius:99px; display:inline-block; }
.opt { width:100%; text-align:left; cursor:pointer; font-family:inherit; background:#fff; border:1.5px solid var(--line);
  border-radius:15px; padding:16px 17px; font-size:15px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:12px;
  transition:border-color .14s, background .14s, transform .1s; }
.opt:hover { border-color:var(--coral); }
.opt:active { transform:scale(.99); }

/* Result */
.reveal { background:linear-gradient(168deg,#FF6A53,#FF4E63); color:#fff; padding:30px 24px 26px; }
.reveal .eyebrow { color:rgba(255,255,255,.88); }
.factcard { background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.22); border-radius:18px; padding:18px 16px; margin-top:16px; }
.factbig { font-size:26px; font-weight:900; letter-spacing:-.02em; line-height:1.35; word-break:keep-all; }
.src { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.16); border-radius:8px; padding:6px 10px; font-size:10.5px; font-weight:700; margin-top:12px; }

.gauge { background:#fff; border-radius:20px; padding:20px; border:1px solid var(--line); }
.gaugeflag { display:inline-flex; align-items:center; gap:5px; background:#FBF7F3; border:1px solid var(--line); border-radius:8px; padding:4px 9px; font-size:10.5px; font-weight:800; color:var(--muted); }
.bar { height:14px; border-radius:99px; background:linear-gradient(90deg,#14C29A 0%, #FFC23D 50%, #FF5A4D 100%); position:relative; margin-top:14px; }
.bar .me { position:absolute; top:-7px; width:4px; height:28px; background:var(--ink); border-radius:4px; }
.pill { display:inline-flex; align-items:center; gap:6px; font-weight:800; font-size:13px; padding:6px 12px; border-radius:99px; }
.discl { background:#FBF7F3; border:1px solid var(--line); border-radius:13px; padding:13px 14px; }
.cta { background:var(--ink); color:#fff; border-radius:16px; padding:16px; text-align:center; font-weight:800; font-size:15.5px; cursor:pointer; transition:transform .12s; }
.cta:active { transform:translateY(1px); }
.cta.know { background:#fff; color:var(--coral-deep); border:1.8px solid var(--coral); }

/* 디스 유형 */
.typecard { padding:26px 22px 24px; border-radius:22px; color:#fff; position:relative; overflow:hidden; }
.code { font-size:12px; font-weight:800; letter-spacing:.2em; opacity:.85; }
.bigemoji { font-size:80px; line-height:1; text-align:center; animation:pop .5s; }
.tname { font-size:30px; font-weight:900; letter-spacing:-.03em; text-align:center; line-height:1.1; }
.diss { font-size:15px; font-weight:700; line-height:1.55; text-align:center; opacity:.96; }
.factbox { background:#fff; border-radius:16px; padding:16px 16px 15px; position:relative; border:1px solid var(--line); }
.factstamp { position:absolute; top:-13px; right:13px; background:var(--coral); color:#fff; font-weight:900; font-size:13px;
  padding:7px 12px; border-radius:9px; transform:rotate(-9deg); box-shadow:0 6px 14px -6px rgba(227,61,46,.8);
  border:2px solid #fff; animation:stamp .5s .35s backwards; letter-spacing:.04em; }

/* 토스트 / 시트 */
.toast { position:fixed; left:50%; bottom:38px; transform:translateX(-50%); background:var(--ink); color:#fff;
  font-weight:700; font-size:14px; padding:12px 20px; border-radius:99px; z-index:60; animation:toastIn .25s;
  box-shadow:0 12px 30px -10px rgba(0,0,0,.5); max-width:90%; text-align:center; }
.overlay { position:absolute; inset:0; background:rgba(20,15,12,.55); z-index:40; animation:fadeIn .2s; display:flex; align-items:flex-end; }
.sheet { width:100%; max-height:88%; background:#fff; border-radius:24px 24px 0 0; overflow-y:auto; animation:sheetIn .32s cubic-bezier(.2,.8,.2,1); padding-bottom:8px; }
.sheethandle { width:40px; height:4px; background:var(--line); border-radius:99px; margin:12px auto 4px; }
.infoblock { border:1px solid var(--line); border-radius:14px; padding:14px 15px; }
.infoblock + .infoblock { margin-top:10px; }
.numbox { background:#FFF4F1; border-radius:14px; padding:14px 15px; }

@media (prefers-reduced-motion: reduce){ .scr,.bigemoji,.factstamp,.toast,.sheet{animation:none !important;} .prog>i{transition:none !important;} }
`;

// ───────── 신뢰 가능한 2030 타겟 팩트 (데이터 반영 완료) ─────────
const CANCER_FACTS = {
  f_20: {
    headline: "20대 여성, 최근 5년 새 대장암 발생이 92.6%나 급증했어요",
    sub: "아직 어리다고 안심할 수 없어요. 서구화된 식습관 등으로 20대 여성의 소화기계 암 발병이 가파르게 늘고 있습니다.",
  },
  f_30: {
    headline: "30대 여성, 대장암 발생자 수가 5년 새 70.4% 폭증했어요",
    sub: "스트레스와 잦은 외식, 환경적 요인으로 30대 여성의 암 발병이 눈에 띄게 늘고 있어요. 지금이 검진을 시작할 때예요.",
  },
  m_20: {
    headline: "20대 남성, 대장암 발병률이 무려 114.5%나 치솟았어요",
    sub: "젊은 남성도 절대 예외는 아니에요. 통계에 따르면 20대 남성의 암 발병 증가 추세가 전 연령대에서 가장 심상치 않습니다.",
  },
  m_30: {
    headline: "30대 남성, 대장암 발생이 무려 84.0%나 폭증했어요",
    sub: "잦은 회식과 스트레스, 고지방 식습관 탓일까요? 30대 남성의 소화기계 암 발생이 가장 눈에 띄게 늘고 있습니다.",
  },
};

// ── 생활습관 위험 지수 BAND ──
const BANDS = [
  { max:24, label:"낮음", color:"#14C29A", emoji:"🌱", line:"지금 습관, 예방수칙에 가까워요. 이대로만 유지해요." },
  { max:44, label:"보통", color:"#7DBA4A", emoji:"🙂", line:"나쁘지 않아요. 한두 개만 손보면 더 좋아져요." },
  { max:64, label:"주의", color:"#FFB02E", emoji:"⚠️", line:"예방수칙에서 좀 멀어진 편이에요. 바꿀 수 있는 게 보여요." },
  { max:999, label:"높음", color:"#FF5A4D", emoji:"🚨", line:"지금이 바꾸기 좋은 타이밍이에요. 검진부터 챙겨봐요." },
];
const bandOf = (s) => BANDS.find((b)=> s<=b.max);

// ── 디스 유형 ──
const TYPES = {
  GOA:{name:"철벽 우등생",emoji:"🛡️",bg:"linear-gradient(135deg,#2E7D5B,#1F6147)",rare:7,
    diss:"흠잡을 데가 없어서 정 떨어지는 타입. 그 검진 습관이 진짜 무기야.",
    act:"지금처럼 주기만 지키면 끝."},
  GOH:{name:"근자감 몸짱",emoji:"💪",bg:"linear-gradient(135deg,#C8511E,#A23A12)",rare:14,
    diss:"운동은 열심인데 “내 몸은 내가 알지” 하며 검진은 패스. 근육이 결절은 못 막아.",
    act:"운동만큼 검진도 루틴에 넣자."},
  GWA:{name:"유리몸 걱정대장",emoji:"🫧",bg:"linear-gradient(135deg,#4A6FA5,#37548A)",rare:9,
    diss:"관리도 검진도 잘하는데 늘 안절부절. 건강염려가 취미인 타입.",
    act:"걱정 대신 검진. 넌 이미 잘하고 있어."},
  GWH:{name:"쫄보 건강덕후",emoji:"🙈",bg:"linear-gradient(135deg,#7B5EA7,#604789)",rare:9,
    diss:"관리는 잘하는데 결과가 무서워 검진은 도망치는 타입. 그게 제일 위험해.",
    act:"무서울수록 빨리. 검진은 ‘확인’이야."},
  BOA:{name:"운빨 막장러",emoji:"🍀",bg:"linear-gradient(135deg,#3E8E7E,#2B6B5E)",rare:11,
    diss:"막 살면서 검진은 받는 타입. 지금까진 운으로 버틴 거야.",
    act:"습관 딱 하나만 끊어보자."},
  BOH:{name:"무적 착각러",emoji:"🦸",bg:"linear-gradient(135deg,#E33D2E,#B82A1D)",rare:21,
    diss:"막 살고 + 난 안 걸린다 믿고 + 검진도 패스. 무적은 영화에만 있어.",
    act:"오늘 딱 하나, 검진센터 검색부터."},
  BWA:{name:"알고도 못 끊어",emoji:"🚬",bg:"linear-gradient(135deg,#8A6240,#6B4A2E)",rare:13,
    diss:"안 좋은 거 알면서 못 끊고, 불안해서 검진은 받는 타입.",
    act:"끊기 어려우면 ‘줄이기’부터."},
  BWH:{name:"구글링 박사",emoji:"🔍",bg:"linear-gradient(135deg,#566270,#3F4A56)",rare:16,
    diss:"증상 검색은 100단, 병원 가기는 0단. 새벽 3시 “목 혹 암” 검색 그만.",
    act:"검색 그만하고 예약. 확인이 약이야."},
};
const DEX_ORDER = ["BOH","BWH","GOH","BWA","BOA","GWH","GWA","GOA"];

// ── 문항: 국민암예방수칙 10개 기반 재설계 ──
const STEPS = [
  { kind:"age", q:"나이대를 골라줘요", sub:"2030 또래 통계 정보를 불러올게요", opts:[
    {v:"e20",t:"20대 초반"},{v:"l20",t:"20대 후반"},{v:"e30",t:"30대 초반"},{v:"l30",t:"30대 후반"}],
    map:{e20:"20대 초반",l20:"20대 후반",e30:"30대 초반",l30:"30대 후반"} },
  { kind:"sex", q:"성별이 어떻게 돼요?", opts:[{v:"f",t:"여성",ic:"👩"},{v:"m",t:"남성",ic:"👨"}] },
  { kind:"q", axis:"A", rule:1, q:"담배는 어떻게 해?", sub:"국가암예방수칙 ① 금연", opts:[
    {t:"피우지 않아",ic:"🚭",pts:0},{t:"가끔 피워",ic:"🚬",pts:2},{t:"매일 피워",ic:"🔥",pts:4}]},
  { kind:"q", axis:"A", rule:5, q:"음주는 얼마나 해?", sub:"국가암예방수칙 ⑤ 절주", opts:[
    {t:"거의 안 마셔",ic:"🥤",pts:0},{t:"가끔 한두 잔",ic:"🍷",pts:2},{t:"자주, 많이 마셔",ic:"🍻",pts:4}]},
  { kind:"q", axis:"A", rule:3, q:"채소·과일은 얼마나 챙겨 먹어?", sub:"국가암예방수칙 ③ 균형 잡힌 식사", opts:[
    {t:"매일 챙겨 먹어",ic:"🥗",pts:0},{t:"가끔 먹어",ic:"🍙",pts:2},{t:"거의 안 먹어",ic:"🍔",pts:4}]},
  { kind:"q", axis:"A", rule:6, q:"운동은 얼마나 해?", sub:"국가암예방수칙 ⑥ 주 5회·30분 이상 운동", opts:[
    {t:"주 5회 이상 규칙적",ic:"🏃",pts:0},{t:"가끔 생각나면",ic:"🚶",pts:2},{t:"숨쉬기 운동 중",ic:"🛋️",pts:4}]},
  { kind:"q", axis:"B", q:"“검진에서 이상 소견” 상상하면?", opts:[
    {t:"에이 설마 나는 아니지",ic:"😎",pts:0},{t:"음 좀 신경 쓰이네",ic:"🤔",pts:2},{t:"벌써 심장 쿵",ic:"😰",pts:4}]},
  { kind:"q", axis:"B", q:"몸에서 작은 혹·통증 발견하면?", opts:[
    {t:"별거 아니겠지, 무시",ic:"🤷",pts:0},{t:"며칠 지켜봄",ic:"👀",pts:2},{t:"바로 최악 상상하며 검색",ic:"📱",pts:4}]},
  { kind:"q", axis:"C", rule:10, q:"마지막 건강검진이 언제야?", sub:"국가암예방수칙 ⑩ 정기 암검진", opts:[
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
  const ageGroup = (ans.age === "e20" || ans.age === "l20") ? "20" : "30"; 
  const sexKey = ans.sex === "m" ? "m" : "f";
  const factKey = `${sexKey}_${ageGroup}`;

  return { code, risk, ageBand, sexKey, factKey };
}

async function shareLink(r, showToast) {
  const sex = r.sexKey==="m" ? "남성" : "여성";
  const t = TYPES[r.code];
  const url = "https://my-app-virid-beta.vercel.app/";
  const text = `나는 ${r.ageBand} ${sex} 「${t.name}」였어 😳 너는 무슨 건강 유형? 30초 자가체크 해봐`;
  try { if (navigator.share) { await navigator.share({title:"암 걸리기 전에, 앎으로 예방하기",text,url}); return; } } catch(e){}
  try { await navigator.clipboard.writeText(url); showToast("링크를 복사했어요 🔗 친구에게 보내보세요"); return; } catch(e){}
  showToast("공유 링크: " + url);
}

export default function App() {
  const [screen,setScreen]=useState("landing");
  const [step,setStep]=useState(0);
  const [ans,setAns]=useState({p:{}});
  const [toast,setToast]=useState(null);
  const [showKnow,setShowKnow]=useState(false);
  const reduce = typeof window!=="undefined"&&window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  const r = useMemo(()=> screen==="result" ? compute(ans) : null, [screen, ans]);
  const showToast=(m)=>{ setToast(m); setTimeout(()=>setToast(null),2200); };
  const reset=()=>{ setScreen("landing"); setStep(0); setAns({p:{}}); setShowKnow(false); };

  return (
    <div className="app">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <div className="phone">
        {screen==="landing" && <Landing onStart={()=>setScreen("quiz")} />}
        {screen==="quiz" && <Quiz step={step} setStep={setStep} ans={ans} setAns={setAns}
          onDone={()=>setScreen("result")} onBack={()=> step===0?reset():setStep(step-1)} />}
        {screen==="result" && <Result r={r} reduce={reduce} onReset={reset} onToast={showToast}
          onShare={()=>shareLink(r,showToast)} onKnow={()=>setShowKnow(true)} />}
        {showKnow && <KnowSheet onClose={()=>setShowKnow(false)} />}
      </div>
    </div>
  );
}

// ───────── Landing ─────────
function Landing({ onStart }) {
  return (
    <div className="scr land">
      <div className="pad">
        <div style={{height:10}} />
        <div className="eyebrow" style={{ textAlign: "center" }}>2030 암 인지도 캠페인</div>
        <div style={{height:14}} />
        <div className="h1" style={{ textAlign: "center" }}>암 걸리기 전에,<br/>앎으로 예방하기</div>
        <div style={{height:16}} />
        <div className="body" style={{color:"rgba(255,255,255,.9)", textAlign: "center"}}>
          30초면 돼요. 같은 <b>나이·성별 또래</b>의<br/>진짜 통계를 보고, 오늘 할 수 있는 걸 찾아봐요.
        </div>
        <div style={{height:22}} />
        
        <div className="bigYou">🫵</div>
        
        {/* 👇 수정된 부분 2: 이모지와 박스 사이 겹침 해결 */}
        <div style={{height: 44}} /> {/* 기존 16에서 44로 늘려서 간격 충분히 확보 */}
        {/* 👆 여기까지 */}
        
        <div className="preview">
          <div className="tiny" style={{color:"rgba(255,255,255,.75)", marginBottom:9}}>테스트 후엔 이런 유형이 나와요</div>
          <div className="previewrow">{DEX_ORDER.slice(0,4).map(c=> <span key={c}>{TYPES[c].emoji}</span>)}</div>
        </div>
        <div style={{height:14}} />
        <div className="badge" style={{ alignSelf: "center" }}>📊 보건의료통계 기반 실제 정보</div>
        {/* 👇 수정된 부분 1: 조 이름 강조 (반투명 뱃지 스타일 적용) */}
        <div style={{ 
          alignSelf: "center", /* 가운데 정렬 */
          background: "rgba(0, 0, 0, 0.15)", /* 반투명 어두운 배경으로 대비 효과 */
          color: "#fff", 
          padding: "8px 18px", 
          borderRadius: "99px", 
          fontWeight: "900", 
          fontSize: "15px", 
          letterSpacing: "0.05em",
          marginBottom: "20px",
          border: "1px solid rgba(255,255,255,0.3)"
        }}>
          💡 IT경영및사업화 6조
        </div>
        {/* 👆 여기까지 */}
        <div style={{flex:1, minHeight:16}} />
        <button className="btn startbtn" onClick={onStart}>30초 자가체크 시작</button>
        <div style={{height:10}} />
        <div className="tiny" style={{color:"rgba(255,255,255,.7)", textAlign:"center"}}>건강보험심사평가원 등 공식 통계 기반 · 의학적 진단이 아니에요</div>
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
    : {A:{t:"예방수칙",c:"#FF5A4D"},B:{t:"멘탈",c:"#7B5EA7"},C:{t:"검진 행동",c:"#14C29A"}}[st.axis];
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
        {st.sub && <div className="body" style={{marginTop:6,fontSize:13.5}}>{st.sub}</div>}
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
function Result({ r, reduce, onReset, onToast, onShare, onKnow }) {
  const band=bandOf(r.risk);
  const sex=r.sexKey==="m"?"남성":"여성";
  const fact = CANCER_FACTS[r.factKey];
  const t=TYPES[r.code];
  const findCenter=()=>{ try{ window.open("https://map.naver.com/p/search/건강검진센터","_blank","noopener"); }catch(e){ onToast("지도 앱에서 ‘건강검진센터’를 검색해보세요 🏥"); } };

  return (
    <div className="scr" style={{overflowY:"auto"}}>
      {/* ① 경각심 — 데이터 기반 통계 */}
      <div className="reveal">
        <div className="eyebrow">{r.ageBand} {sex}를 위한 리얼 통계</div>
        <div className="factcard">
          <div className="factbig">{fact.headline}</div>
          <div className="body" style={{color:"rgba(255,255,255,.92)", marginTop:10, fontSize:14}}>{fact.sub}</div>
        </div>
        <div style={{height:12}} />
        <div className="body" style={{color:"rgba(255,255,255,.92)", fontSize:13.5}}>
          '설마 나는 아니겠지'라고 생각하나요? <b>최근 보건의료 데이터</b>가 증명하고 있어요. 암은 더 이상 중장년층만의 이야기가 아닙니다.
        </div>
        <div className="src">📊 출처: 최근 5년 대장암 증감 통계 (심평원/KOSIS 연계)</div>
      </div>

      <div className="pad" style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* 생활습관 위험 지수 — 참고용 명시 */}
        <div className="gauge">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <span style={{fontWeight:800,fontSize:15}}>내 생활습관 위험 지수</span>
            <span className="gaugeflag">⚠️ 공식 통계 아님 · 자가진단 참고용</span>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,margin:"12px 0 4px"}}>
            <span style={{fontSize:40,fontWeight:900,color:band.color,letterSpacing:"-.03em"}}>{r.risk}</span>
            <span style={{color:"var(--muted)",fontWeight:700,fontSize:14}}>/ 100</span>
            <span className="pill" style={{background:band.color+"22",color:band.color,marginLeft:"auto"}}>{band.emoji} {band.label}</span>
          </div>
          <div className="bar">
            <div className="me" style={{left:`calc(${Math.min(98,Math.max(2,r.risk))}% - 2px)`}} />
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <span className="tiny">낮음</span><span className="tiny">높음</span>
          </div>
          <div style={{height:12}} />
          <div className="body" style={{color:"var(--ink)",fontWeight:600,fontSize:14}}>{band.line}</div>
          <div className="tiny" style={{marginTop:8}}>국립암센터 「국민 암예방수칙 10개」 충족도를 바탕으로 만든 자가진단 점수예요. 실제 발병 위험을 측정하는 의학적 지표가 아니에요.</div>
        </div>

        <div className="discl">
          <div className="tiny" style={{color:"var(--ink)"}}>
            위 통계는 공공 보건의료 데이터를 인용한 사실이며, 생활습관 점수는 별도의 자가진단 참고 자료예요. 이 콘텐츠는 의학적 진단이 아니며, 정확한 상태는 검진으로 확인하세요.
          </div>
        </div>

        <div className="cta" onClick={findCenter}>🏥 가까운 검진센터 찾아보기</div>
        <div className="cta know" onClick={onKnow}>📖 암을 제대로 알기</div>

        {/* ② 공유도 — 디스 유형 */}
        <div style={{borderTop:"1px solid var(--line)",margin:"6px 0 2px"}} />
        <div style={{fontWeight:800,fontSize:14,color:"var(--muted)"}}>🎁 내 건강 유형은?</div>
        <div className="typecard" style={{background:t.bg}}>
          <div className="code">YOUR TYPE · {r.code}</div>
          <div style={{height:10}} />
          <div className="bigemoji">{t.emoji}</div>
          <div style={{height:8}} />
          <div className="tname">{t.name}</div>
          <div style={{height:12}} />
          <div className="diss">{t.diss}</div>
        </div>
        <div className="factbox">
          <div className="factstamp">팩 폭</div>
          <div style={{fontWeight:900, fontSize:13.5, color:"var(--coral-deep)", marginBottom:6}}>너한테 딱 한 가지</div>
          <div style={{fontSize:14, lineHeight:1.6, fontWeight:600}}>👉 {t.act}</div>
        </div>

        <div style={{height:2}} />
        <button className="btn coral" onClick={onShare}>🔗 친구에게 링크 공유하기</button>
        <button className="btn ghost" onClick={onReset}>다시 체크하기</button>
        <div style={{height:6}} />
      </div>
    </div>
  );
}

// ───────── 암을 제대로 알기 (국립암센터 자료 + 2030 팩트 추가) ─────────
function KnowSheet({ onClose }) {
  const rules = [
    "담배를 피우지 말고, 남이 피우는 담배 연기도 피하기",
    "채소와 과일을 충분히 먹고, 균형 잡힌 식사하기",
    "음식을 짜지 않게 먹고, 탄 음식을 피하기",
    "하루 한두 잔의 소량 음주도 피하기",
    "주 5회 이상, 하루 30분 이상 땀나게 운동하기",
    "자신의 체격에 맞는 건강 체중 유지하기",
    "B형간염·자궁경부암 예방접종 지침에 따라 받기",
    "안전한 성생활 하기",
    "발암성 물질에 노출되지 않도록 작업장 안전수칙 지키기",
    "암 조기검진 지침에 따라 검진 빠짐없이 받기",
  ];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e)=>e.stopPropagation()}>
        <div className="sheethandle" />
        <div className="pad" style={{paddingTop:8}}>
          <div className="h2">암을 제대로 알기 📖</div>
          <div className="body" style={{marginTop:6, marginBottom:18, fontSize:14}}>국립암센터 및 공공 통계 기반으로 정리했어요.</div>

          <div className="numbox">
            <div className="tiny" style={{color:"var(--coral-deep)", fontWeight:800, marginBottom:4}}>WHO 발표 기준</div>
            <div className="h3">암 발생의 1/3은 예방, 1/3은 조기발견으로 완치 가능해요</div>
            <div className="body" style={{marginTop:8, fontSize:13.5}}>나머지 1/3의 환자도 적절한 치료로 증상 완화가 가능하다고 알려져 있어요. ‘암 = 무조건 끝’이라는 인식과는 차이가 있어요.</div>
          </div>

          <div style={{height:14}} />
          <div className="h3">2030세대, 왜 안전하지 않을까?</div>
          <div style={{height:10}} />
          <div className="infoblock">
            <div style={{fontWeight:800, fontSize:14}}>📌 2030 발병률이 꾸준히 늘고 있어요</div>
            <div className="body" style={{marginTop:6, fontSize:13.5}}>최근 데이터를 살펴보면, 서구화된 식습관 등으로 2030세대의 대장암 발병률이 최근 5년 새 최대 114%까지 폭증하는 등 발병 증가세가 뚜렷하게 확인됩니다.</div>
          </div>
          <div className="infoblock">
            <div style={{fontWeight:800, fontSize:14}}>📌 초기엔 증상이 거의 없어요</div>
            <div className="body" style={{marginTop:6, fontSize:13.5}}>많은 암이 초기에는 별다른 증상 없이 진행돼요. ‘증상이 없으니 괜찮다’는 젊은 층 특유의 판단보다, 정기 검진으로 확인하는 게 더 정확해요.</div>
          </div>
          <div className="infoblock">
            <div style={{fontWeight:800, fontSize:14}}>📌 조기 발견이면 결과가 크게 달라져요</div>
            <div className="body" style={{marginTop:6, fontSize:13.5}}>같은 암이라도 늦게 발견할수록 치료가 어려워져요. 그래서 증상이 없어도, 젊어도 정기적인 암검진을 시작하는 것이 중요합니다.</div>
          </div>

          <div style={{height:18}} />
          <div className="h3">국민 암예방수칙 10가지</div>
          <div className="tiny" style={{marginTop:4, marginBottom:10}}>국립암센터 암예방사업 자료 기준</div>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {rules.map((rule,i)=>(
              <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start"}}>
                <span style={{flexShrink:0, width:22, height:22, borderRadius:"50%", background:"var(--coral)", color:"#fff",
                  fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center"}}>{i+1}</span>
                <span style={{fontSize:13.5, fontWeight:600, lineHeight:1.5, paddingTop:1}}>{rule}</span>
              </div>
            ))}
          </div>

          <div style={{height:18}} />
          <div className="discl">
            <div className="tiny" style={{color:"var(--ink)"}}>
              출처: 국립암센터 암예방사업, WHO 암 예방 통계, KOSIS 등. 이 정보는 일반적인 암 예방·인지도 향상을 위한 교육용 콘텐츠이며, 특정 질환의 진단이나 치료를 대체하지 않아요.
            </div>
          </div>
          <div style={{height:12}} />
          <button className="btn ghost" onClick={onClose}>닫기</button>
          <div style={{height:8}} />
        </div>
      </div>
    </div>
  );
}