// ドパがきにしかできないゲーム：判定の計算（ゲームとサーバーの確認で同じものを使う）
// ここを変えると、前の記録が確認で合わなくなるので変えないこと（変えるときは版 V を上げる）
(function(root){
const P={V:1,G:9.8,R:0.2,Y0:2.5,YMIN:2.8,TOP:5.0,VMIN:8.5,VMAX:26,WIN:0.25};
// 投げる力 p（0〜1000の整数）→ 投げる速さ（m/秒）
function vel(p){p=Math.max(0,Math.min(1000,Math.round(p)));return P.VMIN+(P.VMAX-P.VMIN)*p/1000;}
// 投げてから t 秒後のボールの中心の高さ
function yAt(v,t){return P.Y0+v*t-P.G*t*t/2;}
// 上がっていくボールの中心が高さ y を通る時刻
function passTime(v,y){const d=v*v-2*P.G*(y-P.Y0);if(d<0)return null;return (v-Math.sqrt(d))/P.G;}
function exitTime(v){return passTime(v,P.TOP);}
function landTime(v){return 2*v/P.G;}
// 記録の数字：1秒未満は0.00001秒きざみ、1秒以上は0.01秒きざみ（四捨五入）。単位は0.00001秒
function quant(T){const a=Math.round(T*1e5);if(a<1e5)return a;return Math.round(T*100)*1000;}
// 空中キャッチ：p=力、eu=指を離してから押すまで（100万分の1秒）、x,y=押した場所（1万分の1m）
function air(p,eu,x,y){
 const v=vel(p),e=eu/1e6,X=x/1e4,Y=y/1e4;
 if(!(e>0)||e>exitTime(v))return null;
 const by=yAt(v,e);if(by<P.YMIN)return null;          // まだ手から離れていない
 const d=Math.hypot(X,Y-by);if(d>P.R)return null;      // ボールの外
 const T=passTime(v,Math.max(Y,P.YMIN));if(T==null)return null;
 const k=Math.max(1,Math.round(100*(1-d/P.R)));
 return {T,q:quant(T),k};
}
// 落ちてきたところのキャッチ：手に届く瞬間の前後0.25秒
function fall(p,eu){
 const v=vel(p),e=eu/1e6,L=landTime(v),dt=Math.abs(e-L);
 if(dt>P.WIN)return null;
 const k=Math.max(1,Math.round(100*(1-dt/P.WIN)));
 return {T:e,q:quant(e),k};
}
// 記録をまるごと確かめる（a=1 空中 / a=0 落下）
function check(r){
 if(!r||r.v!==P.V)return false;
 const j=r.a===1?air(r.p,r.eu,r.x,r.y):fall(r.p,r.eu);
 return !!j&&j.q===r.q&&j.k===r.k;
}
const api={P,vel,yAt,passTime,exitTime,landTime,quant,air,fall,check};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DPC=api;
})(this);
