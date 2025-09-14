/* global React, ReactDOM */
const { useState, useMemo, useEffect } = React;
const num = v => { const n = Number(String(v??'').replace(/,/g,'').trim()); return Number.isFinite(n)?n:NaN; };
const fmt = (n,d=0)=> Number.isFinite(n)? n.toFixed(d):'-';

function Tabs({tab,setTab}){
  const names=[['main','入力・計算'],['help','解説']];
  return React.createElement(React.Fragment,null,
    names.map(([k,label])=>React.createElement('button',{
      key:k, className:`tab ${tab===k?'active':''}`, onClick:()=>setTab(k)}, label))
  );
}

function App(){
  const [tab,setTab]=useState('main');

  const [weight,setWeight]=useState('57');
  const [distance,setDistance]=useState('3.4');
  const [time,setTime]=useState('45');
  const [ascent,setAscent]=useState('82');

  const calc = useMemo(()=>{
    const d=num(distance), t=num(time), up=num(ascent), w=num(weight);
    const v = (d>0&&t>0)? (d*1000)/t : NaN; // m/min
    const grade = d>0 ? up/(d*1000) : NaN;
    const VO2 = (Number.isFinite(v)&&Number.isFinite(grade)) ? 3.5 + 0.1*v + 1.8*v*grade : NaN;
    const MET = Number.isFinite(VO2) ? VO2/3.5 : NaN;
    const time_hr = Number.isFinite(t)? t/60 : NaN;
    const kcal = (Number.isFinite(MET)&&Number.isFinite(w)&&Number.isFinite(time_hr)) ? MET*w*time_hr : NaN;
    return {VO2,MET,kcal};
  },[distance,time,ascent,weight]);

  const MainView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'Rehab Log v4.7（VO2計算＋生活動作目安表）'),
    React.createElement('div',{className:'row', style:{marginTop:8}},
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'MET（自動計算）'), React.createElement('div',{className:'big'}, fmt(calc.MET,2))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'VO2（ml/kg/min）'), React.createElement('div',{className:'big'}, fmt(calc.VO2,1))),
      React.createElement('div',{className:'stat'}, React.createElement('div',{className:'muted'},'消費kcal'), React.createElement('div',{className:'big'}, fmt(calc.kcal,0)))
    )
  );

  const HelpView = React.createElement('div',{className:'card'},
    React.createElement('div',{className:'title'},'生活動作の目安（MET/VO2）'),
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
    )
  );

  useEffect(()=>{
    const m = ReactDOM.createRoot(document.getElementById('tabs'));
    m.render(React.createElement(Tabs,{tab,setTab}));
  },[tab]);

  return React.createElement(React.Fragment,null, tab==='main'?MainView: HelpView);
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
