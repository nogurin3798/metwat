/* global React, ReactDOM */
const { useState, useMemo } = React;
const toNumber = v => { const n = Number(v); return Number.isFinite(n)?n:NaN; };
const fmt = (n,d=0)=>Number.isFinite(n)?n.toFixed(d):'-';
function Stat({label,value}){return React.createElement('div',{style:{padding:10,border:'1px solid #ddd',borderRadius:8}},[React.createElement('div',{style:{fontSize:12,color:'#555'}},label),React.createElement('div',{style:{fontSize:20,fontWeight:700}},value)]);}
function App(){
 const [dt,setDt]=useState('');const [weight,setWeight]=useState('');const [distance,setDistance]=useState('');const [time,setTime]=useState('');const [ascent,setAscent]=useState('');
 const [age,setAge]=useState('');const [restHR,setRestHR]=useState('');const [avgHR,setAvgHR]=useState('');const [borgPre,setBorgPre]=useState('');const [borgPost,setBorgPost]=useState('');
 const [bpPreSys,setBpPreSys]=useState('');const [bpPreDia,setBpPreDia]=useState('');const [bpPostSys,setBpPostSys]=useState('');const [bpPostDia,setBpPostDia]=useState('');
 const values=useMemo(()=>{const w=toNumber(weight),d=toNumber(distance),t=toNumber(time),up=toNumber(ascent);const v=(d&&t)?(d*1000)/t:NaN;const grade=(d&&up)?up/(d*1000):NaN;const VO2=(v&&grade)?3.5+0.1*v+1.8*v*grade:NaN;const MET=VO2?VO2/3.5:NaN;const time_hr=t/60;const energy=(MET&&w&&time_hr)?MET*w*time_hr:NaN;const kcal_min=(energy&&t)?energy/t:NaN;const WAT=(kcal_min)?kcal_min*69.78:NaN;const kmh=(d&&t)?d*60/t:NaN;const A=toNumber(age),R=toNumber(restHR),H=toNumber(avgHR);const HRmax=A?208-0.7*A:NaN;const HRR=(HRmax&&R)?HRmax-R:NaN;const zoneLow=(HRR&&R)?R+0.4*HRR:NaN;const zoneHigh=(HRR&&R)?R+0.6*HRR:NaN;const pctHRR=(H&&R&&HRR)?(H-R)/HRR*100:NaN;return {MET,WAT,kmh,energy,HRmax,zoneLow,zoneHigh,pctHRR};},[weight,distance,time,ascent,age,restHR,avgHR]);
 return React.createElement('div',{style:{padding:20,fontFamily:'sans-serif'}},[
  React.createElement('h2',null,'MET・WAT + 心拍・Borg・血圧 ログ（PWA v4.3）'),
  React.createElement('div',null,[
   '日時:',React.createElement('input',{type:'datetime-local',value:dt,onChange:e=>setDt(e.target.value)}),' 体重:',React.createElement('input',{value:weight,onChange:e=>setWeight(e.target.value)}),
   ' 距離:',React.createElement('input',{value:distance,onChange:e=>setDistance(e.target.value)}),' 時間:',React.createElement('input',{value:time,onChange:e=>setTime(e.target.value)}),' 上り:',React.createElement('input',{value:ascent,onChange:e=>setAscent(e.target.value)})]),
  React.createElement('div',null,[
   '年齢:',React.createElement('input',{value:age,onChange:e=>setAge(e.target.value)}),' 安静HR:',React.createElement('input',{value:restHR,onChange:e=>setRestHR(e.target.value)}),
   ' 平均HR:',React.createElement('input',{value:avgHR,onChange:e=>setAvgHR(e.target.value)}),' Borg前:',React.createElement('input',{value:borgPre,onChange:e=>setBorgPre(e.target.value)}),' Borg後:',React.createElement('input',{value:borgPost,onChange:e=>setBorgPost(e.target.value)})]),
  React.createElement('div',null,[
   'BP前(収縮):',React.createElement('input',{value:bpPreSys,onChange:e=>setBpPreSys(e.target.value)}),' BP前(拡張):',React.createElement('input',{value:bpPreDia,onChange:e=>setBpPreDia(e.target.value)}),
   ' BP後(収縮):',React.createElement('input',{value:bpPostSys,onChange:e=>setBpPostSys(e.target.value)}),' BP後(拡張):',React.createElement('input',{value:bpPostDia,onChange:e=>setBpPostDia(e.target.value)})]),
  React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:10}},[
   React.createElement(Stat,{label:'MET',value:fmt(values.MET,2)}),React.createElement(Stat,{label:'WAT',value:fmt(values.WAT,0)+' W'}),
   React.createElement(Stat,{label:'速度 v',value:fmt(values.kmh,2)+' km/h'}),React.createElement(Stat,{label:'消費エネルギー',value:fmt(values.energy,0)+' kcal'})]),
  React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:10}},[
   React.createElement(Stat,{label:'平均HR',value:avgHR+' bpm'}),React.createElement(Stat,{label:'推定HRmax (Tanaka)',value:fmt(values.HRmax,0)+' bpm'}),
   React.createElement(Stat,{label:'目標ゾーン',value:fmt(values.zoneLow,0)+'-'+fmt(values.zoneHigh,0)+' bpm'}),React.createElement(Stat,{label:'%HRR',value:fmt(values.pctHRR,0)+'%'})])]);}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
