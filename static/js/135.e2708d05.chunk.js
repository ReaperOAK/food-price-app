"use strict";(self.webpackChunkfood_price_app=self.webpackChunkfood_price_app||[]).push([[135],{4135:(e,r,t)=>{t.r(r),t.d(r,{default:()=>i});var a=t(5043),s=t(6058),d=t(461),c=t(579);d.t1.register(d.PP,d.kc,d.E8,d.hE,d.m_,d.s$);const i=e=>{let{eggRates:r,selectedCity:t,selectedState:d}=e;const[i,o]=(0,a.useState)(1),[n,l]=(0,a.useState)({key:"date",direction:"descending"}),b=e=>{o(Number(e.target.id))},h=[];for(let a=1;a<=Math.ceil(r.length/10);a++)h.push(a);const g=10*i,p=g-10,x=[...r].sort(((e,r)=>e[n.key]<r[n.key]?"ascending"===n.direction?-1:1:e[n.key]>r[n.key]?"ascending"===n.direction?1:-1:0)).slice(p,g),m=e=>{let r="ascending";n.key===e&&"ascending"===n.direction&&(r="descending"),l({key:e,direction:r})};if(0===r.length)return(0,c.jsxs)("div",{children:["No rates available for ",t,", ",d,"."]});const y={labels:x.map((e=>e.date)),datasets:[{label:"Egg Rates",data:x.map((e=>e.rate)),backgroundColor:"rgba(75, 192, 192, 0.6)",borderColor:"rgba(75, 192, 192, 1)",borderWidth:1}]},u={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top"},title:{display:!0,text:"Egg Rates in ".concat(t,", ").concat(d)}},scales:{x:{ticks:{maxRotation:90,minRotation:45}}}};return(0,c.jsxs)("div",{className:"dynamic-body p-4",children:[(0,c.jsx)("div",{className:"overflow-x-auto",children:(0,c.jsxs)("table",{className:"min-w-full border border-gray-300 mt-4",children:[(0,c.jsx)("thead",{children:(0,c.jsxs)("tr",{style:{backgroundColor:"#F9BE0C"},children:[(0,c.jsx)("th",{className:"border border-gray-300 p-2 cursor-pointer",onClick:()=>m("date"),children:"Date"}),(0,c.jsx)("th",{className:"border border-gray-300 p-2 cursor-pointer",onClick:()=>m("rate"),children:"Piece"}),(0,c.jsx)("th",{className:"border border-gray-300 p-2",children:"Tray"}),(0,c.jsx)("th",{className:"border border-gray-300 p-2",children:"100 Pcs"}),(0,c.jsx)("th",{className:"border border-gray-300 p-2",children:"Peti"})]})}),(0,c.jsx)("tbody",{children:x.map(((e,r)=>(0,c.jsxs)("tr",{className:"".concat(r%2===0?"bg-[#fffcdf]":"bg-[#fff1c8]"," hover:bg-[#ddfafe]"),children:[(0,c.jsx)("td",{className:"border border-gray-300 p-2",children:e.date}),(0,c.jsxs)("td",{className:"border border-gray-300 p-2",children:["\u20b9",e.rate.toFixed(2)]}),(0,c.jsxs)("td",{className:"border border-gray-300 p-2",children:["\u20b9",(30*e.rate).toFixed(2)]}),(0,c.jsxs)("td",{className:"border border-gray-300 p-2",children:["\u20b9",(100*e.rate).toFixed(2)]}),(0,c.jsxs)("td",{className:"border border-gray-300 p-2",children:["\u20b9",(210*e.rate).toFixed(2)]})]},"".concat(e.date,"-").concat(e.rate,"-").concat(r))))})]})}),(0,c.jsx)("div",{className:"pagination mt-4 flex justify-center",children:h.map((e=>(0,c.jsx)("button",{id:e,onClick:b,className:"px-4 py-2 mx-1 border rounded ".concat(i===e?"bg-blue-500 text-white":"bg-white text-blue-500 hover:bg-blue-100"),children:e},e)))}),(0,c.jsx)("div",{className:"mt-8",style:{position:"relative",height:"400px",width:"100%"},children:(0,c.jsx)(s.yP,{data:y,options:u})})]})}}}]);
//# sourceMappingURL=135.e2708d05.chunk.js.map