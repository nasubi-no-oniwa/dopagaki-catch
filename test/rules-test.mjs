// ランキングのルールの試験（GitHub の上で Firebase の試し用データベースを立てて試す。本番のデータには触らない）
const NS='furoya-no-onna-default-rtdb',PROJ='furoya-no-onna',BASE='http://127.0.0.1:9000';
const DPC=(await import('../physics.js')).default;
const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const tok=uid=>b64({alg:'none',typ:'JWT'})+'.'+b64({uid,sub:uid,user_id:uid,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,aud:PROJ,iss:'https://securetoken.google.com/'+PROJ,provider_id:'anonymous',firebase:{sign_in_provider:'anonymous'}})+'.';
async function req(method,path,uid,body){const r=await fetch(BASE+'/'+path+'.json?ns='+NS+(uid?'&auth='+tok(uid):''),{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {ok:r.ok,status:r.status,j:await r.json().catch(()=>null)};}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fail=0;const ex=(name,res,want)=>{const ok=res.ok===want;console.log((ok?'OK  ':'NG  ')+name+' → '+res.status);if(!ok){fail++;console.log(JSON.stringify(res.j));}};
const TS={'.sv':'timestamp'};
async function ticket(uid,add=1){const c0=(await req('GET','dpc/throws/'+uid+'/c',uid)).j||0;const r=await req('PUT','dpc/throws/'+uid,uid,{t:TS,c:c0+add});const g=await req('GET','dpc/throws/'+uid,uid);return {r,st:g.j&&g.j.t,c:g.j&&g.j.c};}
function rec(a,p,eu,x,y){const j=a===1?DPC.air(p,eu,x,y):DPC.fall(p,eu);if(!j)throw new Error('bad test data');return {n:'テスト',a,p,eu,x,y,q:j.q,k:j.k,t:TS,v:1};}
const U='user1aaaaaaaaaaaaaaaaaaa',U2='user2bbbbbbbbbbbbbbbbbbb';
// 空中：力250で0.05秒後にボールの中心
const v=DPC.vel(250),e=.05,y=Math.round(DPC.yAt(v,e)*1e4),eu=50000;
ex('ログインなしで 投げます を書く',await req('PUT','dpc/throws/'+U,null,{t:TS}),false);
let t1=await ticket(U);ex('投げます を書く',t1.r,true);
ex('1秒以内にもう一度 投げます',(await ticket(U)).r,false);
await sleep(1100);ex('投げた数をとばして書く',(await ticket(U,2)).r,false);
await sleep(1100);t1=await ticket(U);ex('投げます（2投目）',t1.r,true);
await sleep(120);
const r1={...rec(1,250,eu,0,y),st:t1.st,c:t1.c};
ex('何投目かをごまかす',await req('PUT','dpc/sp/scores/'+U,U,{...r1,c:t1.c+50}),false);
ex('ほかの人の場所に書く',await req('PUT','dpc/sp/scores/'+U2,U,r1),false);
ex('ちがう投げの時刻で送る',await req('PUT','dpc/sp/scores/'+U,U,{...r1,st:t1.st-5}),false);
ex('数字のつじつまが合わない（q を小さく）',await req('PUT','dpc/sp/scores/'+U,U,{...r1,q:r1.q-5000}),false);
ex('50点より低い点数',await req('PUT','dpc/sp/scores/'+U,U,{...r1,k:30}),false);
ex('ありえない速さ（q=500）',await req('PUT','dpc/sp/scores/'+U,U,{...r1,q:500,eu:5000}),false);
ex('正しい空中キャッチ',await req('PUT','dpc/sp/scores/'+U,U,r1),true);
ex('同じ投げでもう一度送る',await req('PUT','dpc/sp/scores/'+U,U,{...r1,k:r1.k}),false);
await sleep(1100);let t2=await ticket(U);ex('1秒たって 投げます',t2.r,true);
await sleep(120);
const worse={...rec(1,250,80000,0,Math.round(DPC.yAt(v,.08)*1e4)),st:t2.st,c:t2.c};
ex('前より悪い記録',await req('PUT','dpc/sp/scores/'+U,U,worse),false);
const better={...rec(1,250,40000,0,Math.round(DPC.yAt(v,.04)*1e4)),st:t2.st,c:t2.c};
ex('前より良い記録',await req('PUT','dpc/sp/scores/'+U,U,better),true);
// 落下：パソコン側
let t3=await ticket(U2);const vf=DPC.vel(100),L=DPC.landTime(vf);const euf=Math.round(L*1e6);
const f1={...rec(0,100,euf,0,0),st:t3.st,c:t3.c};
ex('キャッチより前に送る（落下は1.6秒以上）',await req('PUT','dpc/pc/scores/'+U2,U2,f1),false);
await sleep(Math.ceil(L*1000)+100);
ex('落下で x を入れる',await req('PUT','dpc/pc/scores/'+U2,U2,{...f1,x:100}),false);
ex('正しい落下キャッチ',await req('PUT','dpc/pc/scores/'+U2,U2,f1),true);
ex('ほかの人の 投げます を読む',await req('GET','dpc/throws/'+U,U2),false);
ex('ランキングはだれでも読める',await req('GET','dpc/sp/scores',null),true);
ex('管理でない人が隠す',await req('PUT','dpc/hidden/'+U,U2,true),false);
console.log(fail?('失敗 '+fail+' 件'):'すべて合格');process.exit(fail?1:0);
