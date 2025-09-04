/* global React, ReactDOM */
const { useMemo, useState, useEffect } = React;

const toNumber = v => { const n = Number(String(v||'').replace(/,/g,'').trim()); return Number.isFinite(n)?n:NaN; };
const fmt = (n,d=0)=> Number.isFinite(n)? n.toFixed(d):'-';
const nowISO = () => new Date().toISOString().slice(0,16);

function Stat({ label, value }){
  return (
    React.createElement('div', {className:'stat'},
      React.createElement('div', {className:'muted'}, label),
      React.createElement('div', {className:'big'}, value)
    )
  );
}

function zoneBadge(avg, low, high){
  if (!Number.isFinite(avg) || !Number.isFinite(low) || !Number.isFinite(high)) return null;
  let cls='zone-ok', text='安全ゾーン内';
  if (avg < low) { cls='zone-warn'; text='やや低い（負荷不足）'; }
  if (avg > high) { cls='zone-danger'; text='高い（負荷強）'; }
  return React.createElement('span', {className:`badge ${cls}`}, text);
}

// Simple SVG line chart
function LineChart({ data, yKey, label }){
  const w = 900, h = 220, pad = 30;
  const pts = data.map((d,i)=>({x:i, y: Number(d[yKey])})).filter(p=>Number.isFinite(p.y));
  if (pts.length<2) return React.createElement('div',{className:'muted'}, 'データが足りません');
  const xmin = 0, xmax = pts.length - 1;
  const ymin = Math.min(...pts.map(p=>p.y)), ymax = Math.max(...pts.map(p=>p.y));
  const sx = x => pad + (x - xmin)/(xmax - xmin)*(w - 2*pad);
  const sy = y => h - pad - (y - ymin)/(ymax - ymin)*(h - 2*pad);
  const dattr = pts.map((p,i)=> (i? 'L':'M') + sx(p.x)+','+sy(p.y)).join(' ');
  const circles = pts.map((p,i)=> React.createElement('circle',{key:i,cx:sx(p.x), cy:sy(p.y), r:3}));
  return React.createElement('svg',{className:'chart', viewBox:`0 0 ${w} ${h}`},
    React.createElement('path',{d:dattr, fill:'none', stroke:'#0ea5e9', strokeWidth:2}),
    ...circles,
    React.createElement('text',{x:pad, y:16, fill:'#64748b', fontSize:12}, label),
    React.createElement('text',{x:pad, y:h-8, fill:'#64748b', fontSize:10}, `${fmt(ymin,0)} - ${fmt(ymax,0)}`)
  );
}

function App(){
  // Inputs
  const [dt, setDt] = useState(nowISO());
  const [weight,setWeight]=useState('57');
  const [distance,setDistance]=useState('3.4');
  const [time,setTime]=useState('42');
  const [ascent,setAscent]=useState('82');

  const [age, setAge]     = useState('66');
  const [restHR, setRestHR] = useState('75');
  const [avgHR, setAvgHR] = useState('85');
  const [borgPre, setBorgPre] = useState('9');
  const [borgPost, setBorgPost] = useState('13');

  const [bpPreSys, setBpPreSys] = useState('128');
  const [bpPreDia, setBpPreDia] = useState('94');
  const [bpPostSys, setBpPostSys] = useState('126');
  const [bpPostDia, setBpPostDia] = useState('99');

  // Load last inputs
  useEffect(()=>{
    const last = localStorage.getItem('rehab_last_inputs');
    if (last){
      try{ const v=JSON.parse(last);
        setWeight(v.weight??''); setDistance(v.distance??''); setTime(v.time??'');
        setAscent(v.ascent??''); setAge(v.age??''); setRestHR(v.restHR??'');
        setAvgHR(v.avgHR??''); setBorgPre(v.borgPre??''); setBorgPost(v.borgPost??'');
        setBpPreSys(v.bpPreSys??''); setBpPreDia(v.bpPreDia??'');
        setBpPostSys(v.bpPostSys??''); setBpPostDia(v.bpPostDia??'');
      }catch(e){}
    }
  },[]);

  // Calculations
  const values = useMemo(()=>{
    const w=toNumber(weight), d=toNumber(distance), t=toNumber(time), up=toNumber(ascent);
    const v=(d>0&&t>0)?(d*1000)/t:NaN, grade=d>0? up/(d*1000):NaN;
    const VO2=(Number.isFinite(v)&&Number.isFinite(grade))? 3.5+0.1*v+1.8*v*grade:NaN;
    const MET=Number.isFinite(VO2)? VO2/3.5:NaN;
    const time_hr=Number.isFinite(t)? t/60:NaN;
    const energy=(Number.isFinite(MET)&&Number.isFinite(w)&&Number.isFinite(time_hr))? MET*w*time_hr:NaN;
    const kcal_min=(Number.isFinite(energy)&&Number.isFinite(t)&&t>0)? energy/t:NaN;
    const WAT=Number.isFinite(kcal_min)? kcal_min*69.78:NaN;
    const kmh=(Number.isFinite(d)&&Number.isFinite(t)&&t>0)? d*60/t:NaN;

    const A=toNumber(age), R=toNumber(restHR), H=toNumber(avgHR);
    const HRmax = Number.isFinite(A)? (208 - 0.7*A):NaN;
    const HRR   = (Number.isFinite(HRmax)&&Number.isFinite(R))? (HRmax - R):NaN;
    const zoneLow = Number.isFinite(HRR)&&Number.isFinite(R)? (R + 0.40*HRR):NaN;
    const zoneHigh= Number.isFinite(HRR)&&Number.isFinite(R)? (R + 0.60*HRR):NaN;
    const pctHRR = (Number.isFinite(H)&&Number.isFinite(R)&&Number.isFinite(HRR)&&HRR>0)? ((H-R)/HRR*100):NaN;

    return {v,grade,VO2,MET,energy,kcal_min,WAT,kmh, HRmax,HRR,zoneLow,zoneHigh,pctHRR};
  },[weight,distance,time,ascent,age,restHR,avgHR]);

  // Log handling
  const [log, setLog] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('rehab_log')||'[]'); }catch(_){ return []; }
  });

  const saveEntry = ()=>{
    const entry = {
      dt, weight, distance, time, ascent,
      age, restHR, avgHR, borgPre, borgPost,
      bpPreSys, bpPreDia, bpPostSys, bpPostDia,
      MET: Number(values.MET?.toFixed(2)),
      WAT: Number(values.WAT?.toFixed(0)),
      Speed: Number(values.kmh?.toFixed(2)),
      Energy: Number(values.energy?.toFixed(0)),
      zoneLow: Number(values.zoneLow?.toFixed(0)),
      zoneHigh: Number(values.zoneHigh?.toFixed(0)),
      pctHRR: Number(values.pctHRR?.toFixed(0))
    };
    const newLog = [entry, ...log].slice(0,365);
    setLog(newLog);
    localStorage.setItem('rehab_log', JSON.stringify(newLog));
    localStorage.setItem('rehab_last_inputs', JSON.stringify({weight,distance,time,ascent,age,restHR,avgHR,borgPre,borgPost,bpPreSys,bpPreDia,bpPostSys,bpPostDia}));
    alert('保存しました');
  };

  const clearLog = ()=>{
    if (!confirm('ログをすべて削除します。よろしいですか？')) return;
    setLog([]); localStorage.removeItem('rehab_log');
  };

  const exportCSV = ()=>{
    const header = ['日時','体重','距離(km)','時間(分)','上り(m)','年齢','安静HR','平均HR','Borg前','Borg後','BP前(収縮/拡張)','BP後(収縮/拡張)','MET','WAT(W)','速度(km/h)','消費エネルギー(kcal)','目標HR下限','目標HR上限','%HRR'];
    const rows = log.map(r=>[
      r.dt, r.weight, r.distance, r.time, r.ascent, r.age, r.restHR, r.avgHR, r.borgPre, r.borgPost,
      `${r.bpPreSys}/${r.bpPreDia}`, `${r.bpPostSys}/${r.bpPostDia}`,
      r.MET, r.WAT, r.Speed, r.Energy, r.zoneLow, r.zoneHigh, r.pctHRR
    ]);
    const csv = [header.join(','), ...rows.map(a=>a.join(','))].join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rehab_log.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return React.createElement('div',{className:'container'},
    React.createElement('div',{className:'card pad'},
      React.createElement('div',{className:'title'},'MET・WAT + 心拍・Borg・血圧 ログ（PWA v4.4 fix5）'),
      // Inputs
      React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
        React.createElement('div',null,React.createElement('label',null,'日時'), React.createElement('input',{type:'datetime-local', value:dt, onChange:e=>setDt(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'体重 (kg)'), React.createElement('input',{value:weight,onChange:e=>setWeight(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'距離 (km)'), React.createElement('input',{value:distance,onChange:e=>setDistance(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'時間 (分)'), React.createElement('input',{value:time,onChange:e=>setTime(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'上り (m)'), React.createElement('input',{value:ascent,onChange:e=>setAscent(e.target.value)}))
      ),
      React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
        React.createElement('div',null,React.createElement('label',null,'年齢'), React.createElement('input',{value:age,onChange:e=>setAge(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'安静時心拍 (bpm)'), React.createElement('input',{value:restHR,onChange:e=>setRestHR(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'平均心拍 (bpm)'), React.createElement('input',{value:avgHR,onChange:e=>setAvgHR(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'Borg 前'), React.createElement('input',{value:borgPre,onChange:e=>setBorgPre(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'Borg 後'), React.createElement('input',{value:borgPost,onChange:e=>setBorgPost(e.target.value)}))
      ),
      React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
        React.createElement('div',null,React.createElement('label',null,'血圧 前（収縮）'), React.createElement('input',{value:bpPreSys,onChange:e=>setBpPreSys(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'血圧 前（拡張）'), React.createElement('input',{value:bpPreDia,onChange:e=>setBpPreDia(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'血圧 後（収縮）'), React.createElement('input',{value:bpPostSys,onChange:e=>setBpPostSys(e.target.value)})),
        React.createElement('div',null,React.createElement('label',null,'血圧 後（拡張）'), React.createElement('input',{value:bpPostDia,onChange:e=>setBpPostDia(e.target.value)}))
      ),

      // Stats: MET/WAT/Speed/Energy
      React.createElement('div',{className:'grid',style:{gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', marginTop:12}},
        React.createElement(Stat,{label:'MET',value:`${fmt(values.MET,2)}`}),
        React.createElement(Stat,{label:'WAT',value:`${fmt(values.WAT,0)} W`}),
        React.createElement(Stat,{label:'速度 v',value:`${fmt(values.kmh,2)} km/h`}),
        React.createElement(Stat,{label:'消費エネルギー',value:`${fmt(values.energy,0)} kcal`})
      ),

      // HR stats row
      React.createElement('div',{className:'grid',style:{gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', marginTop:12}},
        React.createElement(Stat,{label:'平均心拍 (入力)',value:`${avgHR||'-'} bpm`}),
        React.createElement(Stat,{label:'推定HRmax (Tanaka)',value:`${fmt(values.HRmax,0)} bpm`}),
        React.createElement(Stat,{label:'目標ゾーン (40–60% HRR)',value:`${fmt(values.zoneLow,0)}–${fmt(values.zoneHigh,0)} bpm`}),
        React.createElement(Stat,{label:'HRRに対する割合',value:`${fmt(values.pctHRR,0)}%`})
      ),

      // Zone judgment
      React.createElement('div',{className:'stat', style:{marginTop:12}},
        React.createElement('div',{className:'muted'},'平均心拍の判定'),
        React.createElement('div',{className:'big'}, `${avgHR||'-'} bpm`),
        React.createElement('div',{style:{marginTop:6}}, zoneBadge(toNumber(avgHR), values.zoneLow, values.zoneHigh)),
        React.createElement('div',{className:'muted', style:{marginTop:6}}, `HRRに対する割合: ${fmt(values.pctHRR,0)}%`)
      ),

      // Buttons
      React.createElement('div',{className:'btns',style:{marginTop:12}},
        React.createElement('button',{onClick:saveEntry},'この内容をログ保存'),
        React.createElement('button',{className:'secondary',onClick:()=>{localStorage.setItem('rehab_last_inputs', JSON.stringify({weight,distance,time,ascent,age,restHR,avgHR,borgPre,borgPost,bpPreSys,bpPreDia,bpPostSys,bpPostDia})); alert('入力値を次回の初期値として保存しました');}},'入力値を次回も使う'),
        React.createElement('button',{className:'secondary',onClick:exportCSV},'CSVで出力'),
        React.createElement('button',{className:'secondary',onClick:clearLog},'ログ全削除')
      )
    ),

    // Log table
    React.createElement('div',{className:'card pad', style:{marginTop:16}},
      React.createElement('div',{className:'title'},'ログ一覧'),
      React.createElement('div',{style:{overflowX:'auto', marginTop:8}},
        React.createElement('table',null,
          React.createElement('thead',null,
            React.createElement('tr',null,
              ['日時','距離','時間','上り','平均HR','Borg後','BP前','BP後','MET','WAT','速度','消費kcal'].map((h,i)=>React.createElement('th',{key:i},h))
            )
          ),
          React.createElement('tbody',null,
            log.map((r,i)=>React.createElement('tr',{key:i},
              React.createElement('td',null,r.dt),
              React.createElement('td',null,r.distance),
              React.createElement('td',null,r.time),
              React.createElement('td',null,r.ascent),
              React.createElement('td',null,r.avgHR),
              React.createElement('td',null,r.borgPost),
              React.createElement('td',null,`${r.bpPreSys}/${r.bpPreDia}`),
              React.createElement('td',null,`${r.bpPostSys}/${r.bpPostDia}`),
              React.createElement('td',null,r.MET),
              React.createElement('td',null,r.WAT),
              React.createElement('td',null,r.Speed),
              React.createElement('td',null,r.Energy)
            ))
          )
        )
      )
    ),

    // Graphs
    React.createElement('div',{className:'card pad', style:{marginTop:16}},
      React.createElement('div',{className:'title'},'グラフ'),
      React.createElement('div',{className:'grid', style:{gridTemplateColumns:'1fr', marginTop:8}},
        React.createElement(LineChart,{data:[...log].reverse(), yKey:'avgHR', label:'平均心拍 (bpm) 推移'}),
        React.createElement(LineChart,{data:[...log].reverse(), yKey:'MET', label:'MET 推移'}),
        React.createElement(LineChart,{data:[...log].reverse(), yKey:'WAT', label:'WAT (W) 推移'})
      )
    ),

    React.createElement('p',{className:'muted',style:{marginTop:16}},'※ 本ツールは医療判断の代替ではありません。個別の運動処方は主治医・療法士の指示を優先してください。')
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
