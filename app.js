/* global React, ReactDOM */
const { useState, useMemo, useEffect } = React;
const num = v => { const n = Number(String(v??'').replace(/,/g,'').trim()); return Number.isFinite(n)?n:NaN; };
const fmt = (n,d=0)=> Number.isFinite(n)? n.toFixed(d):'-';

function Badge({avg, low, high}){
  if(!Number.isFinite(avg)||!Number.isFinite(low)||!Number.isFinite(high)) return null;
  let cls='zone-ok', text='適正ゾーン';
  if(avg<low){ cls='zone-warn'; text='やや低い'; }
  if(avg>high){ cls='zone-danger'; text='強い'; }
  return React.createElement('span',{className:`badge ${cls}`}, text);
}

function App(){
  // base inputs
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

  // external kcal mode
  const [extKcal,setExtKcal]=useState(''); // e.g., YAMAP calorie
  const [preferExt,setPreferExt]=useState(true); // which to highlight

  // load last inputs
  useEffect(()=>{
    const last = localStorage.getItem('rehab_v45_last');
    if(last){
      try{ const v=JSON.parse(last);
        setWeight(v.weight??''); setDistance(v.distance??''); setTime(v.time??''); setAscent(v.ascent??'');
        setAge(v.age??''); setRestHR(v.restHR??''); setAvgHR(v.avgHR??''); setBorgPre(v.borgPre??''); setBorgPost(v.borgPost??'');
        setBp5Sys(v.bp5Sys??''); setBp5Dia(v.bp5Dia??''); setExtKcal(v.extKcal??''); setPreferExt(v.preferExt??true);
      }catch(_){}
    }
  },[]);

  // calculated values (model MET)
  const calc = useMemo(()=>{
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
    return {VO2,MET,kcal,WAT,kmh};
  },[distance,time,ascent,weight]);

  // derived from external kcal
  const ext = useMemo(()=>{
    const kcal = num(extKcal);
    const w=num(weight), t=num(time);
    const time_hr = Number.isFinite(t)? t/60 : NaN;
    const MET = (Number.isFinite(kcal)&&Number.isFinite(w)&&Number.isFinite(time_hr)&&w>0&&time_hr>0)? kcal/(w*time_hr) : NaN;
    const kcal_min = (Number.isFinite(kcal)&&Number.isFinite(t)&&t>0)? kcal/t : NaN;
    const WAT = Number.isFinite(kcal_min)? kcal_min*69.78 : NaN;
    return {MET,kcal,WAT};
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

  // logging
  const [log,setLog]=useState(()=>{
    try{ return JSON.parse(localStorage.getItem('rehab_v45_log')||'[]'); }catch(_){ return []; }
  });

  const saveLast = ()=>{
    localStorage.setItem('rehab_v45_last', JSON.stringify({weight,distance,time,ascent,age,restHR,avgHR,borgPre,borgPost,bp5Sys,bp5Dia,extKcal,preferExt}));
    alert('入力を次回の初期値として保存しました');
  };

  const saveLog = ()=>{
    const entry = {
      dt, weight, distance, time, ascent, age, restHR, avgHR, borgPre, borgPost, bp5Sys, bp5Dia,
      auto_MET: Number(calc.MET?.toFixed(2)), auto_kcal: Number(calc.kcal?.toFixed(0)), auto_WAT: Number(calc.WAT?.toFixed(0)),
      ext_MET: Number(ext.MET?.toFixed(2)), ext_kcal: Number(ext.kcal?.toFixed(0)), ext_WAT: Number(ext.WAT?.toFixed(0)),
      preferExt
    };
    const arr=[entry, ...log].slice(0,365);
    setLog(arr);
    localStorage.setItem('rehab_v45_log', JSON.stringify(arr));
    saveLast();
  };

  const exportCSV = ()=>{
    const header=['日時','距離km','時間分','上りm','年齢','安静HR','平均HR','Borg後','BP5分後','MET(自動)','kcal(自動)','WAT(自動)','MET(外部)','kcal(外部)','WAT(外部)','表示優先'];
    const rows=log.map(r=>[r.dt,r.distance,r.time,r.ascent,r.age,r.restHR,r.avgHR,r.borgPost,`${r.bp5Sys}/${r.bp5Dia}`,r.auto_MET,r.auto_kcal,r.auto_WAT,r.ext_MET,r.ext_kcal,r.ext_WAT, r.preferExt?'外部':'自動']);
    const csv=[header.join(','),...rows.map(a=>a.join(','))].join('\n');
    const blob=new Blob([csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download='rehab_log_v45.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return React.createElement('div',null,
    React.createElement('div',{className:'card'},
      React.createElement('div',{className:'title'},'Rehab Log v4.5（外部カロリー対応）'),
      React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
        React.createElement('div',null, React.createElement('label',null,'日時'), React.createElement('input',{type:'datetime-local', value:dt, onChange:e=>setDt(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'体重 (kg)'), React.createElement('input',{value:weight,onChange:e=>setWeight(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'距離 (km)'), React.createElement('input',{value:distance,onChange:e=>setDistance(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'時間 (分)'), React.createElement('input',{value:time,onChange:e=>setTime(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'上り (m)'), React.createElement('input',{value:ascent,onChange:e=>setAscent(e.target.value)}))
      ),
      React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
        React.createElement('div',null, React.createElement('label',null,'年齢'), React.createElement('input',{value:age,onChange:e=>setAge(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'安静時心拍 (bpm)'), React.createElement('input',{value:restHR,onChange:e=>setRestHR(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'平均心拍 (bpm)'), React.createElement('input',{value:avgHR,onChange:e=>setAvgHR(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'Borg 前'), React.createElement('input',{value:borgPre,onChange:e=>setBorgPre(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'Borg 後'), React.createElement('input',{value:borgPost,onChange:e=>setBorgPost(e.target.value)}))
      ),
      React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
        React.createElement('div',null, React.createElement('label',null,'血圧 5分後（収縮）'), React.createElement('input',{value:bp5Sys,onChange:e=>setBp5Sys(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'血圧 5分後（拡張）'), React.createElement('input',{value:bp5Dia,onChange:e=>setBp5Dia(e.target.value)})),
        React.createElement('div',null, React.createElement('label',null,'外部アプリの消費カロリー（kcal）※任意（YAMAP等）'), React.createElement('input',{value:extKcal,onChange:e=>setExtKcal(e.target.value), placeholder:'例: 1264'})),
        React.createElement('div',{className:'switch'}, React.createElement('span',{className:'muted'},'表示優先：'), 
          React.createElement('label',{className:'pill'}, React.createElement('input',{type:'radio',name:'pref',checked:!preferExt,onChange:()=>setPreferExt(false)}),'自動計算'),
          React.createElement('label',{className:'pill'}, React.createElement('input',{type:'radio',name:'pref',checked:preferExt,onChange:()=>setPreferExt(true)}),'外部カロリー基準')
        )
      ),

      // stats rows
      React.createElement('div',{className:'row', style:{marginTop:8}},
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'MET（自動計算）'),
          React.createElement('div',{className:'big'}, fmt(calc.MET,2))
        ),
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'消費kcal（自動計算）'),
          React.createElement('div',{className:'big'}, fmt(calc.kcal,0))
        ),
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'WAT（自動計算）'),
          React.createElement('div',{className:'big'}, fmt(calc.WAT,0),' W')
        )
      ),
      React.createElement('div',{className:'row', style:{marginTop:8}},
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'MET（外部カロリー基準）'),
          React.createElement('div',{className:'big'}, fmt(ext.MET,2))
        ),
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'消費kcal（外部入力）'),
          React.createElement('div',{className:'big'}, fmt(ext.kcal,0))
        ),
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'WAT（外部基準）'),
          React.createElement('div',{className:'big'}, fmt(ext.WAT,0),' W')
        )
      ),

      React.createElement('div',{className:'row', style:{marginTop:8}},
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'推定HRmax（Tanaka）'),
          React.createElement('div',{className:'big'}, fmt(HRcalc.HRmax,0),' bpm')
        ),
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'目標心拍ゾーン（40–60% HRR）'),
          React.createElement('div',{className:'big'}, `${fmt(HRcalc.low,0)}–${fmt(HRcalc.high,0)} bpm`)
        ),
        React.createElement('div',{className:'stat'},
          React.createElement('div',{className:'muted'},'%HRR（平均心拍の位置）'),
          React.createElement('div',{className:'big'}, fmt(HRcalc.pct,0),' %')
        )
      ),
      React.createElement('div',{className:'stat', style:{marginTop:8}},
        React.createElement('div',{className:'muted'},'心拍の判定'),
        React.createElement('div',{className:'big'}, `${avgHR||'-'} bpm`),
        React.createElement('div',null, React.createElement(Badge,{avg:num(avgHR), low:HRcalc.low, high:HRcalc.high}))
      ),

      React.createElement('div',{className:'btns'},
        React.createElement('button',{onClick:saveLog},'この内容をログ保存'),
        React.createElement('button',{className:'secondary',onClick:saveLast},'入力値を次回も使う'),
        React.createElement('button',{className:'secondary',onClick:()=>{
          const data=JSON.parse(localStorage.getItem('rehab_v45_log')||'[]');
          const header=['日時','距離km','時間分','上りm','年齢','安静HR','平均HR','Borg後','BP5分後','MET(自動)','kcal(自動)','WAT(自動)','MET(外部)','kcal(外部)','WAT(外部)','表示優先'];
          const rows=data.map(r=>[r.dt,r.distance,r.time,r.ascent,r.age,r.restHR,r.avgHR,r.borgPost,`${r.bp5Sys}/${r.bp5Dia}`,r.auto_MET,r.auto_kcal,r.auto_WAT,r.ext_MET,r.ext_kcal,r.ext_WAT, r.preferExt?'外部':'自動']);
          const csv=[header.join(','),...rows.map(a=>a.join(','))].join('\n');
          const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob);
          const a=document.createElement('a'); a.href=url; a.download='rehab_log_v45.csv'; a.click(); URL.revokeObjectURL(url);
        }},'CSVで出力')
      )
    ),

    React.createElement('div',{className:'card', style:{marginTop:12}},
      React.createElement('div',{className:'title'},'ログ一覧'),
      React.createElement('div',{style:{overflowX:'auto', marginTop:8}},
        React.createElement('table',null,
          React.createElement('thead',null, React.createElement('tr',null,
            ['日時','距離','時間','上り','平均HR','Borg後','BP5分後','MET(自動)','kcal(自動)','WAT(自動)','MET(外部)','kcal(外部)','WAT(外部)','優先'].map((h,i)=>React.createElement('th',{key:i},h))
          )),
          React.createElement('tbody',null,
            log.map((r,i)=>React.createElement('tr',{key:i},
              React.createElement('td',null,r.dt),
              React.createElement('td',null,r.distance),
              React.createElement('td',null,r.time),
              React.createElement('td',null,r.ascent),
              React.createElement('td',null,r.avgHR),
              React.createElement('td',null,r.borgPost),
              React.createElement('td',null,`${r.bp5Sys}/${r.bp5Dia}`),
              React.createElement('td',null,r.auto_MET),
              React.createElement('td',null,r.auto_kcal),
              React.createElement('td',null,r.auto_WAT),
              React.createElement('td',null,r.ext_MET),
              React.createElement('td',null,r.ext_kcal),
              React.createElement('td',null,r.ext_WAT),
              React.createElement('td',null,r.preferExt?'外部':'自動')
            ))
          )
        )
      )
    ),

    React.createElement('p',{className:'muted',style:{marginTop:12}},'※ 本ツールは医療判断の代替ではありません。個別の運動処方は主治医・療法士の指示を優先してください。')
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
