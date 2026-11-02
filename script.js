// ===== PERSONALIZE AQUI =====
// Os valores abaixo são provisórios: confirme sua tabela antes de publicar.
const PRICES = {
  sketch: { head: 15, half: 20, full: 25 },
  lineart: { head: 25, half: 35, full: 45 },
  color: { none: 0, bw: 5, color: 10 },
  bg: { none: 0, simple: 10, detailed: 25 },
  extraCharacterRate: 0.25
};
const state = {style:"sketch",size:"head",color:"none",bg:"none"};
const labels = {
  style:{sketch:"Sketch",lineart:"Lineart"},
  size:{head:"Headshot",half:"Half-body",full:"Full-body"},
  color:{none:"Sem cor",bw:"Preto e branco",color:"Colorido"},
  bg:{none:"Sem cenário",simple:"Cenário simples",detailed:"Cenário detalhado"}
};
const previewFiles = {
  style:{sketch:"Sketch",lineart:"Lineart"},
  color:{none:"sem-cor",bw:"preto-e-branco",color:"colorido"},
  bg:{simple:"simples",detailed:"detalhado"}
};
const brl = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const $ = id => document.getElementById(id);
const discordInvite = $("contactButton").href;

function updatePreview(){
  const styleFolder = previewFiles.style[state.style];
  const colorFile = previewFiles.color[state.color];
  $("previewStage").dataset.size = state.size;
  const paths = {
    bg: state.bg === "none"
      ? "imagens/calculadora/cenarios/blank.png"
      : `imagens/calculadora/cenarios/${previewFiles.bg[state.bg]}/${colorFile || "sem-cor"}.png`,
    color: colorFile
      ? `imagens/calculadora/${styleFolder}/cores/${colorFile}.png`
      : null,
    base: `imagens/calculadora/${styleFolder}/personagem.png`
  };
  const images = [["prevBg","bg"],["prevColor","color"],["prevBase","base"]];
  images.forEach(([id,key])=>{
    const img=$(id), src=paths[key], encodedSrc=src ? encodeURI(src) : null;
    if(!encodedSrc){
      img.hidden=true;
      img.removeAttribute("src");
      return;
    }
    if(img.getAttribute("src")===encodedSrc){
      if(img.complete && img.naturalWidth>0){
        img.hidden=false;
        img.style.opacity="1";
      }
      return;
    }
    img.dataset.requestedSrc=encodedSrc;
    const nextImage=new Image();
    nextImage.onload=()=>{
      if(img.dataset.requestedSrc!==encodedSrc) return;
      const hasCurrentImage=!img.hidden && img.complete && img.naturalWidth>0;
      let previousImage=null;
      if(hasCurrentImage){
        previousImage=img.cloneNode();
        previousImage.removeAttribute("id");
        previousImage.setAttribute("aria-hidden","true");
        previousImage.classList.add("preview-old-layer");
        previousImage.style.transform=getComputedStyle(img).transform;
        previousImage.style.opacity="1";
        img.after(previousImage);
      }
      img.hidden=false;
      img.style.opacity="0";
      img.onload=()=>{
        if(img.getAttribute("src")===encodedSrc) updatePreviewPlaceholder();
      };
      img.onerror=()=>{
        if(img.getAttribute("src")===encodedSrc){
          console.warn(`Imagem da prévia não encontrada: ${src}`);
          updatePreviewPlaceholder();
        }
      };
      img.src=encodedSrc;
      void img.offsetWidth;
      setTimeout(()=>{
        if(img.getAttribute("src")===encodedSrc) img.style.opacity="1";
        if(previousImage){
          previousImage.style.opacity="0";
          setTimeout(()=>previousImage.remove(),300);
        }
      },20);
    };
    nextImage.onerror=()=>{
      if(img.dataset.requestedSrc===encodedSrc){
        console.warn(`Imagem da prévia não encontrada: ${src}`);
      }
    };
    nextImage.src=encodedSrc;
  });
  updatePreviewPlaceholder();
  $("previewDescription").textContent=[labels.style[state.style],labels.size[state.size],labels.color[state.color],labels.bg[state.bg]].join(" · ");
}
function updatePreviewPlaceholder(){
  const character=$("#prevBase");
  const hasCharacter=character && !character.hidden && character.complete && character.naturalWidth>0;
  document.querySelector(".preview-placeholder").style.display=hasCharacter?"none":"block";
}
function calculate(){
  const base=PRICES[state.style][state.size];
  const color=PRICES.color[state.color], bg=PRICES.bg[state.bg];
  const extras=Math.max(0,Math.min(5,Number($("extras").value)||0));
  const extra=Math.ceil(base*PRICES.extraCharacterRate*extras);
  const total=base+color+bg+extra;
  $("price").textContent=brl(total);
  $("breakdown").innerHTML=[
    ["Base",base],["Coloração",color],["Cenário",bg],["Personagens adicionais",extra]
  ].map(([name,value])=>`<div class="break-row"><span>${name}</span><strong>${brl(value)}</strong></div>`).join("");
  updatePreview();
  return {base,color,bg,extra,total,extras};
}
document.querySelectorAll(".choices").forEach(group=>{
  group.addEventListener("click",e=>{
    const btn=e.target.closest(".choice");if(!btn)return;
    group.querySelectorAll(".choice").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");state[group.dataset.group]=btn.dataset.value;calculate();
  });
});
$("extras").addEventListener("input",calculate);
$("resetCalc").addEventListener("click",()=>{
  Object.assign(state,{style:"sketch",size:"head",color:"none",bg:"none"});
  document.querySelectorAll(".choices").forEach(g=>g.querySelectorAll(".choice").forEach(b=>b.classList.toggle("selected",b.dataset.value===state[g.dataset.group])));
  $("extras").value=0;calculate();
});
$("sendQuote").addEventListener("click",()=>{
  const p=calculate();
  const msg=`Olá Yuna_S22! Vim do seu site de comissão.\nMeu set é:\nEstilo: ${labels.style[state.style]}\nEnquadramento: ${labels.size[state.size]}\nColoração: ${labels.color[state.color]}\nCenário: ${labels.bg[state.bg]}\nPersonagens adicionais: ${p.extras}\nPreço estimado: ${brl(p.total)}`;
  const button=$("sendQuote");
  const originalLabel=button.textContent;
  const discordTab=window.open(discordInvite,"_blank");
  if(discordTab) discordTab.opener=null;
  if(!discordTab) window.location.assign(discordInvite);

  const showCopyResult=copied=>{
    button.textContent=copied?"Copiado! Cole no Discord":"Não foi possível copiar";
    if(!copied) window.prompt("Copie sua mensagem para enviar no Discord:",msg);
    setTimeout(()=>{button.textContent=originalLabel;},4000);
  };
  const fallbackCopy=()=>{
    const textarea=document.createElement("textarea");
    textarea.value=msg;
    textarea.style.position="fixed";
    textarea.style.opacity="0";
    document.body.append(textarea);
    textarea.select();
    let copied=false;
    try{
      copied=document.execCommand("copy");
    }catch(error){
      console.error("Não foi possível copiar o orçamento:",error);
    }finally{
      textarea.remove();
    }
    return copied;
  };
  if(navigator.clipboard?.writeText){
    navigator.clipboard.writeText(msg).then(
      ()=>showCopyResult(true),
      error=>{
        console.error("Não foi possível copiar o orçamento:",error);
        showCopyResult(fallbackCopy());
      }
    );
  }else{
    showCopyResult(fallbackCopy());
  }
});
calculate();

const portfolioGrid=document.querySelector(".portfolio-grid");
function formatPortfolioName(filename){
  return filename.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").trim();
}
function buildPortfolioCard(item){
  const title=formatPortfolioName(item.name)||item.name;
  const card=document.createElement("article");
  card.className="work";
  card.tabIndex=0;
  card.setAttribute("role","button");
  card.setAttribute("aria-label",`Ampliar ${title}`);
  card.dataset.caption=`${item.category} · ${title}`;

  const frame=document.createElement("div");
  frame.className="work-img";
  const image=document.createElement("img");
  image.src=item.thumbnail;
  image.dataset.fullSrc=item.full;
  image.alt=`Ilustração: ${title}`;
  image.loading="lazy";
  image.decoding="async";
  frame.append(image);
  card.append(frame);
  return card;
}

function setupCategoryCarousel(categoryElement,items){
  const viewport=categoryElement.querySelector("[data-category-window]");
  const track=categoryElement.querySelector("[data-category-track]");
  const position=categoryElement.querySelector("[data-category-position]");
  const arrows=categoryElement.querySelectorAll(".category-arrow");
  let interval;

  if(items.length===0){
    const empty=document.createElement("p");
    empty.className="category-empty";
    empty.textContent="Adicione desenhos nesta categoria para exibi-los aqui.";
    track.append(empty);
    position.hidden=true;
    arrows.forEach(arrow=>arrow.hidden=true);
    return {start(){},stop(){}};
  }

  items.forEach(item=>track.append(buildPortfolioCard(item)));
  const update=()=>{
    const width=viewport.clientWidth||1;
    const current=Math.min(items.length,Math.round(viewport.scrollLeft/width)+1);
    position.textContent=`${current} / ${items.length}`;
    arrows.forEach(arrow=>{arrow.disabled=items.length<2});
    return current;
  };
  const move=direction=>{
    if(items.length<2)return;
    const current=update();
    const next=current>=items.length&&direction>0?0:Math.max(0,(current-1+direction)*viewport.clientWidth);
    viewport.scrollTo({left:next,behavior:"smooth"});
  };
  const stop=()=>clearInterval(interval);
  const start=()=>{
    stop();
    if(document.hidden||items.length<2||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    interval=setInterval(()=>{
      move(1);
    },5000);
  };

  arrows.forEach(arrow=>arrow.addEventListener("click",()=>move(Number(arrow.dataset.direction))));
  viewport.addEventListener("scroll",update,{passive:true});
  categoryElement.addEventListener("pointerenter",stop);
  categoryElement.addEventListener("pointerleave",start);
  categoryElement.addEventListener("focusin",stop);
  categoryElement.addEventListener("focusout",start);
  update();
  start();
  return {start,stop};
}

const portfolioManifest=window.PORTFOLIO_IMAGES;
if(!Array.isArray(portfolioManifest)){
  console.error("Portfolio image catalog is missing. Run scripts/generate_portfolio_manifest.py before publishing.");
  portfolioGrid.querySelectorAll(".portfolio-category").forEach(categoryElement=>{
    const message=document.createElement("p");
    message.className="category-empty";
    message.setAttribute("role","alert");
    message.textContent="Não foi possível carregar o portfólio. Tente novamente mais tarde.";
    categoryElement.querySelector("[data-category-track]").append(message);
    categoryElement.querySelectorAll(".category-arrow, [data-category-position]").forEach(control=>{control.hidden=true});
  });
}
const portfolioItems=(portfolioManifest||[]).map(([relativePath,filename,thumbnailPath])=>{
  const [category]=relativePath.split("/");
  const encodedPath=relativePath.split("/").map(encodeURIComponent).join("/");
  return {
    name:filename,
    category,
    full:`imagens/portifolio/${encodedPath}`,
    thumbnail:thumbnailPath
      ?`imagens/portifolio/_thumbs/${thumbnailPath.split("/").map(encodeURIComponent).join("/")}`
      :`imagens/portifolio/${encodedPath}`
  };
});

const portfolioCarousels=[];
if(Array.isArray(portfolioManifest)){
  portfolioGrid.querySelectorAll(".portfolio-category").forEach(categoryElement=>{
    const category=categoryElement.dataset.category;
    portfolioCarousels.push(setupCategoryCarousel(categoryElement,portfolioItems.filter(item=>item.category===category)));
  });
}
document.addEventListener("visibilitychange",()=>{
  portfolioCarousels.forEach(carousel=>document.hidden?carousel.stop():carousel.start());
});

let activeWork = null;
let zoomLevel = 1;
let pinchStartDistance = 0;
let pinchStartZoom = 1;
const lightbox = $("lightbox");
const lightboxImage = $("lightboxImage");
const lightboxViewport = $("lightboxViewport");
const zoomIn = $("zoomIn");
const zoomOut = $("zoomOut");
const zoomReset = $("zoomReset");

function updateZoom(){
  lightboxImage.style.transform=`scale(${zoomLevel})`;
  zoomReset.textContent=`${Math.round(zoomLevel*100)}%`;
  zoomOut.disabled=zoomLevel<=1;
  zoomIn.disabled=zoomLevel>=4;
}
function openLightbox(card){
  const img=card.querySelector(".work-img img");
  if(!img)return;
  activeWork=card;
  zoomLevel=1;
  lightboxImage.src=img.dataset.fullSrc||img.src;
  lightboxImage.alt=img.alt;
  $("lightboxCaption").textContent=card.dataset.caption||card.querySelector(".work-meta strong")?.textContent||img.alt;
  lightboxImage.style.transformOrigin="center";
  updateZoom();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  $("closeLightbox").focus();
}
function closeLightbox(){
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
  lightboxImage.removeAttribute("src");
  activeWork?.focus();
  activeWork=null;
}
portfolioGrid.addEventListener("click",e=>{
  const card=e.target.closest(".work");
  if(card)openLightbox(card);
});
portfolioGrid.addEventListener("keydown",e=>{
  const card=e.target.closest(".work");
  if(card&&(e.key==="Enter"||e.key===" ")){
    e.preventDefault();
    openLightbox(card);
  }
});
zoomIn.addEventListener("click",()=>{zoomLevel=Math.min(4,zoomLevel+0.25);updateZoom()});
zoomOut.addEventListener("click",()=>{zoomLevel=Math.max(1,zoomLevel-0.25);updateZoom()});
zoomReset.addEventListener("click",()=>{zoomLevel=1;updateZoom()});
lightboxViewport.addEventListener("wheel",e=>{
  if(!e.ctrlKey)return;
  e.preventDefault();
  const bounds=lightboxViewport.getBoundingClientRect();
  lightboxImage.style.transformOrigin=`${((e.clientX-bounds.left)/bounds.width)*100}% ${((e.clientY-bounds.top)/bounds.height)*100}%`;
  zoomLevel=Math.min(4,Math.max(1,zoomLevel*Math.exp(-e.deltaY*.002)));
  updateZoom();
},{passive:false});
lightboxViewport.addEventListener("touchstart",e=>{
  if(e.touches.length!==2)return;
  e.preventDefault();
  const [first,second]=e.touches;
  pinchStartDistance=Math.hypot(second.clientX-first.clientX,second.clientY-first.clientY);
  pinchStartZoom=zoomLevel;
},{passive:false});
lightboxViewport.addEventListener("touchmove",e=>{
  if(e.touches.length!==2||!pinchStartDistance)return;
  e.preventDefault();
  const [first,second]=e.touches;
  const distance=Math.hypot(second.clientX-first.clientX,second.clientY-first.clientY);
  const midpointX=(first.clientX+second.clientX)/2;
  const midpointY=(first.clientY+second.clientY)/2;
  const bounds=lightboxViewport.getBoundingClientRect();
  lightboxImage.style.transformOrigin=`${((midpointX-bounds.left)/bounds.width)*100}% ${((midpointY-bounds.top)/bounds.height)*100}%`;
  zoomLevel=Math.min(4,Math.max(1,pinchStartZoom*distance/pinchStartDistance));
  updateZoom();
},{passive:false});
lightboxViewport.addEventListener("touchend",e=>{
  if(e.touches.length<2)pinchStartDistance=0;
});
$("closeLightbox").addEventListener("click",closeLightbox);
lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&lightbox.classList.contains("open"))closeLightbox()});
$("menuBtn").addEventListener("click",()=>$("navlinks").classList.toggle("show"));
document.querySelectorAll(".navlinks a").forEach(a=>a.addEventListener("click",()=>$("navlinks").classList.remove("show")));
