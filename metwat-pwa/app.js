/* global React, ReactDOM */
const { useMemo, useState } = React;
const toNumber = v => { const n = Number(String(v||'').replace(/,/g,'').trim()); return Number.isFinite(n)?n:NaN; };
const fmt = (n,d=2)=> Number.isFinite(n)? n.toFixed(d):'-';
const zoneClass = m => !Number.isFinite(m)?'badge': m<3?'badge b-blue': m<5?'badge b-green': m<7?'badge b-yellow':'badge b-red';
const Stat = ({label,value,note}) => React.createElement('div',{className:'stat'},
  React.createElement('div',{className:'muted'},label),
  React.createElement('div',{className:'big'},value),
  note?React.createElement('div',{className:'muted',style:{marginTop:6}},note):null
);
function App(){
  const [weight,setWeight]=useState('57'); const [distance,setDistance]=useState('3.0');
  const [time,setTime]=useState('38'); const [ascent,setAscent]=useState('72');
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
    return {v,grade,VO2,MET,energy,kcal_min,WAT,kmh};
  },[weight,distance,time,ascent]);
  return React.createElement('div',{className:'container'},
    React.createElement('div',{className:'card pad'},
      React.createElement('div',{className:'title'},'ウォーキング MET・WAT 自動計算（PWA版）'),
      React.createElement('p',{className:'muted'},'距離・時間・上り量・体重を入力すると、ACSM歩行式で計算します。'),
      React.createElement('div',{className:'grid inputs'},
        React.createElement('div',null,React.createElement('label',null,'体重 (kg)'),
          React.createElement('input',{value:weight,onChange:e=>setWeight(e.target.value),placeholder:'例: 57'})),
        React.createElement('div',null,React.createElement('label',null,'距離 (km)'),
          React.createElement('input',{value:distance,onChange:e=>setDistance(e.target.value),placeholder:'例: 3.0'})),
        React.createElement('div',null,React.createElement('label',null,'時間 (分)'),
          React.createElement('input',{value:time,onChange:e=>setTime(e.target.value),placeholder:'例: 38'})),
        React.createElement('div',null,React.createElement('label',null,'総上り (m)'),
          React.createElement('input',{value:ascent,onChange:e=>setAscent(e.target.value),placeholder:'例: 72'}))
      ),
      React.createElement('div',{className:'grid',style:{gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',marginTop:12}},
        React.createElement(Stat,{label:'速度 v',value:`${fmt(values.v)} m/min`,note:`${fmt(values.kmh)} km/h`}),
        React.createElement(Stat,{label:'勾配 grade',value:`${fmt(values.grade)} (小数)`,note:`${fmt((values.grade||0)*100)} %`}),
        React.createElement(Stat,{label:'VO₂',value:`${fmt(values.VO2)} ml/kg/min`,note:'ACSM歩行式'})
      ),
      React.createElement('div',{className:'grid',style:{gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',marginTop:12}},
        React.createElement('div',{className:'stat'},React.createElement('div',{className:'muted'},'MET'),
          React.createElement('div',{className:'big'},fmt(values.MET)),
          React.createElement('div',{style:{marginTop:6}},React.createElement('span',{className:zoneClass(values.MET)},'3〜5 MET 推奨ゾーン'))
        ),
        React.createElement(Stat,{label:'消費エネルギー',value:`${fmt(values.energy)} kcal`,note:`${fmt(values.kcal_min)} kcal/min`}),
        React.createElement(Stat,{label:'WAT',value:`${fmt(values.WAT)} W`,note:'1 kcal/min = 69.78 W'})
      ),
      React.createElement('div',{className:'btns',style:{marginTop:12}},
        React.createElement('button',{onClick:()=>{setWeight('');setDistance('');setTime('');setAscent('');}},'入力リセット'),
        React.createElement('button',{className:'secondary',onClick:()=>{setWeight('57');setDistance('3.0');setTime('38');setAscent('72');}},'幸さんの例を入力')
      ),
      React.createElement('p',{className:'muted',style:{marginTop:12}},'※ 医療判断の代替ではありません。体調異常時は運動を中止し医療者に相談してください。')
    )
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));