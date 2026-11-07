let words=[],idx=0,lang="en",cat="all",seen=new Set(),favs=new Set(),quizWord=null;const $=id=>document.getElementById(id);
function speak(text){
  if(!("speechSynthesis" in window)){alert("Ezen a böngészőn nem érhető el a felolvasás.");return;}
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=lang==="vi"?"vi-VN":"en-US";
  utterance.rate=0.86;
  window.speechSynthesis.speak(utterance);
}
fetch("words.json").then(r=>r.json()).then(d=>{words=d;[...new Set(d.map(x=>x.cat))].forEach(c=>$("category").add(new Option(c,c)));render();newQuiz();});
$("language").onchange=e=>{lang=e.target.value;idx=0;render();newQuiz();};$("category").onchange=e=>{cat=e.target.value;idx=0;render();newQuiz();};
function filtered(){return words.filter(w=>cat==="all"||w.cat===cat)}
function render(){let a=filtered();if(!a.length)return;idx%=a.length;$("counter").textContent=`${idx+1} / ${a.length} tanulási elem`;$("prompt").textContent=a[idx].hu;$("answer").textContent=a[idx][lang];$("answer").classList.add("hidden");$("reveal").classList.remove("hidden");$("favorite").textContent=favs.has(a[idx].hu)?"★ Kedvenc":"☆ Kedvencekhez";$("progress").textContent=`Megtanultként megjelölve: ${seen.size} / ${words.length}`;}
$("speakCard").onclick=()=>speak(filtered()[idx][lang]);
$("reveal").onclick=()=>{$("answer").classList.remove("hidden");seen.add(filtered()[idx].hu);$("progress").textContent=`Megtanultként megjelölve: ${seen.size} / ${words.length}`;};
$("next").onclick=()=>{idx=(idx+1)%filtered().length;render()};$("favorite").onclick=()=>{let w=filtered()[idx].hu;favs.has(w)?favs.delete(w):favs.add(w);render()};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));["learn","quiz","list"].forEach(v=>$(v).classList.toggle("hidden",v!==b.dataset.view));if(b.dataset.view==="list")renderList()});
function newQuiz(){let a=filtered();if(!a.length)return;quizWord=a[Math.floor(Math.random()*a.length)];$("question").textContent=quizWord[lang];$("feedback").textContent="";let opts=[quizWord,...words.filter(w=>w!==quizWord).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);$("choices").innerHTML="";opts.forEach(w=>{let b=document.createElement("button");b.textContent=w.hu;b.onclick=()=>{[...$("choices").children].forEach(x=>x.disabled=true);if(w===quizWord){b.classList.add("correct");$("feedback").textContent="Helyes! Ügyes vagy."}else{b.classList.add("wrong");$("feedback").textContent="A helyes válasz: "+quizWord.hu;[...$("choices").children].find(x=>x.textContent===quizWord.hu)?.classList.add("correct")}};$("choices").append(b)})}
$("nextq").onclick=newQuiz;function renderList(){let q=$("search").value.toLowerCase();$("wordlist").innerHTML="";filtered().filter(w=>(w.hu+" "+w[lang]).toLowerCase().includes(q)).forEach(w=>{let d=document.createElement("div");d.className="word";let a=document.createElement("div");a.className="wordmain";a.textContent=w.hu;let s=document.createElement("small");s.textContent=w.cat;a.append(s);let b=document.createElement("strong");b.textContent=w[lang];let play=document.createElement("button");play.type="button";play.textContent="🔊";play.setAttribute("aria-label","Kiejtés meghallgatása");play.onclick=()=>speak(w[lang]);d.append(a,b,play);$("wordlist").append(d)})}
$("search").oninput=renderList;
if("serviceWorker"in navigator){addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
