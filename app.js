/* global React, ReactDOM */
const { useState, useMemo, useEffect } = React;
const num = v => { const n = Number(String(v??'').replace(/,/g,'').trim()); return Number.isFinite(n)?n:NaN; };
const fmt = (n,d=0)=> Number.isFinite(n)? n.toFixed(d):'-';

function Tabs({tab,setTab}){
  const names=[['main','入力・計算'],['log','ログ'],['help','解説']];
  return React.createElement(React.Fragment,null,
    names.map(([k,label])=>React.createElement('button',{
      key:k, className:`tab ${tab===k?'active':''}`, onClick:()=>setTab(k)}, label))
  );
}

function App(){
  const [tab,setTab]=useState('main');

  // inputs
  const [dt,setDt]=useState(()=>new Date().toISOString().slice(0,16));
  const [weight,setWeight]=useState('57');
  const [distance,setDistance]=useState('3.4');
  const [time,setTime]=useState('45');
  const [ascent,setAscent]=useState('82');

  const [age,setAge]=useState('66');
  const [restHR,setRestHR]=useState('56');
  const [avgHR,setAvgHR]=useState('95');
  const [borgPre,setBorgPre]=useState('9');
  const [borgPost,setBorgPost]=useState('13');

  const [bp5Sys,setBp5Sys]=useState('112');
  const [bp5Dia,setBp5Dia]=useState('79');

  const [extKcal,setExtKcal]=useState('');
  const [extSrc,setExtSrc]=useState('watch'); // watch | yamap | manual
  const [preferExt,setPreferExt]=useState(true);

  // load last
  useEffect(()=>{
    const last = localStorage.getItem('rehab_v48_last');
    if(last){
      try{ const v=JSON.parse(last);
        setDt(v.dt??new Date().toISOString().slice(0,16));
        setWeight(v.weight??''); setDistance(v.distance??''); setTime(v.time??''); setAscent(v.ascent??'');
        setAge(v.age??''); setRestHR(v.restHR??''); setAvgHR(v.avgHR??''); setBorgPre(v.borgPre??''); setBorgPost(v.borgPost??'');
        setBp5Sys(v.bp5Sys??''); setBp5Dia(v.bp5Dia??''); setExtKcal(v.extKcal??''); setExtSrc(v.extSrc??'watch'); setPreferExt(v.preferExt??true);
      }catch(_){}
    }
  },[]);

  // auto calc
  const auto = useMemo(()=>{
    const d=num(distance), t=num(time), up=num(ascent), w=num(weight);
    const v = (d>0&&t>0)? (d*1000)/t : NaN; // m/min
    const grade = d>0 ? up/(d*1000) : NaN;
    const VO2 = (Number.isFinite(v)&&Number.isFinite(grade)) ? 3.5 + 0.1*v + 1.8*v*grade : NaN;
    const MET = Number.isFinite(VO2) ? VO2/3.5 : NaN;
    const time_hr = Number.isFinite(t)? t/60 : NaN;
    const kcal = (Number.isFinite(MET)&&Number.isFinite(w)&&Number.isFinite(time_hr)) ? MET*w*time_hr : NaN;
    const kcal_min = (Number.isFinite(kcal)&&Number.isFinite(t)&&t>0)? kcal/t : NaN;
    const WAT = Number.isFinite(kcal_min)? kcal_min*69.78 : NaN;
    const kmh = (Number.isFinite(d)&&Number.isFinite(t)&&t>0)? d*60/t : NaN;
    const MET_h = Number.isFinite(MET)&&Number.isFinite(time_hr) ? MET*time_hr : NaN;
    return {VO2,MET,kcal,WAT,kmh,grade,v,MET_h,time_hr};
  },[distance,time,ascent,weight]);

  // external-based
  const ext = useMemo(()=>{
    const kcal = num(extKcal);
    const w=num(weight), t=num(time);
    const time_hr = Number.isFinite(t)? t/60 : NaN;
    const MET = (Number.isFinite(kcal)&&Number.isFinite(w)&&Number.isFinite(time_hr)&&w>0&&time_hr>0)? kcal/(w*time_hr) : NaN;
    const VO2 = Number.isFinite(MET)? MET*3.5 : NaN;
    const kcal_min = (Number.isFinite(kcal)&&Number.isFinite(t)&&t>0)? kcal/t : NaN;
    const WAT = Number.isFinite(kcal_min)? kcal_min*69.78 : NaN;
    const MET_h = Number.isFinite(MET)&&Number.isFinite(time_hr) ? MET*time_hr : NaN;
    return {MET,VO2,kcal,WAT,MET_h,time_hr};
  },[extKcal, weight, time]);

  // HR zone
  const HRcalc = useMemo(()=>{
    const A=num(age), R=num(restHR), H=num(avgHR);
    const HRmax = Number.isFinite(A)? (208 - 0.7*A):NaN;
    const HRR = (Number.isFinite(HRmax)&&Number.isFinite(R))? (HRmax - R):NaN;
    const low = (Number.isFinite(HRR)&&Number.isFinite(R))? (R + 0.40*HRR):NaN;
    const high= (Number.isFinite(HRR)&&Number.isFinite(R))? (R + 0.60*HRR):NaN;
    const pct = (Number.isFinite(H)&&Number.isFinite(R)&&Number.isFinite(HRR)&&HRR>0)? ((H-R)/HRR*100):NaN;
    return {HRmax,low,high,pct};
  },[age,restHR,avgHR]);

  // log
  const [log,setLog]=useState(()=>{
    try{ return JSON.parse(localStorage.getItem('rehab_v48_log')||'[]'); }catch(_){ return []; }
  });

  const preferred = useMemo(()=> preferExt ? ext : auto,[preferExt, ext, auto]);

  const saveLast = ()=>{
    localStorage.setItem('rehab_v48_last', JSON.stringify({dt,weight,distance,time,ascent,age,restHR,avgHR,borgPre,borgPost,bp5Sys,bp5Dia,extKcal,extSrc,preferExt}));
    alert('入力を次回の初期値として保存しました');
  };

  const saveLog = ()=>{
    const entry = {
      dt, weight, distance, time, ascent, age, restHR, avgHR, borgPre, borgPost, bp5Sys, bp5Dia,
      auto_MET: Number(auto.MET?.toFixed(2)), auto_VO2: Number(auto.VO2?.toFixed(1)), auto_kcal: Number(auto.kcal?.toFixed(0)), auto_WAT: Number(auto.WAT?.toFixed(0)), auto_METh: Number(auto.MET_h?.toFixed(2)),
      ext_MET: Number(ext.MET?.toFixed(2)), ext_VO2: Number(ext.VO2?.toFixed(1)), ext_kcal: Number(ext.kcal?.toFixed(0)), ext_WAT: Number(ext.WAT?.toFixed(0)), ext_METh: Number(ext.MET_h?.toFixed(2)),
      used_METh: Number(preferred.MET_h?.toFixed(2)),
      extSrc, preferExt
    };
    const arr=[entry, ...log].slice(0,365);
    setLog(arr);
    localStorage.setItem('rehab_v48_log', JSON.stringify(arr));
    saveLast();
  };

  // weekly aggregation (Mon-Sun)
  const weekly = useMemo(()=>{
    const now = new Date();
    const day = (now.getDay()+6)%7; // Mon=0
    const monday = new Date(now); monday.setDate(now.getDate()-day); monday.setHours(0,0,0,0);
    const sunday = new Date(monday); sunday.setDate(monday.getDate()+7); // exclusive
    let sum = 0;
    const items = (log||[]).filter(r=>{
      const t = new Date(r.dt);
      return t>=monday && t<sunday;
    }).map(r=>{
      const me = r.preferExt ? (r.ext_METh ?? (r.ext_MET*r.time/60)) : (r.auto_METh ?? (r.auto_MET*r.time/60));
      const val = Number(me)||0;
      sum += val;
      return {dt:r.dt, METh:val};
    });
    return {monday, sunday, sum, items};
  },[log]);

  const MainView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'Rehab Log v4.8（METs・時の週合計）'),
    React.createElement('div',{className:'row', style:{marginTop:8}},
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'}, preferExt?'MET（外部基準）':'MET（自動計算）'), React.createElement('div',{className:'big'}, fmt(preferred.MET,2))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'METs・時（今回）'), React.createElement('div',{className:'big'}, fmt(preferred.MET_h,2))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'消費kcal（今回）'), React.createElement('div',{className:'big'}, fmt(preferred.kcal,0)))
    ),
    React.createElement('div',{className:'row', style:{marginTop:8}},
      React.createElement('div',{className:'stat'},
        React.createElement('div',{className:'muted'},'週間 METs・時 合計（Mon–Sun）'),
        React.createElement('div',{className:'big'}, fmt(weekly.sum,2)),
        (function(){
          const p = Math.min(100, weekly.sum/23*100);
          return React.createElement('div',{className:'bar',style:{marginTop:8}},
            React.createElement('div',{style:{width:`${p}%`}})
          )
        })(),
        React.createElement('div',{className: weekly.sum>=23?'ok':'warn', style:{marginTop:6}},
          weekly.sum>=33 ? '◎ 週間33 METs・時 も達成！' : (weekly.sum>=23 ? '○ 週間23 達成！' : '▲ 週間23 まであと少し'))
      ),
      React.createElement('div',{className:'stat'},
        React.createElement('div',{className:'muted'},'週目標（参考：厚労省）'),
        React.createElement('div',null,'最低ライン：23 METs・時 / 週'),
        React.createElement('div',null,'推奨ライン：33 METs・時 / 週')
      )
    ),
    React.createElement('div',{className:'btns'},
      React.createElement('button',{onClick:saveLog},'この内容をログ保存'),
      React.createElement('button',{className:'secondary',onClick:()=>{
        localStorage.setItem('rehab_v48_last', JSON.stringify({dt,weight,distance,time,ascent,age,restHR,avgHR,borgPre,borgPost,bp5Sys,bp5Dia,extKcal,extSrc,preferExt}));
        alert('入力値を次回の初期値として保存しました');
      }},'入力値を次回も使う')
    )
  );

  const LogView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'ログ一覧 / CSV'),
    React.createElement('div',{style:{overflowX:'auto', marginTop:8}},
      React.createElement('table',null,
        React.createElement('thead',null, React.createElement('tr',null,
          ['日時','距離','時間','上り','平均HR','Borg後','BP5分後',
           'MET(自動)','VO2(自動)','kcal(自動)','WAT(自動)','METs・時(自動)',
           'MET(外部)','VO2(外部)','kcal(外部)','WAT(外部)','METs・時(外部)',
           '使用METs・時','外部ソース','優先'].map((h,i)=>React.createElement('th',{key:i},h))
        )),
        React.createElement('tbody',null,
          (log||[]).map((r,i)=>React.createElement('tr',{key:i},
            React.createElement('td',null,r.dt),
            React.createElement('td',null,r.distance),
            React.createElement('td',null,r.time),
            React.createElement('td',null,r.ascent),
            React.createElement('td',null,r.avgHR),
            React.createElement('td',null,r.borgPost),
            React.createElement('td',null,`${r.bp5Sys}/${r.bp5Dia}`),
            React.createElement('td',null,r.auto_MET),
            React.createElement('td',null,r.auto_VO2),
            React.createElement('td',null,r.auto_kcal),
            React.createElement('td',null,r.auto_WAT),
            React.createElement('td',null,r.auto_METh),
            React.createElement('td',null,r.ext_MET),
            React.createElement('td',null,r.ext_VO2),
            React.createElement('td',null,r.ext_kcal),
            React.createElement('td',null,r.ext_WAT),
            React.createElement('td',null,r.ext_METh),
            React.createElement('td',null,r.used_METh),
            React.createElement('td',null,({'watch':'ウォッチ','yamap':'YAMAP','manual':'手入力'}[r.extSrc]||'-')),
            React.createElement('td',null,r.preferExt?'外部':'自動')
          ))
        )
      )
    ),
    React.createElement('div',{className:'btns', style:{marginTop:8}},
      React.createElement('button',{className:'secondary',onClick:()=>{
        const data=JSON.parse(localStorage.getItem('rehab_v48_log')||'[]');
        const header=['日時','距離km','時間分','上りm','年齢','安静HR','平均HR','Borg後','BP5分後',
          'MET(自動)','VO2(自動)','kcal(自動)','WAT(自動)','METs・時(自動)',
          'MET(外部)','VO2(外部)','kcal(外部)','WAT(外部)','METs・時(外部)',
          '使用METs・時','外部ソース','表示優先'];
        const rows=data.map(r=>[r.dt,r.distance,r.time,r.ascent,r.age,r.restHR,r.avgHR,r.borgPost,`${r.bp5Sys}/${r.bp5Dia}`,
          r.auto_MET,r.auto_VO2,r.auto_kcal,r.auto_WAT,r.auto_METh,
          r.ext_MET,r.ext_VO2,r.ext_kcal,r.ext_WAT,r.ext_METh,
          r.used_METh, r.extSrc, r.preferExt?'外部':'自動']);
        const csv=[header.join(','),...rows.map(a=>a.join(','))].join('\n');
        const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob);
        const a=document.createElement('a'); a.href=url; a.download='rehab_log_v48.csv'; a.click(); URL.revokeObjectURL(url);
      }},'CSVで出力')
    )
  );

  const HelpView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'解説（式・AT・METs・時）'),
    React.createElement('h3',null,'1) METs・時（MET-hours）とは'),
    React.createElement('p',null,'強度（MET）× 時間（時間[h]）で表す身体活動量の指標です。厚労省は健康維持に週23（できれば33）METs・時を推奨しています。'),
    React.createElement('div',{className:'code'},'METs・時 = MET × 時間 (h)'),
    React.createElement('h3',null,'2) 週合計の考え方'),
    React.createElement('p',null,'本アプリでは週の計算を月曜はじまり（Mon–Sun）で集計します。ログの「優先（外部 or 自動）」に従い、その回のMETs・時を採用します。'),
    React.createElement('h3',null,'3) 参考：式の再掲'),
    React.createElement('div',{className:'code'},`VO2 = 3.5 + 0.1 × v + 1.8 × v × 勾配
MET = VO2 / 3.5
エネルギー消費(kcal) = MET × 時間[h] × 体重[kg]
入力kcal基準: MET = 入力kcal / (体重 × 時間[h])`)
  );

  useEffect(()=>{
    const m = ReactDOM.createRoot(document.getElementById('tabs'));
    m.render(React.createElement(Tabs,{tab,setTab}));
  },[tab]);

  return React.createElement(React.Fragment,null,
    tab==='main'?MainView: tab==='log'?LogView: HelpView
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
