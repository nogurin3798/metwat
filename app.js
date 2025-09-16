/* global React, ReactDOM */
const { useState, useMemo, useEffect } = React;
const num = v => { const n = Number(String(v??'').replace(/,/g,'').trim()); return Number.isFinite(n)?n:NaN; };
const fmt = (n,d=0)=> Number.isFinite(n)? n.toFixed(d):'-';
function Tabs({tab,setTab}){ const names=[['main','入力・計算'],['log','ログ'],['charts','グラフ'],['help','解説']];
  return React.createElement(React.Fragment,null,names.map(([k,l])=>React.createElement('button',{key:k,className:`tab ${tab===k?'active':''}`,onClick:()=>setTab(k)},l))); }
function App(){
  const [tab,setTab]=useState('main');
  const [dt,setDt]=useState(()=>new Date().toISOString().slice(0,16));
  const [autoNow,setAutoNow]=useState(()=> (localStorage.getItem('rehab_auto_now') ?? '1') === '1');
  useEffect(()=>localStorage.setItem('rehab_auto_now', autoNow?'1':'0'),[autoNow]);
  const [weight,setWeight]=useState('57'); const [distance,setDistance]=useState('3.4'); const [time,setTime]=useState('45'); const [ascent,setAscent]=useState('82');
  const [age,setAge]=useState('66'); const [restHR,setRestHR]=useState('56'); const [avgHR,setAvgHR]=useState('95'); const [hrAfter,setHrAfter]=useState(''); const [hr5min,setHr5min]=useState('');
  const [borgPre,setBorgPre]=useState('9'); const [borgPost,setBorgPost]=useState('13');
  const [bpPreSys,setBpPreSys]=useState(''); const [bpPreDia,setBpPreDia]=useState(''); const [bpPostSys,setBpPostSys]=useState(''); const [bpPostDia,setBpPostDia]=useState('');
  const [bp5Sys,setBp5Sys]=useState('112'); const [bp5Dia,setBp5Dia]=useState('79');
  const [extKcal,setExtKcal]=useState(''); const [extSrc,setExtSrc]=useState('watch'); const [preferExt,setPreferExt]=useState(true);
  const [weekStart,setWeekStart]=useState(()=>{ try{return localStorage.getItem('rehab_week_start')||'sun';}catch(_){return 'sun';} });
  useEffect(()=>{ const last48 = localStorage.getItem('rehab_v48_last'); const last = last48 || localStorage.getItem('rehab_v47_last');
    if(last){ try{ const v=JSON.parse(last); setDt(v.dt??new Date().toISOString().slice(0,16));
      setWeight(v.weight??''); setDistance(v.distance??''); setTime(v.time??''); setAscent(v.ascent??'');
      setAge(v.age??''); setRestHR(v.restHR??''); setAvgHR(v.avgHR??''); setHrAfter(v.hrAfter??''); setHr5min(v.hr5min??'');
      setBorgPre(v.borgPre??''); setBorgPost(v.borgPost??''); setBpPreSys(v.bpPreSys??''); setBpPreDia(v.bpPreDia??''); setBpPostSys(v.bpPostSys??''); setBpPostDia(v.bpPostDia??'');
      setBp5Sys(v.bp5Sys??''); setBp5Dia(v.bp5Dia??''); setExtKcal(v.extKcal??''); setExtSrc(v.extSrc??'watch'); setPreferExt(v.preferExt??true); }catch(_){}} },[]);
  useEffect(()=>{ localStorage.setItem('rehab_week_start', weekStart); },[weekStart]);
  const auto = useMemo(()=>{ const d=num(distance), t=num(time), up=num(ascent), w=num(weight);
    const v=(d>0&&t>0)?(d*1000)/t:NaN; const grade=d>0?up/(d*1000):NaN; const VO2=(Number.isFinite(v)&&Number.isFinite(grade))?3.5+0.1*v+1.8*v*grade:NaN;
    const MET=Number.isFinite(VO2)?VO2/3.5:NaN; const time_hr=Number.isFinite(t)?t/60:NaN; const kcal=(Number.isFinite(MET)&&Number.isFinite(w)&&Number.isFinite(time_hr))?MET*w*time_hr:NaN;
    const kcal_min=(Number.isFinite(kcal)&&Number.isFinite(t)&&t>0)?kcal/t:NaN; const WAT=Number.isFinite(kcal_min)?kcal_min*69.78:NaN; const kmh=(Number.isFinite(d)&&Number.isFinite(t)&&t>0)?d*60/t:NaN;
    const MET_h=Number.isFinite(MET)&&Number.isFinite(time_hr)?MET*time_hr:NaN; return {VO2,MET,kcal,WAT,kmh,grade,v,MET_h,time_hr}; },[distance,time,ascent,weight]);
  const ext = useMemo(()=>{ const kcal=num(extKcal), w=num(weight), t=num(time); const time_hr=Number.isFinite(t)?t/60:NaN;
    const MET=(Number.isFinite(kcal)&&Number.isFinite(w)&&Number.isFinite(time_hr)&&w>0&&time_hr>0)?kcal/(w*time_hr):NaN; const VO2=Number.isFinite(MET)?MET*3.5:NaN;
    const kcal_min=(Number.isFinite(kcal)&&Number.isFinite(t)&&t>0)?kcal/t:NaN; const WAT=Number.isFinite(kcal_min)?kcal_min*69.78:NaN; const MET_h=Number.isFinite(MET)&&Number.isFinite(time_hr)?MET*time_hr:NaN;
    return {MET,VO2,kcal,WAT,MET_h,time_hr}; },[extKcal,weight,time]);
  const HRcalc = useMemo(()=>{ const A=num(age), R=num(restHR), H=num(avgHR); const HRmax=Number.isFinite(A)?(208-0.7*A):NaN; const HRR=(Number.isFinite(HRmax)&&Number.isFinite(R))?(HRmax-R):NaN;
    const low=(Number.isFinite(HRR)&&Number.isFinite(R))?(R+0.40*HRR):NaN; const high=(Number.isFinite(HRR)&&Number.isFinite(R))?(R+0.60*HRR):NaN; const pct=(Number.isFinite(H)&&Number.isFinite(R)&&Number.isFinite(HRR)&&HRR>0)?((H-R)/HRR*100):NaN;
    return {HRmax,low,high,pct}; },[age,restHR,avgHR]);
  const [log,setLog]=useState(()=>{ try{return JSON.parse(localStorage.getItem('rehab_v48_log')||localStorage.getItem('rehab_v47_log')||'[]');}catch(_){return [];} });
  const preferred = useMemo(()=> preferExt ? ext : auto,[preferExt, ext, auto]);
  const saveLast = (dtValue)=>{ localStorage.setItem('rehab_v48_last', JSON.stringify({ dt:dtValue??dt, weight,distance,time,ascent,age,restHR,avgHR,hrAfter,hr5min,borgPre,borgPost,bpPreSys,bpPreDia,bpPostSys,bpPostDia,bp5Sys,bp5Dia,extKcal,extSrc,preferExt })); };
  const saveLog = ()=>{ let dtToUse=dt; if(autoNow){ dtToUse=new Date().toISOString().slice(0,16); setDt(dtToUse); }
    const entry={ dt:dtToUse, weight,distance,time,ascent,age,restHR,avgHR,hrAfter,hr5min,borgPre,borgPost,bpPreSys,bpPreDia,bpPostSys,bpPostDia,bp5Sys,bp5Dia,
      auto_MET:Number(auto.MET?.toFixed(2)), auto_VO2:Number(auto.VO2?.toFixed(1)), auto_kcal:Number(auto.kcal?.toFixed(0)), auto_WAT:Number(auto.WAT?.toFixed(0)), auto_METh:Number(auto.MET_h?.toFixed(2)),
      ext_MET:Number(ext.MET?.toFixed(2)), ext_VO2:Number(ext.VO2?.toFixed(1)), ext_kcal:Number(ext.kcal?.toFixed(0)), ext_WAT:Number(ext.WAT?.toFixed(0)), ext_METh:Number(ext.MET_h?.toFixed(2)),
      used_METh:Number((preferExt?ext.MET_h:auto.MET_h)?.toFixed(2)), speed_kmh:Number(auto.kmh?.toFixed(2)), grade_pct:Number((auto.grade*100)?.toFixed(1)), extSrc, preferExt };
    const arr=[entry, ...log].slice(0,500); setLog(arr); localStorage.setItem('rehab_v48_log', JSON.stringify(arr)); saveLast(dtToUse); alert('ログを保存しました'); };
  const weekly = useMemo(()=>{ const now=new Date(); let start=new Date(now); if(weekStart==='mon'){ const day=(now.getDay()+6)%7; start.setDate(now.getDate()-day);} else { start.setDate(now.getDate()-now.getDay()); }
    start.setHours(0,0,0,0); const end=new Date(start); end.setDate(start.getDate()+7); let sum=0; const items=(log||[]).filter(r=>{const t=new Date(r.dt); return t>=start&&t<end;}).map(r=>{ const me=r.preferExt?(r.ext_METh??(r.ext_MET*r.time/60)):(r.auto_METh??(r.auto_MET*r.time/60)); const val=Number(me)||0; sum+=val; return {dt:r.dt,METh:val}; }); return {start,end,sum,items}; },[log,weekStart]);
  const recent=(log||[]).slice(0,20).reverse(); function SimpleChart({data,label}){ const w=800,h=220,pad=24; const xs=data.map((_,i)=> pad+(w-2*pad)*(i/(Math.max(1,data.length-1)))); const maxY=Math.max(1,...data);
    const ys=data.map(v=> h-pad-(h-2*pad)*(v/maxY)); const points=xs.map((x,i)=>`${x},${ys[i]}`).join(' '); return React.createElement('svg',{width:'100%',height:h,viewBox:`0 0 ${w} ${h}`},
      React.createElement('rect',{x:0,y:0,width:w,height:h,fill:'#fff',stroke:'#e5e7eb'}), React.createElement('polyline',{points,fill:'none',stroke:'#0ea5e9','strokeWidth':3}),
      React.createElement('text',{x:pad,y:16,fill:'#334155'},label||''), React.createElement('text',{x:w-pad,y:16,fill:'#334155','textAnchor':'end'},`max ${maxY.toFixed(1)}`)); }
  const MainView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'Rehab Log v4.8（＋保存時に現在時刻を自動セット）'),
    React.createElement('div',{className:'grid inputs',style:{marginTop:8}},
      React.createElement('div',null, React.createElement('label',null,'日時'), React.createElement('input',{type:'datetime-local',value:dt,onChange:e=>setDt(e.target.value)}),
        React.createElement('div',{className:'pill',style:{marginTop:6}}, React.createElement('input',{type:'checkbox',checked:autoNow,onChange:e=>setAutoNow(e.target.checked)}), React.createElement('span',null,'保存時に現在時刻を自動セット'))),
      React.createElement('div',null, React.createElement('label',null,'体重 (kg)'), React.createElement('input',{value:weight,onChange:e=>setWeight(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'距離 (km)'), React.createElement('input',{value:distance,onChange:e=>setDistance(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'時間 (分)'), React.createElement('input',{value:time,onChange:e=>setTime(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'上り (m)'), React.createElement('input',{value:ascent,onChange:e=>setAscent(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'週の開始曜日'), React.createElement('select',{value:weekStart,onChange:e=>setWeekStart(e.target.value)}, React.createElement('option',{value:'sun'},'日曜はじまり'), React.createElement('option',{value:'mon'},'月曜はじまり')))),
    React.createElement('div',{className:'grid inputs',style:{marginTop:8}},
      React.createElement('div',null, React.createElement('label',null,'年齢'), React.createElement('input',{value:age,onChange:e=>setAge(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'安静心拍 (bpm)'), React.createElement('input',{value:restHR,onChange:e=>setRestHR(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'平均心拍 (bpm)'), React.createElement('input',{value:avgHR,onChange:e=>setAvgHR(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'終了直後HR (任意)'), React.createElement('input',{value:hrAfter,onChange:e=>setHrAfter(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'5分後HR (任意)'), React.createElement('input',{value:hr5min,onChange:e=>setHr5min(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'Borg 前'), React.createElement('input',{value:borgPre,onChange:e=>setBorgPre(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'Borg 後'), React.createElement('input',{value:borgPost,onChange:e=>setBorgPost(e.target.value)}))),
    React.createElement('div',{className:'grid inputs',style:{marginTop:8}},
      React.createElement('div',null, React.createElement('label',null,'血圧 前（収縮）'), React.createElement('input',{value:bpPreSys,onChange:e=>setBpPreSys(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'血圧 前（拡張）'), React.createElement('input',{value:bpPreDia,onChange:e=>setBpPreDia(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'血圧 後（収縮）'), React.createElement('input',{value:bpPostSys,onChange:e=>setBpPostSys(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'血圧 後（拡張）'), React.createElement('input',{value:bpPostDia,onChange:e=>setBpPostDia(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'血圧 5分後（収縮）'), React.createElement('input',{value:bp5Sys,onChange:e=>setBp5Sys(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'血圧 5分後（拡張）'), React.createElement('input',{value:bp5Dia,onChange:e=>setBp5Dia(e.target.value)}))),
    React.createElement('div',{className:'grid inputs',style:{marginTop:8}},
      React.createElement('div',null, React.createElement('label',null,'外部の消費kcal（ウォッチ/YAMAP/手入力）'), React.createElement('input',{value:extKcal,onChange:e=>setExtKcal(e.target.value)})),
      React.createElement('div',null, React.createElement('label',null,'外部ソース'), React.createElement('select',{value:extSrc,onChange:e=>setExtSrc(e.target.value)}, React.createElement('option',{value:'watch'},'ウォッチ'), React.createElement('option',{value:'yamap'},'YAMAP'), React.createElement('option',{value:'manual'},'手入力'))),
      React.createElement('div',null, React.createElement('label',null,'表示優先'), React.createElement('select',{value:preferExt?'ext':'auto',onChange:e=>setPreferExt(e.target.value==='ext')}, React.createElement('option',{value:'ext'},'外部基準を優先'), React.createElement('option',{value:'auto'},'自動計算を優先'))),
      React.createElement('div',null, React.createElement('label',null,'速度 v (km/h)'), React.createElement('input',{value:fmt(auto.kmh,2),readOnly:true})),
      React.createElement('div',null, React.createElement('label',null,'勾配 (%)'), React.createElement('input',{value:Number.isFinite(auto.grade)?(auto.grade*100).toFixed(1):'-',readOnly:true}))),
    React.createElement('div',{className:'row',style:{marginTop:8}},
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},preferExt?'MET（外部基準）':'MET（自動計算）'), React.createElement('div',{className:'big'},fmt(preferExt?ext.MET:auto.MET,2))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'VO₂ (mL/kg/min)'), React.createElement('div',{className:'big'},fmt(preferExt?ext.VO2:auto.VO2,1))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'WAT（推定W）'), React.createElement('div',{className:'big'},fmt(preferExt?ext.WAT:auto.WAT,0))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'消費kcal（今回）'), React.createElement('div',{className:'big'},fmt(preferExt?ext.kcal:auto.kcal,0))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'METs・時（今回）'), React.createElement('div',{className:'big'},fmt(preferExt?(ext.MET_h):(auto.MET_h),2)))),
    React.createElement('div',{className:'row',style:{marginTop:8}},
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},`週間 METs・時 合計（${weekStart==='sun'?'Sun–Sat':'Mon–Sun'}）`), React.createElement('div',{className:'big'},fmt(weekly.sum,2)),
        React.createElement('div',{className:'bar',style:{marginTop:8}}, React.createElement('div',{style:{width:`${Math.min(100,weekly.sum/23*100)}%`}}))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'心拍ゾーン（40–60% HRR）'),
        React.createElement('div',null,`HRmax: ${fmt(HRcalc.HRmax,0)} bpm`), React.createElement('div',null,`目標: ${fmt(HRcalc.low,0)}–${fmt(HRcalc.high,0)} bpm`), React.createElement('div',null,`現在: ${fmt(HRcalc.pct,0)}% HRR`))),
    React.createElement('div',{className:'btns'}, React.createElement('button',{onClick:saveLog},'この内容をログ保存'), React.createElement('button',{className:'secondary',onClick:()=>saveLast()},'入力値を次回も使う')));
  const LogView = React.createElement('div',{className:'card'}, React.createElement('div',{className:'title'},'ログ一覧 / CSV'),
    React.createElement('div',{style:{overflowX:'auto',marginTop:8}}, React.createElement('table',null,
      React.createElement('thead',null, React.createElement('tr',null, ['日時','距離','時間','上り','平均HR','Borg後','BP5分後','速度km/h','勾配%','MET(自動)','VO2(自動)','kcal(自動)','WAT(自動)','METs・時(自動)','MET(外部)','VO2(外部)','kcal(外部)','WAT(外部)','METs・時(外部)','使用METs・時','外部ソース','優先'].map((h,i)=>React.createElement('th',{key:i},h)))),
      React.createElement('tbody',null, (log||[]).map((r,i)=>React.createElement('tr',{key:i},
        React.createElement('td',null,r.dt),React.createElement('td',null,r.distance),React.createElement('td',null,r.time),React.createElement('td',null,r.ascent),React.createElement('td',null,r.avgHR),React.createElement('td',null,r.borgPost),React.createElement('td',null,`${r.bp5Sys||''}/${r.bp5Dia||''}`),React.createElement('td',null,r.speed_kmh),React.createElement('td',null,r.grade_pct),React.createElement('td',null,r.auto_MET),React.createElement('td',null,r.auto_VO2),React.createElement('td',null,r.auto_kcal),React.createElement('td',null,r.auto_WAT),React.createElement('td',null,r.auto_METh),React.createElement('td',null,r.ext_MET),React.createElement('td',null,r.ext_VO2),React.createElement('td',null,r.ext_kcal),React.createElement('td',null,r.ext_WAT),React.createElement('td',null,r.ext_METh),React.createElement('td',null,r.used_METh),React.createElement('td',null,({'watch':'ウォッチ','yamap':'YAMAP','manual':'手入力'}[r.extSrc]||'-')),React.createElement('td',null,r.preferExt?'外部':'自動'))))),
    React.createElement('div',{className:'btns',style:{marginTop:8}}, React.createElement('button',{className:'secondary',onClick:()=>{ const data=JSON.parse(localStorage.getItem('rehab_v48_log')||'[]');
      const header=['日時','距離km','時間分','上りm','年齢','安静HR','平均HR','Borg後','BP5分後','速度km/h','勾配%','MET(自動)','VO2(自動)','kcal(自動)','WAT(自動)','METs・時(自動)','MET(外部)','VO2(外部)','kcal(外部)','WAT(外部)','METs・時(外部)','使用METs・時','外部ソース','表示優先'];
      const rows=data.map(r=>[r.dt,r.distance,r.time,r.ascent,r.age,r.restHR,r.avgHR,r.borgPost,`${r.bp5Sys||''}/${r.bp5Dia||''}`,r.speed_kmh,r.grade_pct,r.auto_MET,r.auto_VO2,r.auto_kcal,r.auto_WAT,r.auto_METh,r.ext_MET,r.ext_VO2,r.ext_kcal,r.ext_WAT,r.ext_METh,r.used_METh,r.extSrc,r.preferExt?'外部':'自動']);
      const csv=[header.join(','),...rows.map(a=>a.join(','))].join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='rehab_log_v48.csv'; a.click(); URL.revokeObjectURL(url);} },'CSVで出力'),
      React.createElement('button',{className:'secondary',onClick:()=>{ if(confirm('すべてのログを削除しますか？')){ localStorage.removeItem('rehab_v48_log'); setLog([]);} }},'ログを全削除')));
  const ChartsView = React.createElement('div',{className:'card'}, React.createElement('div',{className:'title'},'グラフ（直近20件）'), (function(){ const r=(log||[]).slice(0,20).reverse();
    const hr=r.map(x=>Number(x.avgHR)||0), met=r.map(x=>Number(x.preferExt?x.ext_MET:x.auto_MET)||0), wat=r.map(x=>Number(x.preferExt?x.ext_WAT:x.auto_WAT)||0);
    return React.createElement(React.Fragment,null, React.createElement(SimpleChart,{data:hr,label:'平均HR (bpm)'}), React.createElement('div',{style:{height:8}}), React.createElement(SimpleChart,{data:met,label:'MET'}), React.createElement('div',{style:{height:8}}), React.createElement(SimpleChart,{data:wat,label:'WAT (W)'})); })());
  function SimpleChart({data,label}){ const w=800,h=220,pad=24; const xs=data.map((_,i)=> pad+(w-2*pad)*(i/(Math.max(1,data.length-1)))); const maxY=Math.max(1,...data);
    const ys=data.map(v=> h-pad-(h-2*pad)*(v/maxY)); const points=xs.map((x,i)=>`${x},${ys[i]}`).join(' '); return React.createElement('svg',{width:'100%',height:h,viewBox:`0 0 ${w} ${h}`}, React.createElement('rect',{x:0,y:0,width:w,height:h,fill:'#fff',stroke:'#e5e7eb'}), React.createElement('polyline',{points,fill:'none',stroke:'#0ea5e9','strokeWidth':3}), React.createElement('text',{x:pad,y:16,fill:'#334155'},label||''), React.createElement('text',{x:w-pad,y:16,fill:'#334155','textAnchor':'end'},`max ${maxY.toFixed(1)}`)); }
  const HelpView = React.createElement('div',{className:'card'}, React.createElement('div',{className:'title'},'解説（数式・METs・時・週開始・自動時刻）'),
    React.createElement('h3',null,'主要な式'), React.createElement('div',{className:'code'},`歩行VO2 = 3.5 + 0.1×v + 1.8×v×勾配
MET = VO2 / 3.5
消費エネルギー(kcal) = MET × 時間[h] × 体重[kg]
外部kcalからの逆算: MET = kcal / (体重 × 時間[h])`),
    React.createElement('h3',null,'自動時刻'), React.createElement('p',null,'「保存時に現在時刻を自動セット」がONのとき、保存ボタンを押した瞬間の時刻をログに記録し、入力欄の日時も更新します。設定は端末に保存されます。'));
  useEffect(()=>{ const m=ReactDOM.createRoot(document.getElementById('tabs')); m.render(React.createElement(Tabs,{tab,setTab})); },[tab]);
  return React.createElement(React.Fragment,null, tab==='main'?MainView: tab==='log'?LogView: tab==='charts'?ChartsView: HelpView);
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
