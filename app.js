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
    const last = localStorage.getItem('rehab_v47_full_last');
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
    return {VO2,MET,kcal,WAT,kmh,grade,v};
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
    return {MET,VO2,kcal,WAT};
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
    try{ return JSON.parse(localStorage.getItem('rehab_v47_full_log')||'[]'); }catch(_){ return []; }
  });

  const saveLast = ()=>{
    localStorage.setItem('rehab_v47_full_last', JSON.stringify({dt,weight,distance,time,ascent,age,restHR,avgHR,borgPre,borgPost,bp5Sys,bp5Dia,extKcal,extSrc,preferExt}));
    alert('入力を次回の初期値として保存しました');
  };

  const saveLog = ()=>{
    const entry = {
      dt, weight, distance, time, ascent, age, restHR, avgHR, borgPre, borgPost, bp5Sys, bp5Dia,
      auto_MET: Number(auto.MET?.toFixed(2)), auto_VO2: Number(auto.VO2?.toFixed(1)), auto_kcal: Number(auto.kcal?.toFixed(0)), auto_WAT: Number(auto.WAT?.toFixed(0)),
      ext_MET: Number(ext.MET?.toFixed(2)), ext_VO2: Number(ext.VO2?.toFixed(1)), ext_kcal: Number(ext.kcal?.toFixed(0)), ext_WAT: Number(ext.WAT?.toFixed(0)),
      extSrc, preferExt
    };
    const arr=[entry, ...log].slice(0,365);
    setLog(arr);
    localStorage.setItem('rehab_v47_full_log', JSON.stringify(arr));
    saveLast();
  };

  const exportCSV = ()=>{
    const header=['日時','距離km','時間分','上りm','年齢','安静HR','平均HR','Borg前','Borg後','BP5分後',
      'MET(自動)','VO2(自動)','kcal(自動)','WAT(自動)',
      'MET(外部)','VO2(外部)','kcal(外部)','WAT(外部)','外部ソース','表示優先'];
    const rows=log.map(r=>[r.dt,r.distance,r.time,r.ascent,r.age,r.restHR,r.avgHR,r.borgPre,r.borgPost,`${r.bp5Sys}/${r.bp5Dia}`,
      r.auto_MET,r.auto_VO2,r.auto_kcal,r.auto_WAT,
      r.ext_MET,r.ext_VO2,r.ext_kcal,r.ext_WAT, r.extSrc, r.preferExt?'外部':'自動']);
    const csv=[header.join(','),...rows.map(a=>a.join(','))].join('\n');
    const blob=new Blob([csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download='rehab_log_v47_full.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const InputRow = React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
    React.createElement('div',null, React.createElement('label',null,'日時'), React.createElement('input',{type:'datetime-local', value:dt, onChange:e=>setDt(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'体重 (kg)'), React.createElement('input',{value:weight,onChange:e=>setWeight(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'距離 (km)'), React.createElement('input',{value:distance,onChange:e=>setDistance(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'時間 (分)'), React.createElement('input',{value:time,onChange:e=>setTime(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'上り (m)'), React.createElement('input',{value:ascent,onChange:e=>setAscent(e.target.value)}))
  );

  const HRRow = React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
    React.createElement('div',null, React.createElement('label',null,'年齢'), React.createElement('input',{value:age,onChange:e=>setAge(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'安静時心拍 (bpm)'), React.createElement('input',{value:restHR,onChange:e=>setRestHR(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'平均心拍 (bpm)'), React.createElement('input',{value:avgHR,onChange:e=>setAvgHR(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'Borg 前'), React.createElement('input',{value:borgPre,onChange:e=>setBorgPre(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'Borg 後'), React.createElement('input',{value:borgPost,onChange:e=>setBorgPost(e.target.value)}))
  );

  const BPRow = React.createElement('div',{className:'grid inputs', style:{marginTop:8}},
    React.createElement('div',null, React.createElement('label',null,'血圧 5分後（収縮）'), React.createElement('input',{value:bp5Sys,onChange:e=>setBp5Sys(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'血圧 5分後（拡張）'), React.createElement('input',{value:bp5Dia,onChange:e=>setBp5Dia(e.target.value)})),
    React.createElement('div',null, React.createElement('label',null,'外部アプリの消費カロリー（kcal）'), React.createElement('input',{value:extKcal,onChange:e=>setExtKcal(e.target.value), placeholder:'例: 1264'})),
    React.createElement('div',null, React.createElement('label',null,'外部データの種類'),
      React.createElement('select',{value:extSrc,onChange:e=>setExtSrc(e.target.value)},
        React.createElement('option',{value:'watch'},'スマートウォッチ'),
        React.createElement('option',{value:'yamap'},'YAMAP / 登山'),
        React.createElement('option',{value:'manual'},'手入力（その他）')
      )
    ),
    React.createElement('div',{className:'switch'}, React.createElement('span',{className:'muted'},'表示優先：'), 
      React.createElement('label',{className:'pill'}, React.createElement('input',{type:'radio',name:'pref',checked:!preferExt,onChange:()=>setPreferExt(false)}),'自動計算'),
      React.createElement('label',{className:'pill'}, React.createElement('input',{type:'radio',name:'pref',checked:preferExt,onChange:()=>setPreferExt(true)}),'外部カロリー基準')
    )
  );

  const Stats1 = React.createElement('div',{className:'row', style:{marginTop:8}},
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'MET（自動計算）'), React.createElement('div',{className:'big'}, fmt(auto.MET,2))),
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'VO2（自動計算, ml/kg/min）'), React.createElement('div',{className:'big'}, fmt(auto.VO2,1))),
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'消費kcal（自動計算）'), React.createElement('div',{className:'big'}, fmt(auto.kcal,0))),
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'WAT（自動計算）'), React.createElement('div',{className:'big'}, fmt(auto.WAT,0),' W'))
  );

  const Stats2 = React.createElement('div',{className:'row', style:{marginTop:8}},
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'MET（外部カロリー基準）'), React.createElement('div',{className:'big'}, fmt(ext.MET,2))),
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'VO2（外部基準, ml/kg/min）'), React.createElement('div',{className:'big'}, fmt(ext.VO2,1))),
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'消費kcal（外部入力）'), React.createElement('div',{className:'big'}, fmt(ext.kcal,0))),
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'WAT（外部基準）'), React.createElement('div',{className:'big'}, fmt(ext.WAT,0),' W'))
  );

  const HRStats = React.createElement('div',{className:'row', style:{marginTop:8}},
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'推定HRmax（Tanaka）'), React.createElement('div',{className:'big'}, fmt(HRcalc.HRmax,0),' bpm')),
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'目標心拍ゾーン（40–60% HRR）'), React.createElement('div',{className:'big'}, `${fmt(HRcalc.low,0)}–${fmt(HRcalc.high,0)} bpm`)),
    React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'%HRR（平均心拍の位置）'), React.createElement('div',{className:'big'}, fmt(HRcalc.pct,0),' %'))
  );

  const MainView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'Rehab Log v4.7（フル機能版）'),
    InputRow, HRRow, BPRow, Stats1, Stats2, HRStats,
    React.createElement('div',{className:'btns'},
      React.createElement('button',{onClick:saveLog},'この内容をログ保存'),
      React.createElement('button',{className:'secondary',onClick:saveLast},'入力値を次回も使う'),
      React.createElement('button',{className:'secondary',onClick:exportCSV},'CSVで出力')
    )
  );

  const LogView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'ログ一覧'),
    React.createElement('div',{style:{overflowX:'auto', marginTop:8}},
      React.createElement('table',null,
        React.createElement('thead',null, React.createElement('tr',null,
          ['日時','距離','時間','上り','平均HR','Borg後','BP5分後',
           'MET(自動)','VO2(自動)','kcal(自動)','WAT(自動)',
           'MET(外部)','VO2(外部)','kcal(外部)','WAT(外部)','外部ソース','優先'].map((h,i)=>React.createElement('th',{key:i},h))
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
            React.createElement('td',null,r.auto_VO2),
            React.createElement('td',null,r.auto_kcal),
            React.createElement('td',null,r.auto_WAT),
            React.createElement('td',null,r.ext_MET),
            React.createElement('td',null,r.ext_VO2),
            React.createElement('td',null,r.ext_kcal),
            React.createElement('td',null,r.ext_WAT),
            React.createElement('td',null,({'watch':'ウォッチ','yamap':'YAMAP','manual':'手入力'}[r.extSrc]||'-')),
            React.createElement('td',null,r.preferExt?'外部':'自動')
          ))
        )
      )
    ),
    React.createElement('div',{className:'btns', style:{marginTop:8}},
      React.createElement('button',{className:'secondary',onClick:exportCSV},'CSVで出力')
    )
  );

  const HelpView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'解説（式・AT・目安表）'),
    React.createElement('h3',null,'1) 歩行由来の自動計算（ACSM歩行式）'),
    React.createElement('div',{className:'code'},`VO2 = 3.5 + 0.1 × v + 1.8 × v × 勾配
- v = 速度 (m/分) = 距離(m)/時間(分)
- 勾配 = 上り(m)/距離(m)
MET = VO2 / 3.5`),
    React.createElement('h3',null,'2) 消費カロリー（自動計算）'),
    React.createElement('div',{className:'code'},'エネルギー消費量 (kcal) = MET × 時間 (h) × 体重 (kg)'),
    React.createElement('h3',null,'3) 外部カロリー入力（逆算法）'),
    React.createElement('div',{className:'code'},`入力kcal → MET = 入力kcal / (体重 × 時間[h])
VO2 = MET × 3.5
kcal/分 → WAT ≈ (kcal/分) × 69.78`),
    React.createElement('h3',null,'4) 心拍ゾーン（Karvonen法）'),
    React.createElement('div',{className:'code'},`HRmax (Tanaka) = 208 − 0.7 × 年齢
HRR = HRmax − 安静時HR
目標ゾーン = 安静時HR + (0.40〜0.60) × HRR
%HRR = (平均HR − 安静時HR) / HRR × 100`),
    React.createElement('h3',null,'5) 生活動作の目安（MET/VO2）'),
    React.createElement('table',null,
      React.createElement('thead',null,React.createElement('tr',null,['活動','MET','VO2 (ml/kg/min)'].map(h=>React.createElement('th',null,h)))),
      React.createElement('tbody',null,[
        ['安静（座位）','1','3.5'],
        ['ゆっくり歩行（2km/h）','2','7'],
        ['普通歩行（4km/h, 平地）','3','10.5'],
        ['やや速歩（5km/h）','4','14'],
        ['買い物・階段ゆっくり昇り','4–5','14–17.5'],
        ['洗車・軽い掃除','4–5','14–17.5'],
        ['階段昇降・軽登山','6–7','21–24.5'],
        ['ジョギング（7km/h）','7–8','24.5–28']
      ].map(r=>React.createElement('tr',null,r.map(c=>React.createElement('td',null,c)))))
    ),
    React.createElement('p',{className:'muted'},'※ β遮断薬使用時は心拍反応が鈍くなるため、BorgやMET/VO2も併用して評価してください。')
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
