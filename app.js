// KUYUMCU SATIŞ SİSTEMİ v8 — APP.JS

let islemler=[],borcDefteri=[],siparisler=[],bankaHareketleri=[],gecmisGunler=[],baglantiAtolye=[],baglantiTransferler=[];
let secDurum='SATIŞ',currentFis=null,fotoArr=[];

// save() -> storage.js içinde

const fmt=n=>'₺'+parseFloat(n).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtG=n=>parseFloat(n).toLocaleString('tr-TR',{minimumFractionDigits:3,maximumFractionDigits:3})+'g';
const gf=()=>parseFloat(document.getElementById('gram-fiyat').value)||3200;
function parseTR(v){ return parseFloat((v+'').replace(',','.').replace(/[^0-9.]/g,''))||0; }
function getGramVal(id){ return parseTR(document.getElementById(id).value); }
const WS=`<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.934 1.395 5.608L0 24l6.545-1.349A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.031-1.385l-.36-.214-3.733.769.794-3.617-.235-.372A9.772 9.772 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.418 0 9.818 4.398 9.818 9.818 0 5.418-4.4 9.818-9.818 9.818z"/></svg>`;

function toast(m){const e=document.getElementById('toast');e.textContent=m;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2600);}
function wpOpen(m){window.open('https://wa.me/?text='+encodeURIComponent(m),'_blank');}

// init header
document.getElementById('tarih-lbl').textContent=new Date().toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'long',year:'numeric'});
// gram fiyat: veriYukle() içinde
function updateFiyat(){
  var v=parseFloat(document.getElementById('gram-fiyat-vis').value)||3200;
  document.getElementById('gram-fiyat').value=v;
  gramToTutar();
  saveGramFiyat(v);
}
// banka badge init
setTimeout(function(){updateBhBadge();bhUpdateBankaDL();},100);

function showTab(t){
  ['musteri','islem','islemler','siparis','banka','ayarlar','gecmis','borc','rapor','baglanti'].forEach(x=>document.getElementById('tab-'+x).style.display=x===t?'block':'none');
  document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',['musteri','islem','islemler','siparis','banka','gecmis','rapor','borc','baglanti','ayarlar'][i]===t));
  if(t==='siparis')renderSiparisler();
  if(t==='banka'){bhSetBugune();renderBankaHareketleri();
    var bhTe=document.getElementById('bh-tarih-ekle');
    if(bhTe&&!bhTe.value) bhTe.value=bhTodayStr();
  }
  if(t==='gecmis'){renderGecmisIslemler();}
  if(t==='borc'){renderBorcDefteri(); bdUpdateHesapDL();}
  if(t==='rapor'){renderGunlukRapor();}
  if(t==='islemler'){renderIslemler();}
  if(t==='baglanti'){bagRenderAll();}
  if(t==='ayarlar'){otoYedekRender();}
}

function setDurum(el,d){
  secDurum=d;
  document.querySelectorAll('.sopt').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('sip-extra').style.display=d==='SİPARİŞ'?'block':'none';

  // ÇIKIŞ durumu → ALIŞ satırı ön seçili, GİRİŞ → SATIŞ
  if(secSatirTip!=='NAKİT' && secSatirTip!=='HAVALE'){
    var yeniTip = isCikisDurum(d) ? 'ALIŞ' : 'SATIŞ';
    secSatirTip = yeniTip;
    // Butonun görsel stilini güncelle
    var btns = document.querySelectorAll('.stip-btn');
    btns.forEach(function(b){
      b.classList.remove('sp-s','sp-a','sp-n','sp-h');
      var bTip = b.getAttribute('data-tip');
      if(bTip===yeniTip){
        b.classList.add(yeniTip==='ALIŞ'?'sp-a':'sp-s');
      }
    });
    // stip-select varsa güncelle
    var ss = document.getElementById('stip-select');
    if(ss) ss.value = yeniTip;
  }
}

function toggleOdemeD(){}
function toggleOdemeCard(type){}
function fillFull(type){}
function selectOdeme(type){}
function alisGramToTutar(){}
function toggleAlisSection(){}

function gramToTutar(){
  const g=parseFloat(document.getElementById('s-gram').value)||0;
  if(g>0) document.getElementById('s-tutar').value=(g*gf()).toFixed(2);
}

function totalOdenen(){
  return satirlar.filter(s=>s.tip==='NAKİT'||s.tip==='HAVALE').reduce((a,s)=>a+s.tutar,0);
}

function calcKalan(){
  const k = calcKalanVal();
  const el = document.getElementById('kalan-disp');
  const kb = document.getElementById('kalan-box-main');
  const lblTxt = document.getElementById('kalan-lbl-txt');
  const subTxt = document.getElementById('kalan-sub-txt');
  if(!satirlar.length){ el.innerHTML='<span class="kalan-bos">BOŞ</span>'; if(kb)kb.style.display='none'; return; }
  if(kb) kb.style.display='flex';

  if(k === 0){
    if(lblTxt){lblTxt.textContent='HESAP KAPANDI';lblTxt.style.color='var(--green)';}
    if(subTxt){subTxt.textContent='Satış = Alış + Ödeme';subTxt.style.color='';}
    if(kb){kb.style.background='linear-gradient(135deg,#edfaf3,#d4f5e3)';kb.style.borderColor='var(--green)';}
    el.innerHTML='<div style="text-align:right"><div style="font-size:15px;font-weight:700;color:var(--green)">✓ TAM ÖDENDİ</div></div>';
    return;
  }
  if(k > 0){
    if(lblTxt){lblTxt.textContent='MÜŞTERİ BORCU';lblTxt.style.color='var(--red)';}
    if(subTxt){subTxt.textContent='Satış − Alış − Ödeme';subTxt.style.color='';}
    if(kb){kb.style.background='linear-gradient(135deg,#fdfaf5,#f8f3e8)';kb.style.borderColor='#e4c0a0';}
    const satisGram=satirlar.filter(function(s){return s.tip==='SATIŞ';}).reduce(function(a,s){return a+s.gram;},0);
    const gramGoster=satisGram>0?fmtG(satisGram):fmtG(k/gf());
    el.innerHTML='<div style="text-align:right"><div class="kalan-tl">'+fmt(k)+'</div><div class="kalan-gr">'+gramGoster+' gram karşılığı</div></div>';
    // Gram borcu kutusunu göster
    var gbw=document.getElementById('gram-borc-wrap');
    if(gbw) gbw.style.display='';
    return;
  }
  // k = 0 veya k < 0 → gram borcu kutusunu gizle
  var gbw=document.getElementById('gram-borc-wrap');
  if(gbw){ gbw.style.display='none'; document.getElementById('gram-borc-inp').value=''; }
  // k < 0 → SEN müşteriye borçlusun — ÜST VERİLECEK
  const ust=Math.abs(k);
  if(lblTxt){lblTxt.textContent='⬆️ ÜST VERİLECEK';lblTxt.style.color='var(--blue)';}
  if(subTxt){subTxt.textContent='Alış > Satış — Sen müşteriye '+fmt(ust)+' veriyorsun';subTxt.style.color='var(--blue)';}
  if(kb){kb.style.background='linear-gradient(135deg,#edf2fc,#dce8fc)';kb.style.borderColor='var(--blue)';}
  el.innerHTML=''
    +'<div style="text-align:right">'
    +'<div style="font-size:10px;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px">⬆️ MÜŞTERİYE VERİLECEK</div>'
    +'<div style="font-size:22px;font-weight:800;color:var(--blue);font-family:JetBrains Mono,monospace">'+fmt(ust)+'</div>'
    +'<div style="font-size:11px;color:var(--text2);font-family:JetBrains Mono,monospace;margin-top:2px">'+fmtG(ust/gf())+' gram karşılığı</div>'
    +'</div>';
}

function getKalan(){
  const k = calcKalanVal();
  if(k<=0) return{tl:0,gram:0};
  return{tl:k, gram:k/gf()};
}

function getUst(){
  const k = calcKalanVal();
  if(k>=0) return{tl:0,gram:0};
  return{tl:Math.abs(k), gram:Math.abs(k)/gf()};
}


function ustVerAc(id){
  var i = islemler.find(function(x){return x.id===id;});
  if(!i || !(i.kalan_tl<0)) return;
  var ust = Math.abs(i.kalan_tl);
  _oeIslemId = id;
  _oeTip = 'NAKİT';
  _oeSatirlar = [];
  _oeModUst = true;
  oeModalAyarla(true, ust, i.musteri+' · '+i.tarih);
  document.getElementById('odeme-ekle-modal').classList.add('open');
  setTimeout(function(){document.getElementById('oe-tutar').focus();},200);
}

function ustModalKaydet(){
  var bekleyenTutar = parseFloat(document.getElementById('oe-tutar').value)||0;
  if(bekleyenTutar>0) oeSatirEkle();
  if(!_oeSatirlar.length){ toast('⚠️ En az bir ödeme satırı ekleyin'); return; }
  var i = islemler.find(function(x){return x.id===_oeIslemId;});
  if(!i) return;
  var now = new Date();
  var saat = now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  var tarihTR = now.toLocaleDateString('tr-TR');

  // İslem üzerindeki nakit/havale alanlarını güncelle (günlük özet için)
  var ustNakit  = _oeSatirlar.filter(function(s){return s.tip==='NAKİT';}).reduce(function(a,s){return a+s.tutar;},0);
  var ustHavale = _oeSatirlar.filter(function(s){return s.tip==='HAVALE';}).reduce(function(a,s){return a+s.tutar;},0);
  var ustHavaleDetay = _oeSatirlar.filter(function(s){return s.tip==='HAVALE'&&s.banka;}).map(function(s){return s.banka;}).join(', ');

  // Var olan nakit/havale'ye ekle (müşteri daha önce ödeme yapmış olabilir)
  i.ust_nakit   = (i.ust_nakit||0) + ustNakit;
  i.ust_havale  = (i.ust_havale||0) + ustHavale;
  i.ust_havale_detay = ustHavaleDetay;
  var _toplamUst = ustNakit + ustHavale;
  i.kalan_tl = i.kalan_tl + _toplamUst;
  if(i.kalan_tl >= 0){ i.kalan_tl = 0; i.ust_verildi = true; }
  else { i.ust_verildi = false; }

  _oeSatirlar.forEach(function(s){
    if(s.tip==='HAVALE'){
      bankaHareketleri.unshift({
        id: Date.now()+Math.random(),
        tarih: tarihTR, saat: saat,
        kimden: '📤 ' + i.musteri + ' (ÜST)',   // kim için ödediğin belli olsun
        banka: s.banka||'',
        aciklama: '📤 SEN ÖDEDİN — Üst: '+i.musteri+' · '+(i.urun||i.durum||''),
        tutar: s.tutar,
        yon: 'cikis',
        onay: false,
        islemId: i.id
      });
      updateBhBadge();
    } else {
      var hNakit = {id:Date.now()+Math.random(), tarih:tarihTR, saat:saat,
        tip:'cikis', tutar:s.tutar, aciklama:'Üst ödendi (nakit): '+i.musteri};
      nakitHareketler.unshift(hNakit);
      nakitBakiye -= s.tutar;
    }
  });
  saveNakit(); updateNakitLbl();
  save(); renderIslemler(); renderMusteri();

  var kaydetBtn = document.getElementById('oe-kaydet-btn');
  if(kaydetBtn){ kaydetBtn.textContent='💳 Kaydet'; kaydetBtn.onclick=function(){odemeEkleKaydet();}; }
  odemeEkleKapat();

  var toplamVerilen = _oeSatirlar.reduce(function(a,s){return a+s.tutar;},0);
  toast('⬆️ Üst verildi: '+fmt(toplamVerilen)+' — '+i.musteri);

  var kendiTel = getKendiTel();
  if(kendiTel){
    var wpLines = _oeSatirlar.map(function(s){ return '  '+(s.tip==='NAKİT'?'🪙':'🏦')+' '+s.tip+(s.banka?' ('+s.banka+')':'')+': *'+fmt(s.tutar)+'*'; }).join('\n');
    var msg='⬆️ *ÜST VERİLDİ*\n━━━━━━━━━━━━━\n👤 '+i.musteri+'\n'+wpLines+'\n✅ Hesap kapatıldı\n📅 '+tarihTR+' '+saat;
    setTimeout(function(){window.open('https://wa.me/'+kendiTel+'?text='+encodeURIComponent(msg),'_blank');},300);
  }
}

function readForm(){
  if(!satirlar.length){ toast('⚠️ En az bir satır ekleyin'); return null; }
  const satisRows = satirlar.filter(s=>s.tip==='SATIŞ');
  const alisRows  = satirlar.filter(s=>s.tip==='ALIŞ');
  const nakitRows = satirlar.filter(s=>s.tip==='NAKİT');
  const havaleRows= satirlar.filter(s=>s.tip==='HAVALE');
  const satisTop  = satisRows.reduce((a,s)=>a+s.tutar,0);
  const alisTop   = alisRows.reduce((a,s)=>a+s.tutar,0);
  const nakit     = nakitRows.reduce((a,s)=>a+s.tutar,0);
  const havale    = havaleRows.reduce((a,s)=>a+s.tutar,0);
  const odemeTop  = nakit+havale;
  const kalanTl   = satisTop - alisTop - odemeTop; // negatif = üst verilecek
  const fs = satisRows[0]||{};
  const fa = alisRows[0]||{};
  const odemeArr=[]; if(nakit>0)odemeArr.push('NAKİT'); if(havale>0)odemeArr.push('HAVALE/EFT');
  return{
    id:Date.now(),
    musteri:document.getElementById('i-musteri').value.trim()||'PEŞİN MÜŞTERİ',
    urun: satisRows.map(s=>s.urun).filter(Boolean).join(', ') || satirlar[0]?.urun || '',
    durum:secDurum,
    gram:fs.gram||0,
    tutar:satisTop,
    nakit, havale,
    odemeDetay: havaleRows.map(s=>s.urun).filter(Boolean).join(', '),
    odenen:odemeTop,
    odeme:odemeArr.join(' + '),
    not:document.getElementById('i-not').value.trim(),
    gram_fiyat:gf(),
    tarih:new Date().toLocaleDateString('tr-TR'),
    saat:new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}),
    kalan_tl:kalanTl, kalan_gram:kalanTl>0?kalanTl/gf():0,
    bilezikTuru:document.getElementById('i-bilezik').value,
    adet:fs.adet||1,
    olcu:document.getElementById('i-olcu').value.trim(),
    sipNot:document.getElementById('i-snot').value.trim(),
    fotolar:[...fotoArr],
    satirlar:[...satirlar],
    alisVar:alisRows.length>0,
    alisUrun:alisRows.map(s=>s.urun).join(', '),
    alisTutar:alisTop, alisGram:fa.gram||0, alisAdet:fa.adet||0,
    borc_notu: (document.getElementById('gram-borc-inp')||{value:''}).value.trim(),
  };
}

function saveIslem(showFis){
  const d = readForm();
  if(!d) return;
  if(d.durum === 'SİPARİŞ'){
    d.sipStatus = 'alindi';
    siparisler.unshift(d);
  } else {
    islemler.unshift(d);
  }
  // Havale varsa banka hareketi oluştur
  if(d.havale > 0){
    // Çıkış: kullanıcı tarafından ayarlanan durum listesine göre
    var satisNetTop = d.satirlar ? d.satirlar.filter(function(s){return s.tip==='SATIŞ';}).reduce(function(a,s){return a+s.tutar;},0) : (d.tutar||0);
    var alisNetTop  = d.satirlar ? d.satirlar.filter(function(s){return s.tip==='ALIŞ';}).reduce(function(a,s){return a+s.tutar;},0) : (d.alisTutar||0);
    var netCikis = isCikisDurum(d.durum) || (alisNetTop > satisNetTop && satisNetTop===0);
    var yon = netCikis ? 'cikis' : 'giris';

    var havaleRows = d.satirlar ? d.satirlar.filter(function(s){return s.tip==='HAVALE';}) : [];
    var bankaOnayliMi = !!(document.getElementById('i-banka-onay') && document.getElementById('i-banka-onay').checked);
    havaleRows.forEach(function(hr){
      bankaHareketleri.unshift({
        id: Date.now() + Math.random(),
        tarih: d.tarih, saat: d.saat,
        kimden: d.musteri,
        banka: hr.urun || '',
        aciklama: (netCikis ? '📤 Ödeme yapıldı → ' : '📥 Tahsilat ← ') + (d.urun||'') + ' · ' + d.durum,
        tutar: hr.tutar,
        yon: yon,
        onay: bankaOnayliMi,
        islemId: d.id
      });
    });
    if(!havaleRows.length){
      bankaHareketleri.unshift({
        id: Date.now() + Math.random(),
        tarih: d.tarih, saat: d.saat,
        kimden: d.musteri,
        banka: d.odemeDetay || '',
        aciklama: (netCikis ? '📤 Ödeme yapıldı → ' : '📥 Tahsilat ← ') + (d.urun||'') + ' · ' + d.durum,
        tutar: d.havale,
        yon: yon,
        onay: bankaOnayliMi,
        islemId: d.id
      });
    }
    updateBhBadge();
  }
  save();
  renderIslemler();
  renderMusteri();
  updateSipBadge();
  // Nakit varsa kasayı güncelle
  nakitIslemdenGuncelle(d, isCikisDurum(d.durum));

  // Borç notu varsa otomatik cariye + borç defterine ekle
  if(d.borc_notu && d.durum !== 'SİPARİŞ'){
    var cm = musteriler.find(function(x){return x.isim===d.musteri;});
    if(!cm){
      cm = {id:Date.now(), isim:d.musteri, tel:'', cariHesap:[], cariGram:0};
      musteriler.push(cm);
      updateDL();
    }
    if(!cm.cariHesap) cm.cariHesap=[];
    var borcGram = parseTR(d.borc_notu)||0;
    var borcTl   = parseTR(d.borc_notu.replace(/[^0-9.,]/g,''))||0;
    // Cari hesap satırı
    cm.cariHesap.push({id:Date.now(), tarih:d.tarih, tip:'borc', urun:d.urun||d.durum, gram:borcGram, adet:0, aciklama:d.borc_notu, islemId:d.id});
    cm.cariGram = cm.cariHesap.reduce(function(a,e){return a+(e.tip==='borc'?e.gram:-e.gram);},0);

    // Borç defterine de ekle — kişiyi bul veya oluştur
    var bdKisi = borcDefteri.find(function(x){return x.isim===d.musteri;});
    if(!bdKisi){
      bdKisi = {id:Date.now()+1, isim:d.musteri, tel:cm.tel||'', notlar:'', kayitlar:[]};
      borcDefteri.unshift(bdKisi);
    }
    if(!bdKisi.kayitlar) bdKisi.kayitlar=[];
    bdKisi.kayitlar.unshift({
      id: Date.now()+2,
      tarih: d.tarih,
      tip: 'borc',
      gram: borcGram,
      tl: d.kalan_tl > 0 ? d.kalan_tl : borcTl,
      aciklama: d.borc_notu + (d.urun?' · '+d.urun:'') + ' · ' + d.durum,
      odendi: false,
      islemId: d.id
    });

    save(); renderMusteri(); bdBadgeGuncelle();
    toast('✓ Kaydedildi · borç cariye + borç defterine eklendi — '+d.musteri);
  } else {
    toast('✓ Kaydedildi: ' + d.musteri);
  }
  if(showFis) openFis(d);
  clearForm();
  // Kaydedince İşlemler sekmesine geç
  if(!showFis) setTimeout(function(){ showTab('islemler'); }, 300);
  // Otomatik grup WP — toggle açıksa mesajı kopyala + WhatsApp aç
  if(getGrupAutoAcik()){
    var _msg = islemDetayMesaj(d);
    setTimeout(function(){
      if(navigator.clipboard){ navigator.clipboard.writeText(_msg).catch(function(){}); }
      window.open('https://wa.me/?text='+encodeURIComponent(_msg),'_blank');
      toast('📋 Mesaj kopyalandı — grubu seç ve gönder');
    }, 350);
  }
  // Kalan varsa gram çevirme teklif et
  var satirSatisTop2 = d.satirlar ? d.satirlar.filter(function(s){return s.tip==='SATIŞ';}).reduce(function(a,s){return a+s.tutar;},0) : d.tutar;
  var odemeTop2 = d.odenen||0;
  if(d.kalan_tl > 0){
    openGramCevir(d.musteri, d.kalan_tl);
  } else if(satirSatisTop2 === 0 && odemeTop2 > 0){
    openGramCevir(d.musteri, odemeTop2);
  }
  // kalan_tl < 0 → üst verilecek, gram çevirme gerekmez
}

function clearForm(){
  var gbw=document.getElementById('gram-borc-wrap');if(gbw)gbw.style.display='none';
  var gbi=document.getElementById('gram-borc-inp');if(gbi)gbi.value='';
  satirlar=[];
  secSatirTip='SATIŞ';
  // Tip butonları sıfırla
  var ss = document.getElementById('stip-select'); if(ss) ss.value='SATIŞ';
  setSatirTipSelect('SATIŞ');
  // Alanları temizle
  ['i-musteri','i-not','i-olcu','i-snot','s-urun','s-gram','s-tutar','s-odeme-tutar','s-detay'].forEach(id=>{
    const e=document.getElementById(id); if(e) e.value='';
  });
  document.getElementById('s-adet').value='1';
  document.getElementById('i-bilezik').value='';
  document.getElementById('i-adet').value='1';
  document.getElementById('i-foto').value='';
  document.getElementById('foto-preview-wrap').innerHTML='';
  document.getElementById('sip-extra').style.display='none';
  document.querySelectorAll('.sopt').forEach((b,i)=>b.classList.toggle('active',i===0));
  document.querySelectorAll('.qbtn').forEach(b=>b.classList.remove('sel'));
  secDurum='SATIŞ'; fotoArr=[];
  renderSatirlar();
  // Banka onay checkbox'ını sıfırla ve gizle
  var bankaOnayChk = document.getElementById('i-banka-onay');
  if(bankaOnayChk) bankaOnayChk.checked = false;
  var bankaOnayWrap = document.getElementById('banka-onay-satir-wrap');
  if(bankaOnayWrap) bankaOnayWrap.style.display = 'none';
}

// MÜŞTERİ
function addMusteri(){
  const isim=document.getElementById('m-isim').value.trim();
  const tel=document.getElementById('m-tel').value.trim();
  if(!isim){toast('⚠️ Müşteri adı giriniz');return;}
  musteriler.push({id:Date.now(),isim,tel});
  document.getElementById('m-isim').value='';document.getElementById('m-tel').value='';
  save();renderMusteri();updateDL();toast('✓ Müşteri eklendi: '+isim);
}

function renderMusteri(){
  const ara = (document.getElementById('m-ara')||{}).value||'';
  const filtre = ara.toLowerCase();
  const liste = musteriler.filter(m => !filtre || m.isim.toLowerCase().includes(filtre) || (m.tel||'').includes(filtre));
  document.getElementById('m-cnt').textContent = musteriler.length;
  const el = document.getElementById('musteri-list');
  if(!musteriler.length){el.innerHTML='<div class="empty"><div class="empty-icon">👤</div>Henüz müşteri eklenmedi</div>';return;}
  if(!liste.length){el.innerHTML='<div class="empty"><div class="empty-icon">🔍</div>Sonuç bulunamadı</div>';return;}
  el.innerHTML = liste.map(m => {
    const txs = islemler.filter(i => i.musteri === m.isim);
    const topK = txs.reduce((s,i) => s + (i.kalan_tl||0), 0);
    const cariGram = m.cariGram||0;
    const av = m.isim.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

    // Cari bakiye satırları
    var hesap = m.cariHesap||[];
    var cariRows = '';

    // TL Borcu
    if(topK > 0) cariRows += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #e8dfc8">'
      + '<span style="font-size:11px;color:var(--text2);font-weight:600">TL Borcu</span>'
      + '<span style="font-size:13px;font-weight:700;color:var(--red)">'+fmt(topK)+'</span></div>';

    // Her ürün grubunu ayrı göster (borç - alacak net)
    var urunMap = {};
    hesap.forEach(function(e){
      if(!urunMap[e.urun]) urunMap[e.urun] = 0;
      urunMap[e.urun] += (e.tip==='borc' ? e.gram : -e.gram);
    });
    Object.keys(urunMap).forEach(function(urun){
      var net = urunMap[urun];
      if(net === 0) return;
      // Check if this ürün uses adet
      var adetNet = hesap.filter(function(e){return e.urun===urun && e.adet>0;}).reduce(function(a,e){return a+(e.tip==='borc'?e.adet:-e.adet);},0);
      var netGoster = adetNet !== 0 ? (Math.abs(adetNet)+' adet') : fmtG(Math.abs(net));
      var netDeger = adetNet !== 0 ? adetNet : net;
      var etiket = netDeger > 0 ? urun+' Borcu' : urun+' Alacağı';
      var renk = netDeger > 0 ? 'var(--orange)' : 'var(--green)';
      cariRows += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #e8dfc8">'
        + '<span style="font-size:11px;color:var(--text2);font-weight:600">'+etiket+'</span>'
        + '<span style="font-size:13px;font-weight:700;color:'+renk+'">'+netGoster+'</span></div>';
    });

    // Eğer hiç cariHesap yoksa ama cariGram var (eski veri) → toplu göster
    if(!hesap.length && cariGram !== 0){
      var renk2 = cariGram>0 ? 'var(--orange)' : 'var(--green)';
      cariRows += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #e8dfc8">'
        + '<span style="font-size:11px;color:var(--text2);font-weight:600">'+(cariGram>0?'Gram Borcu':'Gram Alacağı')+'</span>'
        + '<span style="font-size:13px;font-weight:700;color:'+renk2+'">'+fmtG(Math.abs(cariGram))+'</span></div>';
    }

    if(!cariRows) cariRows = '<div style="font-size:11px;color:var(--text3);padding:4px 0">Temiz — bakiye yok ✓</div>';

    // Borç defteri satırları
    var bdKisi = borcDefteri.find(function(x){ return x.isim===m.isim; });
    var bdRows = '';
    if(bdKisi){
      var bdAktif = (bdKisi.kayitlar||[]).filter(function(k){ return !k.odendi; });
      var bdNetTl   = bdAktif.reduce(function(a,k){ return a+(k.tip==='borc'?1:-1)*(k.tl||0); }, 0);
      var bdNetGram = bdAktif.reduce(function(a,k){ return a+(k.tip==='borc'?1:-1)*(k.gram||0); }, 0);
      if(bdNetGram !== 0 || bdNetTl !== 0 || bdAktif.length){
        if(bdNetGram !== 0) bdRows += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #c7d5f0">'
          + '<span style="font-size:11px;color:var(--blue);font-weight:600">'+(bdNetGram>0?'📒 Gram Borcu':'📒 Gram Alacağı')+'</span>'
          + '<span style="font-size:13px;font-weight:700;color:'+(bdNetGram>0?'var(--red)':'var(--green)')+'">'+fmtG(Math.abs(bdNetGram))+'</span></div>';
        if(bdNetTl !== 0) bdRows += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #c7d5f0">'
          + '<span style="font-size:11px;color:var(--blue);font-weight:600">'+(bdNetTl>0?'📒 TL Borcu':'📒 TL Alacağı')+'</span>'
          + '<span style="font-size:13px;font-weight:700;color:'+(bdNetTl>0?'var(--red)':'var(--green)')+'">'+fmt(Math.abs(bdNetTl))+'</span></div>';
        if(!bdNetGram && !bdNetTl && bdAktif.length) bdRows += '<div style="font-size:11px;color:var(--text3);padding:4px 0">'+bdAktif.length+' açık kayıt</div>';
      }
    }

    return '<div style="border:1px solid var(--border);border-radius:var(--radius);margin-bottom:10px;background:#fff;overflow:hidden">'
      // Üst satır: avatar + isim + işlem sayısı + sil
      + '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px">'
      +   '<div class="m-av">'+av+'</div>'
      +   '<div style="flex:1">'
      +     '<div style="font-size:13px;font-weight:600">'+m.isim+'</div>'
      +     (m.tel ? '<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text3)">'+m.tel+'</div>' : '')
      +   '</div>'
      +   '<div style="font-size:11px;color:var(--text3);margin-right:8px">'+txs.length+' işlem</div>'
      +   '<button class="btn" onclick="cariDetayAc('+m.id+')" style="font-size:11px;padding:4px 8px">📋 Cari</button>'
      +   '<button class="btn" onclick="cariEkleAc('+m.id+',\'borc\')" style="font-size:11px;padding:4px 8px;color:var(--red);border-color:var(--red)">+ Borç</button>'
      +   '<button class="btn" onclick="cariEkleAc('+m.id+',\'alacak\')" style="font-size:11px;padding:4px 8px;color:var(--green);border-color:var(--green)">+ Alacak</button>'
      +   '<button class="btn" onclick="musteriBorcDefteri(\''+m.isim+'\')" style="font-size:11px;padding:4px 8px;color:var(--blue);border-color:var(--blue)" title="Borç Defterini Aç">📒</button>'
      +   '<button class="icon-btn" onclick="delMusteri('+m.id+')" title="Sil">✕</button>'
      + '</div>'
      // Cari bakiye bölümü
      + '<div style="background:var(--gold-light);border-top:1px solid #e8dfc8;padding:8px 14px">'
      +   '<div style="font-size:10px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">CARİ HESAP</div>'
      +   cariRows
      + '</div>'
      // Borç defteri özeti
      + (bdRows ? '<div style="background:var(--blue-light);border-top:1px solid #c7d5f0;padding:8px 14px">'
      +   '<div style="font-size:10px;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">BORÇ DEFTERİ</div>'
      +   bdRows
      + '</div>' : '')
      + '</div>';
  }).join('');
}

function delMusteri(id){if(!confirm('Müşteriyi silmek istiyor musunuz?'))return;musteriler=musteriler.filter(m=>m.id!==id);save();renderMusteri();updateDL();}

function musteriBorcDefteri(isim){
  // Borç defteri sekmesine geç ve o kişiyi aç
  showTab('borc');
  var ara = document.getElementById('bd-ara');
  if(ara){ ara.value=isim; }
  // O kişinin kartını otomatik aç
  var kisi = borcDefteri.find(function(x){ return x.isim===isim; });
  if(kisi){ _bdAcikKartlar.add(kisi.id); }
  renderBorcDefteri();
}
function gramCariDuzenle(id){
  var m = musteriler.find(function(x){return x.id===id;});
  if(!m) return;
  var val = prompt(m.isim + ' - Cari gram düzenle (mevcut: '+(fmtG(m.cariGram||0))+')\nYeni gram değeri:', (m.cariGram||0).toFixed(3).replace('.',','));
  if(val===null) return;
  var g = parseFloat((val+'').replace(',','.'))||0;
  m.cariGram = g;
  save(); renderMusteri();
  toast('Cari güncellendi: ' + fmtG(g));
}
function updateDL(){document.getElementById('m-dl').innerHTML=musteriler.map(m=>`<option value="${m.isim}">`).join('');}

// İŞLEMLER
function durumBadge(d){
  if(d==='SATIŞ'||d==='EMANETTEN SATIŞ')return`<span class="badge bd-s">${d}</span>`;
  if(d==='ALIŞ'||d==='EMANETE ALIŞ')return`<span class="badge bd-a">${d}</span>`;
  if(d==='SİPARİŞ')return`<span class="badge bd-sp">${d}</span>`;
  if(d.includes('BORÇ'))return`<span class="badge bd-b">${d}</span>`;
  return`<span class="badge bd-e">${d}</span>`;
}

function renderIslemler(){
  document.getElementById('islem-cnt').textContent=islemler.length;
  var tabCnt=document.getElementById('islem-tab-cnt');
  if(tabCnt){
    var kalanliSayi=islemler.filter(function(i){return i.kalan_tl>0||i.kalan_tl<0;}).length;
    if(kalanliSayi>0){tabCnt.textContent=kalanliSayi;tabCnt.style.display='';}
    else tabCnt.style.display='none';
  }
  const tb=document.getElementById('islem-tb');
  if(!islemler.length){tb.innerHTML='<tr><td colspan="10"><div class="empty"><div class="empty-icon">&#9878;</div>Henuz islem girilmedi</div></td></tr>';return;}
  var rows='';
  for(var idx=0;idx<islemler.length;idx++){
    var i=islemler[idx];
    var islendi = i.islendi||false;

    // Satır rengi: kullanıcının ayarladığı GİRİŞ/ÇIKIŞ'a göre
    var isCikis = isCikisDurum(i.durum||'');
    var isGiris = !isCikis;

    var rowStyle, rowBorder;
    if(islendi){
      rowStyle = 'background:linear-gradient(180deg,#fef9c3 0%,#fefce8 18%,#fffef5 100%);';
      rowBorder = 'border-top:4px solid #eab308;border-left:3px solid #eab308;';
    } else if(isCikis){
      rowStyle = 'background:linear-gradient(180deg,#fecaca 0%,#fee2e2 12%,#fff8f8 100%);';
      rowBorder = 'border-top:4px solid #dc2626;border-left:3px solid #dc2626;';
    } else {
      rowStyle = 'background:linear-gradient(180deg,#86efac 0%,#dcfce7 12%,#f0fdf4 100%);';
      rowBorder = 'border-top:4px solid #16a34a;border-left:3px solid #16a34a;';
    }

    var kalanHtml;
    if(i.borc_notu){
      kalanHtml = '<span class="gram-borc-badge">⚠️ '+i.borc_notu+'</span>';
    } else if(i.kalan_tl > 0){
      kalanHtml = '<span style="color:var(--red);font-weight:700;font-family:JetBrains Mono,monospace;font-size:12px">'+fmt(i.kalan_tl)+'</span>';
    } else if(i.kalan_tl < 0){
      kalanHtml = '<span style="color:var(--blue);font-weight:700;font-family:JetBrains Mono,monospace;font-size:12px" title="Dükkan müşteriye borçlu">⬆️ '+fmt(Math.abs(i.kalan_tl))+'</span>';
    } else {
      kalanHtml = i.ust_verildi
        ? '<span style="color:var(--green);font-size:11px;font-weight:700">✓ Tamam</span>'
        : '<span style="color:var(--text3);font-size:12px;font-style:italic">YOK</span>';
    }

    var odemeHtml = (i.odeme||'-')+(i.odemeDetay?'<br><span style="color:var(--text3)">'+i.odemeDetay+'</span>':'');

    // Checkbox + tüm metin işlendiyse soluk
    var textOpacity = islendi ? 'opacity:.55;' : '';
    var checkHtml = '<label style="display:flex;align-items:center;justify-content:center;cursor:pointer;width:100%;height:100%">'
      + '<input type="checkbox" '+(islendi?'checked':'')+' onchange="islemIslendi('+i.id+',this.checked)"'
      + ' style="width:17px;height:17px;accent-color:#eab308;cursor:pointer;border-radius:4px">'
      + '</label>';

    rows += '<tr style="'+rowStyle+rowBorder+'transition:all .2s;cursor:pointer;border-bottom:1px solid var(--border)" onclick="islemDetayToggle('+i.id+',event)">';
    rows += '<td style="text-align:center;padding:6px 10px" onclick="event.stopPropagation()">'+checkHtml+'</td>';
    rows += '<td style="white-space:nowrap;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text3);'+textOpacity+'">'+i.tarih+'<br>'+i.saat+'</td>';
    // Müşteri + durum etiketi (gerçek durum adı, kısa)
    var tipRenk  = isCikis ? '#dc2626' : '#16a34a';
    var tipBg    = isCikis ? '#fee2e2'  : '#dcfce7';
    var tipEtiket = '<span style="display:inline-block;font-size:9px;font-weight:800;background:'+tipRenk+';color:#fff;padding:1px 6px;border-radius:3px;letter-spacing:.03em;margin-right:5px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle">'+i.durum+'</span>';
    rows += '<td style="font-weight:600;'+textOpacity+(islendi?'text-decoration:line-through;color:var(--text3)':'')+'" >'+tipEtiket+i.musteri+'</td>';
    rows += '<td style="'+textOpacity+'">'+durumBadge(i.durum)+'</td>';
    rows += '<td style="color:var(--text2);'+textOpacity+'">'+(i.urun||'-')+'</td>';
    rows += '<td style="font-family:JetBrains Mono,monospace;'+textOpacity+'">'+(i.gram>0?fmtG(i.gram):'-')+'</td>';
    rows += '<td style="font-family:JetBrains Mono,monospace;font-weight:500;'+textOpacity+'">'+(i.tutar>0?fmt(i.tutar):'-')+'</td>';
    rows += '<td style="font-size:11px;color:var(--text2);'+textOpacity+'">'+odemeHtml+'</td>';
    rows += '<td style="'+textOpacity+'">'+kalanHtml+'</td>';

    // BANKA ONAYI sütunu
    var islemBhler = bankaHareketleri.filter(function(h){ return h.islemId === i.id; });
    var bankaTd = '';
    if(islemBhler.length > 0){
      var hepsiOnay = islemBhler.every(function(h){ return h.onay; });
      var bazıOnay  = islemBhler.some(function(h){ return h.onay; });
      var bhTutar   = islemBhler.reduce(function(a,h){ return a+h.tutar; }, 0);
      var bhTitle   = islemBhler.map(function(h){ return (h.onay?'✓ ':'⏳ ')+(h.banka||'Havale')+': '+fmt(h.tutar); }).join('\n');
      if(hepsiOnay){
        bankaTd = '<button onclick="islemBankaToggle('+i.id+',event)" title="'+bhTitle+'\n\nTümü onaylı — kaldırmak için tıkla" '
          +'style="display:flex;align-items:center;gap:3px;padding:3px 7px;border:1.5px solid var(--green);border-radius:var(--radius-sm);background:var(--green-light);color:var(--green);cursor:pointer;font-size:10px;font-weight:800;white-space:nowrap;font-family:var(--font-body)">'
          +'🏦 ✓</button>';
      } else if(bazıOnay){
        bankaTd = '<button onclick="islemBankaToggle('+i.id+',event)" title="'+bhTitle+'\n\nKısmi onaylı — tümünü onaylamak için tıkla" '
          +'style="display:flex;align-items:center;gap:3px;padding:3px 7px;border:1.5px solid var(--orange);border-radius:var(--radius-sm);background:var(--orange-light);color:var(--orange);cursor:pointer;font-size:10px;font-weight:800;white-space:nowrap;font-family:var(--font-body)">'
          +'🏦 ½</button>';
      } else {
        bankaTd = '<button onclick="islemBankaToggle('+i.id+',event)" title="'+bhTitle+'\n\nOnay bekliyor — tıkla onayla" '
          +'style="display:flex;align-items:center;gap:3px;padding:3px 7px;border:1.5px solid var(--red);border-radius:var(--radius-sm);background:var(--red-light);color:var(--red);cursor:pointer;font-size:10px;font-weight:800;white-space:nowrap;font-family:var(--font-body);animation:pulse-red 1.2s infinite">'
          +'🏦 ⏳</button>';
      }
    }
    rows += '<td style="text-align:center;padding:4px 6px" onclick="event.stopPropagation()">'+bankaTd+'</td>';

    rows += '<td style="display:flex;gap:4px;flex-wrap:wrap" onclick="event.stopPropagation()">';
    if(!islendi){
      if(i.kalan_tl>0){
        rows += '<button onclick="odemeEkleAc('+i.id+')" title="Ödeme Ekle" style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border:1.5px solid var(--green);border-radius:var(--radius-sm);background:var(--green-light);color:var(--green);font-family:var(--font-body);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">💳 Ödeme</button>';
      } else if(i.kalan_tl<0){
        rows += '<button onclick="ustVerAc('+i.id+')" title="Üst Ver" style="display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border:1.5px solid var(--blue);border-radius:var(--radius-sm);background:var(--blue-light);color:var(--blue);font-family:var(--font-body);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">⬆️ Üst Ver</button>';
      }
    }
    rows += '<button class="icon-btn" title="Düzenle" onclick="islemDuzenle('+i.id+')" style="color:var(--gold-dark);border-color:var(--gold-mid);background:var(--gold-light)">✏️</button>';
    rows += '<button class="icon-btn" title="Fis" onclick="openFisById('+i.id+')">&#128510;</button>';
    // WP Müşteriye butonu
    rows += '<button class="icon-btn" title="'+(i.wp_musteri_zaman?'Müşteriye gönderildi: '+i.wp_musteri_zaman:'WP Müşteriye')+'" onclick="islemMusteriyeWP('+i.id+')" style="background:#e7fce9;border-color:#25D366;color:#075e54;position:relative">'
      +'👤'+(i.wp_musteri_zaman?'<span style="position:absolute;top:-5px;right:-5px;background:#25D366;color:#fff;border-radius:50%;width:13px;height:13px;font-size:8px;display:flex;align-items:center;justify-content:center;font-weight:700">✓</span>':'')+'</button>';
    // WP Kendime butonu
    rows += '<button class="icon-btn" title="'+(i.wp_kendi_zaman?'Kendime gönderildi: '+i.wp_kendi_zaman:'Kendime WP')+'" onclick="islemKendimeWP('+i.id+')" style="background:#e7fce9;border-color:#25D366;color:#075e54;position:relative">'
      +'📱'+(i.wp_kendi_zaman?'<span style="position:absolute;top:-5px;right:-5px;background:#25D366;color:#fff;border-radius:50%;width:13px;height:13px;font-size:8px;display:flex;align-items:center;justify-content:center;font-weight:700">✓</span>':'')+'</button>';
    // WP Gruba butonu (sadece grup tel tanımlıysa göster)
    if(getIslemGrup()){
      rows += '<button class="icon-btn" title="'+(i.wp_grup_zaman?'Gruba gönderildi: '+i.wp_grup_zaman:'Gruba WP')+'" onclick="islemGrubaWP('+i.id+')" style="background:#e8f0fe;border-color:#1b3f7a;color:#1b3f7a;position:relative">'
        +'👥'+(i.wp_grup_zaman?'<span style="position:absolute;top:-5px;right:-5px;background:#1b3f7a;color:#fff;border-radius:50%;width:13px;height:13px;font-size:8px;display:flex;align-items:center;justify-content:center;font-weight:700">✓</span>':'')+'</button>';
    }
    rows += '<button class="icon-btn" title="Sil" onclick="delIslem('+i.id+')">&#10005;</button>';
    rows += '</td></tr>';
    // GİZLİ DETAY SATIRI
    rows += '<tr id="detay-'+i.id+'" style="display:none"><td colspan="11" style="padding:0;background:#f8f6f0">';
    rows += islemDetayHTML(i);
    rows += '</td></tr>';
  }
  tb.innerHTML=rows;
}
function delIslem(id){if(!confirm('İşlemi silmek istiyor musunuz?'))return;islemler=islemler.filter(x=>x.id!==id);save();renderIslemler();renderMusteri();}
function openFisById(id){const i=islemler.find(x=>x.id===id);if(i)openFis(i);}

function islemBankaToggle(islemId, e){
  if(e) e.stopPropagation();
  var bhler = bankaHareketleri.filter(function(h){ return h.islemId === islemId; });
  if(!bhler.length) return;
  var hepsiOnay = bhler.every(function(h){ return h.onay; });
  // Hepsi onaylıysa → hepsini kaldır; değilse → hepsini onayla
  var yeniDurum = !hepsiOnay;
  bhler.forEach(function(h){ h.onay = yeniDurum; });
  save();
  renderIslemler();
  updateBhBadge();
  if(yeniDurum){
    toast('🏦 ✓ Banka onaylandı — '+bhler.length+' hareket');
  } else {
    toast('🏦 ⏳ Banka onayı kaldırıldı');
  }
}

/* ════ İŞLEM DETAY AÇILIR ════ */
var _acikDetaylar = new Set();

function islemDetayToggle(id, e){
  if(e && e.target && (e.target.tagName==='BUTTON'||e.target.tagName==='INPUT')) return;
  var row = document.getElementById('detay-'+id);
  if(!row) return;
  if(_acikDetaylar.has(id)){
    _acikDetaylar.delete(id);
    row.style.display='none';
  } else {
    _acikDetaylar.add(id);
    row.style.display='';
  }
}

function islemDetayHTML(i){
  var satirlar = i.satirlar || [];
  var html = '<div style="padding:14px 20px;border-top:2px dashed #e4d9c0">';

  // ── BANKA ONAY BANNER ──────────────────────
  var bhler = bankaHareketleri.filter(function(h){ return h.islemId === i.id; });
  if(bhler.length){
    var hepsiOnay = bhler.every(function(h){ return h.onay; });
    var bazisiOnay = bhler.some(function(h){ return h.onay; });
    var bhToplam = bhler.reduce(function(a,h){return a+h.tutar;},0);
    var isCikisBh = bhler[0] && bhler[0].yon === 'cikis';
    if(hepsiOnay){
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:linear-gradient(135deg,#14532d,#16a34a);border-radius:var(--radius-sm);margin-bottom:14px;box-shadow:0 2px 8px rgba(20,83,45,.25)">'
        +'<span style="font-size:18px">🏦</span>'
        +'<div style="flex:1">'
          +'<div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.08em">Banka Onayı</div>'
          +'<div style="font-size:14px;font-weight:800;color:#fff">✅ BANKADAN GELDİ — '+(isCikisBh?'Ödeme Gönderildi':'Para Alındı')+'</div>'
        +'</div>'
        +'<div style="text-align:right">'
          +'<div style="font-family:var(--font-mono);font-size:16px;font-weight:800;color:#fff">'+fmt(bhToplam)+'</div>'
          +'<div style="font-size:10px;color:rgba(255,255,255,.6)">'+(bhler.map(function(h){return h.banka||'Havale';}).join(' · '))+'</div>'
        +'</div>'
      +'</div>';
    } else if(bazisiOnay){
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:linear-gradient(135deg,#7c3d0a,#c2640f);border-radius:var(--radius-sm);margin-bottom:14px;box-shadow:0 2px 8px rgba(124,61,10,.25)">'
        +'<span style="font-size:18px">🏦</span>'
        +'<div style="flex:1">'
          +'<div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.08em">Banka Onayı</div>'
          +'<div style="font-size:14px;font-weight:800;color:#fff">⚠️ KISMİ ONAY — Bekleyen var</div>'
        +'</div>'
        +'<button onclick="islemBankaToggle('+i.id+',event)" style="padding:5px 12px;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.5);border-radius:6px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">Tümünü Onayla</button>'
      +'</div>';
    } else {
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:linear-gradient(135deg,#7c1d1d,#dc2626);border-radius:var(--radius-sm);margin-bottom:14px;box-shadow:0 2px 8px rgba(124,29,29,.25);animation:pulse-red 1.4s infinite">'
        +'<span style="font-size:18px">🏦</span>'
        +'<div style="flex:1">'
          +'<div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.08em">Banka Onayı</div>'
          +'<div style="font-size:14px;font-weight:800;color:#fff">⏳ BANKA ONAYI BEKLİYOR — Tıkla Onayla</div>'
        +'</div>'
        +'<div style="text-align:right">'
          +'<div style="font-family:var(--font-mono);font-size:16px;font-weight:800;color:#fff">'+fmt(bhToplam)+'</div>'
        +'</div>'
        +'<button onclick="islemBankaToggle('+i.id+',event)" style="padding:5px 14px;background:rgba(255,255,255,.25);border:2px solid #fff;border-radius:6px;color:#fff;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap">✓ ONAYLA</button>'
      +'</div>';
    }
  }

  html += '<div style="font-size:10px;font-weight:700;color:var(--gold-dark);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">📋 ALIŞVERİŞ DETAYI — #'+String(i.id).slice(-6)+'</div>';

  if(satirlar.length){
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px">';
    html += '<thead><tr style="background:var(--gold-light)">'
      +'<th style="padding:6px 10px;text-align:left;font-size:9px;font-weight:700;color:var(--gold-dark);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #e4d4a0">TÜR</th>'
      +'<th style="padding:6px 10px;text-align:left;font-size:9px;font-weight:700;color:var(--gold-dark);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #e4d4a0">ÜRÜN / AÇIKLAMA</th>'
      +'<th style="padding:6px 10px;text-align:right;font-size:9px;font-weight:700;color:var(--gold-dark);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #e4d4a0">GRAM / ADET</th>'
      +'<th style="padding:6px 10px;text-align:right;font-size:9px;font-weight:700;color:var(--gold-dark);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #e4d4a0">TUTAR</th>'
      +'</tr></thead><tbody>';
    satirlar.forEach(function(s){
      var tipRenk = s.tip==='SATIŞ'?'var(--blue)':s.tip==='ALIŞ'?'var(--green)':s.tip==='NAKİT'?'var(--orange)':'#6d28d9';
      var tipBg   = s.tip==='SATIŞ'?'var(--blue-light)':s.tip==='ALIŞ'?'var(--green-light)':s.tip==='NAKİT'?'var(--orange-light)':'#f5f3ff';
      // SATIŞ veya ALIŞ ise işlemin gerçek durumunu göster (ör: EMANETE ALTIN ALDI)
      var tipLabel = (s.tip==='SATIŞ'||s.tip==='ALIŞ') ? (i.durum||s.tip) : s.tip;
      html += '<tr style="border-bottom:1px solid #f0ebe3">'
        +'<td style="padding:7px 10px"><span style="background:'+tipBg+';color:'+tipRenk+';padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;white-space:nowrap">'+tipLabel+'</span></td>'
        +'<td style="padding:7px 10px;font-weight:500">'+(s.urun||'—')+'</td>'
        +'<td style="padding:7px 10px;text-align:right;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text2)">'+(s.gram>0?fmtG(s.gram):s.adet>0?s.adet+' adet':'—')+'</td>'
        +'<td style="padding:7px 10px;text-align:right;font-family:JetBrains Mono,monospace;font-weight:700;color:'+tipRenk+'">'+fmt(s.tutar)+'</td>'
        +'</tr>';
    });
    html += '</tbody></table>';
  } else {
    // Eski format — tek satır bilgi
    var bilgiler = [];
    if(i.urun)       bilgiler.push(['Ürün', i.urun]);
    if(i.gram>0)     bilgiler.push(['Gram', fmtG(i.gram)]);
    if(i.tutar>0)    bilgiler.push(['Satış', fmt(i.tutar)]);
    if((i.alisTutar||0)>0) bilgiler.push(['Alış', fmt(i.alisTutar)]);
    if(i.nakit>0)    bilgiler.push(['Nakit', fmt(i.nakit)]);
    if(i.havale>0)   bilgiler.push(['Havale'+(i.odemeDetay?' ('+i.odemeDetay+')':''), fmt(i.havale)]);
    if(bilgiler.length){
      html += '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:10px">';
      bilgiler.forEach(function(b){
        html += '<div><div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em">'+b[0]+'</div><div style="font-size:13px;font-weight:700;font-family:JetBrains Mono,monospace">'+b[1]+'</div></div>';
      });
      html += '</div>';
    }
  }

  // Kalan / üst
  if(i.kalan_tl>0) html += '<div style="display:inline-flex;align-items:center;gap:8px;background:var(--red-light);border:1px solid var(--red);border-radius:6px;padding:6px 12px;font-size:12px"><span style="font-weight:700;color:var(--red)">⚠️ KALAN:</span><span style="font-family:JetBrains Mono,monospace;font-weight:800;color:var(--red)">'+fmt(i.kalan_tl)+'</span></div>';
  else if(i.ust_verildi){
    html += '<div style="display:inline-flex;align-items:center;gap:8px;background:var(--blue-light);border:1px solid var(--blue);border-radius:6px;padding:6px 12px;font-size:12px;margin-bottom:4px">';
    html += '<span style="font-weight:700;color:var(--blue)">⬆️ ÜST VERİLDİ</span>';
    if(i.ust_nakit>0)  html += '<span style="font-family:JetBrains Mono,monospace">🪙 '+fmt(i.ust_nakit)+'</span>';
    if(i.ust_havale>0) html += '<span style="font-family:JetBrains Mono,monospace">🏦 '+fmt(i.ust_havale)+(i.ust_havale_detay?' ('+i.ust_havale_detay+')':'')+'</span>';
    html += '</div>';
  } else if(i.tutar>0 || (i.alisTutar||0)>0){
    html += '<div style="display:inline-flex;align-items:center;gap:6px;background:var(--green-light);border:1px solid var(--green);border-radius:6px;padding:6px 12px;font-size:12px"><span style="font-weight:700;color:var(--green)">✅ TAM ÖDENDİ</span></div>';
  }

  if(i.not || i.sipNot) html += '<div style="margin-top:8px;font-size:12px;color:var(--text2);font-style:italic;padding-top:8px;border-top:1px dashed #e4d4a0">📝 '+(i.sipNot||i.not)+'</div>';

  // Banka hareketleri özeti
  var bhler = bankaHareketleri.filter(function(h){ return h.islemId === i.id; });
  if(bhler.length){
    html += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--border2)">';
    html += '<div style="font-size:10px;font-weight:700;color:var(--purple);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">🏦 BANKA HAREKETLERİ</div>';
    html += '<div style="display:flex;flex-direction:column;gap:5px">';
    bhler.forEach(function(h){
      var onayRenk = h.onay ? 'var(--green)' : 'var(--red)';
      var onayBg   = h.onay ? 'var(--green-light)' : 'var(--red-light)';
      var isCikis  = h.yon === 'cikis';
      html += '<div style="display:flex;align-items:center;gap:10px;padding:7px 12px;background:'+onayBg+';border:1px solid '+onayRenk+';border-radius:var(--radius-sm)">'
        +'<span style="font-size:13px">'+(isCikis?'📤':'📥')+'</span>'
        +'<div style="flex:1;min-width:0">'
          +'<span style="font-size:12px;font-weight:600">'+(h.kimden||'—')+'</span>'
          +(h.banka ? '<span style="font-size:11px;color:var(--text2);margin-left:6px">· '+h.banka+'</span>' : '')
          +(h.aciklama ? '<div style="font-size:10px;color:var(--text3);font-style:italic;margin-top:1px">'+h.aciklama+'</div>' : '')
        +'</div>'
        +'<span style="font-family:var(--font-mono);font-weight:700;font-size:13px;color:'+(isCikis?'var(--red)':'var(--green)')+'">'+fmt(h.tutar)+'</span>'
        +'<label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer">'
          +'<input type="checkbox" '+(h.onay?'checked':'')+' onchange="bhToggleOnay('+h.id+',this.checked)" style="width:16px;height:16px;accent-color:var(--green);cursor:pointer">'
          +'<span style="font-size:10px;font-weight:700;color:'+onayRenk+'">'+(h.onay?'ONAYLANDI':'ONAY BEKLİYOR')+'</span>'
        +'</label>'
      +'</div>';
    });
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

/* ════ OTOMATİK YEDEK ════ */
function otoYedekAl(){
  try {
    var yedekler = JSON.parse(localStorage.getItem('ks_oto_yedek')||'[]');
    var snap = {
      zaman: new Date().toISOString(),
      islemSayisi: islemler.length,
      musteriSayisi: musteriler.length,
      data: {
        musteriler: musteriler,
        islemler: islemler,
        siparisler: siparisler,
        bankaHareketleri: bankaHareketleri,
        borcDefteri: borcDefteri,
        durumlar: durumlar,
        cikisDurumlar: cikisDurumlar,
        bankalar: bankalar,
        atolyeler: atolyeler,
        baglantiAtolye: baglantiAtolye,
        baglantiTransferler: baglantiTransferler
      }
    };
    yedekler.unshift(snap);
    if(yedekler.length > 10) yedekler = yedekler.slice(0,10);
    localStorage.setItem('ks_oto_yedek', JSON.stringify(yedekler));
  } catch(e){}
}

function otoYedekRender(){
  var el = document.getElementById('oto-yedek-list'); if(!el) return;
  var yedekler = [];
  try { yedekler = JSON.parse(localStorage.getItem('ks_oto_yedek')||'[]'); } catch(e){}
  if(!yedekler.length){
    el.innerHTML='<div style="font-size:12px;color:var(--text3);padding:8px 0">Henüz otomatik yedek yok — ilk kayıtta oluşturulur.</div>';
    return;
  }
  el.innerHTML = yedekler.map(function(y,idx){
    var d = new Date(y.zaman);
    var tarihStr = d.toLocaleDateString('tr-TR')+' '+d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:6px;background:#fff">'
      +'<div style="flex:1">'
        +'<div style="font-size:12px;font-weight:700">'+tarihStr+'</div>'
        +'<div style="font-size:11px;color:var(--text3);margin-top:2px">'+y.islemSayisi+' işlem · '+y.musteriSayisi+' müşteri</div>'
      +'</div>'
      +'<button onclick="otoYedekYukle('+idx+')" style="padding:6px 13px;background:var(--blue);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:12px;font-weight:700;cursor:pointer">Geri Yükle</button>'
      +'<button onclick="otoYedekIndir('+idx+')" style="padding:6px 11px;background:#fff;border:1.5px solid var(--border2);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:12px;cursor:pointer" title="JSON indir">⬇</button>'
      +'</div>';
  }).join('');
}

function otoYedekYukle(idx){
  var yedekler = [];
  try { yedekler = JSON.parse(localStorage.getItem('ks_oto_yedek')||'[]'); } catch(e){}
  var y = yedekler[idx]; if(!y||!y.data) { toast('❌ Yedek bulunamadı'); return; }
  var d = new Date(y.zaman);
  var tarihStr = d.toLocaleDateString('tr-TR')+' '+d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  if(!confirm('⚠️ '+tarihStr+' tarihli yedek yüklensin mi?\n\nMevcut veriler silinecek!')) return;
  var data = y.data;
  if(data.musteriler)      { musteriler=data.musteriler; localStorage.setItem('ks_m',JSON.stringify(musteriler)); }
  if(data.islemler)        { islemler=data.islemler; localStorage.setItem('ks_i',JSON.stringify(islemler)); }
  if(data.siparisler)      { siparisler=data.siparisler; try{localStorage.setItem('ks_s',JSON.stringify(siparisler));}catch(e2){} }
  if(data.bankaHareketleri){ bankaHareketleri=data.bankaHareketleri; localStorage.setItem('ks_bh',JSON.stringify(bankaHareketleri)); }
  if(data.borcDefteri)     { borcDefteri=data.borcDefteri; localStorage.setItem('ks_bd',JSON.stringify(borcDefteri)); }
  if(data.durumlar)        { durumlar=data.durumlar; localStorage.setItem('ks_durumlar',JSON.stringify(durumlar)); }
  if(data.cikisDurumlar)   { cikisDurumlar=data.cikisDurumlar; localStorage.setItem('ks_cd',JSON.stringify(cikisDurumlar)); }
  if(data.bankalar)        { bankalar=data.bankalar; localStorage.setItem('ks_bankalar',JSON.stringify(bankalar)); }
  if(data.atolyeler)       { atolyeler=data.atolyeler; localStorage.setItem('ks_atolyeler',JSON.stringify(atolyeler)); }
  if(data.baglantiAtolye)  { baglantiAtolye=data.baglantiAtolye; localStorage.setItem('ks_bag_a',JSON.stringify(baglantiAtolye)); }
  if(data.baglantiTransferler){ baglantiTransferler=data.baglantiTransferler; localStorage.setItem('ks_bag_t',JSON.stringify(baglantiTransferler)); }
  renderDurumWrap(); renderMusteri(); renderIslemler(); updateSipBadge(); updateDL();
  renderBankaList(); renderBankaQbtns(); updateBankaDL(); renderAtolyeleri(); updateBhBadge();
  otoYedekRender();
  toast('✅ Yedek yüklendi! '+islemler.length+' işlem, '+musteriler.length+' müşteri');
}

function otoYedekIndir(idx){
  var yedekler = [];
  try { yedekler = JSON.parse(localStorage.getItem('ks_oto_yedek')||'[]'); } catch(e){}
  var y = yedekler[idx]; if(!y) return;
  var json = JSON.stringify(y.data, null, 2);
  var blob = new Blob([json],{type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var d = new Date(y.zaman);
  a.href=url; a.download='kuyumcu_yedek_'+d.toLocaleDateString('tr-TR').replace(/\./g,'-')+'_'+d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}).replace(':','-')+'.json';
  a.click(); URL.revokeObjectURL(url);
}

function localStorageTara(){
  var panel = document.getElementById('kurtarma-panel');
  panel.style.display = '';

  var html = '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">🔍 Bulunan Veriler</div>';

  var anahtarlar = [
    { key:'ks_i',  ad:'İşlemler',     sayac: function(d){ return Array.isArray(d)?d.length+' işlem':null; } },
    { key:'ks_m',  ad:'Müşteriler',   sayac: function(d){ return Array.isArray(d)?d.length+' müşteri':null; } },
    { key:'ks_bd', ad:'Borç Defteri', sayac: function(d){ return Array.isArray(d)?d.length+' kayıt':null; } },
    { key:'ks_s',  ad:'Siparişler',   sayac: function(d){ return Array.isArray(d)?d.length+' sipariş':null; } },
    { key:'ks_bh', ad:'Banka Hareketleri', sayac: function(d){ return Array.isArray(d)?d.length+' kayıt':null; } },
  ];

  var bulunanlar = [];
  anahtarlar.forEach(function(a){
    var val = localStorage.getItem(a.key);
    if(!val) return;
    try {
      var parsed = JSON.parse(val);
      var bilgi = a.sayac(parsed);
      if(bilgi) bulunanlar.push({ key:a.key, ad:a.ad, bilgi:bilgi });
      else if(Array.isArray(parsed) && parsed.length>0) bulunanlar.push({ key:a.key, ad:a.ad, bilgi:parsed.length+' kayıt' });
    } catch(e){}
  });

  if(!bulunanlar.length){
    panel.innerHTML = '<div style="font-size:13px;color:var(--red);font-weight:600;padding:10px 0">❌ Tarayıcıda kurtarılabilecek veri bulunamadı.<br><span style="font-weight:400;font-size:12px">Veri başka bir tarayıcı ya da bilgisayarda kalmış olabilir.</span></div>';
    return;
  }

  html += bulunanlar.map(function(b){
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:1.5px solid var(--green);border-radius:var(--radius-sm);background:#fff;margin-bottom:8px">'
      +'<div style="flex:1">'
        +'<div style="font-size:12px;color:var(--text3)">'+b.ad+'</div>'
        +'<div style="font-size:15px;font-weight:800;color:var(--green);margin-top:2px">'+b.bilgi+'</div>'
      +'</div>'
      +'<button onclick="kurtarmaYukle(\''+b.key+'\')" style="padding:9px 18px;background:var(--green);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:13px;font-weight:700;cursor:pointer">✓ Yükle</button>'
    +'</div>';
  }).join('');

  panel.innerHTML = html;
}

function kurtarmaYukle(key){
  try {
    var val = localStorage.getItem(key);
    var parsed = JSON.parse(val);

    // ks_i — işlemler dizisi
    if(key==='ks_i'){
      var arr = Array.isArray(parsed) ? parsed : [];
      if(!arr.length){ toast('⚠️ Bu anahtarda işlem yok'); return; }
      if(!confirm(arr.length+' işlem bulundu. Yüklensin mi?')) return;
      islemler = arr;
      localStorage.setItem('ks_i', JSON.stringify(islemler));
      renderIslemler(); updateDL();
      toast('✅ '+arr.length+' işlem kurtarıldı!');
      return;
    }
    // ks_m — müşteri dizisi
    if(key==='ks_m'){
      var arr = Array.isArray(parsed) ? parsed : [];
      if(!arr.length){ toast('⚠️ Bu anahtarda müşteri yok'); return; }
      if(!confirm(arr.length+' müşteri bulundu. Yüklensin mi?')) return;
      musteriler = arr;
      localStorage.setItem('ks_m', JSON.stringify(musteriler));
      renderMusteri();
      toast('✅ '+arr.length+' müşteri kurtarıldı!');
      return;
    }
    // ks_bd — borç defteri
    if(key==='ks_bd'){
      var arr = Array.isArray(parsed) ? parsed : [];
      if(!arr.length){ toast('⚠️ Borç defteri boş'); return; }
      if(!confirm(arr.length+' borç kaydı bulundu. Yüklensin mi?')) return;
      borcDefteri = arr;
      localStorage.setItem('ks_bd', JSON.stringify(borcDefteri));
      toast('✅ '+arr.length+' borç kaydı kurtarıldı!');
      return;
    }
    // Tam yedek objesi
    if(parsed && typeof parsed==='object' && !Array.isArray(parsed)){
      var toplam = (parsed.islemler||[]).length + (parsed.musteriler||[]).length;
      if(!confirm('Toplam '+(parsed.islemler||[]).length+' işlem, '+(parsed.musteriler||[]).length+' müşteri. Yüklensin mi?')) return;
      if(parsed.musteriler)  { musteriler=parsed.musteriler; localStorage.setItem('ks_m',JSON.stringify(musteriler)); }
      if(parsed.islemler)    { islemler=parsed.islemler; localStorage.setItem('ks_i',JSON.stringify(islemler)); }
      if(parsed.borcDefteri) { borcDefteri=parsed.borcDefteri; localStorage.setItem('ks_bd',JSON.stringify(borcDefteri)); }
      renderMusteri(); renderIslemler(); updateDL();
      toast('✅ Kurtarıldı! '+islemler.length+' işlem, '+musteriler.length+' müşteri');
      return;
    }
    toast('⚠️ Tanınamayan format: '+key);
  } catch(e){ toast('❌ Hata: '+e.message); }
}

/* ════ VERİ YEDEKLEME / YÜKLEME ════ */
function veriDisaAktar(){
  var data = {
    versiyon: '1.0',
    tarih: new Date().toISOString(),
    musteriler: musteriler,
    islemler: islemler,
    siparisler: siparisler,
    bankaHareketleri: bankaHareketleri,
    nakitHareketler: nakitHareketler,
    nakitBakiye: nakitBakiye,
    durumlar: durumlar,
    cikisDurumlar: cikisDurumlar,
    borcDefteri: borcDefteri,
    bankalar: bankalar,
    atolyeler: atolyeler,
    bilezikTurler: bilezikTurler
  };
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'kuyumcu_yedek_'+new Date().toLocaleDateString('tr-TR').replace(/\./g,'-')+'.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('✅ Yedek dosyası indirildi!');
}

function veriIceAktar(event){
  var file = event.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e){
    try{
      var data = JSON.parse(e.target.result);
      if(!confirm('Mevcut tüm veriler silinip yedek dosyası yüklensin mi?\n\nBu işlem geri alınamaz!')) return;
      if(data.musteriler)      { musteriler=data.musteriler; localStorage.setItem('ks_m',JSON.stringify(musteriler)); }
      if(data.islemler)        { islemler=data.islemler; localStorage.setItem('ks_i',JSON.stringify(islemler)); }
      if(data.siparisler)      { siparisler=data.siparisler; try{localStorage.setItem('ks_s',JSON.stringify(siparisler));}catch(e2){} }
      if(data.bankaHareketleri){ bankaHareketleri=data.bankaHareketleri; localStorage.setItem('ks_bh',JSON.stringify(bankaHareketleri)); }
      if(data.nakitHareketler) { nakitHareketler=data.nakitHareketler; }
      if(typeof data.nakitBakiye==='number') { nakitBakiye=data.nakitBakiye; }
      if(data.durumlar)        { durumlar=data.durumlar; localStorage.setItem('ks_durumlar',JSON.stringify(durumlar)); }
      if(data.cikisDurumlar)   { cikisDurumlar=data.cikisDurumlar; localStorage.setItem('ks_cd',JSON.stringify(cikisDurumlar)); }
      if(data.borcDefteri)     { borcDefteri=data.borcDefteri; localStorage.setItem('ks_bd',JSON.stringify(borcDefteri)); }
      if(data.bankalar)        { bankalar=data.bankalar; localStorage.setItem('ks_bankalar',JSON.stringify(bankalar)); }
      if(data.atolyeler)       { atolyeler=data.atolyeler; localStorage.setItem('ks_atolyeler',JSON.stringify(atolyeler)); }
      if(data.bilezikTurler)   { bilezikTurler=data.bilezikTurler; localStorage.setItem('ks_btur',JSON.stringify(bilezikTurler)); }
      saveNakit();
      renderDurumWrap(); renderMusteri(); renderIslemler(); updateSipBadge(); updateDL();
      renderBankaList(); renderBankaQbtns(); updateBankaDL(); renderAtolyeleri();
      updateNakitLbl(); updateBhBadge();
      toast('✅ Yedek yüklendi! '+islemler.length+' işlem, '+musteriler.length+' müşteri');
    } catch(err){
      toast('❌ Dosya okunamadı: '+err.message);
    }
    event.target.value='';
  };
  reader.readAsText(file);
}

/* ════ GÜNLÜK PDF ════ */
function gunlukPDF(){
  var bugun = new Date().toLocaleDateString('tr-TR');
  var gunIslemler = islemler.filter(function(x){return x.tarih===bugun;});
  if(!gunIslemler.length){ toast('⚠️ Bugün işlem yok'); return; }

  var satisTop=0, alisTop=0, nakitTop=0, havaleTop=0, kalanTop=0;
  gunIslemler.forEach(function(i){
    satisTop+=(i.tutar||0); alisTop+=(i.alisTutar||0);
    nakitTop+=(i.nakit||0); havaleTop+=(i.havale||0);
    if(i.kalan_tl>0) kalanTop+=i.kalan_tl;
  });

  var rows = gunIslemler.map(function(i,idx){
    var satirlar = i.satirlar||[];
    var detaySatirlar = satirlar.length ? satirlar.map(function(s){
      var tipRenk = s.tip==='SATIŞ'?'#1b3f7a':s.tip==='ALIŞ'?'#14532d':s.tip==='NAKİT'?'#7c3d0a':'#4c1d95';
      var tipLabel = (s.tip==='SATIŞ'||s.tip==='ALIŞ') ? (i.durum||s.tip) : s.tip;
      return '<tr style="border-bottom:1px solid #f0ebe3">'
        +'<td style="padding:4px 8px;font-size:10px"><span style="background:'+(s.tip==='SATIŞ'?'#edf2fc':s.tip==='ALIŞ'?'#edfaf3':s.tip==='NAKİT'?'#fef6ee':'#f5f3ff')+';color:'+tipRenk+';padding:1px 6px;border-radius:8px;font-weight:700;white-space:nowrap">'+tipLabel+'</span></td>'
        +'<td style="padding:4px 8px;font-size:11px">'+(s.urun||'—')+'</td>'
        +'<td style="padding:4px 8px;font-size:11px;text-align:right;font-family:monospace">'+(s.gram>0?fmtG(s.gram):s.adet>0?s.adet+' adet':'—')+'</td>'
        +'<td style="padding:4px 8px;font-size:11px;text-align:right;font-family:monospace;font-weight:700;color:'+tipRenk+'">'+fmt(s.tutar)+'</td>'
        +'</tr>';
    }).join('') : '<tr><td colspan="4" style="padding:4px 8px;font-size:11px;color:#333">'+(i.urun||'—')+(i.gram>0?' · '+fmtG(i.gram):'')+'</td></tr>';

    var kalanStr = i.kalan_tl>0 ? '<span style="color:#7c1d1d;font-weight:700">'+fmt(i.kalan_tl)+' KALAN</span>'
      : i.ust_verildi ? '<span style="color:#1b3f7a">⬆️ Üst Verildi</span>'
      : '<span style="color:#14532d">✓ Tam Ödendi</span>';

    return '<div style="margin-bottom:16px;border:1px solid #e4ddd3;border-radius:8px;overflow:hidden;break-inside:avoid">'
      +'<div style="background:#f8f3e8;padding:8px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e4d4a0">'
      +'<div><span style="font-weight:700;font-size:14px">'+(idx+1)+'. '+i.musteri+'</span>'
      +'<span style="margin-left:10px;background:'+(i.durum.includes('SATIŞ')?'#edf2fc':i.durum.includes('ALIŞ')?'#edfaf3':'#f8f3e8')+';padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">'+i.durum+'</span></div>'
      +'<div style="font-size:12px;color:#222;font-weight:700">'+i.saat+'</div></div>'
      +'<table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr style="background:#d8d8d8"><th style="padding:6px 8px;text-align:left;font-size:10px;color:#111;text-transform:uppercase;font-weight:800;border-bottom:2px solid #999">Tür</th><th style="padding:6px 8px;text-align:left;font-size:10px;color:#111;text-transform:uppercase;font-weight:800;border-bottom:2px solid #999">Ürün</th><th style="padding:6px 8px;text-align:right;font-size:10px;color:#111;text-transform:uppercase;font-weight:800;border-bottom:2px solid #999">Gram/Adet</th><th style="padding:6px 8px;text-align:right;font-size:10px;color:#111;text-transform:uppercase;font-weight:800;border-bottom:2px solid #999">Tutar</th></tr></thead>'
      +'<tbody>'+detaySatirlar+'</tbody></table>'
      +'<div style="background:#f8f8f6;padding:6px 14px;border-top:1px solid #eee;font-size:11px;display:flex;justify-content:flex-end;gap:16px">'
      +kalanStr+(i.not?'<span style="color:#333;font-weight:700;font-style:italic">📝 '+i.not+'</span>':'')
      +'</div></div>';
  }).join('');

  var w = window.open('','_blank');
  w.document.write('<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">'
    +'<title>Günlük Rapor — '+bugun+'</title>'
    +'<style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:\'Segoe UI\',Arial,sans-serif;background:#fff;color:#111;padding:20px;font-size:14px;font-weight:600;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
    +'@media print{html,body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;padding:8px!important}@page{margin:8mm;size:A4}button{display:none!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}th,td,div,span{color:#000!important}body{font-size:12px!important;font-weight:600!important}}'
    +'</style></head><body>'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:12px;border-bottom:3px solid #1a1714">'
    +'<div><div style="font-size:22px;font-weight:800">💎 KUYUMCU GÜNLÜK RAPOR</div>'
    +'<div style="font-size:13px;color:#222;font-weight:700;margin-top:4px">📅 '+bugun+' · '+gunIslemler.length+' işlem</div></div>'
    +'<button onclick="window.print()" style="padding:10px 20px;background:#1a1714;color:#e8b84b;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">🖨️ PDF Kaydet / Yazdır</button>'
    +'</div>'
    +rows
    +'<div style="margin-top:20px;padding:16px;background:#ede8de;border-radius:8px;border:2px solid #b8a878">'
    +'<div style="font-size:14px;font-weight:800;margin-bottom:10px">📈 GÜNLÜK ÖZET</div>'
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">'
    +'<div style="background:#fff;padding:10px;border-radius:6px;border:1.5px solid #b8a878"><div style="font-size:10px;font-weight:800;color:#222;text-transform:uppercase;font-weight:700">İşlem Sayısı</div><div style="font-size:18px;font-weight:800">'+gunIslemler.length+'</div></div>'
    +(satisTop>0?'<div style="background:#fff;padding:10px;border-radius:6px;border:1.5px solid #b8a878"><div style="font-size:10px;font-weight:800;color:#222;text-transform:uppercase;font-weight:700">Toplam Satış</div><div style="font-size:18px;font-weight:800;color:#1b3f7a">'+fmt(satisTop)+'</div></div>':'')
    +(alisTop>0?'<div style="background:#fff;padding:10px;border-radius:6px;border:1.5px solid #b8a878"><div style="font-size:10px;font-weight:800;color:#222;text-transform:uppercase;font-weight:700">Toplam Alış</div><div style="font-size:18px;font-weight:800;color:#14532d">'+fmt(alisTop)+'</div></div>':'')
    +(nakitTop>0?'<div style="background:#fff;padding:10px;border-radius:6px;border:1.5px solid #b8a878"><div style="font-size:10px;font-weight:800;color:#222;text-transform:uppercase;font-weight:700">Nakit Tahsilat</div><div style="font-size:18px;font-weight:800">'+fmt(nakitTop)+'</div></div>':'')
    +(havaleTop>0?'<div style="background:#fff;padding:10px;border-radius:6px;border:1.5px solid #b8a878"><div style="font-size:10px;font-weight:800;color:#222;text-transform:uppercase;font-weight:700">Havale Tahsilat</div><div style="font-size:18px;font-weight:800">'+fmt(havaleTop)+'</div></div>':'')
    +(kalanTop>0?'<div style="background:#f5d0d0;padding:10px;border-radius:6px;border:2px solid #c08080"><div style="font-size:10px;font-weight:800;color:#222;text-transform:uppercase">Bekleyen Kalan</div><div style="font-size:18px;font-weight:800;color:#7c1d1d">'+fmt(kalanTop)+'</div></div>':'')
    +'<div style="background:#fff;padding:10px;border-radius:6px;border:1.5px solid #b8a878"><div style="font-size:10px;font-weight:800;color:#222;text-transform:uppercase;font-weight:700">Nakit Kasa</div><div style="font-size:18px;font-weight:800;color:'+(nakitBakiye>=0?'#14532d':'#7c1d1d')+'">'+fmt(nakitBakiye)+'</div></div>'
    +'</div></div>'
    +'</body></html>');
  w.document.close();
}

function islemIslendi(id, val){
  var i = islemler.find(function(x){return x.id===id;});
  if(!i) return;
  i.islendi = val;
  save();
  renderIslemler();
  if(val) toast('✓ İşlem işlendi olarak işaretlendi');
}

/* ════ İŞLEM DÜZENLE ════ */
var _idIslemId = null;

function islemDuzenle(id){
  var i = islemler.find(function(x){return x.id===id;});
  if(!i) return;
  _idIslemId = id;

  document.getElementById('id-musteri-lbl').textContent = i.tarih + ' · ' + i.saat + ' · #'+String(i.id).slice(-6);
  document.getElementById('id-musteri').value = i.musteri||'';
  document.getElementById('id-urun').value = i.urun||'';
  document.getElementById('id-gram').value = i.gram>0 ? (i.gram+'').replace('.',',') : '';
  document.getElementById('id-tutar').value = i.tutar||'';
  document.getElementById('id-alis-tutar').value = i.alisTutar||'';
  document.getElementById('id-nakit').value = i.nakit||'';
  document.getElementById('id-havale').value = i.havale||'';
  document.getElementById('id-odeme-detay').value = i.odemeDetay||'';
  document.getElementById('id-not').value = i.not||'';

  // Durum select
  var sel = document.getElementById('id-durum');
  sel.innerHTML = durumlar.map(function(d){ return '<option value="'+d+'"'+(d===i.durum?' selected':'')+'>'+d+'</option>'; }).join('');

  idKalanGuncelle();
  document.getElementById('islem-duzenle-modal').classList.add('open');
}

function idKalanGuncelle(){
  var tutar    = parseFloat(document.getElementById('id-tutar').value)||0;
  var alis     = parseFloat(document.getElementById('id-alis-tutar').value)||0;
  var nakit    = parseFloat(document.getElementById('id-nakit').value)||0;
  var havale   = parseFloat(document.getElementById('id-havale').value)||0;
  var odeme    = nakit + havale;
  var net      = tutar - alis;

  // YÖN MANTIĞI:
  // net < 0 → Alış > Satış → sen müşteriye ödüyorsun → ödeme borcunu AZALTIR
  // net >= 0 → Satış > Alış → müşteri sana ödüyor → ödeme alacağını AZALTIR
  var kalan = net < 0 ? net + odeme : net - odeme;

  var lbl = document.getElementById('id-kalan-lbl');
  var box = document.getElementById('id-kalan-box');
  var tipLbl = box && box.querySelector('[id^="id-kalan"]') ? null : box;

  // Etiket güncelle
  var tipEl = document.querySelector('#islem-duzenle-modal .kalan-tip-lbl');

  if(kalan > 0){
    lbl.textContent = fmt(kalan)+' KALAN'; lbl.style.color='var(--red)';
    box.style.borderColor='var(--red)'; box.style.background='var(--red-light)';
  } else if(kalan < 0){
    lbl.textContent = '⬆️ Üst: '+fmt(Math.abs(kalan)); lbl.style.color='var(--blue)';
    box.style.borderColor='var(--blue)'; box.style.background='var(--blue-light)';
  } else {
    lbl.textContent = '✓ TAM ÖDENDİ'; lbl.style.color='var(--green)';
    box.style.borderColor='var(--green)'; box.style.background='var(--green-light)';
  }

  // Nakit/Havale alanlarının etiketini bağlama göre güncelle
  var nakitLbl = document.getElementById('id-nakit-lbl');
  var havaleLbl = document.getElementById('id-havale-lbl');
  if(nakitLbl && havaleLbl){
    if(net < 0){
      nakitLbl.textContent = '🪙 Nakit Ödedim (müşteriye)';
      havaleLbl.textContent = '🏦 Havale Gönderdim (müşteriye)';
    } else {
      nakitLbl.textContent = '🪙 Nakit Aldım (müşteriden)';
      havaleLbl.textContent = '🏦 Havale Aldım (müşteriden)';
    }
  }
}

function idNetKalan(tutar, alis, nakit, havale){
  var net = tutar - alis;
  return net < 0 ? net + (nakit+havale) : net - (nakit+havale);
}

function islemDuzenleKaydet(){
  var i = islemler.find(function(x){return x.id===_idIslemId;});
  if(!i) return;

  var tutar  = parseFloat(document.getElementById('id-tutar').value)||0;
  var alis   = parseFloat(document.getElementById('id-alis-tutar').value)||0;
  var nakit  = parseFloat(document.getElementById('id-nakit').value)||0;
  var havale = parseFloat(document.getElementById('id-havale').value)||0;
  var kalan  = idNetKalan(tutar, alis, nakit, havale);

  i.musteri     = document.getElementById('id-musteri').value.trim()||i.musteri;
  i.durum       = document.getElementById('id-durum').value;
  i.urun        = document.getElementById('id-urun').value.trim();
  i.gram        = parseTR(document.getElementById('id-gram').value)||0;
  i.tutar       = tutar;
  i.alisTutar   = alis;
  i.nakit       = nakit;
  i.havale      = havale;
  i.odemeDetay  = document.getElementById('id-odeme-detay').value.trim();
  i.odenen      = nakit + havale;
  i.kalan_tl    = kalan;
  i.kalan_gram  = kalan>0 ? kalan/gf() : 0;
  i.not         = document.getElementById('id-not').value.trim();

  var odemeArr = [];
  if(nakit>0) odemeArr.push('NAKİT');
  if(havale>0) odemeArr.push('HAVALE/EFT');
  i.odeme = odemeArr.join(' + ');

  save();
  renderIslemler();
  renderMusteri();
  document.getElementById('islem-duzenle-modal').classList.remove('open');
  toast('✓ İşlem güncellendi: ' + i.musteri);
}

/* ════ ÖDEME EKLE — ÇOKLU SATIR (SONRADAN) ════ */
var _oeIslemId = null;
var _oeTip = 'NAKİT';
var _oeSatirlar = []; // geçici satır listesi

function odemeEkleAc(id){
  var i = islemler.find(function(x){return x.id===id;});
  if(!i || !(i.kalan_tl>0)) return;
  _oeIslemId = id;
  _oeTip = 'NAKİT';
  _oeSatirlar = [];
  _oeModUst = false;
  oeModalAyarla(false, i.kalan_tl, i.musteri+' · '+i.tarih);
  document.getElementById('odeme-ekle-modal').classList.add('open');
  setTimeout(function(){document.getElementById('oe-tutar').focus();},200);
}

function oeModalAyarla(isUst, tutar, musteriLbl){
  document.getElementById('oe-musteri-lbl').textContent = musteriLbl||'';
  document.getElementById('oe-baslik').textContent = isUst ? '⬆️ Üst Ödemesi' : '💳 Ödeme Ekle';
  document.getElementById('oe-icon').textContent = isUst ? '⬆️' : '💳';
  var box = document.getElementById('oe-kalan-box');
  var tip = document.getElementById('oe-kalan-tip');
  var lbl = document.getElementById('oe-kalan-lbl');
  var kalan2 = document.getElementById('oe-kalan-kalan');
  if(isUst){
    box.style.cssText='background:var(--blue-light);border:1.5px solid var(--blue);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center';
    tip.textContent='Müşteriye Verilecek Üst'; tip.style.color='var(--blue)';
    lbl.style.color='var(--blue)';
  } else {
    box.style.cssText='background:var(--red-light);border:1.5px solid var(--red);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center';
    tip.textContent='Kalan Borç'; tip.style.color='var(--red)';
    lbl.style.color='var(--red)';
  }
  lbl.textContent = fmt(tutar);
  if(kalan2) kalan2.textContent='';
  document.getElementById('oe-tutar').value='';
  document.getElementById('oe-banka').value='';
  document.getElementById('oe-uyari').style.display='none';
  var kaydetBtn = document.getElementById('oe-kaydet-btn');
  kaydetBtn.textContent = isUst ? '⬆️ Üstü Ver' : '💳 Kaydet';
  kaydetBtn.onclick = isUst ? function(){ustModalKaydet();} : function(){odemeEkleKaydet();};
  oeTipSec('NAKİT');
  oeRenderSatirlar();
  oeToplam();
}

function odemeEkleKapat(){
  document.getElementById('odeme-ekle-modal').classList.remove('open');
  _oeIslemId = null;
  _oeSatirlar = [];
}

function oeTipSec(tip){
  _oeTip = tip;
  document.getElementById('oe-tip-nakit').classList.toggle('active', tip==='NAKİT');
  document.getElementById('oe-tip-havale').classList.toggle('active', tip==='HAVALE');
  document.getElementById('oe-banka-wrap').style.display = tip==='HAVALE' ? 'block' : 'none';
  if(tip==='HAVALE') setTimeout(function(){document.getElementById('oe-banka').focus();},100);
}

function oeKalanYaz(){
  var i = islemler.find(function(x){return x.id===_oeIslemId;});
  if(!i) return;
  var girilenTop = _oeSatirlar.reduce(function(a,s){return a+s.tutar;},0);
  var kalan = Math.abs(i.kalan_tl) - girilenTop;
  if(kalan>0) document.getElementById('oe-tutar').value = kalan.toFixed(2);
  oeKontrol();
}

function oeKontrol(){
  var i = islemler.find(function(x){return x.id===_oeIslemId;});
  if(!i) return;
  var yeniTutar = parseFloat(document.getElementById('oe-tutar').value)||0;
  var girilenTop = _oeSatirlar.reduce(function(a,s){return a+s.tutar;},0);
  var toplam = girilenTop + yeniTutar;
  document.getElementById('oe-uyari').style.display = toplam > Math.abs(i.kalan_tl) ? 'block' : 'none';
}

function oeSatirEkle(){
  var tutar = parseFloat(document.getElementById('oe-tutar').value)||0;
  if(tutar<=0){ toast('⚠️ Tutar girin'); document.getElementById('oe-tutar').focus(); return; }
  var banka = document.getElementById('oe-banka').value.trim();
  _oeSatirlar.push({ tip:_oeTip, tutar:tutar, banka: _oeTip==='HAVALE'?(banka||'Havale'):'' });
  document.getElementById('oe-tutar').value='';
  document.getElementById('oe-banka').value='';
  oeTipSec('NAKİT');
  oeRenderSatirlar();
  oeToplam();
  document.getElementById('oe-tutar').focus();
}

function oeSatirSil(idx){
  _oeSatirlar.splice(idx,1);
  oeRenderSatirlar();
  oeToplam();
}

function oeRenderSatirlar(){
  var el = document.getElementById('oe-satirlar');
  if(!_oeSatirlar.length){ el.innerHTML=''; return; }
  el.innerHTML = _oeSatirlar.map(function(s,idx){
    var bg = s.tip==='NAKİT' ? 'var(--orange-light)' : 'var(--purple-light)';
    var col = s.tip==='NAKİT' ? 'var(--orange)' : 'var(--purple)';
    var ikon = s.tip==='NAKİT' ? '🪙' : '🏦';
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:'+bg+';border-radius:var(--radius-sm);margin-bottom:6px">'
      +'<span style="font-size:14px">'+ikon+'</span>'
      +'<div style="flex:1"><div style="font-size:12px;font-weight:700;color:'+col+'">'+s.tip+(s.banka?' · '+s.banka:'')+'</div></div>'
      +'<div style="font-family:JetBrains Mono,monospace;font-weight:700;font-size:14px;color:'+col+'">'+fmt(s.tutar)+'</div>'
      +'<button onclick="oeSatirSil('+idx+')" style="width:24px;height:24px;border:1px solid '+col+';background:transparent;border-radius:4px;cursor:pointer;color:'+col+';font-size:13px;display:flex;align-items:center;justify-content:center">✕</button>'
      +'</div>';
  }).join('');
}

function oeToplam(){
  var top = _oeSatirlar.reduce(function(a,s){return a+s.tutar;},0);
  var el = document.getElementById('oe-toplam-lbl');
  if(el) el.textContent = _oeSatirlar.length>0 ? 'Toplam: '+fmt(top) : '';
  var i = islemler.find(function(x){return x.id===_oeIslemId;});
  if(i){
    var kalan2 = document.getElementById('oe-kalan-kalan');
    if(kalan2){
      var kalan = Math.abs(i.kalan_tl) - top;
      kalan2.textContent = kalan>0 ? 'Kalan: '+fmt(kalan) : kalan===0 ? '✓ Tam ödenecek' : '';
      kalan2.style.color = kalan>0?'var(--text2)':'var(--green)';
    }
  }
}

var _oeModUst = false;

function odemeEkleKaydet(){
  // Önce bekleyen tutar varsa otomatik ekle
  var bekleyenTutar = parseFloat(document.getElementById('oe-tutar').value)||0;
  if(bekleyenTutar>0) oeSatirEkle();

  if(!_oeSatirlar.length){ toast('⚠️ En az bir ödeme satırı ekleyin'); return; }
  var i = islemler.find(function(x){return x.id===_oeIslemId;});
  if(!i) return;

  var now = new Date();
  var saat = now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  if(!i.satirlar) i.satirlar=[];

  var isCikisSon = isCikisDurum(i.durum||'');

  _oeSatirlar.forEach(function(s){
    i.satirlar.push({ tip:s.tip, urun:s.banka||'', tutar:s.tutar, gram:0, adet:0, tarih:now.toLocaleDateString('tr-TR'), saat:saat });

    // Banka hareketi
    if(s.tip==='HAVALE'){
      bankaHareketleri.unshift({ id:Date.now()+Math.random(), tarih:now.toLocaleDateString('tr-TR'), saat:saat, kimden:i.musteri, banka:s.banka||'', aciklama:'Sonradan ödeme · '+(i.urun||''), tutar:s.tutar, yon:isCikisSon?'cikis':'giris', onay:false, islemId:i.id });
      updateBhBadge();
    }
    if(s.tip==='NAKİT'){
      var hNakit={id:Date.now()+Math.random(), tarih:now.toLocaleDateString('tr-TR'), saat:saat, tip:isCikisSon?'cikis':'giris', tutar:s.tutar, aciklama:'Sonradan ödeme: '+i.musteri};
      nakitHareketler.unshift(hNakit);
      if(isCikisSon) nakitBakiye-=s.tutar; else nakitBakiye+=s.tutar;
    }
  });
  saveNakit(); updateNakitLbl();

  // Toplamları yeniden hesapla
  var nakit  = i.satirlar.filter(function(s){return s.tip==='NAKİT';}).reduce(function(a,s){return a+s.tutar;},0);
  var havale = i.satirlar.filter(function(s){return s.tip==='HAVALE';}).reduce(function(a,s){return a+s.tutar;},0);
  var satisTop = i.satirlar.filter(function(s){return s.tip==='SATIŞ';}).reduce(function(a,s){return a+s.tutar;},0)||i.tutar||0;
  var alisTop  = i.satirlar.filter(function(s){return s.tip==='ALIŞ';}).reduce(function(a,s){return a+s.tutar;},0)||(i.alisTutar||0);
  var odemeTop = nakit+havale;
  var yeniKalan = satisTop - alisTop - odemeTop;

  i.nakit=nakit; i.havale=havale; i.odenen=odemeTop;
  i.kalan_tl=yeniKalan; i.kalan_gram=yeniKalan>0?yeniKalan/gf():0;
  var odemeArr=[]; if(nakit>0)odemeArr.push('NAKİT'); if(havale>0)odemeArr.push('HAVALE/EFT');
  i.odeme=odemeArr.join(' + ');
  i.odemeDetay=[...new Set(i.satirlar.filter(function(s){return s.tip==='HAVALE'&&s.urun;}).map(function(s){return s.urun;}))].join(', ');

  save(); renderIslemler(); renderMusteri();
  odemeEkleKapat();

  var mesaj = yeniKalan<=0 ? '✅ '+i.musteri+' tam ödedi!' : '💳 Ödeme eklendi. Kalan: '+fmt(yeniKalan);
  toast(mesaj);

  // Kendine WP
  var kendiTel = getKendiTel();
  if(kendiTel){
    var wpLines = _oeSatirlar.map(function(s){ return '  '+(s.tip==='NAKİT'?'🪙':'🏦')+' '+s.tip+(s.banka?' ('+s.banka+')':'')+': '+fmt(s.tutar); }).join('\n');
    var wpMsg='💳 *ÖDEME EKLENDİ*\n━━━━━━━━━━━━━━\n👤 '+i.musteri+'\n'+wpLines+'\n'+(yeniKalan>0?'⚠️ Kalan: *'+fmt(yeniKalan)+'*':'✅ *TAM ÖDENDİ*')+'\n📅 '+now.toLocaleDateString('tr-TR')+' '+saat;
    setTimeout(function(){window.open('https://wa.me/'+kendiTel+'?text='+encodeURIComponent(wpMsg),'_blank');},400);
  }
}

// SİPARİŞLER
const STEPS=[{k:'alindi',l:'Alındı'},{k:'atolyede',l:'Atölyede'},{k:'geldi',l:'Geldi'},{k:'teslim',l:'Teslim'}];

function renderSiparisler(){
  const counts={alindi:0,atolyede:0,geldi:0,teslim:0};
  siparisler.forEach(s=>counts[s.sipStatus]=(counts[s.sipStatus]||0)+1);
  document.getElementById('s-top').textContent=siparisler.length;
  document.getElementById('s-alindi').textContent=counts.alindi||0;
  document.getElementById('s-atolye').textContent=counts.atolyede||0;
  document.getElementById('s-teslim').textContent=counts.teslim||0;

  var filtre = typeof sipFiltre!=='undefined' ? sipFiltre : 'tumu';
  var liste = siparisler.filter(function(s){
    if(filtre==='bilezik') return s.sipTip==='bilezik'||(s.bilezikTuru&&!s.sipTip);
    if(filtre==='diger') return s.sipTip==='diger'||(!s.bilezikTuru&&!s.sipTip);
    return true;
  });

  const el=document.getElementById('siparis-list');
  if(!liste.length){el.innerHTML='<div class="empty"><div class="empty-icon">'+(filtre==='bilezik'?'💍':filtre==='diger'?'📦':'📋')+'</div>Bu kategoride sipariş yok</div>';return;}

  el.innerHTML=liste.map(s=>{
    const isBilezik = s.sipTip==='bilezik'||(s.bilezikTuru&&!s.sipTip);
    const si=STEPS.findIndex(x=>x.k===s.sipStatus);
    const stepsHtml=STEPS.map((st,i)=>{
      const cls=i<si?'done':i===si?'cur':'';
      return`<div class="step ${cls}"><div class="step-dot">${i<si?'✓':i+1}</div><div class="step-lbl">${st.l}</div></div>`;
    }).join('');

    const fotoHtml=(s.fotolar&&s.fotolar.length)
      ?s.fotolar.map(f=>`<img src="${f}" onclick="openFotoModal('${f}')" title="Büyüt">`).join(''):'';

    // Durum badge
    const statusColors={alindi:'var(--gold)',atolyede:'var(--blue)',geldi:'var(--green)',teslim:'var(--text3)'};
    const statusLabels={alindi:'Alındı',atolyede:'Atölyede',geldi:'Geldi',teslim:'Teslim'};
    const scol=statusColors[s.sipStatus]||'var(--text3)';

    let actions='';
    if(s.sipStatus==='alindi'){
      actions=`
        <button class="wp-btn" onclick="atolyeSecAc(${s.id})">${WS} Atölyeye Gönder</button>
        <button class="wp-btn" style="background:#1a9e4e" onclick="wpSipAlindi2(siparisler.find(x=>x.id===${s.id}))">${WS} Müşteriye: Alındı</button>
        <button class="btn" style="font-size:12px;padding:6px 13px;margin-left:auto" onclick="advSip(${s.id})">→ Atölyeye Geçir</button>`;
    } else if(s.sipStatus==='atolyede'){
      actions=`
        <span style="font-size:12px;color:var(--blue);font-weight:600">🏭 Atölyede bekleniyor</span>
        <button class="btn" style="font-size:12px;padding:6px 13px;margin-left:auto" onclick="advSip(${s.id})">✓ Geldi</button>`;
    } else if(s.sipStatus==='geldi'){
      actions=`
        <button class="wp-btn" style="background:#1a5c2a" onclick="wpSipGeldi2(siparisler.find(x=>x.id===${s.id}))">${WS} Müşteriye: Geldi! 🎉</button>
        <button class="btn btn-g" style="font-size:12px;padding:6px 13px" onclick="advSip(${s.id})">✓ Teslim Et</button>`;
    } else if(s.sipStatus==='teslim'){
      actions=`
        <span style="font-size:12px;color:var(--green);font-weight:600">✅ Teslim Edildi</span>
        <button class="wp-btn" style="margin-left:auto;background:#1a5c2a" onclick="wpSipTeslim2(siparisler.find(x=>x.id===${s.id}))">${WS} Müşteriye: Teslim</button>`;
    }

    const tipIcon=isBilezik?'💍':'📦';
    const altBilgi=isBilezik
      ?[s.bilezikTuru,s.adet>1?s.adet+' adet':'',s.gram>0?fmtG(s.gram):'',s.olcu?s.olcu+'cm':''].filter(Boolean).join(' · ')
      :[s.urun,s.gram>0?fmtG(s.gram):'',s.olcu||''].filter(Boolean).join(' · ');

    return`<div class="sip-card" style="border-left:4px solid ${scol}">
      <div class="sip-head">
        <div style="width:36px;height:36px;border-radius:50%;background:${isBilezik?'var(--gold-light)':'var(--blue-light)'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${tipIcon}</div>
        <div style="flex:1">
          <div class="sip-no">SİP-${String(s.id).slice(-6)} · ${s.tarih} ${s.saat}</div>
          <div class="sip-name">${s.musteri} ${s.musteriTel?'<span style="font-size:11px;color:var(--text3);font-weight:400">· '+s.musteriTel+'</span>':''}</div>
          <div class="sip-sub" style="color:${isBilezik?'var(--gold-dark)':'var(--blue)'}">${altBilgi||'—'}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-items:flex-start">
          <span style="font-size:10px;font-weight:700;color:${scol};background:${scol}1a;padding:3px 8px;border-radius:12px;border:1px solid ${scol}40">${statusLabels[s.sipStatus]||''}</span>
          <button class="icon-btn" title="Sil" onclick="delSiparis(${s.id})">✕</button>
        </div>
      </div>
      <div class="sip-body">
        <div class="steps">${stepsHtml}</div>
        <div class="sip-info">
          ${s.tutar>0?`<span>Tutar: <b>${fmt(s.tutar)}</b></span>`:''}
          ${s.kalan_tl>0?`<span style="color:var(--red)">Kalan: <b>${fmt(s.kalan_tl)}</b></span>`:''}
        </div>
        ${(s.sipNot||s.not)?`<div class="sip-not">📝 ${s.sipNot||s.not}</div>`:''}
      </div>
      ${fotoHtml?`<div class="sip-fotos">${fotoHtml}</div>`:''}
      <div class="sip-actions">${actions}</div>
    </div>`;
  }).join('');
}

function advSip(id){
  const s=siparisler.find(x=>x.id===id);if(!s)return;
  const ks=['alindi','atolyede','geldi','teslim'];
  const i=ks.indexOf(s.sipStatus);
  if(i<ks.length-1){s.sipStatus=ks[i+1];save();renderSiparisler();updateSipBadge();}
}

function openFisSip(id){const s=siparisler.find(x=>x.id===id);if(s){currentFis=s;openFis(s);}}
function delSiparis(id){if(!confirm('Siparişi silmek istiyor musunuz?'))return;siparisler=siparisler.filter(x=>x.id!==id);save();renderSiparisler();updateSipBadge();}

function updateSipBadge(){
  const n=siparisler.filter(s=>s.sipStatus!=='teslim').length;
  const e=document.getElementById('sip-cnt');
  e.style.display=n>0?'inline':'none';e.textContent=n;
}

// WP MESAJLARI
function sipInfo(s){
  let m='';
  m+='Müşteri : '+s.musteri+'\n';
  if(s.bilezikTuru)m+='Tür : '+s.bilezikTuru+'\n';
  if(s.adet>1)m+='Adet : '+s.adet+'\n';
  if(s.gram>0)m+='Gram : '+fmtG(s.gram)+'\n';
  if(s.olcu)m+='Ölçü : '+s.olcu+'\n';
  const n=s.sipNot||s.not;if(n)m+='Not : '+n+'\n';
  return m;
}

function wpAtelye(id){
  const s=siparisler.find(x=>x.id===id);if(!s)return;
  wpOpen('SİPARİŞ\n━━━━━━━━━━━\n'+sipInfo(s)+'━━━━━━━━━━━\n'+s.tarih+' '+s.saat);
}
function wpAlindi(id){
  const s=siparisler.find(x=>x.id===id);if(!s)return;
  let m='Sayın '+s.musteri+',\n\n';
  m+='Siparişiniz alınmıştır.\n';
  if(s.bilezikTuru)m+=s.bilezikTuru;
  if(s.olcu)m+=' - '+s.olcu;
  m+='\n\nHazır olduğunda bilgilendireceğiz.\nTeşekkür ederiz.';
  wpOpen(m);
}
function wpGeldi(id){
  const s=siparisler.find(x=>x.id===id);if(!s)return;
  let m='Sayın '+s.musteri+',\n\n';
  m+='Siparişiniz gelmiştir, teslimata hazırdır.\n';
  if(s.bilezikTuru)m+=s.bilezikTuru;
  if(s.olcu)m+=' - '+s.olcu;
  m+='\n\nBekleriz. Teşekkür ederiz.';
  wpOpen(m);
}
function wpTeslim(id){
  const s=siparisler.find(x=>x.id===id);if(!s)return;
  let m='Sayın '+s.musteri+',\n\n';
  m+='Siparişiniz teslim edilmiştir. İyi günler dileriz.\n';
  if(s.bilezikTuru)m+=s.bilezikTuru;
  m+='\n\nTeşekkür ederiz.';
  wpOpen(m);
}

// FİŞ
function openFis(islem){
  currentFis=islem;
  const canvas=buildFis(islem);
  canvas.style.maxWidth='100%';
  const prev=document.getElementById('fis-preview');
  prev.innerHTML='';prev.appendChild(canvas);
  document.getElementById('fis-modal').classList.add('open');
}
function closeFis(){document.getElementById('fis-modal').classList.remove('open');}

function buildFis(d){
  const W=360,SC=2,PAD=22,MF="'Courier New',Courier,monospace";

  // ── Satırları topla ──────────────────────────────
  const satirlar = d.satirlar||[];
  const satisRows  = satirlar.filter(s=>s.tip==='SATIŞ');
  const alisRows   = satirlar.filter(s=>s.tip==='ALIŞ');
  const nakitRows  = satirlar.filter(s=>s.tip==='NAKİT');
  const havaleRows = satirlar.filter(s=>s.tip==='HAVALE');

  // ── Render listesi ───────────────────────────────
  // Her eleman: { tür, veri }
  const rows=[];
  const R=(t,...v)=>rows.push([t,...v]);

  R('hdr','KUYUMCU FİŞİ');
  R('sub',d.tarih+'   '+d.saat);
  R('sub','Fiş: #'+String(d.id).slice(-8));
  R('div');
  R('row','MÜŞTERİ',d.musteri);
  R('row','DURUM',d.durum);
  if(d.bilezikTuru) R('row','TÜR',d.bilezikTuru);
  if(d.olcu)        R('row','ÖLÇÜ',d.olcu);
  if(d.not||d.sipNot) R('row','NOT',d.sipNot||d.not);

  // ── SATIŞ satırları ─────────────────────────────
  if(satisRows.length){
    R('div');
    R('sechdr','💰 SATIŞ');
    satisRows.forEach((s,i)=>{
      R('urun', s.urun||(i===0?'—':''), s.gram>0?fmtG(s.gram):(s.adet>1?s.adet+'×':''), s.tutar>0?fmt(s.tutar):'');
    });
    const satisTop=satisRows.reduce((a,s)=>a+s.tutar,0);
    if(satisRows.length>1) R('subtop','Satış Toplam',fmt(satisTop));
  }

  // ── ALIŞ satırları ──────────────────────────────
  if(alisRows.length){
    R('div');
    R('sechdr','📥 ALIŞ');
    alisRows.forEach((s,i)=>{
      R('urun', s.urun||(i===0?'—':''), s.gram>0?fmtG(s.gram):(s.adet>1?s.adet+'×':''), s.tutar>0?fmt(s.tutar):'');
    });
    const alisTop=alisRows.reduce((a,s)=>a+s.tutar,0);
    if(alisRows.length>1) R('subtop','Alış Toplam',fmt(alisTop));
  }

  // Eğer satirlar boşsa eski alanlardan göster
  if(!satisRows.length && !alisRows.length){
    R('div');
    if(d.urun)   R('row','ÜRÜN',d.urun);
    if(d.gram>0) R('row','GRAM',fmtG(d.gram));
    if(d.tutar>0)R('row','TUTAR',fmt(d.tutar));
    if(d.alisVar){
      if(d.alisUrun) R('row','ALIŞ ÜRÜN',d.alisUrun);
      if(d.alisGram>0)R('row','ALIŞ GRAM',fmtG(d.alisGram));
      if(d.alisTutar>0)R('row','ALIŞ TUTAR',fmt(d.alisTutar));
    }
  }

  // ── ÖDEME satırları ─────────────────────────────
  const toplamOdeme = [...nakitRows,...havaleRows].reduce((a,s)=>a+s.tutar,0);
  if(nakitRows.length||havaleRows.length){
    R('div');
    R('sechdr','💳 ÖDEME');
    nakitRows.forEach(s=>{
      R('odeme','🪙 Nakit',fmt(s.tutar));
    });
    havaleRows.forEach(s=>{
      R('odeme','🏦 '+(s.urun||'Havale/EFT'),fmt(s.tutar));
    });
    if(nakitRows.length+havaleRows.length>1)
      R('subtop','Ödenen',fmt(toplamOdeme));
  } else if(d.odenen>0){
    R('div');
    R('sechdr','💳 ÖDEME');
    if(d.nakit>0)  R('odeme','🪙 Nakit',fmt(d.nakit));
    if(d.havale>0) R('odeme','🏦 '+(d.odemeDetay||'Havale'),fmt(d.havale));
  }

  // ── KALAN / ÜST ─────────────────────────────────
  R('div');
  if(d.kalan_tl>0){
    R('kalan','⚠️ KALAN',fmt(d.kalan_tl),'red');
  } else if(d.kalan_tl<0){
    R('kalan','⬆️ ÜST VERİLECEK',fmt(Math.abs(d.kalan_tl)),'blue');
  } else {
    R('kalan','✓ TAM ÖDENDİ','','green');
  }
  R('div');
  R('center','9px','#aaa','Teşekkür Ederiz');

  // ── Yükseklik hesapla ────────────────────────────
  const ROW=22,DIV=12,SECHDR=20,URUN=20,SUBTOP=18;
  let H=18;
  rows.forEach(r=>{
    if(r[0]==='div')    H+=DIV;
    else if(r[0]==='hdr')   H+=26;
    else if(r[0]==='sub')   H+=16;
    else if(r[0]==='sechdr')H+=SECHDR;
    else if(r[0]==='urun')  H+=(r[2]||r[3]) ? 34 : 20;
    else if(r[0]==='subtop')H+=SUBTOP;
    else if(r[0]==='odeme') H+=ROW+2;
    else if(r[0]==='row')   H+=ROW;
    else if(r[0]==='kalan') H+=ROW+4;
    else if(r[0]==='center')H+=ROW;
  });
  H+=20;

  // ── Canvas çiz ──────────────────────────────────
  const c=document.createElement('canvas');
  c.width=W*SC;c.height=H*SC;c.style.width=W+'px';c.style.height=H+'px';
  const ctx=c.getContext('2d');ctx.scale(SC,SC);

  ctx.fillStyle='#fefcfa';ctx.fillRect(0,0,W,H);
  const g=ctx.createLinearGradient(0,0,W,0);
  g.addColorStop(0,'#c8961a');g.addColorStop(1,'#e6b84a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,6);
  ctx.strokeStyle='#e0d8cc';ctx.lineWidth=0.5;ctx.strokeRect(0.5,0.5,W-1,H-1);

  // Metin kırpma yardımcısı
  function clip(text,maxW){
    let t=String(text||'');
    while(ctx.measureText(t).width>maxW&&t.length>1)t=t.slice(0,-1)+'…';
    return t;
  }

  let y=14;
  rows.forEach(r=>{
    switch(r[0]){
      case 'hdr':
        ctx.font=`bold 14px ${MF}`;ctx.fillStyle='#1a1714';ctx.textAlign='center';
        ctx.fillText(r[1],W/2,y+14);y+=26;break;

      case 'sub':
        ctx.font=`9px ${MF}`;ctx.fillStyle='#999';ctx.textAlign='center';
        ctx.fillText(r[1],W/2,y+10);y+=16;break;

      case 'div':
        ctx.strokeStyle='#d8d0c4';ctx.lineWidth=0.5;ctx.setLineDash([4,3]);
        ctx.beginPath();ctx.moveTo(PAD,y+6);ctx.lineTo(W-PAD,y+6);ctx.stroke();
        ctx.setLineDash([]);y+=DIV;break;

      case 'sechdr':
        ctx.font=`bold 10px ${MF}`;ctx.fillStyle='#7a5c1e';ctx.textAlign='left';
        ctx.fillText(r[1],PAD,y+13);
        ctx.strokeStyle='#d0c0a0';ctx.lineWidth=0.5;ctx.setLineDash([]);
        ctx.beginPath();ctx.moveTo(PAD,y+16);ctx.lineTo(W-PAD,y+16);ctx.stroke();
        y+=SECHDR;break;

      case 'urun':{
        // Ürün adı tam satır, gram+tutar ikinci satırda
        const urunTxt=String(r[1]||'—'), ortaTxt=String(r[2]||''), tutarTxt=String(r[3]||'');
        const rowH = (ortaTxt||tutarTxt) ? 34 : 20;
        // Ürün adı
        ctx.font=`bold 11px ${MF}`;ctx.fillStyle='#1a1714';ctx.textAlign='left';
        ctx.fillText(clip('  '+urunTxt.toUpperCase(), W-PAD*2-8), PAD, y+13);
        // Gram + Tutar alt satır
        if(ortaTxt||tutarTxt){
          ctx.font=`10px ${MF}`;
          if(ortaTxt){ctx.fillStyle='#888';ctx.textAlign='left';ctx.fillText('  '+ortaTxt, PAD, y+26);}
          if(tutarTxt){ctx.fillStyle='#8b2121';ctx.font=`bold 11px ${MF}`;ctx.textAlign='right';ctx.fillText(tutarTxt, W-PAD, y+26);}
        }
        y+=rowH;break;
      }

      case 'subtop':
        ctx.font=`bold 9px ${MF}`;ctx.fillStyle='#666';ctx.textAlign='left';
        ctx.fillText(r[1]+':',PAD+8,y+13);
        ctx.textAlign='right';ctx.fillText(r[2],W-PAD,y+13);y+=SUBTOP;break;

      case 'odeme':
        // Ödeme satırı — yeşil vurgulu
        ctx.fillStyle='#f0fdf4';
        ctx.fillRect(PAD-4, y+2, W-PAD*2+8, ROW-2);
        ctx.strokeStyle='#bbf7d0';ctx.lineWidth=0.5;
        ctx.strokeRect(PAD-4, y+2, W-PAD*2+8, ROW-2);
        ctx.font=`bold 10px ${MF}`;ctx.fillStyle='#14532d';ctx.textAlign='left';
        ctx.fillText('  '+r[1],PAD,y+15);
        ctx.font=`bold 11px ${MF}`;ctx.fillStyle='#14532d';ctx.textAlign='right';
        ctx.fillText(r[2],W-PAD,y+15);y+=ROW+2;break;

      case 'row':
        ctx.font=`9px ${MF}`;ctx.fillStyle='#888';ctx.textAlign='left';
        ctx.fillText(r[1]+':',PAD,y+14);
        ctx.font=`10px ${MF}`;ctx.fillStyle='#1a1714';ctx.textAlign='right';
        ctx.fillText(clip(r[2],W-PAD*2-80),W-PAD,y+14);y+=ROW;break;

      case 'kalan':{
        const col=r[3]==='green'?'#14532d':r[3]==='blue'?'#1b3f7a':'#8b2121';
        ctx.font=`bold 11px ${MF}`;ctx.fillStyle=col;
        ctx.textAlign='left';ctx.fillText(r[1],PAD,y+15);
        if(r[2]){ctx.textAlign='right';ctx.fillText(r[2],W-PAD,y+15);}
        y+=ROW+4;break;
      }

      case 'center':
        ctx.font=`${r[1]} ${MF}`;ctx.fillStyle=r[2];ctx.textAlign='center';
        ctx.fillText(r[3],W/2,y+12);y+=ROW;break;
    }
  });

  ctx.fillStyle=g;ctx.fillRect(0,H-6,W,6);
  return c;
}

function downloadFisPng(){
  if(!currentFis)return;
  const c=buildFis(currentFis);
  const a=document.createElement('a');
  a.download='fis-'+currentFis.musteri.replace(/\s+/g,'-')+'-'+currentFis.tarih.replace(/\./g,'')+'.png';
  a.href=c.toDataURL('image/png');a.click();toast('📥 Fiş indirildi');
}

function wpFisSend(){
  if(!currentFis)return;
  const d=currentFis;
  const satirlar=d.satirlar||[];
  const satisRows =satirlar.filter(s=>s.tip==='SATIŞ');
  const alisRows  =satirlar.filter(s=>s.tip==='ALIŞ');
  const nakitRows =satirlar.filter(s=>s.tip==='NAKİT');
  const havaleRows=satirlar.filter(s=>s.tip==='HAVALE');

  let m='🧾 *KUYUMCU FİŞİ*\n';
  m+='━━━━━━━━━━━━━━━━━━━━\n';
  m+='👤 *'+d.musteri+'*\n';
  m+='📌 '+d.durum+'\n';
  m+='📅 '+d.tarih+'  🕐 '+d.saat+'\n';
  if(d.bilezikTuru) m+='💍 Tür: '+d.bilezikTuru+'\n';
  if(d.olcu) m+='📏 Ölçü: '+d.olcu+'\n';

  if(satisRows.length){
    m+='\n💰 *SATIŞ*\n';
    satisRows.forEach(s=>{
      m+='  • '+(s.urun||'—');
      if(s.gram>0) m+='  '+fmtG(s.gram);
      if(s.adet>1) m+='  '+s.adet+'×';
      if(s.tutar>0) m+='  →  *'+fmt(s.tutar)+'*';
      m+='\n';
    });
  }
  if(alisRows.length){
    m+='\n📥 *ALIŞ*\n';
    alisRows.forEach(s=>{
      m+='  • '+(s.urun||'—');
      if(s.gram>0) m+='  '+fmtG(s.gram);
      if(s.adet>1) m+='  '+s.adet+'×';
      if(s.tutar>0) m+='  →  *'+fmt(s.tutar)+'*';
      m+='\n';
    });
  }
  // Eski stil (satirlar boşsa)
  if(!satisRows.length && !alisRows.length){
    if(d.urun)    m+='\nÜRÜN: '+d.urun+'\n';
    if(d.gram>0)  m+='GRAM: '+fmtG(d.gram)+'\n';
    if(d.tutar>0) m+='TUTAR: '+fmt(d.tutar)+'\n';
    if(d.alisVar){
      m+='\n📥 ALIŞ:\n';
      if(d.alisUrun) m+='  Ürün: '+d.alisUrun+'\n';
      if(d.alisGram>0) m+='  Gram: '+fmtG(d.alisGram)+'\n';
      if(d.alisTutar>0) m+='  Tutar: '+fmt(d.alisTutar)+'\n';
    }
  }
  if(nakitRows.length||havaleRows.length){
    m+='\n💳 *ÖDEME*\n';
    nakitRows.forEach(s=>{ m+='  🪙 Nakit: '+fmt(s.tutar)+'\n'; });
    havaleRows.forEach(s=>{ m+='  🏦 '+(s.urun||'Havale')+': '+fmt(s.tutar)+'\n'; });
  } else if(d.odenen>0){
    m+='\n💳 *ÖDEME*\n';
    if(d.nakit>0)  m+='  🪙 Nakit: '+fmt(d.nakit)+'\n';
    if(d.havale>0) m+='  🏦 '+(d.odemeDetay||'Havale')+': '+fmt(d.havale)+'\n';
  }
  m+='\n━━━━━━━━━━━━━━━━━━━━\n';
  if(d.kalan_tl>0)       m+='⚠️ *KALAN: '+fmt(d.kalan_tl)+'*\n';
  else if(d.kalan_tl<0)  m+='⬆️ *ÜST VERİLECEK: '+fmt(Math.abs(d.kalan_tl))+'*\n';
  else                   m+='✅ *TAM ÖDENDİ*\n';
  const nt=d.sipNot||d.not;if(nt)m+='📝 NOT: '+nt+'\n';
  wpOpen(m);
}

function openFotoModal(src){document.getElementById('foto-modal-img').src=src;document.getElementById('foto-modal').classList.add('open');}
function closeFotoModal(){document.getElementById('foto-modal').classList.remove('open');}

function setUrun(el,val){
  document.getElementById('s-urun').value=val;
  document.querySelectorAll('.qbtn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
}

var _hizliUrun='', _hizliTip='adet', _hizliIslemTip='SATIŞ';
function setHizliTip(el, tip){
  _hizliIslemTip = tip;
  document.querySelectorAll('[id^="ht-"]').forEach(function(b){
    b.classList.remove('sp-s','sp-a','sp-n','sp-h');
  });
  var cls = {SATIŞ:'sp-s',ALIŞ:'sp-a',NAKİT:'sp-n',HAVALE:'sp-h'}[tip]||'sp-s';
  el.classList.add(cls);
}
function hizliEkleAc(el, urun, tip){
  // Show urun panel
  document.getElementById('satir-urun-panel').style.display = '';
  document.getElementById('satir-odeme-panel').style.display = 'none';
  // Highlight button
  document.querySelectorAll('.qbtn').forEach(function(b){b.classList.remove('sel');});
  el.classList.add('sel');
  // Fill ürün field
  document.getElementById('s-urun').value = urun;
  // Show/hide gram vs adet
  document.getElementById('s-gram-fg').style.display = tip==='gram' ? '' : 'none';
  document.getElementById('s-adet-fg').style.display = tip==='adet' ? '' : 'none';
  // Focus the right field
  setTimeout(function(){
    var f = tip==='gram' ? document.getElementById('s-gram') : document.getElementById('s-tutar');
    f.value = '';
    f.focus();
  }, 30);
}

function hizliGramToTutar(){
  var g = getGramVal('hizli-gram');
  if(g>0) document.getElementById('hizli-tutar').value = (g*gf()).toFixed(2);
}

function hizliEkleKaydet(){
  var gram  = getGramVal('hizli-gram');
  var tutar = parseFloat(document.getElementById('hizli-tutar').value)||0;
  if(tutar<=0){ toast('Tutar giriniz'); document.getElementById('hizli-tutar').focus(); return; }
  var adet  = (_hizliTip==='adet') ? 1 : 0;
  var tipMap2 = {'ALIŞ':'ALIŞ','EMANETE ALIŞ':'ALIŞ','BORÇ ALIŞI':'ALIŞ','EMANETE ALTIN ALDI':'ALIŞ','NAKİT TAHSİLAT':'ALIŞ','MAHSUP GELEN':'ALIŞ'};
  var rowTip = tipMap2[secDurum] || 'SATIŞ';
  satirlar.push({ tip: rowTip, urun: _hizliUrun, gram: gram, adet: adet, tutar: tutar });
  renderSatirlar();
  hizliEkleKapat();
  toast('Eklendi: ' + _hizliUrun);
}

function hizliEkleKapat(){
  document.getElementById('hizli-popup').style.display='none';
  document.querySelectorAll('.qbtn').forEach(b=>b.classList.remove('sel'));
}

function setUrunHizli(el,ad,tip,deger,satisTutar,alisTutar){
  document.getElementById('s-urun').value=ad;
  document.querySelectorAll('.qbtn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
  const tutar = secSatirTip==='ALIŞ' ? alisTutar : satisTutar;
  if(tip==='gram'){
    document.getElementById('s-gram').value=deger;
    if(tutar>0) document.getElementById('s-tutar').value=tutar.toFixed(2);
    else satirGramToTutar();
  } else {
    document.getElementById('s-gram').value='';
    if(tutar>0) document.getElementById('s-tutar').value=tutar.toFixed(2);
  }
}

function printFis(){
  if(!currentFis) return;
  const d = currentFis;
  const fmt2  = n => '₺'+parseFloat(n).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const fmtG2 = n => parseFloat(n).toLocaleString('tr-TR',{minimumFractionDigits:3,maximumFractionDigits:3})+'g';

  const row = (k,v) => `<div class="pr-row"><span class="pk">${k}:</span><span class="pv">${v}</span></div>`;

  let rows = '';
  rows += row('MÜŞTERİ', d.musteri);
  rows += row('DURUM', d.durum);
  if(d.bilezikTuru) rows += row('TÜR', d.bilezikTuru);
  if(d.adet > 1)    rows += row('ADET', d.adet);
  if(d.olcu)        rows += row('ÖLÇÜ', d.olcu);
  if(d.urun)        rows += row('ÜRÜN', d.urun);
  if(d.gram > 0)    rows += row('GRAM', fmtG2(d.gram));
  else if(d.adet>0) rows += row('ADET', d.adet+' adet');
  if(d.tutar > 0)   rows += row('TUTAR', fmt2(d.tutar));
  if(d.nakit>0)       rows += row('NAKİT', fmt2(d.nakit));
  if(d.havale>0)      rows += row('HAVALE', fmt2(d.havale)+(d.odemeDetay?' ('+d.odemeDetay+')':''));
  if(d.odenen>0)      rows += row('TOPLAM ÖDENEN', fmt2(d.odenen));
  const nt = d.sipNot||d.not;
  if(nt)            rows += row('NOT', nt);

  const kalanTxt = d.kalan_tl > 0 ? fmt2(d.kalan_tl) : 'YOK';

  const html = `<div id="print-area">
<div class="pr-title">FİŞ</div>
<div class="pr-sub">${d.tarih} ${d.saat} | #${String(d.id).slice(-6)}</div>
<div class="pr-body">${rows}</div>
<div class="pr-kalan"><span>KALAN</span><span>${kalanTxt}</span></div>
<div class="pr-foot">Teşekkür ederiz</div>
</div>`;

  document.getElementById('print-area').innerHTML = html;
  window.print();
}


/* ════ DURUM YÖNETİMİ ════ */
const DEFAULT_DURUMLAR = ['SATIŞ','ALIŞ','EMANETE ALIŞ','EMANETTEN SATIŞ','BORÇ SATIŞI','BORÇ ALIŞI','SİPARİŞ'];
let durumlar = [...DEFAULT_DURUMLAR];

// Çıkış durumları: para/gram DÜKKAN'DAN ÇIKIYOR (müşteriye ödüyorsun)
const DEFAULT_CIKIS = ['ALIŞ','EMANETE ALIŞ','BORÇ ALIŞI','EMANETTEKİ ALTINI SATTI','EMMANETTEKİ ALTINI SATTI','EMANETTE ALTIN SATTI','EMANETTEKİ ALTIN SATTI','EMANETE ALTIN ALDI','NAKİT TAHSİLAT','MAHSUP GELEN'];
let cikisDurumlar = [...DEFAULT_CIKIS];
// Eksik olanları otomatik ekle
DEFAULT_CIKIS.forEach(function(d){ if(!cikisDurumlar.some(function(x){return x.toUpperCase()===d.toUpperCase();})) cikisDurumlar.push(d); });
localStorage.setItem('ks_cd', JSON.stringify(cikisDurumlar));

function saveCikisDurumlar(){ localStorage.setItem('ks_cd', JSON.stringify(cikisDurumlar)); sbSet('ks_cd',cikisDurumlar); }
function isCikisDurum(durum){
  return cikisDurumlar.some(function(x){ return (durum||'').toUpperCase().includes(x.toUpperCase()); });
}
function toggleCikisDurum(durum){
  var idx = cikisDurumlar.findIndex(function(x){ return x.toUpperCase()===durum.toUpperCase(); });
  if(idx >= 0) cikisDurumlar.splice(idx,1);
  else cikisDurumlar.push(durum.toUpperCase());
  saveCikisDurumlar();
  renderDurumListEdit();
}

function saveDurumlar(){ localStorage.setItem('ks_durumlar', JSON.stringify(durumlar)); sbSet('ks_durumlar',durumlar); }

function renderDurumWrap(){
  const wrap = document.getElementById('durum-wrap');
  wrap.innerHTML = durumlar.map((d,i) => {
    const isSip = d === 'SİPARİŞ';
    const label = isSip ? '📋 ' + d : d;
    const isActive = secDurum === d;
    return `<button class="sopt${isActive?' active':''}" onclick="setDurum(this,'${d}')">${label}</button>`;
  }).join('');
}

function openDurumEditor(){
  renderDurumListEdit();
  document.getElementById('durum-modal').classList.add('open');
}
function closeDurumEditor(){ document.getElementById('durum-modal').classList.remove('open'); }

function renderDurumListEdit(){
  const el = document.getElementById('durum-list-edit');
  el.innerHTML = durumlar.map((d,i) => {
    const isCikis = isCikisDurum(d);
    const yon = isCikis ? 'ÇIKIŞ' : 'GİRİŞ';
    const yonBg  = isCikis ? '#fdf0f0' : '#edfaf3';
    const yonBdr = isCikis ? 'var(--red)' : 'var(--green)';
    const yonCol = isCikis ? 'var(--red)' : 'var(--green)';
    const yonIkon= isCikis ? '📤' : '📥';
    return `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:6px;background:#fff">
      <span style="flex:1;font-size:13px;font-weight:600">${d}</span>
      <button onclick="toggleCikisDurum('${d}')" title="Para akışı yönünü değiştir"
        style="padding:4px 10px;border:1.5px solid ${yonBdr};border-radius:20px;background:${yonBg};color:${yonCol};font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font-body);white-space:nowrap">
        ${yonIkon} ${yon}
      </button>
      ${i > 0 ? `<button onclick="moveDurum(${i},-1)" style="border:none;background:none;cursor:pointer;color:var(--text2);font-size:14px" title="Yukarı">↑</button>` : '<span style="width:18px"></span>'}
      ${i < durumlar.length-1 ? `<button onclick="moveDurum(${i},1)" style="border:none;background:none;cursor:pointer;color:var(--text2);font-size:14px" title="Aşağı">↓</button>` : '<span style="width:18px"></span>'}
      <button onclick="delDurum(${i})" style="border:none;background:none;cursor:pointer;color:var(--red);font-size:16px" title="Sil">×</button>
    </div>`;
  }).join('');
}

function addDurum(){
  const inp = document.getElementById('durum-new-input');
  const val = inp.value.trim().toUpperCase();
  if(!val) return;
  if(durumlar.includes(val)){ toast('⚠️ Bu durum zaten var'); return; }
  durumlar.push(val);
  saveDurumlar(); inp.value = '';
  renderDurumListEdit(); renderDurumWrap();
  toast('✓ Durum eklendi: '+val);
}

function delDurum(i){
  if(durumlar.length <= 1){ toast('En az 1 durum olmalı'); return; }
  durumlar.splice(i,1);
  if(!durumlar.includes(secDurum)) secDurum = durumlar[0];
  saveDurumlar(); renderDurumListEdit(); renderDurumWrap();
}

function moveDurum(i, dir){
  const j = i + dir;
  if(j < 0 || j >= durumlar.length) return;
  [durumlar[i], durumlar[j]] = [durumlar[j], durumlar[i]];
  saveDurumlar(); renderDurumListEdit(); renderDurumWrap();
}

/* ════ BANKA HAREKETLERİ ════ */
function bhTodayStr(){
  var d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function bhSetBugune(){
  var el=document.getElementById('bh-tarih-filtre');
  if(el && !el.value) el.value=bhTodayStr();
}
function bhBugune(){
  document.getElementById('bh-tarih-filtre').value=bhTodayStr();
  renderBankaHareketleri();
}

function bhTarihGoster(tarihStr){
  // tarihStr: "13.04.2026" (TR) veya "2026-04-13" (ISO)
  // Her iki formatı destekle
  return tarihStr;
}

function bhFiltreStr(){
  var el=document.getElementById('bh-tarih-filtre');
  if(!el||!el.value) return bhTodayStr();
  return el.value; // ISO format: 2026-04-13
}

function bhIsoToTR(iso){ // "2026-04-13" → "13.04.2026"
  if(!iso) return '';
  var p=iso.split('-');
  if(p.length===3) return p[2]+'.'+p[1]+'.'+p[0];
  return iso;
}

function bhTRToIso(tr){ // "13.04.2026" → "2026-04-13"
  if(!tr) return '';
  var p=tr.split('.');
  if(p.length===3) return p[2]+'-'+p[1]+'-'+p[0];
  return tr;
}

function bankaHareketleriWP(){
  var filtreTarih = bhFiltreStr();
  var filtreTR    = bhIsoToTR(filtreTarih);

  var liste = bankaHareketleri.filter(function(h){
    var hTarih = h.tarih||'';
    var hIso = hTarih.includes('-') ? hTarih : bhTRToIso(hTarih);
    return hIso === filtreTarih || hTarih === filtreTR;
  });

  if(!liste.length){ toast('⚠️ Bu tarihte hareket yok'); return; }

  var girisTop = liste.filter(function(h){return h.yon!=='cikis';}).reduce(function(a,h){return a+h.tutar;},0);
  var cikisTop = liste.filter(function(h){return h.yon==='cikis';}).reduce(function(a,h){return a+h.tutar;},0);

  var msg = '🏦 *BANKA HAREKETLERİ*\n';
  msg += '📅 *'+filtreTR+'*\n';
  msg += '━━━━━━━━━━━━━━━━━━━━\n\n';

  // Girişler
  var girişler = liste.filter(function(h){return h.yon!=='cikis';});
  if(girişler.length){
    msg += '📥 *GİRİŞLER*\n';
    girişler.forEach(function(h){
      msg += '  '+(h.onay?'✅':'⏳')+' ';
      if(h.saat) msg += h.saat+' ';
      msg += (h.kimden||'—');
      if(h.banka) msg += ' · '+h.banka;
      msg += ' → *'+fmt(h.tutar)+'*';
      if(h.aciklama) msg += '\n      📌 '+h.aciklama;
      msg += '\n';
    });
    msg += '\n';
  }

  // Çıkışlar
  var cikislar = liste.filter(function(h){return h.yon==='cikis';});
  if(cikislar.length){
    msg += '📤 *ÇIKIŞLAR*\n';
    cikislar.forEach(function(h){
      msg += '  '+(h.onay?'✅':'⏳')+' ';
      if(h.saat) msg += h.saat+' ';
      msg += (h.kimden||'—');
      if(h.banka) msg += ' · '+h.banka;
      msg += ' → *'+fmt(h.tutar)+'*';
      if(h.aciklama) msg += '\n      📌 '+h.aciklama;
      msg += '\n';
    });
    msg += '\n';
  }

  msg += '━━━━━━━━━━━━━━━━━━━━\n';
  if(girisTop>0) msg += '📥 Toplam Giriş: *'+fmt(girisTop)+'*\n';
  if(cikisTop>0) msg += '📤 Toplam Çıkış: *'+fmt(cikisTop)+'*\n';
  msg += '🔁 Net: *'+(girisTop-cikisTop>=0?'+':'')+fmt(girisTop-cikisTop)+'*';

  if(navigator.clipboard){ navigator.clipboard.writeText(msg).catch(function(){}); }
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
  toast('📋 Banka hareketleri kopyalandı + WP açıldı');
}

function renderBankaHareketleri(){
  var filtreTarih = bhFiltreStr();
  var filtreTR    = bhIsoToTR(filtreTarih);

  var liste = bankaHareketleri.filter(function(h){
    var hTarih = h.tarih||'';
    var hIso = hTarih.includes('-') ? hTarih : bhTRToIso(hTarih);
    return hIso === filtreTarih || hTarih === filtreTR;
  });

  // Özet: giriş ve çıkış ayrı hesapla
  var girisTop  = liste.filter(function(h){return h.yon!=='cikis';}).reduce(function(a,h){return a+h.tutar;},0);
  var cikisTop  = liste.filter(function(h){return h.yon==='cikis';}).reduce(function(a,h){return a+h.tutar;},0);
  var netTop    = girisTop - cikisTop;
  var onaylanan = liste.filter(function(h){return h.onay && h.yon!=='cikis';}).reduce(function(a,h){return a+h.tutar;},0)
                - liste.filter(function(h){return h.onay && h.yon==='cikis';}).reduce(function(a,h){return a+h.tutar;},0);
  var bekleyen  = netTop - onaylanan;

  // Özet güncelle
  var toplamEl = document.getElementById('bh-toplam');
  var onayEl   = document.getElementById('bh-onaylanan');
  var bekEl    = document.getElementById('bh-bekleyen');
  if(toplamEl){ toplamEl.textContent = (netTop>=0?'+':'')+fmt(netTop); toplamEl.style.color = netTop>=0?'var(--green)':'var(--red)'; }
  if(onayEl)  { onayEl.textContent   = (onaylanan>=0?'+':'')+fmt(onaylanan); onayEl.style.color = onaylanan>=0?'var(--blue)':'var(--red)'; }
  if(bekEl)   { bekEl.textContent    = fmt(girisTop)+' giriş / '+fmt(cikisTop)+' çıkış'; bekEl.style.color='var(--text2)'; bekEl.style.fontSize='12px'; }

  updateBhBadge();
  bhUpdateBankaDL();

  var tb = document.getElementById('bh-tb');
  if(!liste.length){
    tb.innerHTML='<tr><td colspan="8"><div class="empty"><div class="empty-icon">🏦</div>Bu güne ait banka hareketi yok<br><span style="font-size:11px;color:var(--text3)">Havale/EFT kaydettiğinde otomatik eklenir</span></div></td></tr>';
    return;
  }

  tb.innerHTML = liste.map(function(h){
    var isCikis = h.yon === 'cikis';
    var rowBg = h.onay ? (isCikis?'#fff0f0':'var(--green-light)') : (isCikis?'#fff8f8':'#fff');
    var borderCol = h.onay ? (isCikis?'var(--red)':'var(--green)') : (isCikis?'#fca5a5':'var(--border)');
    var tutarColor = isCikis ? 'var(--red)' : 'var(--green)';
    var tutarPrefix = isCikis ? '−' : '+';
    var yonBadge = isCikis
      ? '<span style="display:inline-block;padding:2px 7px;background:var(--red-light);color:var(--red);border:1px solid #f5cccc;border-radius:12px;font-size:9px;font-weight:800;letter-spacing:.05em">📤 ÇIKIŞ</span>'
      : '<span style="display:inline-block;padding:2px 7px;background:var(--green-light);color:var(--green);border:1px solid #b8e8c8;border-radius:12px;font-size:9px;font-weight:800;letter-spacing:.05em">📥 GİRİŞ</span>';
    return '<tr style="background:'+rowBg+';border-left:4px solid '+borderCol+'">'
      + '<td style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text3);white-space:nowrap">'+(h.saat||'—')+'</td>'
      + '<td>'+yonBadge+'</td>'
      + '<td style="font-weight:600;font-size:13px">'+(h.kimden||'—')+'</td>'
      + '<td style="font-size:12px;color:var(--text2)">'+(h.banka||'—')+'</td>'
      + '<td style="font-size:11px;color:var(--text2);font-style:italic;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+(h.aciklama||'')+'">'+(h.aciklama||'—')+'</td>'
      + '<td style="text-align:right;font-family:JetBrains Mono,monospace;font-weight:700;font-size:13px;color:'+tutarColor+'">'
      +   tutarPrefix+fmt(h.tutar)
      + '</td>'
      + '<td style="text-align:center">'
      +   '<label title="'+(h.onay?'Onaylandı':'Onaylandı mı?')+'" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer;gap:3px">'
      +     '<input type="checkbox" '+(h.onay?'checked':'')+' onchange="bhToggleOnay('+h.id+',this.checked)" style="width:17px;height:17px;accent-color:'+(isCikis?'var(--red)':'var(--green)')+';cursor:pointer">'
      +     '<span style="font-size:10px;color:'+(h.onay?(isCikis?'var(--red)':'var(--green)'):'var(--text3)')+';font-weight:700">'+(h.onay?'✓':'?')+'</span>'
      +   '</label>'
      + '</td>'
      + '<td><button class="icon-btn" onclick="bhSil('+h.id+')" title="Sil">✕</button></td>'
      + '</tr>';
  }).join('');
}

function updateBhBadge(){
  var today=bhTodayStr();
  var todayTR=bhIsoToTR(today);
  var todayCount=bankaHareketleri.filter(function(h){
    var hTarih=h.tarih||'';
    var hIso=hTarih.includes('-')?hTarih:bhTRToIso(hTarih);
    return hIso===today||hTarih===todayTR;
  }).length;
  var badgeEl=document.getElementById('bh-cnt');
  if(badgeEl){
    badgeEl.textContent=todayCount;
    badgeEl.style.display=todayCount>0?'inline':'none';
  }
  checkBankaUyari();
}

function checkBankaUyari(){
  var bekleyenler=bankaHareketleri.filter(function(h){return !h.onay;});
  var bant=document.getElementById('banka-uyari-bant');
  var icerik=document.getElementById('bant-icerik');
  if(!bant||!icerik) return;
  if(!bekleyenler.length){ bant.style.display='none'; return; }
  bant.style.display='block';
  var toplam=bekleyenler.reduce(function(a,h){return a+h.tutar;},0);
  var tekItem=''
    +'<span class="bant-item">'
    +'<span class="bant-ikaz">🔔</span>'
    +'<span>ONAY BEKLEYEN BANKA İŞLEMİ VAR!</span>'
    +'<span class="bant-sayi">'+bekleyenler.length+' İŞLEM</span>'
    +'<span class="bant-ikaz">⚠️</span>'
    +'<span style="opacity:.7">TOPLAM:</span>'
    +'<span class="bant-tutar">'+fmt(toplam)+'</span>'
    +'<span style="opacity:.5;padding:0 12px">· · · · · · · · · · ONAYLAMADAN KASAYI KAPATMA! · · · · · · · · · ·</span>'
    +'<span class="bant-ikaz">🏦</span>'
    +'<span>BANKA HAREKETLERİNİ KONTROL ET</span>'
    +'<span class="bant-sayi">'+bekleyenler.length+' İŞLEM</span>'
    +'<span class="bant-ikaz">⚠️</span>'
    +'<span style="opacity:.7">TOPLAM:</span>'
    +'<span class="bant-tutar">'+fmt(toplam)+'</span>'
    +'<span style="opacity:.5;padding:0 12px">· · · · · · · · · · TIKLAYARAK ONAYLAMAYA GEÇ · · · · · · · · · ·</span>'
    +'</span>';
  icerik.innerHTML=tekItem.repeat(3);
}


function bhUpdateBankaDL(){
  // bankalar global değişkenden
  var dl=document.getElementById('bh-banka-dl');
  if(dl) dl.innerHTML=bankalar.map(function(b){return '<option value="'+b.ad+'">';}).join('');
}

var _bhYon = 'giris';

function bhYonSec(yon){
  _bhYon = yon;
  var gBtn = document.getElementById('bh-yon-giris');
  var cBtn = document.getElementById('bh-yon-cikis');
  if(yon === 'giris'){
    gBtn.style.borderColor='var(--green)'; gBtn.style.background='var(--green-light)'; gBtn.style.color='var(--green)';
    cBtn.style.borderColor='var(--border)'; cBtn.style.background='var(--surface2)'; cBtn.style.color='var(--text3)';
  } else {
    cBtn.style.borderColor='var(--red)'; cBtn.style.background='var(--red-light)'; cBtn.style.color='var(--red)';
    gBtn.style.borderColor='var(--border)'; gBtn.style.background='var(--surface2)'; gBtn.style.color='var(--text3)';
  }
}

function addBankaHareket(){
  var tutar=parseFloat(document.getElementById('bh-tutar').value)||0;
  if(tutar<=0){toast('⚠️ Tutar giriniz');document.getElementById('bh-tutar').focus();return;}
  var kimden=document.getElementById('bh-kimden').value.trim();
  var banka=document.getElementById('bh-banka').value.trim();
  var aciklama=document.getElementById('bh-aciklama').value.trim();
  var onay=document.getElementById('bh-onay-ekle').checked;
  var tarihInput=document.getElementById('bh-tarih-ekle').value;
  var now=new Date();
  var tarihISO = tarihInput || (now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0'));
  var saat=now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  bankaHareketleri.unshift({
    id:Date.now()+Math.random(),
    tarih:tarihISO,
    saat:saat,
    kimden:kimden,
    banka:banka,
    aciklama: (aciklama||'Manuel kayıt') + ' · ' + (_bhYon==='giris'?'📥 GİRİŞ':'📤 ÇIKIŞ'),
    tutar:tutar,
    yon:_bhYon,
    onay:onay
  });
  save();
  ['bh-tutar','bh-kimden','bh-banka','bh-aciklama'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.value='';
  });
  document.getElementById('bh-onay-ekle').checked=false;
  document.getElementById('bh-tarih-filtre').value=tarihISO;
  renderBankaHareketleri();
  toast((_bhYon==='giris'?'📥 Giriş eklendi: ':'📤 Çıkış eklendi: ')+fmt(tutar));
}

function bhToggleOnay(id,val){
  var h=bankaHareketleri.find(function(x){return x.id==id;});
  if(!h) return;
  h.onay=val;
  save();
  renderBankaHareketleri();
  toast(val?'✓ Hareket onaylandı':'Onay kaldırıldı');
}

function bhSil(id){
  if(!confirm('Bu banka hareketi silinsin mi?')) return;
  bankaHareketleri=bankaHareketleri.filter(function(h){return h.id!=id;});
  save();
  renderBankaHareketleri();
  toast('Hareket silindi');
}

/* ════ ÇOKLU ATÖLYE ════ */
let atolyeler = [];
function saveAtolyeler(){ localStorage.setItem('ks_atolyeler', JSON.stringify(atolyeler)); sbSet('ks_atolyeler',atolyeler); }
function getAtolyeTel(){ // Geriye uyumluluk
  if(atolyeler.length) return atolyeler[0].tel;
  return localStorage.getItem('ks_atolye_tel')||'';
}
function addAtolye(){
  var ad=document.getElementById('atolye-ad').value.trim();
  var tel=document.getElementById('atolye-tel-yeni').value.trim();
  if(!ad){toast('⚠️ Atölye adı girin');return;}
  atolyeler.push({id:Date.now(),ad:ad,tel:tel});
  saveAtolyeler();
  document.getElementById('atolye-ad').value='';
  document.getElementById('atolye-tel-yeni').value='';
  renderAtolyeleri();
  toast('✓ Atölye eklendi: '+ad);
}
function delAtolye(id){
  atolyeler=atolyeler.filter(function(a){return a.id!==id;});
  saveAtolyeler();renderAtolyeleri();
}
function renderAtolyeleri(){
  var el=document.getElementById('atolye-list');if(!el)return;
  if(!atolyeler.length){el.innerHTML='<div style="font-size:12px;color:var(--text3);padding:8px 0">Henüz atölye eklenmedi</div>';return;}
  el.innerHTML=atolyeler.map(function(a){
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:6px;background:#fff">'
      +'<div style="flex:1"><div style="font-size:13px;font-weight:600">'+a.ad+'</div>'
      +(a.tel?'<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text3)">'+a.tel+'</div>':'<div style="font-size:11px;color:var(--text3)">Telefon yok</div>')
      +'</div>'
      +'<button onclick="delAtolye('+a.id+')" class="icon-btn" style="color:var(--red);border-color:var(--red)">✕</button>'
      +'</div>';
  }).join('');
}
function atolyeSecAc(sipId){
  var liste=document.getElementById('atolye-sec-list');
  if(!atolyeler.length){
    // Tek atölye ya da eski sistem
    var tek=getAtolyeTel();
    if(!tek){toast('⚠️ Ayarlardan atölye ekleyin');return;}
    var sip=siparisler.find(function(x){return x.id===sipId;});
    if(sip) wpAtolye2Direct(sip,tek,'Atölye');
    return;
  }
  liste.innerHTML=atolyeler.map(function(a){
    return '<button onclick="atolyeSecGonder('+sipId+',\''+a.tel+'\',\''+a.ad+'\')" style="display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;border:1.5px solid var(--border2);border-radius:var(--radius-sm);background:#fff;cursor:pointer;font-family:var(--font-body);transition:all .15s" onmouseover="this.style.borderColor=\'var(--gold-mid)\';this.style.background=\'var(--gold-light)\'" onmouseout="this.style.borderColor=\'var(--border2)\';this.style.background=\'#fff\'">'
      +'<div style="font-size:13px;font-weight:700">🏭 '+a.ad+'</div>'
      +(a.tel?'<div style="font-size:11px;color:var(--text3);font-family:JetBrains Mono,monospace">'+a.tel+'</div>':'<div style="font-size:11px;color:var(--red)">Telefon girilmemiş</div>')
      +'</button>';
  }).join('');
  document.getElementById('atolye-sec-modal').classList.add('open');
  document.getElementById('atolye-sec-modal').dataset.sipId=sipId;
}
function atolyeSecGonder(sipId,tel,ad){
  var sip=siparisler.find(function(x){return x.id===sipId;});
  if(!sip){toast('Sipariş bulunamadı');return;}
  document.getElementById('atolye-sec-modal').classList.remove('open');
  wpAtolye2Direct(sip,tel,ad);
}
function wpAtolye2Direct(s,tel,atolyeAd){
  if(!tel){toast('⚠️ '+atolyeAd+' için telefon girilmemiş');return;}
  var msg='🏭 *ATÖLYE SİPARİŞİ — '+atolyeAd.toUpperCase()+'*\n'+sipBilgiMesaj(s);
  window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(msg),'_blank');
}

/* ════ BİLEZİK TÜRÜ KAYITLI ════ */
let bilezikTurler = ['22 Ayar Bilezik','18 Ayar Bilezik','14 Ayar Bilezik','925 Gümüş Bilezik','Cumhuriyet Altını','Yarım Altın','Çeyrek Altın','Tam Altın'];
function saveBilezikTurler(){ localStorage.setItem('ks_btur',JSON.stringify(bilezikTurler)); sbSet('ks_btur',bilezikTurler); }
function renderBilezikTurDL(){
  var dl=document.getElementById('bsip-tur-dl');
  if(dl) dl.innerHTML=bilezikTurler.map(function(t){return '<option value="'+t+'">';}).join('');
}
function bsipTurEkle(val){
  if(!val) return;
  val=val.trim();
  if(!bilezikTurler.includes(val)){
    bilezikTurler.unshift(val);
    if(bilezikTurler.length>30) bilezikTurler=bilezikTurler.slice(0,30);
    saveBilezikTurler();
    renderBilezikTurDL();
  }
}

/* ════ MÜŞTERİ TEL OTOFİLL ════ */
function bsipMusteriDoldur(isim){
  var m=musteriler.find(function(x){return x.isim.toLowerCase()===isim.toLowerCase();});
  if(m&&m.tel){
    document.getElementById('bsip-tel').value=m.tel;
  }
}
function dsipMusteriDoldur(isim){
  var m=musteriler.find(function(x){return x.isim.toLowerCase()===isim.toLowerCase();});
  if(m&&m.tel){
    document.getElementById('dsip-tel').value=m.tel;
  }
}

/* ════ NAKİT KASA ════ */
var nakitBakiye = parseFloat(localStorage.getItem('ks_nakit_bakiye')||'0');
var nakitHareketler = JSON.parse(localStorage.getItem('ks_nakit_h')||'[]');
var _nkTip = 'giris';

function saveNakit(){
  localStorage.setItem('ks_nakit_bakiye', nakitBakiye.toString());
  localStorage.setItem('ks_nakit_h', JSON.stringify(nakitHareketler));
}
function updateNakitLbl(){
  var el=document.getElementById('nakit-bakiye-lbl');
  if(el){ el.textContent=fmt(nakitBakiye); el.style.color=nakitBakiye>=0?'var(--green)':'var(--red)'; }
  var mel=document.getElementById('nakit-modal-bakiye');
  if(mel){ mel.textContent=fmt(nakitBakiye); mel.style.color=nakitBakiye>=0?'var(--gold-dark)':'var(--red)'; }
}
function nakitBakiyeModal(){
  updateNakitLbl();
  document.getElementById('nk-tutar').value='';
  document.getElementById('nk-aciklama').value='';
  nkTipSec('giris');
  document.getElementById('nakit-modal').classList.add('open');
}
function nkTipSec(tip){
  _nkTip=tip;
  document.getElementById('nk-tip-giris').classList.toggle('active',tip==='giris');
  document.getElementById('nk-tip-cikis').classList.toggle('active',tip==='cikis');
}
function nkKaydet(){
  var tutar=parseFloat(document.getElementById('nk-tutar').value)||0;
  if(tutar<=0){toast('⚠️ Tutar girin');document.getElementById('nk-tutar').focus();return;}
  var aciklama=document.getElementById('nk-aciklama').value.trim();
  var now=new Date();
  var hareket={
    id:Date.now(),
    tarih:now.toLocaleDateString('tr-TR'),
    saat:now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}),
    tip:_nkTip,
    tutar:tutar,
    aciklama:aciklama
  };
  nakitHareketler.unshift(hareket);
  if(nakitHareketler.length>200) nakitHareketler=nakitHareketler.slice(0,200);
  if(_nkTip==='giris') nakitBakiye+=tutar;
  else nakitBakiye-=tutar;
  saveNakit();
  updateNakitLbl();
  document.getElementById('nakit-modal').classList.remove('open');
  toast((_nkTip==='giris'?'🪙 Nakit giriş: ':'🪙 Nakit çıkış: ')+fmt(tutar)+' → Kasa: '+fmt(nakitBakiye));
}
function nakitGecmis(){
  if(!nakitHareketler.length){toast('Henüz nakit hareketi yok');return;}
  var msg=nakitHareketler.slice(0,20).map(function(h){
    return (h.tip==='giris'?'+ ':' ')+'₺'+h.tutar.toLocaleString('tr-TR')+(h.aciklama?' ('+h.aciklama+')':'')+' — '+h.tarih;
  }).join('\n');
  alert('NAKİT HAREKETLER (Son 20)\n\n'+msg+'\n\nMevcut Kasa: ₺'+nakitBakiye.toLocaleString('tr-TR'));
}
// İşlem kaydedilince nakit güncelle
function nakitIslemdenGuncelle(d, yonCikis){
  if(d.nakit && d.nakit>0){
    var hareket={
      id:Date.now()+Math.random(),
      tarih:d.tarih,saat:d.saat,
      tip:yonCikis?'cikis':'giris',
      tutar:d.nakit,
      aciklama:(yonCikis?'Ödeme: ':'Tahsilat: ')+d.musteri+(d.urun?' · '+d.urun:'')
    };
    nakitHareketler.unshift(hareket);
    if(nakitHareketler.length>200) nakitHareketler=nakitHareketler.slice(0,200);
    if(yonCikis) nakitBakiye-=d.nakit;
    else nakitBakiye+=d.nakit;
    saveNakit();
    updateNakitLbl();
  }
}

function saveKendiTel(){localStorage.setItem('ks_kendi_tel',document.getElementById('kendi-tel').value.trim());}
function saveAtolyeTel(){localStorage.setItem('ks_atolye_tel',document.getElementById('atolye-tel').value.trim());}
function getKendiTel(){return localStorage.getItem('ks_kendi_tel')||'';}
function getAtolyeTel(){return localStorage.getItem('ks_atolye_tel')||'';}

function islemDetayMesaj(d){
  var satirlar = d.satirlar||[];
  var satisRows  = satirlar.filter(function(s){return s.tip==='SATIŞ';});
  var alisRows   = satirlar.filter(function(s){return s.tip==='ALIŞ';});
  var nakitRows  = satirlar.filter(function(s){return s.tip==='NAKİT';});
  var havaleRows = satirlar.filter(function(s){return s.tip==='HAVALE';});

  var m='🏪 *İŞLEM DETAYI*\n';
  m+='━━━━━━━━━━━━━━━━━━━━\n';
  m+='📅 '+d.tarih+'  🕐 '+d.saat+'\n';
  m+='👤 *'+d.musteri+'*\n';
  m+='📌 '+d.durum+'\n';

  // SATIŞ satırları
  if(satisRows.length){
    m+='\n💰 *SATIŞ*\n';
    var satisTop=0;
    satisRows.forEach(function(s){
      m+='  • '+(s.urun||'—');
      if(s.gram>0) m+='   ⚖️ '+fmtG(s.gram);
      if(s.adet>1) m+='   '+s.adet+'×';
      if(s.tutar>0){ m+='   *'+fmt(s.tutar)+'*'; satisTop+=s.tutar; }
      m+='\n';
    });
    if(satisRows.length>1) m+='  *Toplam: '+fmt(satisTop)+'*\n';
  }

  // ALIŞ satırları
  if(alisRows.length){
    m+='\n📥 *ALIŞ*\n';
    var alisTop=0;
    alisRows.forEach(function(s){
      m+='  • '+(s.urun||'—');
      if(s.gram>0) m+='   ⚖️ '+fmtG(s.gram);
      if(s.adet>1) m+='   '+s.adet+' adet';
      if(s.tutar>0){ m+='   *'+fmt(s.tutar)+'*'; alisTop+=s.tutar; }
      m+='\n';
    });
    if(alisRows.length>1) m+='  *Toplam: '+fmt(alisTop)+'*\n';
  }

  // Eski format (satirlar boşsa)
  if(!satisRows.length && !alisRows.length){
    if(d.urun)    m+='\n💎 Ürün: '+d.urun+'\n';
    if(d.gram>0)  m+='⚖️ Gram: '+fmtG(d.gram)+'\n';
    if(d.tutar>0) m+='💰 Satış: *'+fmt(d.tutar)+'*\n';
    if(d.alisVar){
      m+='\n📥 Alış:\n';
      if(d.alisUrun)    m+='  Ürün: '+d.alisUrun+'\n';
      if(d.alisGram>0)  m+='  Gram: '+fmtG(d.alisGram)+'\n';
      if(d.alisTutar>0) m+='  Tutar: *'+fmt(d.alisTutar)+'*\n';
    }
  }

  // ÖDEME satırları
  var toplamOdeme = nakitRows.reduce(function(a,s){return a+s.tutar;},0)
                 + havaleRows.reduce(function(a,s){return a+s.tutar;},0);
  if(nakitRows.length||havaleRows.length){
    m+='\n💳 *ÖDEME*\n';
    nakitRows.forEach(function(s){
      m+='  🪙 Nakit: *'+fmt(s.tutar)+'*\n';
    });
    havaleRows.forEach(function(s){
      m+='  🏦 '+(s.urun||'Havale/EFT')+': *'+fmt(s.tutar)+'*\n';
    });
    if(nakitRows.length+havaleRows.length>1) m+='  Toplam ödenen: *'+fmt(toplamOdeme)+'*\n';
  } else if(d.odenen>0){
    m+='\n💳 *ÖDEME*\n';
    if(d.nakit>0)  m+='  🪙 Nakit: *'+fmt(d.nakit)+'*\n';
    if(d.havale>0) m+='  🏦 '+(d.odemeDetay||'Havale/EFT')+': *'+fmt(d.havale)+'*\n';
  }

  // KALAN
  m+='\n━━━━━━━━━━━━━━━━━━━━\n';
  if(d.kalan_tl>0)       m+='⚠️ *KALAN: '+fmt(d.kalan_tl)+'*\n';
  else if(d.kalan_tl<0)  m+='⬆️ *ÜST VERİLECEK: '+fmt(Math.abs(d.kalan_tl))+'*\n';
  else                   m+='✅ *TAM ÖDENDİ*\n';

  if(d.borc_notu) m+='📌 Borç notu: '+d.borc_notu+'\n';
  if(d.not)       m+='📝 Not: '+d.not+'\n';
  m+='#'+String(d.id).slice(-6);
  return m;
}

function islemKendimeWP(id){
  var d=islemler.find(function(x){return x.id===id;});if(!d)return;
  var tel=getKendiTel();
  var msg=islemDetayMesaj(d);
  if(tel) window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(msg),'_blank');
  else window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
  // Gönderildi işareti
  var saat = new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  d.wp_kendi_zaman = saat;
  save(); renderIslemler();
  toast('📱 Kendime gönderildi — '+saat);
}

function islemMusteriMesaji(i){
  var satirlar = i.satirlar || [];
  var satisRows  = satirlar.filter(function(s){return s.tip==='SATIŞ';});
  var alisRows   = satirlar.filter(function(s){return s.tip==='ALIŞ';});
  var nakitRows  = satirlar.filter(function(s){return s.tip==='NAKİT';});
  var havaleRows = satirlar.filter(function(s){return s.tip==='HAVALE';});

  var msg = '💎 Sayın *'+i.musteri+'*,\n\n';

  // Durum cümlesi
  var isCikis = isCikisDurum(i.durum||'');
  var durumCumle = '';
  if(i.durum==='SATIŞ')                 durumCumle = 'Mağazamızdan satış işleminiz gerçekleştirilmiştir.';
  else if(i.durum==='ALIŞ')             durumCumle = 'Altın alım işleminiz gerçekleştirilmiştir.';
  else if(i.durum==='EMANETE ALIŞ')     durumCumle = 'Altınlarınız emanete alınmıştır.';
  else if(i.durum==='EMANETTEN SATIŞ')  durumCumle = 'Emanetinizdeki altından satış işlemi gerçekleştirilmiştir.';
  else if(i.durum && i.durum.includes('BORÇ')) durumCumle = i.durum+' işleminiz kaydedilmiştir.';
  else                                   durumCumle = (i.durum||'İşlem')+' işleminiz gerçekleştirilmiştir.';
  msg += durumCumle+'\n';

  // Ürün detayları
  if(satisRows.length || alisRows.length || satirlar.length){
    msg += '\n📦 *İşlem Detayı:*\n';
    var gosterRows = satisRows.length ? satisRows : (alisRows.length ? alisRows : satirlar.filter(function(s){return s.tip!=='NAKİT'&&s.tip!=='HAVALE';}));
    gosterRows.forEach(function(s){
      var satir = '  • ';
      if(s.urun) satir += s.urun;
      if(s.gram>0) satir += '  ⚖️ '+fmtG(s.gram);
      else if(s.adet>0) satir += '  '+s.adet+' adet';
      if(s.tutar>0) satir += '  →  *'+fmt(s.tutar)+'*';
      msg += satir+'\n';
    });
    // Eski format (satirlar yoksa)
    if(!gosterRows.length){
      if(i.urun)      msg += '  • '+i.urun+(i.gram>0?' — '+fmtG(i.gram):'')+(i.tutar>0?' → *'+fmt(i.tutar)+'*':'')+'\n';
      if(i.alisVar && i.alisUrun) msg += '  • Alınan: '+i.alisUrun+(i.alisGram>0?' — '+fmtG(i.alisGram):'')+(i.alisTutar>0?' → *'+fmt(i.alisTutar)+'*':'')+'\n';
    }
  }

  // Ödeme bilgisi
  var odemeVarMi = (nakitRows.length || havaleRows.length || i.nakit>0 || i.havale>0);
  if(odemeVarMi){
    msg += '\n💳 *Ödeme Bilgisi:*\n';
    nakitRows.forEach(function(s){ msg += '  🪙 Nakit: *'+fmt(s.tutar)+'*\n'; });
    havaleRows.forEach(function(s){ msg += '  🏦 Havale/EFT'+(s.urun?' — '+s.urun:'')+': *'+fmt(s.tutar)+'*\n'; });
    // Eski format
    if(!nakitRows.length && !havaleRows.length){
      if(i.nakit>0)  msg += '  🪙 Nakit: *'+fmt(i.nakit)+'*\n';
      if(i.havale>0) msg += '  🏦 Havale/EFT'+(i.odemeDetay?' — '+i.odemeDetay:'')+': *'+fmt(i.havale)+'*\n';
    }
    if(isCikis){
      msg += '  ✅ *Ödemeniz yapılmıştır.*\n';
    } else {
      msg += '  ✅ *Ödemeniz alınmıştır.*\n';
    }
  }

  // Kalan
  if(i.kalan_tl > 0){
    msg += '\n⚠️ *Kalan Borç: '+fmt(i.kalan_tl)+'*\n';
  } else if(i.kalan_tl < 0){
    msg += '\n⬆️ *Tarafınıza verilecek üst: '+fmt(Math.abs(i.kalan_tl))+'*\n';
  } else {
    msg += '\n✅ *Hesabınız tamamen kapatılmıştır.*\n';
  }

  // Not
  if(i.not||i.sipNot) msg += '\n📝 _'+(i.sipNot||i.not)+'_\n';

  msg += '\n📅 '+i.tarih+'  🕐 '+i.saat;
  msg += '\n\nTeşekkür ederiz 🙏';
  return msg;
}

function islemMusteriyeWP(id){
  var d=islemler.find(function(x){return x.id===id;});if(!d)return;
  var m=musteriler.find(function(x){return x.isim===d.musteri;});
  var tel = m&&m.tel ? m.tel.replace(/\D/g,'') : '';
  var msg = islemMusteriMesaji(d);
  if(tel) window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(msg),'_blank');
  else    window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
  var saat = new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  d.wp_musteri_zaman = saat;
  save(); renderIslemler();
  toast('👤 Müşteriye gönderildi — '+saat);
}

function islemGrubaWP(id){
  var d=islemler.find(function(x){return x.id===id;});if(!d)return;
  var grupTel=getIslemGrup();
  var msg=islemDetayMesaj(d);
  if(grupTel) window.open('https://wa.me/'+grupTel+'?text='+encodeURIComponent(msg),'_blank');
  else window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
  var saat = new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  d.wp_grup_zaman = saat;
  save(); renderIslemler();
  toast('👥 Gruba gönderildi — '+saat);
}

function saveIslemVeKendimeWP(){
  var d=readForm();if(!d)return;
  if(d.durum==='SİPARİŞ'){d.sipStatus='alindi';siparisler.unshift(d);}
  else{islemler.unshift(d);}
  if(d.havale>0){
    var bankaOnayliMi2 = !!(document.getElementById('i-banka-onay') && document.getElementById('i-banka-onay').checked);
    bankaHareketleri.unshift({id:Date.now()+Math.random(),tarih:d.tarih,saat:d.saat,kimden:d.musteri,banka:d.odemeDetay||'',aciklama:'İşlemden · '+(d.urun||''),tutar:d.havale,onay:bankaOnayliMi2,islemId:d.id});
    updateBhBadge();
  }
  save();renderIslemler();renderMusteri();updateSipBadge();
  toast('✓ Kaydedildi + WP: '+d.musteri);
  clearForm();
  var tel=getKendiTel();
  var msg=islemDetayMesaj(d);
  setTimeout(function(){
    if(tel) window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(msg),'_blank');
    else window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
  },300);
}

/* ════ YENİ SİPARİŞ SİSTEMİ ════ */
var sipFiltre='tumu';
var bsipFotoArr=[];
var dsipFotoArr=[];

var BILEZIK_OLCULER=[];
(function(){for(var o=40;o<=72;o+=2){BILEZIK_OLCULER.push((o/10).toFixed(1));}})();

function sipTabSec(tip){
  sipFiltre=tip;
  ['tumu','bilezik','diger'].forEach(function(t){
    var btn=document.getElementById('sip-tab-'+t);
    if(btn) btn.classList.toggle('active',t===tip);
  });
  renderSiparisler();
}

function sipModalAc(tip){
  if(tip==='bilezik'){
    renderBilezikOlculer();
    renderBilezikTurDL();
    bsipFotoArr=[];
    document.getElementById('bsip-foto-preview').innerHTML='';
    ['bsip-musteri','bsip-tel','bsip-gram','bsip-not','bsip-olcu-manuel'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
    document.getElementById('bsip-adet').value='1';
    document.getElementById('bsip-tur').value='';
    document.getElementById('bsip-tutar').value='';
    document.getElementById('bsip-olcu').value='';
    document.getElementById('bilezik-sip-modal').classList.add('open');
  } else {
    dsipFotoArr=[];
    document.getElementById('dsip-foto-preview').innerHTML='';
    ['dsip-musteri','dsip-tel','dsip-urun','dsip-gram','dsip-olcu','dsip-not'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
    document.getElementById('dsip-tutar').value='';
    document.getElementById('diger-sip-modal').classList.add('open');
  }
}

function sipModalKapat(tip){
  document.getElementById((tip==='bilezik'?'bilezik':'diger')+'-sip-modal').classList.remove('open');
}

function renderBilezikOlculer(){
  var wrap=document.getElementById('bsip-olcu-wrap');
  if(!wrap) return;
  wrap.innerHTML=BILEZIK_OLCULER.map(function(o){
    var lbl=o.replace('.',',')+'cm';
    return '<button type="button" class="bsip-olcu-btn" onclick="bsipSecOlcu(this,\''+o+'\')" style="padding:5px 10px;border:1.5px solid var(--border2);border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;background:#fff;color:var(--text2);font-family:var(--font-mono);transition:all .15s;line-height:1">'+lbl+'</button>';
  }).join('');
}

function bsipSecOlcu(el,val){
  document.querySelectorAll('.bsip-olcu-btn').forEach(function(b){b.style.cssText='padding:5px 10px;border:1.5px solid var(--border2);border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;background:#fff;color:var(--text2);font-family:var(--font-mono);transition:all .15s;line-height:1';});
  el.style.background='linear-gradient(135deg,#18150a,#2a2412)';
  el.style.color='#e8b84b';
  el.style.borderColor='#18150a';
  document.getElementById('bsip-olcu').value=val;
  document.getElementById('bsip-olcu-manuel').value='';
}

function bsipPreviewFoto(){
  var inp=document.getElementById('bsip-foto');
  var wrap=document.getElementById('bsip-foto-preview');
  bsipFotoArr=[];wrap.innerHTML='';
  Array.from(inp.files).forEach(function(f){
    var r=new FileReader();
    r.onload=function(e2){
      bsipFotoArr.push(e2.target.result);
      var img=document.createElement('img');
      img.src=e2.target.result;
      img.style.cssText='width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border);cursor:pointer';
      img.onclick=function(){openFotoModal(e2.target.result);};
      wrap.appendChild(img);
    };
    r.readAsDataURL(f);
  });
}

function dsipPreviewFoto(){
  var inp=document.getElementById('dsip-foto');
  var wrap=document.getElementById('dsip-foto-preview');
  dsipFotoArr=[];wrap.innerHTML='';
  Array.from(inp.files).forEach(function(f){
    var r=new FileReader();
    r.onload=function(e2){
      dsipFotoArr.push(e2.target.result);
      var img=document.createElement('img');
      img.src=e2.target.result;
      img.style.cssText='width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid var(--border);cursor:pointer';
      img.onclick=function(){openFotoModal(e2.target.result);};
      wrap.appendChild(img);
    };
    r.readAsDataURL(f);
  });
}

function saveBilezikSip(){
  var musteri=document.getElementById('bsip-musteri').value.trim();
  var tur=document.getElementById('bsip-tur').value.trim();
  if(!musteri){toast('⚠️ Müşteri adı gerekli');document.getElementById('bsip-musteri').focus();return;}
  if(!tur){toast('⚠️ Bilezik türü girin');document.getElementById('bsip-tur').focus();return;}
  // Yeni türü kaydet
  bsipTurEkle(tur);
  var olcu=document.getElementById('bsip-olcu').value||document.getElementById('bsip-olcu-manuel').value.trim();
  var now=new Date();
  var sip={
    id:Date.now(),sipTip:'bilezik',sipStatus:'alindi',
    musteri:musteri,musteriTel:document.getElementById('bsip-tel').value.trim(),
    bilezikTuru:tur,urun:tur,
    gram:parseTR(document.getElementById('bsip-gram').value)||0,
    adet:parseInt(document.getElementById('bsip-adet').value)||1,
    olcu:olcu,tutar:parseFloat(document.getElementById('bsip-tutar').value)||0,
    not:document.getElementById('bsip-not').value.trim(),
    fotolar:[...bsipFotoArr],
    tarih:now.toLocaleDateString('tr-TR'),
    saat:now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})
  };
  siparisler.unshift(sip);
  save();updateSipBadge();renderSiparisler();
  sipModalKapat('bilezik');
  toast('💍 Bilezik siparişi eklendi: '+musteri);
}

function saveDigerSip(){
  var musteri=document.getElementById('dsip-musteri').value.trim();
  var urun=document.getElementById('dsip-urun').value.trim();
  if(!musteri){toast('⚠️ Müşteri adı gerekli');return;}
  if(!urun){toast('⚠️ Ürün adı gerekli');return;}
  var now=new Date();
  var sip={
    id:Date.now(),sipTip:'diger',sipStatus:'alindi',
    musteri:musteri,musteriTel:document.getElementById('dsip-tel').value.trim(),
    urun:urun,gram:parseTR(document.getElementById('dsip-gram').value)||0,
    olcu:document.getElementById('dsip-olcu').value.trim(),
    tutar:parseFloat(document.getElementById('dsip-tutar').value)||0,
    not:document.getElementById('dsip-not').value.trim(),
    fotolar:[...dsipFotoArr],
    tarih:now.toLocaleDateString('tr-TR'),
    saat:now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})
  };
  siparisler.unshift(sip);
  save();updateSipBadge();renderSiparisler();
  sipModalKapat('diger');
  toast('📦 Sipariş eklendi: '+urun+' — '+musteri);
}

function sipBilgiMesaj(s){
  var m=(s.sipTip==='bilezik'?'💍':'📦')+' *SİPARİŞ*\n━━━━━━━━━━━━━\n';
  m+='👤 Müşteri : *'+s.musteri+'*\n';
  if(s.sipTip==='bilezik'){
    if(s.bilezikTuru) m+='💍 Tür : '+s.bilezikTuru+'\n';
    if(s.adet>1) m+='🔢 Adet : '+s.adet+'\n';
    if(s.gram>0) m+='⚖️ Gram : '+fmtG(s.gram)+'\n';
    if(s.olcu) m+='📐 Ölçü : '+s.olcu+'cm\n';
  } else {
    m+='📦 Ürün : '+s.urun+'\n';
    if(s.gram>0) m+='⚖️ Gram : '+fmtG(s.gram)+'\n';
    if(s.olcu) m+='📐 Ölçü : '+s.olcu+'\n';
  }
  if(s.tutar>0) m+='💰 Tahmini : '+fmt(s.tutar)+'\n';
  if(s.not) m+='📝 Not : '+s.not+'\n';
  m+='📅 '+s.tarih+' '+s.saat+'\n━━━━━━━━━━━━━\n#'+String(s.id).slice(-6);
  return m;
}

function wpAtolye2(s){
  var tel=getAtolyeTel();
  var msg='🏭 *ATÖLYE SİPARİŞİ*\n'+sipBilgiMesaj(s);
  if(tel) window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(msg),'_blank');
  else window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}

function wpSipAlindi2(s){
  var tel=s.musteriTel?(s.musteriTel.replace(/\D/g,'')):'';
  if(tel&&!tel.startsWith('9')) tel='9'+tel;
  var m='Sayın *'+s.musteri+'*,\n\n';
  if(s.sipTip==='bilezik') m+='💍 *Bilezik siparişiniz alınmıştır.*\n'+(s.bilezikTuru||'')+'\n'+(s.olcu?'Ölçü: '+s.olcu+'cm\n':'');
  else m+='📦 *'+s.urun+' siparişiniz alınmıştır.*\n'+(s.olcu?'Ölçü: '+s.olcu+'\n':'');
  m+='\nHazır olduğunda bilgilendireceğiz. 🙏\nTeşekkür ederiz.';
  if(tel) window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(m),'_blank');
  else window.open('https://wa.me/?text='+encodeURIComponent(m),'_blank');
}

function wpSipGeldi2(s){
  var tel=s.musteriTel?(s.musteriTel.replace(/\D/g,'')):'';
  if(tel&&!tel.startsWith('9')) tel='9'+tel;
  var m='Sayın *'+s.musteri+'*,\n\n';
  if(s.sipTip==='bilezik') m+='💍 *Bilezik siparişiniz gelmiştir!* 🎉\n'+(s.bilezikTuru||'')+'\n'+(s.olcu?'Ölçü: '+s.olcu+'cm\n':'');
  else m+='📦 *'+s.urun+' siparişiniz gelmiştir!* 🎉\n';
  m+='\nTeslim almaya gelebilirsiniz. 😊\nTeşekkür ederiz.';
  if(tel) window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(m),'_blank');
  else window.open('https://wa.me/?text='+encodeURIComponent(m),'_blank');
}

function wpSipTeslim2(s){
  var tel=s.musteriTel?(s.musteriTel.replace(/\D/g,'')):'';
  if(tel&&!tel.startsWith('9')) tel='9'+tel;
  var m='Sayın *'+s.musteri+'*,\n\n';
  if(s.sipTip==='bilezik') m+='💍 *Bilezik siparişiniz teslim edilmiştir.*\n';
  else m+='📦 *'+s.urun+' siparişiniz teslim edilmiştir.*\n';
  m+='\nAlışverişiniz için teşekkür ederiz. 🙏\nİyi günler dileriz.';
  if(tel) window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(m),'_blank');
  else window.open('https://wa.me/?text='+encodeURIComponent(m),'_blank');
}

/* ════ GÜNLÜK ÖZET WP ════ */
function saveGunlukGrup(){ localStorage.setItem('ks_gunluk_grup', document.getElementById('gunluk-grup').value.trim()); }
function getGunlukGrup(){ return localStorage.getItem('ks_gunluk_grup')||''; }
function saveIslemGrup(){ localStorage.setItem('ks_islem_grup', document.getElementById('islem-grup-tel').value.trim()); }
function getIslemGrup(){ return localStorage.getItem('ks_islem_grup')||''; }

function getGrupAutoAcik(){ return localStorage.getItem('ks_grup_auto')==='1'; }
function toggleGrupAuto(){
  var yeni = !getGrupAutoAcik();
  localStorage.setItem('ks_grup_auto', yeni ? '1' : '0');
  renderGrupAutoBtn();
}
function renderGrupAutoBtn(){
  var btn = document.getElementById('grup-auto-btn');
  var lbl = document.getElementById('grup-auto-aciklama');
  if(!btn) return;
  var acik = getGrupAutoAcik();
  btn.textContent = acik ? '🟢 Açık' : '⬛ Kapalı';
  btn.style.borderColor = acik ? 'var(--green)' : 'var(--border)';
  btn.style.background  = acik ? 'var(--green-light)' : 'var(--surface2)';
  btn.style.color       = acik ? 'var(--green)' : 'var(--text3)';
  if(lbl) lbl.textContent = acik ? 'Açık — her kayıtta WhatsApp açılır, grubu seçersin' : 'Kapalı — işlemler otomatik gönderilmez';
}

function gunlukOzetWP(){
  var bugun = new Date().toLocaleDateString('tr-TR');
  var gunIslemler = islemler.filter(function(i){ return i.tarih === bugun; });
  if(!gunIslemler.length){ toast('⚠️ Bugün henüz işlem yok'); return; }

  var satisTop=0, alisTop=0, nakitTop=0, havaleTop=0, kalanTopla=0, ustTopla=0;
  gunIslemler.forEach(function(i){
    satisTop  += (i.tutar||0);
    alisTop   += (i.alisTutar||0);
    nakitTop  += (i.nakit||0);
    havaleTop += (i.havale||0);
    if(i.kalan_tl>0) kalanTopla += i.kalan_tl;
    if(i.kalan_tl<0) ustTopla   += Math.abs(i.kalan_tl);
  });

  var now = new Date();
  var msg = '📊 *GÜNLÜK İŞLEM RAPORU*\n';
  msg += '📅 *'+bugun+'* · '+now.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})+'\n';
  msg += '━━━━━━━━━━━━━━━━━━━━\n\n';

  gunIslemler.forEach(function(i, idx){
    msg += '*'+(idx+1)+'. '+i.musteri+'*\n';
    msg += '   📌 '+i.durum;
    if(i.urun) msg += ' · '+i.urun;
    if(i.gram>0) msg += ' · '+fmtG(i.gram);
    msg += ' · '+i.saat+'\n';
    if(i.tutar>0)          msg += '   💰 Satış: '+fmt(i.tutar)+'\n';
    if((i.alisTutar||0)>0) msg += '   📥 Alış: '+fmt(i.alisTutar)+'\n';
    // Ödeme satır bazlı detay
    if(i.satirlar && i.satirlar.length){
      i.satirlar.filter(function(s){return s.tip==='NAKİT';}).forEach(function(s){
        msg += '   🪙 Nakit: '+fmt(s.tutar)+'\n';
      });
      i.satirlar.filter(function(s){return s.tip==='HAVALE';}).forEach(function(s){
        msg += '   🏦 Havale'+(s.urun?' ('+s.urun+')':'')+': '+fmt(s.tutar)+'\n';
      });
    } else {
      if(i.nakit>0)  msg += '   🪙 Nakit: '+fmt(i.nakit)+'\n';
      if(i.havale>0) msg += '   🏦 Havale'+(i.odemeDetay?' ('+i.odemeDetay+')':'')+': '+fmt(i.havale)+'\n';
    }
    // Üst ödeme detayı (müşteriye sen ödedin)
    if(i.ust_verildi){
      if(i.ust_nakit>0)  msg += '   ⬆️🪙 Üst Nakit: '+fmt(i.ust_nakit)+'\n';
      if(i.ust_havale>0) msg += '   ⬆️🏦 Üst Havale'+(i.ust_havale_detay?' ('+i.ust_havale_detay+')':'')+': '+fmt(i.ust_havale)+'\n';
      if(!i.ust_nakit && !i.ust_havale) msg += '   ⬆️ Üst Verildi: '+fmt(Math.abs(i.kalan_tl||0))+'\n';
    }
    if(i.kalan_tl>0)  msg += '   ⚠️ Kalan: *'+fmt(i.kalan_tl)+'*\n';
    else if(!i.ust_verildi && i.kalan_tl===0 && (i.tutar>0||(i.alisTutar||0)>0)) msg += '   ✅ Tam Ödendi\n';
    if(i.not) msg += '   📝 '+i.not+'\n';
    msg += '\n';
  });

  msg += '━━━━━━━━━━━━━━━━━━━━\n';
  msg += '📈 *ÖZET*\n';
  msg += '🔢 İşlem: *'+gunIslemler.length+'*\n';
  if(satisTop>0)   msg += '💰 Satış: *'+fmt(satisTop)+'*\n';
  if(alisTop>0)    msg += '📥 Alış: *'+fmt(alisTop)+'*\n';
  if(nakitTop>0)   msg += '🪙 Nakit Tahsilat: *'+fmt(nakitTop)+'*\n';
  if(havaleTop>0)  msg += '🏦 Havale Tahsilat: *'+fmt(havaleTop)+'*\n';
  if(kalanTopla>0) msg += '⚠️ Bekleyen Kalan: *'+fmt(kalanTopla)+'*\n';
  if(ustTopla>0)   msg += '⬆️ Verilen Üst: *'+fmt(ustTopla)+'*\n';
  msg += '🪙 Nakit Kasa: *'+fmt(nakitBakiye)+'*\n';
  msg += '━━━━━━━━━━━━━━━━━━━━';

  // Panoya kopyala + WA aç, kullanıcı grubu seçer
  function acp(){
    if(navigator.clipboard){
      navigator.clipboard.writeText(msg).then(function(){
        toast('📋 Kopyalandı! WhatsApp açılıyor → Günlük grubunu seç');
        setTimeout(function(){ window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank'); }, 400);
      }).catch(function(){ window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank'); toast('WhatsApp açılıyor → Günlük grubunu seç'); });
    } else {
      window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
      toast('WhatsApp açılıyor → Günlük grubunu seç');
    }
  }
  acp();
}

let topluSecili = new Set();

function openTopluWP(){
  topluSecili = new Set();
  document.getElementById('toplu-msg').value = 'Sayın {musteri},\n\n{durum} işleminiz kaydedilmiştir.\nÜrün: {urun}\nTutar: {tutar}\nKalan: {kalan}\n\nTeşekkür ederiz.';
  renderTopluList();
  document.getElementById('toplu-modal').classList.add('open');
}
function closeTopluWP(){ document.getElementById('toplu-modal').classList.remove('open'); }

function renderTopluList(){
  const filtre = (document.getElementById('toplu-filtre').value||'').toLowerCase();
  const el = document.getElementById('toplu-list');
  const liste = islemler.filter(i =>
    !filtre || i.musteri.toLowerCase().includes(filtre) || i.durum.toLowerCase().includes(filtre)
  );
  if(!liste.length){ el.innerHTML = '<div class="empty" style="padding:16px">Kayıt bulunamadı</div>'; return; }
  el.innerHTML = liste.map(i => {
    const checked = topluSecili.has(i.id);
    return `<label style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border);cursor:pointer;${checked?'background:var(--green-light)':''}">
      <input type="checkbox" ${checked?'checked':''} onchange="toggleToplu(${i.id},this.checked)" style="width:16px;height:16px;cursor:pointer;accent-color:var(--green)">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600">${i.musteri}</div>
        <div style="font-size:11px;color:var(--text2)">${i.durum} · ${i.urun||'—'} · ${i.tarih}</div>
      </div>
      <div style="font-size:12px;font-weight:600;white-space:nowrap">${i.tutar>0?fmt(i.tutar):''}</div>
    </label>`;
  }).join('');
  document.getElementById('toplu-secili-cnt').textContent = topluSecili.size + ' seçili';
}

function toggleToplu(id, checked){
  if(checked) topluSecili.add(id); else topluSecili.delete(id);
  document.getElementById('toplu-secili-cnt').textContent = topluSecili.size + ' seçili';
  renderTopluList();
}

function secTumunuToplu(sec){
  const filtre = (document.getElementById('toplu-filtre').value||'').toLowerCase();
  islemler.filter(i => !filtre || i.musteri.toLowerCase().includes(filtre) || i.durum.toLowerCase().includes(filtre))
    .forEach(i => sec ? topluSecili.add(i.id) : topluSecili.delete(i.id));
  document.getElementById('toplu-secili-cnt').textContent = topluSecili.size + ' seçili';
  renderTopluList();
}

function sendTopluWP(){
  if(topluSecili.size === 0){ toast('⚠️ Önce işlem seç'); return; }
  const sablonBase = document.getElementById('toplu-msg').value;
  const seciliIslemler = islemler.filter(i => topluSecili.has(i.id));
  
  let birlesik = '';
  seciliIslemler.forEach((i, idx) => {
    let msg = sablonBase
      .replace(/{musteri}/g, i.musteri)
      .replace(/{durum}/g, i.durum)
      .replace(/{urun}/g, i.urun||'—')
      .replace(/{tutar}/g, i.tutar>0?fmt(i.tutar):'—')
      .replace(/{kalan}/g, i.kalan_tl>0?fmt(i.kalan_tl):'YOK')
      .replace(/{tarih}/g, i.tarih);
    birlesik += msg + (idx < seciliIslemler.length-1 ? '\n\n─────────────\n\n' : '');
  });

  window.open('https://wa.me/?text='+encodeURIComponent(birlesik), '_blank');
  toast('✓ WhatsApp açılıyor...');
}


/* ════ SATIR-BAZLI FORM ════ */
let satirlar = [];
let secSatirTip = 'SATIŞ';

function satirOdemeAc(tip){ setSatirTipSelect(tip); }
function formOdemeAc(tip){ setSatirTipSelect(tip); }

function setSatirTipSelect(tip){
  secSatirTip = tip;
  var urunPanel = document.getElementById('satir-urun-panel');
  var odemePanel = document.getElementById('satir-odeme-panel');
  var detayFg = document.getElementById('s-detay-fg');
  if(tip==='NAKİT'||tip==='HAVALE'){
    urunPanel.style.display='none'; odemePanel.style.display='';
    if(detayFg) detayFg.style.display = tip==='HAVALE' ? '' : 'none';
  } else {
    urunPanel.style.display=''; odemePanel.style.display='none';
  }
  var bqw = document.getElementById('banka-qbtns-wrap');
  if(bqw) bqw.style.display = (tip==='HAVALE' && bankalar.length) ? 'flex' : 'none';
}

function setSatirTip(el, tip){
  secSatirTip = tip;
  document.querySelectorAll('.stip-btn').forEach(b=>b.classList.remove('sp-s','sp-a','sp-n','sp-h'));
  const cls = {SATIŞ:'sp-s',ALIŞ:'sp-a',NAKİT:'sp-n',HAVALE:'sp-h'}[tip]||'sp-s';
  el.classList.add(cls);
  const urunPanel = document.getElementById('satir-urun-panel');
  const odemePanel = document.getElementById('satir-odeme-panel');
  const detayFg = document.getElementById('s-detay-fg');
  if(tip==='NAKİT'||tip==='HAVALE'){
    urunPanel.style.display='none'; odemePanel.style.display='';
    if(detayFg) detayFg.style.display = tip==='HAVALE' ? '' : 'none';
  } else {
    urunPanel.style.display=''; odemePanel.style.display='none';
  }
}

function satirGramToTutar(){
  var g = getGramVal('s-gram');
  if(g>0) document.getElementById('s-tutar').value = (g*gf()).toFixed(2);
}

function satirKalanEkle(){
  const k = calcKalanVal();
  if(k>0) document.getElementById('s-odeme-tutar').value = k.toFixed(2);
}

function addSatir(){
  var tip;
  if(secSatirTip==='NAKİT'||secSatirTip==='HAVALE'){
    tip = secSatirTip;
  } else {
    // ÇIKIŞ durumu (ALIŞ, EMANETTEKİ ALTINI SATTI, vs.) → ALIŞ satırı
    // GİRİŞ durumu (SATIŞ, EMANETTEN SATIŞ, vs.) → SATIŞ satırı
    tip = isCikisDurum(secDurum) ? 'ALIŞ' : 'SATIŞ';
  }
  let satir = { tip };
  if(tip==='NAKİT'||tip==='HAVALE'){
    const t = parseFloat(document.getElementById('s-odeme-tutar').value)||0;
    if(t<=0){ toast('Tutar giriniz'); return; }
    satir.urun = tip==='HAVALE' ? (document.getElementById('s-detay').value.trim()||'') : '';
    satir.gram = 0; satir.adet = 0; satir.tutar = t;
    document.getElementById('s-odeme-tutar').value='';
    document.getElementById('s-detay').value='';
  } else {
    const urun = document.getElementById('s-urun').value.trim();
    const gram = getGramVal('s-gram');
    const adet = parseInt(document.getElementById('s-adet').value)||0;
    const t = parseFloat(document.getElementById('s-tutar').value)||0;
    if(!urun && t<=0){ toast('Urun veya tutar giriniz'); return; }
    satir.urun = urun; satir.gram = gram; satir.adet = adet; satir.tutar = t;
    document.getElementById('s-urun').value='';
    document.getElementById('s-gram').value='';
    document.getElementById('s-adet').value='1';
    document.getElementById('s-tutar').value='';
    document.querySelectorAll('.qbtn').forEach(b=>b.classList.remove('sel'));
  }
  satirlar.push(satir);
  renderSatirlar();
}

function delSatir(idx){
  satirlar.splice(idx,1);
  renderSatirlar();
}

function renderSatirlar(){
  const tb = document.getElementById('satirlar-tb');
  const ozet = document.getElementById('satirlar-ozet');
  const kb = document.getElementById('kalan-box-main');
  if(!satirlar.length){
    tb.innerHTML='<tr><td colspan="6"><div class="empty" style="padding:22px 0"><div class="empty-icon" style="font-size:24px">📋</div>Yukarıdan satır ekleyin<br><span style="font-size:11px;color:var(--text3)">SATIS / ALIS / NAKIT / HAVALE sırasıyla</span></div></td></tr>';
    ozet.style.display='none'; if(kb)kb.style.display='none';
    document.getElementById('kalan-disp').innerHTML='<span class="kalan-bos">BOS</span>';
    return;
  }
  const tipCls={SATIS:'str-satis',ALIS:'str-alis','NAKİT':'str-nakit',HAVALE:'str-havale'};
  const tipBadge={SATIS:'str-badge-s',ALIS:'str-badge-a','NAKİT':'str-badge-n',HAVALE:'str-badge-h'};
  let rows='';
  satirlar.forEach(function(s,i){
    const tc = s.tip==='SATIŞ'?'str-satis':s.tip==='ALIŞ'?'str-alis':s.tip==='NAKİT'?'str-nakit':'str-havale';
    const bc = s.tip==='SATIŞ'?'str-badge-s':s.tip==='ALIŞ'?'str-badge-a':s.tip==='NAKİT'?'str-badge-n':'str-badge-h';
    const gramStr = s.gram>0 ? fmtG(s.gram) : (s.adet>0 ? s.adet+' adet' : '-');
    rows += '<tr class="'+tc+'"><td style="font-size:11px;color:var(--text3);font-weight:600">'+(i+1)+'</td>';
    rows += '<td><span class="str-badge '+bc+'">'+s.tip+'</span></td>';
    rows += '<td style="font-weight:500">'+(s.urun||'-')+'</td>';
    rows += '<td style="font-family:JetBrains Mono,monospace;font-size:12px">'+gramStr+'</td>';
    rows += '<td style="text-align:right;font-family:JetBrains Mono,monospace;font-weight:600;font-size:13px">'+(s.tutar>0?fmt(s.tutar):'-')+'</td>';
    rows += '<td><button class="icon-btn" onclick="delSatir('+i+')" title="Sil">x</button></td></tr>';
  });
  tb.innerHTML = rows;

  const satisTop = satirlar.filter(function(s){return s.tip==='SATIŞ';}).reduce(function(a,s){return a+s.tutar;},0);
  const alisTop  = satirlar.filter(function(s){return s.tip==='ALIŞ';}).reduce(function(a,s){return a+s.tutar;},0);
  const odemeTop = satirlar.filter(function(s){return s.tip==='NAKİT'||s.tip==='HAVALE';}).reduce(function(a,s){return a+s.tutar;},0);
  let oz = '<div class="ozet-row">';
  if(satisTop>0) oz += '<div class="ozet-item"><div class="ozet-lbl">Satis</div><div class="ozet-val" style="color:var(--blue)">'+fmt(satisTop)+'</div></div>';
  if(alisTop>0)  oz += '<div class="ozet-item"><div class="ozet-lbl">Alis</div><div class="ozet-val" style="color:var(--green)">'+fmt(alisTop)+'</div></div>';
  if(odemeTop>0) oz += '<div class="ozet-item"><div class="ozet-lbl">Odeme</div><div class="ozet-val" style="color:var(--orange)">'+fmt(odemeTop)+'</div></div>';
  oz += '</div>';
  ozet.innerHTML = oz; ozet.style.display='';
  if(kb) kb.style.display='flex';
  calcKalan();

  // Havale satırı varsa banka onay checkbox'ını göster
  var havaleVar = satirlar.some(function(s){ return s.tip==='HAVALE'; });
  var bankaOnayWrap = document.getElementById('banka-onay-satir-wrap');
  if(bankaOnayWrap) bankaOnayWrap.style.display = havaleVar ? '' : 'none';
  if(!havaleVar){
    var bankaOnayChk = document.getElementById('i-banka-onay');
    if(bankaOnayChk) bankaOnayChk.checked = false;
  }
}

function calcKalanVal(){
  const satisTop = satirlar.filter(function(s){return s.tip==='SATIŞ';}).reduce(function(a,s){return a+s.tutar;},0);
  const alisTop  = satirlar.filter(function(s){return s.tip==='ALIŞ';}).reduce(function(a,s){return a+s.tutar;},0);
  const odemeTop = satirlar.filter(function(s){return s.tip==='NAKİT'||s.tip==='HAVALE';}).reduce(function(a,s){return a+s.tutar;},0);
  return satisTop - alisTop - odemeTop;
}



/* ════ BANKA YÖNETİMİ ════ */
let bankalar = JSON.parse(localStorage.getItem('ks_bankalar')||'[]');
function saveBankalar(){ localStorage.setItem('ks_bankalar', JSON.stringify(bankalar)); sbSet('ks_bankalar',bankalar); }

function addBanka(){
  const kisayol = (document.getElementById('banka-kisayol').value.trim()||'').toLowerCase();
  const ad = document.getElementById('banka-ad').value.trim();
  const tel = document.getElementById('banka-tel').value.trim().replace(/\s/g,'');
  if(!kisayol||!ad){ toast('Kisayol ve banka adi gerekli'); return; }
  if(bankalar.find(b=>b.kisayol===kisayol)){ toast('Bu kisayol zaten var: '+kisayol); return; }
  bankalar.push({id:Date.now(),kisayol,ad,tel});
  saveBankalar();
  document.getElementById('banka-kisayol').value='';
  document.getElementById('banka-ad').value='';
  document.getElementById('banka-tel').value='';
  renderBankaList(); renderBankaQbtns(); updateBankaDL(); renderWpBankaButtons();
  toast('Banka eklendi: '+kisayol+' = '+ad);
}

function delBanka(id){
  bankalar=bankalar.filter(b=>b.id!==id);
  saveBankalar();
  renderBankaList(); renderBankaQbtns(); updateBankaDL(); renderWpBankaButtons();
}

function renderBankaList(){
  const el=document.getElementById('banka-list'); if(!el) return;
  if(!bankalar.length){ el.innerHTML='<div style="font-size:12px;color:var(--text3);padding:6px 0">Henuz banka eklenmedi</div>'; return; }
  el.innerHTML=bankalar.map(b=>`
    <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:7px;background:#fff">
      <span class="banka-btn" style="cursor:default;min-width:36px;text-align:center">${b.kisayol}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${b.ad}</div>
        ${b.tel?'<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--text3)">'+b.tel+'</div>':'<div style="font-size:10px;color:var(--text3)">Telefon eklenmedi</div>'}
      </div>
      ${b.tel?`<button class="wp-btn" style="font-size:11px;padding:5px 10px" onclick="wpOpen('https://wa.me/'+${JSON.stringify(b.tel)})">WP</button>`:''}
      <button class="icon-btn" onclick="delBanka(${b.id})">x</button>
    </div>`).join('');
}

function renderBankaQbtns(){
  const wrap = document.getElementById('banka-qbtns');
  const outer = document.getElementById('banka-qbtns-wrap');
  if(!wrap) return;
  if(!bankalar.length){ wrap.innerHTML=''; if(outer)outer.style.display='none'; return; }
  if(outer) outer.style.display='flex';
  wrap.innerHTML = bankalar.map(b=>
    `<button type="button" class="banka-btn" onclick="setBanka('${b.ad.replace(/'/g,"\\'")}','${b.kisayol}')">${b.kisayol} – ${b.ad}</button>`
  ).join('');
}

function updateBankaDL(){
  const dl=document.getElementById('banka-dl'); if(!dl) return;
  dl.innerHTML=bankalar.map(b=>`<option value="${b.ad}">${b.kisayol} – ${b.ad}</option>`).join('');
}

function setBanka(ad, kisayol){
  const el = document.getElementById('s-detay');
  if(el){ el.value=ad; el.focus(); }
}

function bankaKisayolCoz(inp){
  const val = inp.value.trim().toLowerCase();
  const found = bankalar.find(b=>b.kisayol===val);
  if(found){ inp.value=found.ad; inp.style.color='var(--green)'; setTimeout(()=>inp.style.color='',800); }
}

function renderWpBankaButtons(){
  const wrap = document.getElementById('wp-banka-btns'); if(!wrap) return;
  const telli = bankalar.filter(b=>b.tel);
  if(!telli.length){ wrap.innerHTML=''; return; }
  wrap.innerHTML = telli.map(b=>
    `<button class="wp-blue" onclick="wpBankaGonder('${b.id}')" style="font-size:12px;padding:7px 12px">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.934 1.395 5.608L0 24l6.545-1.349A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.031-1.385l-.36-.214-3.733.769.794-3.617-.235-.372A9.772 9.772 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.418 0 9.818 4.398 9.818 9.818 0 5.418-4.4 9.818-9.818 9.818z"/></svg>
      🏦 WP ${b.ad}
    </button>`
  ).join('');
}

function buildIslemMesaj(){
  const musteri = document.getElementById('i-musteri').value.trim()||'PEŞİN MÜŞTERİ';
  let msg = 'İŞLEM ÖZETI\n━━━━━━━━━━━━━━━\n';
  msg += 'Müşteri: '+musteri+'\n';
  msg += 'Tarih: '+new Date().toLocaleDateString('tr-TR')+'\n━━━━━━━━━━━━━━━\n';
  satirlar.forEach(function(s){
    const tip = s.tip;
    let satir = tip+': ';
    if(s.urun) satir += s.urun+' ';
    if(s.gram>0) satir += '('+fmtG(s.gram)+') ';
    else if(s.adet>0) satir += '('+s.adet+' adet) ';
    if(s.tutar>0) satir += fmt(s.tutar);
    msg += satir+'\n';
  });
  const k = calcKalanVal();
  msg += '━━━━━━━━━━━━━━━\n';
  msg += 'KALAN: '+(k>0?fmt(k):'TAM ÖDENDİ')+'\n';
  return msg;
}

function wpMusteriGonder(){
  if(!satirlar.length){ toast('Önce satır ekleyin'); return; }
  const musteri = document.getElementById('i-musteri').value.trim();
  const m = musteriler.find(x=>x.isim===musteri);
  const msg = buildIslemMesaj();
  if(m&&m.tel){ window.open('https://wa.me/'+m.tel.replace(/\D/g,'')+'?text='+encodeURIComponent(msg),'_blank'); }
  else { wpOpen(msg); }
  toast('WP açılıyor...');
}

function wpBankaGonder(bankaId){
  if(!satirlar.length){ toast('Önce satır ekleyin'); return; }
  const banka = bankalar.find(b=>b.id==bankaId);
  if(!banka||!banka.tel){ toast('Banka telefonu bulunamadı'); return; }
  const msg = buildIslemMesaj();
  window.open('https://wa.me/'+banka.tel.replace(/\D/g,'')+'?text='+encodeURIComponent(msg),'_blank');
  toast('WP '+banka.ad+' açılıyor...');
}

/* setSatirTip override removed */


/* ════ GRAM ÇEVİRME ════ */
/* ════ CARİ EKLEME ════ */
var _ceMusteriId = 0, _ceTip = 'borc';

function cariEkleAc(id, tip){
  _ceMusteriId = id;
  _ceTip = tip;
  var m = musteriler.find(function(x){return x.id===id;});
  if(!m) return;
  var baslik = tip==='borc' ? '➕ Gram Borcu Ekle' : '➕ Gram Alacağı Ekle';
  document.getElementById('ce-baslik').textContent = baslik;
  document.getElementById('ce-musteri-lbl').textContent = m.isim;
  document.getElementById('ce-urun').value = '';
  document.getElementById('ce-gram').value = '';
  document.getElementById('cari-ekle-modal').classList.add('open');
  setTimeout(function(){ document.getElementById('ce-gram').focus(); }, 100);
}

function cariEkleKapat(){
  document.getElementById('cari-ekle-modal').classList.remove('open');
}

function cariEkleKaydet(){
  var urun = document.getElementById('ce-urun').value.trim() || (_ceTip==='borc'?'Borç':'Alacak');
  var m = musteriler.find(function(x){return x.id===_ceMusteriId;});
  if(!m){ toast('Müşteri bulunamadı'); return; }
  if(!m.cariHesap) m.cariHesap = [];
  var gramVal = (document.getElementById('ce-gram').value+'').replace(',','.');
  var gram = parseFloat(gramVal)||0;
  if(gram<=0){ toast('Gram veya adet giriniz'); return; }
  // Nokta içermiyorsa ve çok küçük değilse → adet olabilir (kullanıcı 5 yazdıysa adet)
  var isAdet = !gramVal.includes('.') && !gramVal.includes(',') && gram === Math.floor(gram) && gram < 1000;
  var entry = { id:Date.now(), tarih:new Date().toLocaleDateString('tr-TR'), tip:_ceTip, urun:urun, gram: isAdet?0:gram, adet: isAdet?gram:0 };
  m.cariHesap.push(entry);
  m.cariGram = m.cariHesap.reduce(function(a,e){ return a+(e.tip==='borc'?e.gram:-e.gram); }, 0);
  save(); renderMusteri();
  var gosterim = isAdet ? (gram+' adet '+urun) : (fmtG(gram)+' '+urun);
  toast('✓ ' + gosterim + ' ' + (_ceTip==='borc'?'borç':'alacak') + ' eklendi');
  cariEkleKapat();
}

function cariDetayAc(id){
  var m = musteriler.find(function(x){return x.id===id;});
  if(!m) return;
  var hesap = m.cariHesap||[];
  document.getElementById('cd-baslik').textContent = m.isim + ' — Cari Hesap';
  var toplamGram = m.cariGram||0;
  var ozetTxt = toplamGram>0 ? 'Toplam Borç: '+fmtG(toplamGram) : toplamGram<0 ? 'Toplam Alacak: '+fmtG(Math.abs(toplamGram)) : 'Bakiye yok';
  document.getElementById('cd-ozet').textContent = ozetTxt;
  var el = document.getElementById('cd-liste');
  if(!hesap.length){
    el.innerHTML='<div class="empty">Henüz cari kayıt yok</div>';
  } else {
    var rows = '<table style="width:100%;border-collapse:collapse;font-size:13px">'
      + '<thead><tr style="background:var(--surface2)">'
      + '<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:2px solid var(--border2)">Tarih</th>'
      + '<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:2px solid var(--border2)">Tür</th>'
      + '<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:2px solid var(--border2)">Ürün</th>'
      + '<th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:2px solid var(--border2)">Gram</th>'
      + '<th style="padding:8px 12px;border-bottom:2px solid var(--border2)"></th>'
      + '</tr></thead><tbody>';
    hesap.forEach(function(e,i){
      var renk = e.tip==='borc' ? 'var(--red)' : 'var(--green)';
      var etiket = e.tip==='borc' ? 'BORÇ' : 'ALACAK';
      rows += '<tr style="border-bottom:1px solid var(--border)">'
        + '<td style="padding:9px 12px;font-size:11px;color:var(--text3)">'+e.tarih+'</td>'
        + '<td style="padding:9px 12px"><span style="background:'+(e.tip==='borc'?'var(--red-light)':'var(--green-light)')+';color:'+renk+';padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">'+etiket+'</span></td>'
        + '<td style="padding:9px 12px;font-weight:600">'+e.urun+'</td>'
        + '<td style="padding:9px 12px;text-align:right;font-family:JetBrains Mono,monospace;font-weight:700;color:'+renk+'">'+(e.adet>0?(e.adet+' adet'):fmtG(e.gram))+'</td>'
        + '<td style="padding:9px 12px;text-align:right"><button class="icon-btn" onclick="cariSatirSil('+id+','+e.id+')">✕</button></td>'
        + '</tr>';
    });
    // Toplam satırı
    rows += '<tr style="background:var(--surface2);border-top:2px solid var(--border2)">'
      + '<td colspan="3" style="padding:10px 12px;font-weight:700;font-size:12px">TOPLAM</td>'
      + '<td style="padding:10px 12px;text-align:right;font-family:JetBrains Mono,monospace;font-weight:700;font-size:14px;color:'+(toplamGram>=0?'var(--red)':'var(--green)')+'">'+fmtG(Math.abs(toplamGram))+'</td>'
      + '<td></td></tr>';
    rows += '</tbody></table>';
    el.innerHTML = rows;
  }
  document.getElementById('cari-detay-modal').classList.add('open');
}

function cariSatirSil(musteriId, kayitId){
  if(!confirm('Bu kayıt silinsin mi?')) return;
  var m = musteriler.find(function(x){return x.id===musteriId;});
  if(!m||!m.cariHesap) return;
  m.cariHesap = m.cariHesap.filter(function(e){return e.id!==kayitId;});
  m.cariGram = m.cariHesap.reduce(function(a,e){ return a+(e.tip==='borc'?e.gram:-e.gram); }, 0);
  save(); renderMusteri();
  cariDetayAc(musteriId); // Refresh modal
}

var _gcMusteri = '', _gcKalan = 0;

function openGramCevir(musteri, kalan){
  _gcMusteri = musteri;
  _gcKalan = kalan;
  document.getElementById('gc-musteri-lbl').textContent = musteri + ' için';
  document.getElementById('gc-kalan-lbl').textContent = fmt(kalan);
  document.getElementById('gc-gram-fiyat').value = gf();
  document.getElementById('gc-gram-manuel').value = '';
  document.getElementById('gc-urun').value = '';
  document.getElementById('gc-adet').value = '';
  document.querySelectorAll('#gram-cevir-modal .qbtn').forEach(function(b){ b.classList.remove('sel'); });
  gcSetTip('gram');
  gcHesapla();
  setTimeout(function(){ document.getElementById('gc-urun').focus(); }, 100);
  document.getElementById('gram-cevir-modal').classList.add('open');
}

function closeGramCevir(){
  document.getElementById('gram-cevir-modal').classList.remove('open');
}

function gcHesapla(){
  var gf2 = parseFloat(document.getElementById('gc-gram-fiyat').value)||0;
  var lbl = document.getElementById('gc-gram-lbl');
  if(gf2>0) lbl.textContent = fmtG(_gcKalan/gf2);
  else lbl.textContent = '—';
}
var _gcOlcumTip = 'gram';

function gcUrunSec(el, urun, olcumTip){
  document.getElementById('gc-urun').value = urun;
  document.querySelectorAll('#gram-cevir-modal .qbtn').forEach(function(b){ b.classList.remove('sel'); });
  el.classList.add('sel');
  gcSetTip(olcumTip);
}

function gcSetTip(tip){
  _gcOlcumTip = tip;
  document.getElementById('gc-gram-bolum').style.display = tip==='gram' ? '' : 'none';
  document.getElementById('gc-adet-bolum').style.display = tip==='adet' ? '' : 'none';
  var btnG = document.getElementById('gc-tip-gram');
  var btnA = document.getElementById('gc-tip-adet');
  btnG.className = 'stip-btn' + (tip==='gram' ? ' sp-s' : '');
  btnA.className = 'stip-btn' + (tip==='adet' ? ' sp-s' : '');
}

function gcGetGram(){
  var manuel = (document.getElementById('gc-gram-manuel').value+'').replace(',','.');
  var m = parseFloat(manuel)||0;
  if(m>0) return m;
  var gf2 = parseFloat(document.getElementById('gc-gram-fiyat').value)||0;
  return gf2>0 ? _gcKalan/gf2 : 0;
}

function gramCeviriKaydet(){
  var urun = document.getElementById('gc-urun').value.trim() || 'Kalan';
  var m = musteriler.find(function(x){ return x.isim === _gcMusteri; });
  if(!m){
    // Kayıtsız müşteri - otomatik kayıt et
    m = {id: Date.now(), isim: _gcMusteri, tel: '', cariHesap: [], cariGram: 0};
    musteriler.push(m);
    updateDL();
  }
  if(!m.cariHesap) m.cariHesap = [];
  var entry = { id:Date.now(), tarih:new Date().toLocaleDateString('tr-TR'), tip:'borc', urun:urun };
  var mesaj = '';
  if(_gcOlcumTip === 'adet'){
    var adet = parseInt(document.getElementById('gc-adet').value)||0;
    if(adet<=0){ toast('Adet giriniz'); return; }
    entry.adet = adet; entry.gram = 0;
    mesaj = adet + ' adet ' + urun;
  } else {
    var gram = gcGetGram();
    if(gram<=0){ toast('Gram fiyatı veya manuel gram giriniz'); return; }
    entry.gram = gram; entry.adet = 0;
    mesaj = fmtG(gram) + ' ' + urun;
  }
  m.cariHesap.push(entry);
  m.cariGram = m.cariHesap.reduce(function(a,e){ return a+(e.tip==='borc'?e.gram:-e.gram); }, 0);
  // Kalan TL'yi sıfırla — gram'a çevrildi
  var sonIslem = islemler.find(function(x){ return x.musteri === _gcMusteri && x.kalan_tl > 0; });
  if(sonIslem){ sonIslem.kalan_tl = 0; sonIslem.kalan_gram = 0; }
  save(); renderMusteri(); renderIslemler();
  toast('✓ ' + mesaj + ' cari borç eklendi, TL kalan sıfırlandı');
  closeGramCevir();
}

// INIT
/* ════ ÖZEL HIZLI TUŞLAR ════ */
let ozelTuslar = JSON.parse(localStorage.getItem('ks_ot')||'[]');
function saveOzelTuslar(){ localStorage.setItem('ks_ot', JSON.stringify(ozelTuslar)); }

function addOzelTus(){
  var ad = document.getElementById('ot-ad').value.trim();
  var tip = document.getElementById('ot-tip').value;
  if(!ad){ toast('Ürün adı giriniz'); return; }
  ozelTuslar.push({id:Date.now(), ad:ad, tip:tip});
  saveOzelTuslar();
  document.getElementById('ot-ad').value='';
  renderOzelTusList();
  renderOzelTusButtons();
  toast('Tuş eklendi: '+ad);
}

function delOzelTus(id){
  ozelTuslar = ozelTuslar.filter(function(t){return t.id!==id;});
  saveOzelTuslar();
  renderOzelTusList();
  renderOzelTusButtons();
}

function renderOzelTusList(){
  var el = document.getElementById('ozel-tus-list'); if(!el) return;
  if(!ozelTuslar.length){ el.innerHTML='<div style="font-size:12px;color:var(--text3);padding:4px 0">Henüz özel tuş eklenmedi</div>'; return; }
  el.innerHTML = ozelTuslar.map(function(t){
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:6px;background:#fff">'
      +'<span class="qbtn" style="cursor:default">'+t.ad+'</span>'
      +'<span style="font-size:11px;color:var(--text3)">'+t.tip+'</span>'
      +'<button class="icon-btn" style="margin-left:auto" onclick="delOzelTus('+t.id+')">x</button>'
      +'</div>';
  }).join('');
}

function renderOzelTusButtons(){
  var wrap = document.getElementById('ozel-tus-wrap'); if(!wrap) return;
  if(!ozelTuslar.length){ wrap.innerHTML=''; return; }
  wrap.innerHTML = ozelTuslar.map(function(t){
    var esc = function(s){ return s.replace(/'/g,"\\'"); };
    var isAdet = t.tip === 'adet';
    // Kurumsal ikon — ürün tipine göre nötr semboller
    var ad = t.ad.toLowerCase();
    var ikon;
    if(ad.indexOf('bilezik')!==-1||ad.indexOf('burma')!==-1) ikon='◈';
    else if(ad.indexOf('kolye')!==-1||ad.indexOf('zincir')!==-1) ikon='◇';
    else if(ad.indexOf('yüzük')!==-1||ad.indexOf('yuzuk')!==-1) ikon='○';
    else if(ad.indexOf('ata')!==-1||ad.indexOf('cumhur')!==-1) ikon='◆';
    else if(ad.indexOf('çeyrek')!==-1||ad.indexOf('ceyrek')!==-1) ikon='◈';
    else if(ad.indexOf('yarım')!==-1||ad.indexOf('yarim')!==-1) ikon='◈';
    else if(ad.indexOf('tam')!==-1) ikon='◈';
    else if(ad.indexOf('hurda')!==-1) ikon='▣';
    else if(ad.indexOf('gram')!==-1) ikon='▤';
    else if(isAdet) ikon='◇';
    else ikon='◈';

    return '<button type="button" draggable="true" data-tid="'+t.id+'" onclick="hizliEkleAc(this,\''+esc(t.ad)+'\',\''+t.tip+'\')" '
      +'style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;'
      +'padding:8px 16px;min-width:84px;min-height:54px;'
      +'background:linear-gradient(160deg,#1c1a10,#2a2412);'
      +'border:1px solid rgba(196,154,46,.3);border-radius:8px;'
      +'cursor:grab;transition:all .18s;font-family:var(--font-body);'
      +'box-shadow:0 1px 6px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.04)"'
      +' onmouseover="this.style.background=\'linear-gradient(160deg,#252210,#332d16)\';this.style.borderColor=\'rgba(196,154,46,.7)\';this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 18px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.06)\'"'
      +' onmouseout="this.style.background=\'linear-gradient(160deg,#1c1a10,#2a2412)\';this.style.borderColor=\'rgba(196,154,46,.3)\';this.style.transform=\'\';this.style.boxShadow=\'0 1px 6px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.04)\'">'
      +'<span style="font-size:12px;color:rgba(232,184,75,.55);line-height:1">'+ikon+'</span>'
      +'<span style="font-size:10.5px;font-weight:700;color:#e8c97a;text-align:center;line-height:1.2;white-space:nowrap;letter-spacing:.03em">'+t.ad+'</span>'
      +'</button>';
  }).join('');

  // Sürükle-bırak sıralama
  var dragSrc = null;
  wrap.querySelectorAll('button[draggable]').forEach(function(btn){
    btn.addEventListener('dragstart', function(e){
      dragSrc = this;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    btn.addEventListener('dragend', function(){
      this.classList.remove('dragging');
      wrap.querySelectorAll('button').forEach(function(b){ b.classList.remove('drag-over'); });
    });
    btn.addEventListener('dragover', function(e){
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if(this !== dragSrc){
        wrap.querySelectorAll('button').forEach(function(b){ b.classList.remove('drag-over'); });
        this.classList.add('drag-over');
      }
    });
    btn.addEventListener('drop', function(e){
      e.preventDefault();
      if(this === dragSrc) return;
      var srcId = parseInt(dragSrc.dataset.tid);
      var dstId = parseInt(this.dataset.tid);
      var srcIdx = ozelTuslar.findIndex(function(t){ return t.id===srcId; });
      var dstIdx = ozelTuslar.findIndex(function(t){ return t.id===dstId; });
      if(srcIdx===-1||dstIdx===-1) return;
      var item = ozelTuslar.splice(srcIdx, 1)[0];
      ozelTuslar.splice(dstIdx, 0, item);
      save();
      renderOzelTusButtons();
      renderOzelTusList();
      toast('✓ Sıralama güncellendi');
    });
  });
}


/* ════ GÜNLÜK DEVİR ════ */
function gunlukDevir(){
  if(!islemler.length){ toast('⚠️ Bugün işlem yok, devredilecek bir şey bulunamadı'); return; }
  var tarih = new Date().toLocaleDateString('tr-TR');
  var saat  = new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});

  // Günün özeti
  var satisTop   = islemler.reduce(function(a,i){ return a+(i.tutar||0); },0);
  var nakitTop   = islemler.reduce(function(a,i){ return a+(i.nakit||0); },0);
  var havaleTop  = islemler.reduce(function(a,i){ return a+(i.havale||0); },0);
  var kalanTop   = islemler.reduce(function(a,i){ return a+(i.kalan_tl||0); },0);

  // Mevcut günde aynı tarih var mı? → üstüne ekle
  var mevcutGun = gecmisGunler.find(function(g){ return g.tarih===tarih; });
  if(mevcutGun){
    mevcutGun.islemler = mevcutGun.islemler.concat(islemler);
    mevcutGun.satisTop  += satisTop;
    mevcutGun.nakitTop  += nakitTop;
    mevcutGun.havaleTop += havaleTop;
    mevcutGun.kalanTop  += kalanTop;
    mevcutGun.saat       = saat; // son güncelleme saati
  } else {
    gecmisGunler.unshift({
      id: Date.now(),
      tarih: tarih,
      saat: saat,
      islemler: [...islemler],
      satisTop: satisTop,
      nakitTop: nakitTop,
      havaleTop: havaleTop,
      kalanTop: kalanTop
    });
  }

  islemler = [];
  save();
  renderIslemler();
  updateGecmisCnt();
  toast('✅ ' + tarih + ' günü devredildi — '+islemler.length+' işlem arşivlendi');
  showTab('gecmis');
}

function updateGecmisCnt(){
  var cnt = document.getElementById('gecmis-cnt');
  if(!cnt) return;
  if(gecmisGunler.length>0){ cnt.textContent=gecmisGunler.length; cnt.style.display='inline-block'; }
  else { cnt.style.display='none'; }
}

function renderGecmisIslemler(){
  var araEl = document.getElementById('gecmis-ara');
  var araVal = araEl ? araEl.value.toLowerCase() : '';
  var tarihSec = (document.getElementById('gecmis-tarih-filtre')||{}).value||'';

  // Tarih dropdown'ı güncelle
  var ddEl = document.getElementById('gecmis-tarih-filtre');
  if(ddEl){
    var mevcut = ddEl.value;
    var tarihler = [...new Set(gecmisGunler.map(function(g){return g.tarih;}))];
    ddEl.innerHTML = '<option value="">Tüm Günler</option>';
    tarihler.forEach(function(t){
      var opt = document.createElement('option');
      opt.value = t; opt.textContent = t;
      if(t===mevcut) opt.selected = true;
      ddEl.appendChild(opt);
    });
    tarihSec = ddEl.value;
  }

  var el = document.getElementById('gecmis-list');
  var ozetBar = document.getElementById('gecmis-ozet-bar');

  if(!gecmisGunler.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">📅</div>Henüz devredilmiş gün yok<br><span style="font-size:11px;color:var(--text3)">Satış & Alış ekranında "Günü Kapat & Devret" butonunu kullanın</span></div>';
    if(ozetBar) ozetBar.innerHTML='';
    return;
  }

  // Filtrele
  var gunler = gecmisGunler.filter(function(g){
    if(tarihSec && g.tarih!==tarihSec) return false;
    if(!araVal) return true;
    return g.islemler.some(function(i){
      return (i.musteri||'').toLowerCase().includes(araVal)
          || (i.urun||'').toLowerCase().includes(araVal)
          || (i.durum||'').toLowerCase().includes(araVal);
    });
  });

  // Genel özet
  if(ozetBar){
    var topSatis=0,topNakit=0,topHavale=0,topKalan=0,topIslem=0;
    gecmisGunler.forEach(function(g){
      topSatis  += g.satisTop||0;
      topNakit  += g.nakitTop||0;
      topHavale += g.havaleTop||0;
      topKalan  += g.kalanTop||0;
      topIslem  += (g.islemler||[]).length;
    });
    ozetBar.innerHTML=
      '<div class="ozet-item"><span class="ozet-lbl">Toplam İşlem</span><span class="ozet-val">'+topIslem+'</span></div>'
     +'<div class="ozet-item"><span class="ozet-lbl">Toplam Satış</span><span class="ozet-val" style="color:var(--blue)">'+fmt(topSatis)+'</span></div>'
     +'<div class="ozet-item"><span class="ozet-lbl">Nakit Tahsilat</span><span class="ozet-val" style="color:var(--green)">'+fmt(topNakit)+'</span></div>'
     +'<div class="ozet-item"><span class="ozet-lbl">Havale Tahsilat</span><span class="ozet-val" style="color:var(--purple)">'+fmt(topHavale)+'</span></div>'
     +'<div class="ozet-item"><span class="ozet-lbl">Kalan Alacak</span><span class="ozet-val" style="color:var(--red)">'+fmt(topKalan)+'</span></div>';
  }

  if(!gunler.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">🔍</div>Arama sonucu bulunamadı</div>';
    return;
  }

  el.innerHTML = gunler.map(function(g){
    // Gün işlemlerini ara ile filtrele
    var gunIslemleri = g.islemler;
    if(araVal){
      gunIslemleri = gunIslemleri.filter(function(i){
        return (i.musteri||'').toLowerCase().includes(araVal)
            || (i.urun||'').toLowerCase().includes(araVal)
            || (i.durum||'').toLowerCase().includes(araVal);
      });
    }

    var rows = gunIslemleri.map(function(i){
      var islendi = i.islendi||false;
      var rowStyle = islendi ? 'background:linear-gradient(90deg,#fef9c3,#fefce8);' : (i.kalan_tl>0?'background:#fff8f8;':'');
      var borderL  = islendi ? 'border-left:3px solid #eab308;' : (i.kalan_tl>0?'border-left:3px solid var(--red);':(i.kalan_tl<0?'border-left:3px solid var(--blue);':''));
      var durumBadgeHtml = '';
      var d=i.durum||'';
      if(d==='SATIŞ'||d==='EMANETTEN SATIŞ') durumBadgeHtml='<span class="badge bd-s">'+d+'</span>';
      else if(d==='ALIŞ'||d==='EMANETE ALIŞ') durumBadgeHtml='<span class="badge bd-a">'+d+'</span>';
      else if(d==='SİPARİŞ')                  durumBadgeHtml='<span class="badge bd-sp">'+d+'</span>';
      else if(d.includes('BORÇ'))              durumBadgeHtml='<span class="badge bd-b">'+d+'</span>';
      else                                     durumBadgeHtml='<span class="badge bd-e">'+d+'</span>';
      var kalan = i.kalan_tl||0;
      var kalanHtml = kalan===0
        ? '<span style="color:var(--green);font-weight:700;font-size:11px">✓ Ödendi</span>'
        : (kalan>0
            ? '<span style="color:var(--red);font-weight:700;font-family:JetBrains Mono,monospace;font-size:12px">'+fmt(kalan)+'</span>'
            : '<span style="color:var(--blue);font-weight:700;font-family:JetBrains Mono,monospace;font-size:12px">↑ '+fmt(Math.abs(kalan))+'</span>');
      return '<tr style="'+rowStyle+borderL+'">'
        +'<td style="padding:9px 10px;font-size:12px;color:var(--text2)">'+i.saat+'</td>'
        +'<td style="padding:9px 10px;font-size:12px;font-weight:600">'+i.musteri+'</td>'
        +'<td style="padding:9px 10px">'+durumBadgeHtml+'</td>'
        +'<td style="padding:9px 10px;font-size:12px;color:var(--text)">'+( i.urun||i.bilezikTuru||'—' )+'</td>'
        +'<td style="padding:9px 10px;font-family:JetBrains Mono,monospace;font-size:12px;color:var(--text2)">'+(i.gram?fmtG(i.gram):'—')+'</td>'
        +'<td style="padding:9px 10px;font-family:JetBrains Mono,monospace;font-size:12px;font-weight:700">'+fmt(i.tutar||0)+'</td>'
        +'<td style="padding:9px 10px">'+kalanHtml+'</td>'
        +'</tr>';
    }).join('');

    var gunSatisTop = gunIslemleri.reduce(function(a,i){return a+(i.tutar||0);},0);
    var gunKalanTop = gunIslemleri.reduce(function(a,i){return a+(i.kalan_tl||0);},0);

    return '<div style="border:1px solid var(--border);border-radius:var(--radius);margin-bottom:12px;background:#fff;overflow:hidden">'
      // Gün başlığı
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 16px;background:linear-gradient(135deg,#18150a,#2a2412);cursor:pointer" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\'">'
        +'<div style="display:flex;align-items:center;gap:12px">'
          +'<span style="font-size:15px">📅</span>'
          +'<div>'
            +'<div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:700;color:#e8b84b">'+g.tarih+'</div>'
            +'<div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:1px">Son güncelleme: '+g.saat+'</div>'
          +'</div>'
        +'</div>'
        +'<div style="display:flex;gap:16px;align-items:center">'
          +'<div style="text-align:right"><div style="font-size:9px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.05em">İşlem</div><div style="font-size:14px;font-weight:700;color:#e8b84b">'+gunIslemleri.length+'</div></div>'
          +'<div style="text-align:right"><div style="font-size:9px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.05em">Satış</div><div style="font-size:14px;font-weight:700;color:#e8b84b">'+fmt(gunSatisTop)+'</div></div>'
          +(gunKalanTop>0?'<div style="text-align:right"><div style="font-size:9px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.05em">Kalan</div><div style="font-size:14px;font-weight:700;color:#fca5a5">'+fmt(gunKalanTop)+'</div></div>':'')
          +'<button onclick="event.stopPropagation();gecmisGunSil(\''+g.id+'\')" style="padding:4px 10px;border:1px solid rgba(255,100,100,.4);border-radius:20px;background:transparent;color:rgba(255,150,150,.8);font-size:10px;font-weight:700;cursor:pointer;font-family:var(--font-body)">Sil</button>'
          +'<span style="color:rgba(255,255,255,.35);font-size:16px">▼</span>'
        +'</div>'
      +'</div>'
      // Tablo (varsayılan gizli)
      +'<div style="display:none">'
        +(rows ? '<div class="tbl-wrap" style="border:none;border-radius:0;box-shadow:none"><table style="min-width:600px"><thead><tr><th>Saat</th><th>Müşteri</th><th>Durum</th><th>Ürün</th><th>Gram</th><th>Tutar</th><th>Kalan</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
                : '<div class="empty" style="padding:18px">Arama sonucu bu günde yok</div>')
      +'</div>'
    +'</div>';
  }).join('');
  updateGecmisCnt();
}

function gecmisGunSil(gunId){
  if(!confirm('Bu günün tüm kayıtları silinsin mi?')) return;
  gecmisGunler = gecmisGunler.filter(function(g){ return g.id != gunId; });
  save(); renderGecmisIslemler();
  toast('Gün silindi');
}

function gecmisTumunuSil(){
  if(!confirm('Tüm geçmiş işlemler kalıcı olarak silinsin mi?')) return;
  gecmisGunler = [];
  save(); renderGecmisIslemler();
  toast('Geçmiş temizlendi');
}

// Başlatma: DOMContentLoaded ile yapılıyor



/* ════ GÜNLÜK RAPOR ════════════════════════════════════════ */

function raporTarihBugune(){
  var bugun = new Date().toISOString().split('T')[0];
  document.getElementById('rapor-tarih').value = bugun;
  renderGunlukRapor();
}

function raporTarihStr(){
  var v = document.getElementById('rapor-tarih').value;
  if(!v) return new Date().toLocaleDateString('tr-TR');
  var p = v.split('-');
  return p[2]+'.'+p[1]+'.'+p[0];
}

function renderGunlukRapor(){
  // Tarih init
  var tarihInput = document.getElementById('rapor-tarih');
  if(!tarihInput.value) tarihInput.value = new Date().toISOString().split('T')[0];
  var seciliTarih = raporTarihStr();

  var gunIslemleri = islemler.filter(function(i){ return i.tarih === seciliTarih; });

  var bosEl = document.getElementById('rapor-bos');
  var kasaBar = document.getElementById('rapor-kasa-bar');
  var durumTablo = document.getElementById('rapor-durum-tablo');
  var gramBar = document.getElementById('rapor-gram-bar');
  var kalanWrap = document.getElementById('rapor-kalan-wrap');
  var cntEl = document.getElementById('rapor-islem-cnt');

  if(!gunIslemleri.length){
    bosEl.style.display='';
    kasaBar.innerHTML=''; durumTablo.innerHTML=''; gramBar.innerHTML=''; kalanWrap.innerHTML='';
    if(cntEl) cntEl.textContent='';
    return;
  }
  bosEl.style.display='none';
  if(cntEl) cntEl.textContent = gunIslemleri.length + ' işlem';

  /* ── 1. KASA KARTI ── */
  var nakitGiris=0, nakitCikis=0, havaleGiris=0, hataleCikis=0;

  // Nakit hareketlerinden bugünküleri
  nakitHareketler.filter(function(h){ return h.tarih===seciliTarih; }).forEach(function(h){
    if(h.tip==='giris') nakitGiris+=h.tutar;
    else nakitCikis+=h.tutar;
  });

  // Banka hareketlerinden bugünküleri
  bankaHareketleri.filter(function(h){ return h.tarih===seciliTarih; }).forEach(function(h){
    if(h.yon==='cikis') hataleCikis+=h.tutar;
    else havaleGiris+=h.tutar;
  });

  function kasaKart(ikon, baslik, tutar, renk, bg){
    return '<div style="padding:12px 16px;background:'+bg+';border:1.5px solid '+renk+';border-radius:var(--radius-sm)">'
      +'<div style="font-size:10px;font-weight:700;color:'+renk+';text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">'+ikon+' '+baslik+'</div>'
      +'<div style="font-size:18px;font-weight:800;font-family:JetBrains Mono,monospace;color:'+renk+'">'+fmt(tutar)+'</div>'
      +'</div>';
  }
  kasaBar.innerHTML =
    kasaKart('📥','Nakit Giriş',   nakitGiris,  'var(--green)', 'var(--green-light)') +
    kasaKart('📤','Nakit Çıkış',   nakitCikis,  'var(--red)',   'var(--red-light)') +
    kasaKart('📥','Havale Giriş',  havaleGiris, 'var(--blue)',  'var(--blue-light)') +
    kasaKart('📤','Havale Çıkış',  hataleCikis, 'var(--orange)','var(--orange-light)') +
    kasaKart('🪙','Net Nakit',     nakitGiris-nakitCikis, nakitGiris>=nakitCikis?'var(--green)':'var(--red)', nakitGiris>=nakitCikis?'var(--green-light)':'var(--red-light)') +
    kasaKart('🏦','Net Havale',    havaleGiris-hataleCikis, havaleGiris>=hataleCikis?'var(--blue)':'var(--orange)', havaleGiris>=hataleCikis?'var(--blue-light)':'var(--orange-light)');

  /* ── 2. DURUM BAZLI TABLO ── */
  var durumMap = {};
  gunIslemleri.forEach(function(i){
    var d = i.durum || 'DİĞER';
    if(!durumMap[d]) durumMap[d] = { sayi:0, satirTop:0, alisTop:0, gramTop:0, nakit:0, havale:0, kalan:0, islemler:[] };
    var g = durumMap[d];
    g.sayi++;
    g.satirTop += (i.tutar||0);
    g.alisTop  += (i.alisTutar||0);
    g.gramTop  += (i.gram||0) + (i.alisGram||0);
    g.nakit    += (i.nakit||0);
    g.havale   += (i.havale||0);
    if(i.kalan_tl>0) g.kalan += i.kalan_tl;
    g.islemler.push(i);
  });

  var tablo = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">'
    +'<thead><tr style="background:linear-gradient(135deg,#18150a,#2a2412)">'
    +'<th style="padding:9px 12px;text-align:left;color:#e8b84b;font-size:10px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">İşlem Türü</th>'
    +'<th style="padding:9px 10px;text-align:center;color:#e8b84b;font-size:10px;letter-spacing:.06em;text-transform:uppercase">Adet</th>'
    +'<th style="padding:9px 10px;text-align:right;color:#e8b84b;font-size:10px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Satış Tutar</th>'
    +'<th style="padding:9px 10px;text-align:right;color:#e8b84b;font-size:10px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Alış Tutar</th>'
    +'<th style="padding:9px 10px;text-align:right;color:#e8b84b;font-size:10px;letter-spacing:.06em;text-transform:uppercase">Gram</th>'
    +'<th style="padding:9px 10px;text-align:right;color:#e8b84b;font-size:10px;letter-spacing:.06em;text-transform:uppercase">Nakit</th>'
    +'<th style="padding:9px 10px;text-align:right;color:#e8b84b;font-size:10px;letter-spacing:.06em;text-transform:uppercase">Havale</th>'
    +'<th style="padding:9px 10px;text-align:right;color:#e8b84b;font-size:10px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">Kalan</th>'
    +'</tr></thead><tbody>';

  var topSatisTutar=0, topAlisTutar=0, topGram=0, topNakit=0, topHavale=0, topKalan=0;
  var satirNo=0;
  Object.keys(durumMap).forEach(function(d){
    var g = durumMap[d];
    var cikis = isCikisDurum(d);
    var bg = satirNo%2===0 ? '#fff' : 'var(--surface2)';
    satirNo++;
    tablo += '<tr style="background:'+bg+';border-bottom:1px solid var(--border)">'
      +'<td style="padding:9px 12px"><span style="display:inline-flex;align-items:center;gap:6px">'
        +'<span style="font-size:10px;padding:2px 8px;border-radius:10px;font-weight:700;'+(cikis?'background:var(--red-light);color:var(--red)':'background:var(--green-light);color:var(--green)')+';">'+(cikis?'📤 ÇIKIŞ':'📥 GİRİŞ')+'</span>'
        +'<b>'+d+'</b>'
      +'</span></td>'
      +'<td style="padding:9px 10px;text-align:center;font-weight:700">'+g.sayi+'</td>'
      +'<td style="padding:9px 10px;text-align:right;font-family:JetBrains Mono,monospace;font-weight:600">'+(g.satirTop>0?fmt(g.satirTop):'-')+'</td>'
      +'<td style="padding:9px 10px;text-align:right;font-family:JetBrains Mono,monospace;font-weight:600">'+(g.alisTop>0?fmt(g.alisTop):'-')+'</td>'
      +'<td style="padding:9px 10px;text-align:right;font-family:JetBrains Mono,monospace">'+(g.gramTop>0?fmtG(g.gramTop):'-')+'</td>'
      +'<td style="padding:9px 10px;text-align:right;font-family:JetBrains Mono,monospace;color:var(--green)">'+(g.nakit>0?fmt(g.nakit):'-')+'</td>'
      +'<td style="padding:9px 10px;text-align:right;font-family:JetBrains Mono,monospace;color:var(--blue)">'+(g.havale>0?fmt(g.havale):'-')+'</td>'
      +'<td style="padding:9px 10px;text-align:right;font-family:JetBrains Mono,monospace;color:var(--red);font-weight:700">'+(g.kalan>0?fmt(g.kalan):'-')+'</td>'
      +'</tr>';
    topSatisTutar+=g.satirTop; topAlisTutar+=g.alisTop; topGram+=g.gramTop;
    topNakit+=g.nakit; topHavale+=g.havale; topKalan+=g.kalan;
  });

  // Toplam satırı
  tablo += '<tr style="background:linear-gradient(135deg,#fef9c3,#fefce8);border-top:2px solid #eab308;font-weight:700">'
    +'<td style="padding:10px 12px;font-weight:800">TOPLAM</td>'
    +'<td style="padding:10px;text-align:center">'+gunIslemleri.length+'</td>'
    +'<td style="padding:10px;text-align:right;font-family:JetBrains Mono,monospace">'+(topSatisTutar>0?fmt(topSatisTutar):'-')+'</td>'
    +'<td style="padding:10px;text-align:right;font-family:JetBrains Mono,monospace">'+(topAlisTutar>0?fmt(topAlisTutar):'-')+'</td>'
    +'<td style="padding:10px;text-align:right;font-family:JetBrains Mono,monospace">'+(topGram>0?fmtG(topGram):'-')+'</td>'
    +'<td style="padding:10px;text-align:right;font-family:JetBrains Mono,monospace;color:var(--green)">'+(topNakit>0?fmt(topNakit):'-')+'</td>'
    +'<td style="padding:10px;text-align:right;font-family:JetBrains Mono,monospace;color:var(--blue)">'+(topHavale>0?fmt(topHavale):'-')+'</td>'
    +'<td style="padding:10px;text-align:right;font-family:JetBrains Mono,monospace;color:var(--red)">'+(topKalan>0?fmt(topKalan):'-')+'</td>'
    +'</tr>';

  tablo += '</tbody></table></div>';
  durumTablo.innerHTML = tablo;

  /* ── 3. GRAM ÖZETİ ── */
  var gramGiren=0, gramCikan=0;
  gunIslemleri.forEach(function(i){
    if(isCikisDurum(i.durum)){
      gramCikan += (i.gram||0)+(i.alisGram||0);
    } else {
      gramGiren += (i.gram||0)+(i.alisGram||0);
    }
  });
  var netGram = gramGiren - gramCikan;
  gramBar.innerHTML =
    (gramGiren>0  ? kasaKart('⬇️','Giren Gram',  gramGiren, 'var(--green)',  'var(--green-light)') : '') +
    (gramCikan>0  ? kasaKart('⬆️','Çıkan Gram',  gramCikan, 'var(--red)',    'var(--red-light)')   : '') +
    (gramGiren>0||gramCikan>0 ? kasaKart('⚖️','Net Gram', Math.abs(netGram), netGram>=0?'var(--blue)':'var(--orange)', netGram>=0?'var(--blue-light)':'var(--orange-light)') : '');

  /* ── 4. KALAN / BEKLEYENLEr ── */
  var kalanlar = gunIslemleri.filter(function(i){ return i.kalan_tl>0; });
  var ustBekleyen = gunIslemleri.filter(function(i){ return i.kalan_tl<0; });
  var kalanHtml = '';
  if(kalanlar.length || ustBekleyen.length){
    kalanHtml += '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Bekleyen İşlemler</div>';
    kalanHtml += '<div style="display:flex;flex-direction:column;gap:6px">';
    kalanlar.forEach(function(i){
      kalanHtml += '<div style="display:flex;align-items:center;gap:10px;padding:9px 14px;background:var(--red-light);border:1px solid var(--red);border-radius:var(--radius-sm)">'
        +'<span style="font-size:13px">💳</span>'
        +'<div style="flex:1"><b>'+i.musteri+'</b> <span style="font-size:11px;color:var(--text2)">'+i.durum+'</span></div>'
        +'<span style="font-family:JetBrains Mono,monospace;font-weight:700;color:var(--red)">'+fmt(i.kalan_tl)+' kalan</span>'
        +'</div>';
    });
    ustBekleyen.forEach(function(i){
      kalanHtml += '<div style="display:flex;align-items:center;gap:10px;padding:9px 14px;background:var(--blue-light);border:1px solid var(--blue);border-radius:var(--radius-sm)">'
        +'<span style="font-size:13px">⬆️</span>'
        +'<div style="flex:1"><b>'+i.musteri+'</b> <span style="font-size:11px;color:var(--text2)">'+i.durum+'</span></div>'
        +'<span style="font-family:JetBrains Mono,monospace;font-weight:700;color:var(--blue)">'+fmt(Math.abs(i.kalan_tl))+' üst verilecek</span>'
        +'</div>';
    });
    kalanHtml += '</div>';
  }
  kalanWrap.innerHTML = kalanHtml;
}

function raporWP(){
  var seciliTarih = raporTarihStr();
  var gunIslemleri = islemler.filter(function(i){ return i.tarih===seciliTarih; });
  if(!gunIslemleri.length){ toast('⚠️ Bu güne ait işlem yok'); return; }

  var msg = '📊 *GÜNLÜK RAPOR — '+seciliTarih+'*\n';
  msg += '━━━━━━━━━━━━━━━━━━━━\n\n';

  // Durum bazlı özet
  var durumMap = {};
  gunIslemleri.forEach(function(i){
    var d = i.durum||'DİĞER';
    if(!durumMap[d]) durumMap[d]={sayi:0,satirTop:0,alisTop:0,gramTop:0,nakit:0,havale:0,kalan:0};
    var g=durumMap[d];
    g.sayi++; g.satirTop+=(i.tutar||0); g.alisTop+=(i.alisTutar||0);
    g.gramTop+=(i.gram||0)+(i.alisGram||0); g.nakit+=(i.nakit||0);
    g.havale+=(i.havale||0); if(i.kalan_tl>0) g.kalan+=i.kalan_tl;
  });
  Object.keys(durumMap).forEach(function(d){
    var g=durumMap[d];
    var cikis=isCikisDurum(d);
    msg+=(cikis?'📤':'📥')+' *'+d+'* ('+g.sayi+' işlem)\n';
    if(g.satirTop>0) msg+='   💰 Satış: '+fmt(g.satirTop)+'\n';
    if(g.alisTop>0)  msg+='   📥 Alış: '+fmt(g.alisTop)+'\n';
    if(g.gramTop>0)  msg+='   ⚖️ Gram: '+fmtG(g.gramTop)+'\n';
    if(g.nakit>0)    msg+='   🪙 Nakit: '+fmt(g.nakit)+'\n';
    if(g.havale>0)   msg+='   🏦 Havale: '+fmt(g.havale)+'\n';
    if(g.kalan>0)    msg+='   ⚠️ Kalan: '+fmt(g.kalan)+'\n';
    msg+='\n';
  });

  // Nakit kasa
  var nGiris=0,nCikis=0,hGiris=0,hCikis=0;
  nakitHareketler.filter(function(h){return h.tarih===seciliTarih;}).forEach(function(h){ if(h.tip==='giris')nGiris+=h.tutar; else nCikis+=h.tutar; });
  bankaHareketleri.filter(function(h){return h.tarih===seciliTarih;}).forEach(function(h){ if(h.yon==='cikis')hCikis+=h.tutar; else hGiris+=h.tutar; });

  msg+='━━━━━━━━━━━━━━━━━━━━\n';
  msg+='💵 *KASA*\n';
  if(nGiris>0)  msg+='   📥 Nakit Giriş: *'+fmt(nGiris)+'*\n';
  if(nCikis>0)  msg+='   📤 Nakit Çıkış: *'+fmt(nCikis)+'*\n';
  if(nGiris||nCikis) msg+='   🟰 Net Nakit: *'+fmt(nGiris-nCikis)+'*\n';
  if(hGiris>0)  msg+='   📥 Havale Giriş: *'+fmt(hGiris)+'*\n';
  if(hCikis>0)  msg+='   📤 Havale Çıkış: *'+fmt(hCikis)+'*\n';
  msg+='🪙 Nakit Kasa: *'+fmt(nakitBakiye)+'*\n';
  msg+='━━━━━━━━━━━━━━━━━━━━\n';
  msg+='🔢 Toplam: *'+gunIslemleri.length+' işlem*';

  if(navigator.clipboard){ navigator.clipboard.writeText(msg).catch(function(){}); }
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
  toast('📋 Rapor kopyalandı + WP açıldı');
}



var _bdAcikKartlar = new Set();

function bdBadgeGuncelle(){
  var el = document.getElementById('bd-cnt');
  if(!el) return;
  var toplam = borcDefteri.length;
  if(toplam > 0){ el.textContent = toplam; el.style.display = ''; }
  else { el.style.display = 'none'; }
}

function bdNetHesapla(kisi){
  var netGram = 0, netTl = 0;
  (kisi.kayitlar||[]).filter(function(k){ return !k.odendi; }).forEach(function(k){
    var carpan = k.tip === 'borc' ? 1 : -1;
    netGram += carpan * (k.gram||0);
    netTl   += carpan * (k.tl||0);
  });
  return { gram: netGram, tl: netTl };
}

function bdKisiEkleAc(){
  document.getElementById('bd-kisi-id').value = '';
  document.getElementById('bd-kisi-isim').value = '';
  document.getElementById('bd-kisi-tel').value = '';
  document.getElementById('bd-kisi-not').value = '';
  document.getElementById('bd-kisi-baslik').textContent = 'Yeni Kişi Ekle';
  document.getElementById('bd-kisi-modal').classList.add('open');
  setTimeout(function(){ document.getElementById('bd-kisi-isim').focus(); }, 150);
}

function bdKisiDuzenleAc(id){
  var k = borcDefteri.find(function(x){ return x.id === id; });
  if(!k) return;
  document.getElementById('bd-kisi-id').value = id;
  document.getElementById('bd-kisi-isim').value = k.isim;
  document.getElementById('bd-kisi-tel').value = k.tel||'';
  document.getElementById('bd-kisi-not').value = k.notlar||'';
  document.getElementById('bd-kisi-baslik').textContent = 'Kişiyi Düzenle';
  document.getElementById('bd-kisi-modal').classList.add('open');
  setTimeout(function(){ document.getElementById('bd-kisi-isim').focus(); }, 150);
}

function bdKisiEkleKapat(){
  document.getElementById('bd-kisi-modal').classList.remove('open');
}

function bdKisiKaydet(){
  var isim = document.getElementById('bd-kisi-isim').value.trim();
  if(!isim){ toast('⚠️ İsim giriniz'); return; }
  var existingId = document.getElementById('bd-kisi-id').value;
  if(existingId){
    var k = borcDefteri.find(function(x){ return x.id == existingId; });
    if(k){
      k.isim = isim;
      k.tel = document.getElementById('bd-kisi-tel').value.trim();
      k.notlar = document.getElementById('bd-kisi-not').value.trim();
    }
    toast('✓ Kişi güncellendi');
  } else {
    borcDefteri.unshift({
      id: Date.now(),
      isim: isim,
      tel: document.getElementById('bd-kisi-tel').value.trim(),
      notlar: document.getElementById('bd-kisi-not').value.trim(),
      kayitlar: []
    });
    toast('✓ '+isim+' eklendi');
  }
  save(); bdKisiEkleKapat(); renderBorcDefteri(); bdUpdateHesapDL();
  // Yeni kişi eklendiyse otomatik seç
  if(!existingId){
    var yeni = borcDefteri[0];
    if(yeni){
      var araEl = document.getElementById('bd-hesap-ara');
      if(araEl) araEl.value = yeni.isim;
      _bdSeciliId = yeni.id;
      document.getElementById('bd-hesap-no').textContent = '#'+String(yeni.id).slice(-4);
      bdRenderSecili();
    }
  } else {
    // Güncellendiyse yenile
    if(_bdSeciliId == existingId) bdRenderSecili();
  }
}

function bdKisiSil(id){
  var k = borcDefteri.find(function(x){ return x.id === id; });
  if(!k) return;
  if(!confirm(k.isim+' kişisini ve tüm kayıtlarını silmek istiyor musunuz?')) return;
  borcDefteri = borcDefteri.filter(function(x){ return x.id !== id; });
  save(); renderBorcDefteri(); bdUpdateHesapDL();
  toast('🗑 Silindi');
}

function bdKayitAc(kisiId){
  var k = borcDefteri.find(function(x){ return x.id === kisiId; });
  if(!k) return;
  document.getElementById('bd-kayit-kisi-id').value = kisiId;
  document.getElementById('bd-kayit-id').value = '';
  document.getElementById('bd-kayit-kisi-lbl').textContent = k.isim;
  document.getElementById('bd-kayit-gram').value = '';
  document.getElementById('bd-kayit-tl').value = '';
  document.getElementById('bd-kayit-aciklama').value = '';
  var bugun = new Date().toISOString().split('T')[0];
  document.getElementById('bd-kayit-tarih').value = bugun;
  bdKayitTipSec('borc');
  document.getElementById('bd-kayit-modal').classList.add('open');
  setTimeout(function(){ document.getElementById('bd-kayit-gram').focus(); }, 150);
}

function bdKayitKapat(){
  document.getElementById('bd-kayit-modal').classList.remove('open');
}

function bdKayitTipSec(tip){
  _bdKayitTip = tip;
  var bBtn = document.getElementById('bd-tip-borc');
  var aBtn = document.getElementById('bd-tip-alacak');
  if(tip === 'borc'){
    bBtn.style.borderColor = 'var(--red)'; bBtn.style.background = 'var(--red-light)'; bBtn.style.color = 'var(--red)';
    aBtn.style.borderColor = 'var(--border)'; aBtn.style.background = 'var(--surface2)'; aBtn.style.color = 'var(--text3)';
    document.getElementById('bd-kayit-icon').textContent = '📥';
    document.getElementById('bd-kayit-baslik').textContent = 'Borç Kaydı';
  } else {
    aBtn.style.borderColor = 'var(--blue)'; aBtn.style.background = 'var(--blue-light)'; aBtn.style.color = 'var(--blue)';
    bBtn.style.borderColor = 'var(--border)'; bBtn.style.background = 'var(--surface2)'; bBtn.style.color = 'var(--text3)';
    document.getElementById('bd-kayit-icon').textContent = '📤';
    document.getElementById('bd-kayit-baslik').textContent = 'Alacak Kaydı';
  }
}

function bdKayitTlHesapla(){
  var g = parseTR(document.getElementById('bd-kayit-gram').value);
  if(g > 0){
    var hesap = g * gf();
    document.getElementById('bd-kayit-tl').value = hesap.toFixed(2);
  }
}

function bdKayitKaydet(){
  var kisiId = parseInt(document.getElementById('bd-kayit-kisi-id').value);
  var k = borcDefteri.find(function(x){ return x.id === kisiId; });
  if(!k) return;
  var gram  = parseTR(document.getElementById('bd-kayit-gram').value);
  var tl    = parseTR(document.getElementById('bd-kayit-tl').value);
  var acik  = document.getElementById('bd-kayit-aciklama').value.trim();
  var tarihVal = document.getElementById('bd-kayit-tarih').value;
  var tarih = tarihVal ? new Date(tarihVal).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR');
  if(gram <= 0 && tl <= 0){ toast('⚠️ Gram veya TL giriniz'); return; }
  if(!k.kayitlar) k.kayitlar = [];
  var existId = document.getElementById('bd-kayit-id').value;
  if(existId){
    var r = k.kayitlar.find(function(x){ return x.id == existId; });
    if(r){ r.tip=_bdKayitTip; r.gram=gram; r.tl=tl; r.aciklama=acik; r.tarih=tarih; }
  } else {
    k.kayitlar.unshift({ id:Date.now(), tarih:tarih, tip:_bdKayitTip, gram:gram, tl:tl, aciklama:acik, odendi:false });
  }
  save(); bdKayitKapat(); renderBorcDefteri();
  toast('✓ Kayıt eklendi — '+k.isim);
}

function bdKayitOdendi(kisiId, kayitId){
  var k = borcDefteri.find(function(x){ return x.id === kisiId; });
  if(!k) return;
  var r = k.kayitlar.find(function(x){ return x.id === kayitId; });
  if(!r) return;
  if(!r.odendi){
    if(!confirm('Bu kaydı KAPAT mı? (Borç/alacak ödendi olarak işaretlenecek)\n\nGeri almak için tekrar tıklayabilirsiniz.')) return;
  }
  r.odendi = !r.odendi;
  save(); if(_bdSeciliId===kisiId) bdRenderSecili(); else bdListeRender();
  toast(r.odendi ? '✅ Kaydı kapatıldı' : '↩ Kayıt yeniden açıldı');
}

function bdKayitSil(kisiId, kayitId){
  var k = borcDefteri.find(function(x){ return x.id === kisiId; });
  if(!k) return;
  if(!confirm('Bu kaydı silmek istiyor musunuz?')) return;
  k.kayitlar = k.kayitlar.filter(function(x){ return x.id !== kayitId; });
  save(); if(_bdSeciliId===kisiId) bdRenderSecili(); else bdListeRender();
}

function bdToggleKart(id){ bdKisiSec(id); }

function bdWpKisi(kisiId){
  var k = borcDefteri.find(function(x){ return x.id === kisiId; });
  if(!k) return;
  var aktif = (k.kayitlar||[]).filter(function(r){ return !r.odendi; });
  var msg = '📒 *BORÇ DEFTERİ*\n━━━━━━━━━━━━━━\n👤 *'+k.isim+'*\n\n';
  aktif.forEach(function(r){
    var birim=r.birim||(r.gram>0?'HAS':'TL');
    var miktar=r.miktar!==undefined?r.miktar:(birim==='TL'?Math.abs(r.tl||0):Math.abs(r.gram||0));
    msg += (r.tip==='borc'?'📥 BORÇ':'📤 ALACAK')+' · '+birim+' · '+r.tarih+'\n';
    msg += '   '+miktar.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:3})+' '+birim+'\n';
    if(r.aciklama) msg += '   📌 '+r.aciklama+'\n';
    msg += '\n';
  });
  // Net HAS
  var totalHas=0;
  aktif.forEach(function(r){ var h=bdHasHesapla(r); totalHas+=(r.tip==='borc'?h:-h); });
  msg += '━━━━━━━━━━━━━━\n';
  msg += (totalHas>0?'🔴 SANA BORÇLU':totalHas<0?'🔵 SEN BORÇLUSUN':'✅ HESAP KAPALI')+'\n';
  msg += '⚖️ Net: *'+(totalHas>=0?'+':'')+totalHas.toFixed(3)+' HAS*\n';
  msg += '📅 '+new Date().toLocaleDateString('tr-TR');
  var tel = k.tel ? k.tel.replace(/\D/g,'') : '';
  if(tel) window.open('https://wa.me/'+tel+'?text='+encodeURIComponent(msg),'_blank');
  else    window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}

function bdWpOzet(){
  if(!borcDefteri.length){ toast('⚠️ Borç defteri boş'); return; }
  var msg = '📒 *BORÇ DEFTERİ ÖZET*\n━━━━━━━━━━━━━━━━━━\n📅 '+new Date().toLocaleDateString('tr-TR')+'\n\n';
  borcDefteri.forEach(function(k){
    var aktif=(k.kayitlar||[]).filter(function(r){return !r.odendi;});
    if(!aktif.length) return;
    var totalHas=0;
    aktif.forEach(function(r){ var h=bdHasHesapla(r); totalHas+=(r.tip==='borc'?h:-h); });
    if(Math.abs(totalHas)<0.001) return;
    var ikon=totalHas>0?'🔴':'🔵';
    msg+=ikon+' *'+k.isim+'*\n';
    msg+='   '+(totalHas>=0?'+':'')+totalHas.toFixed(3)+' HAS\n\n';
  });
  wpOpen(msg);
}

/* ════════════════════════════════════
   BORÇ DEFTERİ v2 — Profesyonel Hesap
   ════════════════════════════════════ */

var _bdSeciliId = null;

var bdHasKurlar = (function(){
  try { return JSON.parse(localStorage.getItem('ks_bd_kur')) || {}; } catch(e){ return {}; }
})();
var bdHasKurDefaults = {HAS:1,BLZ:0.9166,CEY:0.875,YRM:1.75,TAM:6.61,ATA:6.61,EAT:6.61,EYA:1.75};
function bdGetKur(birim){ return bdHasKurlar[birim] || bdHasKurDefaults[birim] || 1; }

function bdHasHesapla(r){
  try {
    var birim = r.birim || ((r.gram||0) > 0 ? 'HAS' : 'TL');
    var miktar = (r.miktar !== undefined && r.miktar !== null) ? Number(r.miktar) : (birim==='TL' ? Math.abs(Number(r.tl)||0) : Math.abs(Number(r.gram)||0));
    if(isNaN(miktar)) miktar = 0;
    if(birim === 'TL'){
      var kur2 = Number(r.kur) || gf();
      return kur2 > 0 ? miktar / kur2 : 0;
    } else {
      var kur3 = Number(r.kur) || bdGetKur(birim);
      return miktar * kur3;
    }
  } catch(e){ return 0; }
}

// ── Dropdown arama ──────────────────────────
function bdAramaGuncelle(val){
  val = (val||'').trim();
  var drop = document.getElementById('bd-ara-drop');
  if(!drop) return;
  if(val.length < 1){ drop.style.display='none'; return; }
  var lower = val.toLowerCase();
  var matches = borcDefteri.filter(function(k){ return k.isim.toLowerCase().indexOf(lower) !== -1; });
  if(!matches.length){ drop.style.display='none'; return; }
  drop.innerHTML = matches.slice(0,10).map(function(k){
    var aktif = (k.kayitlar||[]).filter(function(r){return !r.odendi;}).length;
    return '<div onclick="bdKisiSec('+k.id+')" style="padding:9px 12px;cursor:pointer;border-bottom:1px solid var(--border);font-size:13px;font-weight:600;color:var(--text);transition:background .1s" onmouseover="this.style.background=\'var(--gold-light)\'" onmouseout="this.style.background=\'#fff\'">'
      + k.isim
      + (aktif ? '<span style="margin-left:8px;font-size:10px;font-weight:700;color:var(--red);background:var(--red-light);padding:1px 6px;border-radius:8px">'+aktif+' aktif</span>' : '<span style="margin-left:8px;font-size:10px;color:var(--green)">✅</span>')
      + '</div>';
  }).join('');
  drop.style.display = 'block';
}

document.addEventListener('click', function(e){
  var drop = document.getElementById('bd-ara-drop');
  if(drop && !drop.contains(e.target) && e.target.id !== 'bd-hesap-ara') drop.style.display='none';
});

// ── Müşteri seç ──────────────────────────
function bdKisiSec(id){
  var kisi = borcDefteri.find(function(k){ return k.id===id; });
  if(!kisi) return;
  _bdSeciliId = id;
  var araEl = document.getElementById('bd-hesap-ara');
  if(araEl) araEl.value = kisi.isim;
  var noEl = document.getElementById('bd-hesap-no');
  if(noEl) noEl.textContent = '#'+String(id).slice(-4);
  var drop = document.getElementById('bd-ara-drop');
  if(drop) drop.style.display='none';
  bdRenderSecili();
  // Liste paneli kapatma
  var panel = document.getElementById('bd-liste-panel');
  if(panel) panel.style.display = 'none';
}

// ── Render: seçili müşteri ──────────────────────────
function bdRenderSecili(){
  var kisi = _bdSeciliId ? borcDefteri.find(function(k){ return k.id===_bdSeciliId; }) : null;
  if(!kisi){ bdRenderBos(); return; }

  var ti = document.getElementById('bd-yeni-tarih');
  if(ti && !ti.value){
    var n = new Date();
    ti.value = n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
  }
  var form = document.getElementById('bd-ekle-form');
  if(form) form.style.display = '';
  var btns = document.getElementById('bd-kisi-btns');
  if(btns){ btns.style.display = 'flex'; }

  bdRenderIslemler(kisi);
  bdRenderBakiye(kisi);
}

function bdRenderBos(){
  var tb = document.getElementById('bd-islem-tb');
  if(tb) tb.innerHTML = '<tr><td colspan="8"><div class="empty"><div class="empty-icon">📒</div>Yukarıdan müşteri seçin</div></td></tr>';
  var btb = document.getElementById('bd-bakiye-satirlar');
  if(btb) btb.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text3);font-size:12px">Müşteri seçin</div>';
  var hasEl = document.getElementById('bd-has-toplam');
  if(hasEl){ hasEl.textContent = '— HAS'; hasEl.style.color = 'var(--text3)'; }
  var form = document.getElementById('bd-ekle-form');
  if(form) form.style.display = 'none';
  var btns = document.getElementById('bd-kisi-btns');
  if(btns) btns.style.display = 'none';
  var cnt = document.getElementById('bd-islem-sayac');
  if(cnt) cnt.textContent = '0 kayıt';
}

// ── İşlem tablosu ──────────────────────────
function bdRenderIslemler(kisi){
  var tb = document.getElementById('bd-islem-tb');
  if(!tb) return;
  var cnt = document.getElementById('bd-islem-sayac');
  var kayitlar = [];
  try { kayitlar = (kisi.kayitlar||[]).slice().sort(function(a,b){return (a.id||0)-(b.id||0);}); } catch(e){}
  if(cnt) cnt.textContent = kayitlar.length + ' kayıt';

  if(!kayitlar.length){
    tb.innerHTML='<tr><td colspan="8"><div class="empty"><div class="empty-icon">📝</div>'+kisi.isim+' için kayıt yok — aşağıdan ekleyin</div></td></tr>';
    return;
  }

  var rows = '';
  for(var ri=0; ri<kayitlar.length; ri++){
    try {
      var r = kayitlar[ri];
      var birim = r.birim || ((Number(r.gram)||0) > 0 ? 'HAS' : 'TL');
      var miktar = (r.miktar !== undefined && r.miktar !== null) ? Number(r.miktar) : (birim==='TL' ? Math.abs(Number(r.tl)||0) : Math.abs(Number(r.gram)||0));
      if(isNaN(miktar)) miktar = 0;
      var kur = Number(r.kur) || (birim==='TL' ? gf() : bdGetKur(birim));
      if(isNaN(kur)||kur<=0) kur = 1;
      var has = bdHasHesapla(r);
      var isBorc = r.tip === 'borc';
      var borcRenk = isBorc ? 'var(--red)' : 'var(--green)';
      var rowBg = r.odendi ? '#f5f5f5' : (isBorc ? '#fff0f0' : '#f0fff4');
      var lbl = isBorc ? 'BORÇ' : 'ALACAK';
      var birimRenkMap = {TL:'#444',HAS:'#a07828',BLZ:'#1b3f7a',CEY:'#7c3d0a',YRM:'#7c3d0a',TAM:'#7c3d0a',ATA:'#7c3d0a',EAT:'#4c1d95',EYA:'#4c1d95'};
      var birimRenk = birimRenkMap[birim]||'#333';
      var miktarStr = birim==='TL'
        ? '\u20ba'+(miktar||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})
        : (miktar||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:3});
      var kurStr = birim==='TL'
        ? '\u20ba'+(kur||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:0})
        : (kur||0).toLocaleString('tr-TR',{minimumFractionDigits:3,maximumFractionDigits:3});
      var hasStr = (has||0).toFixed(3);
      var acikStr = (r.aciklama||'—').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      var tarihStr = r.tarih||'—';
      var rid = r.id||0;
      var kid = kisi.id||0;

      rows += '<tr style="background:'+rowBg+';border-bottom:1px solid #e8e0d4;'+(r.odendi?'opacity:.5;':'')+'">';
      rows += '<td style="padding:8px;text-align:center"><span style="font-size:9px;font-weight:800;color:'+borcRenk+';border:1px solid '+borcRenk+';padding:2px 6px;border-radius:8px">'+lbl+'</span></td>';
      rows += '<td style="padding:8px;font-size:11px;color:#888;font-family:monospace;white-space:nowrap">'+tarihStr+'</td>';
      rows += '<td style="padding:8px;text-align:center"><span style="font-size:11px;font-weight:800;color:'+birimRenk+'">'+birim+'</span></td>';
      rows += '<td style="padding:8px;text-align:right;font-family:monospace;font-size:11px;color:#555">'+kurStr+'</td>';
      rows += '<td style="padding:8px;text-align:right;font-family:monospace;font-weight:700;color:'+borcRenk+'">'+miktarStr+'</td>';
      rows += '<td style="padding:8px;text-align:right;font-family:monospace;font-size:11px;color:#a07828">'+hasStr+' g</td>';
      rows += '<td style="padding:8px;font-size:11px;color:#555;font-style:italic;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+acikStr+'">'+acikStr+'</td>';
      rows += '<td style="padding:6px;white-space:nowrap">';
      rows += '<button onclick="bdKayitOdendi('+kid+','+rid+')" style="width:25px;height:25px;border:1.5px solid '+(r.odendi?'#aaa':'#14532d')+';border-radius:4px;background:'+(r.odendi?'#eee':'#edfaf3')+';color:'+(r.odendi?'#aaa':'#14532d')+';cursor:pointer;font-size:11px">'+(r.odendi?'↩':'✓')+'</button>';
      rows += '<button onclick="bdKayitSil('+kid+','+rid+')" style="width:25px;height:25px;border:1.5px solid #ddd;border-radius:4px;background:#fff;color:#888;cursor:pointer;font-size:11px;margin-left:2px">✕</button>';
      rows += '</td></tr>';
    } catch(rowErr){
      rows += '<tr><td colspan="8" style="color:orange;font-size:11px;padding:6px">Kayıt gösterim hatası</td></tr>';
    }
  }
  tb.innerHTML = rows;
}

// ── Bakiye tablosu ──────────────────────────
function bdRenderBakiye(kisi){
  var tumKayitlar = kisi.kayitlar || [];
  var aktifler  = tumKayitlar.filter(function(r){ return !r.odendi; });
  var kapalilar = tumKayitlar.filter(function(r){ return  r.odendi; });

  // Aktif birim bakiye hesapla
  var birimMap = {};
  var totalHas = 0;

  aktifler.forEach(function(r){
    try{
      var birim = r.birim || ((Number(r.gram)||0) > 0 ? 'HAS' : 'TL');
      var miktar;
      if(r.miktar !== undefined && r.miktar !== null){ miktar = Number(r.miktar); }
      else if(birim === 'TL'){ miktar = Math.abs(Number(r.tl)||0); }
      else { miktar = Math.abs(Number(r.gram)||0); }
      if(isNaN(miktar)||miktar<0) miktar = 0;
      var has = bdHasHesapla(r);
      if(!birimMap[birim]) birimMap[birim] = {borc:0, alacak:0};
      if(r.tip === 'borc'){ birimMap[birim].borc += miktar; totalHas += has; }
      else                { birimMap[birim].alacak += miktar; totalHas -= has; }
    }catch(e){}
  });

  var satirEl = document.getElementById('bd-bakiye-satirlar');
  if(!satirEl) return;

  var birimSirasi = ['TL','HAS','BLZ','CEY','YRM','TAM','ATA','EAT','EYA'];
  var satirlar = [];
  birimSirasi.forEach(function(b){ if(birimMap[b]) satirlar.push(b); });
  Object.keys(birimMap).forEach(function(b){ if(birimSirasi.indexOf(b)===-1) satirlar.push(b); });

  var birimRenk = {TL:'#333',HAS:'#a07828',BLZ:'#1b3f7a',CEY:'#7c3d0a',YRM:'#7c3d0a',TAM:'#7c3d0a',ATA:'#7c3d0a',EAT:'#4c1d95',EYA:'#4c1d95'};

  function fmtVal(v, isTL){
    if(v <= 0.0001) return '';
    if(isTL) return '\u20ba'+v.toLocaleString('tr-TR',{minimumFractionDigits:2, maximumFractionDigits:2});
    return v.toLocaleString('tr-TR',{minimumFractionDigits:2, maximumFractionDigits:3});
  }

  var html = '';

  if(satirlar.length === 0 && aktifler.length === 0){
    if(kapalilar.length > 0){
      // Tüm kayıtlar kapatılmış
      html += '<div style="padding:10px 12px;background:#edfaf3;border-bottom:1px solid #c6f0d9;display:flex;align-items:center;gap:6px">'
        +'<span style="font-size:14px">✅</span>'
        +'<div style="flex:1"><div style="font-size:11px;font-weight:700;color:#14532d">Tüm borçlar kapatıldı</div>'
        +'<div style="font-size:10px;color:#2d7a4f">'+kapalilar.length+' kayıt kapalı</div></div>'
        +'</div>';
    } else {
      html += '<div style="padding:14px 12px;text-align:center;color:var(--text3);font-size:12px">Kayıt yok</div>';
    }
  } else {
    // Aktif borç/alacak satırları
    html += satirlar.map(function(b){
      var d = birimMap[b];
      var bStr = fmtVal(d.borc, b==='TL');
      var aStr = fmtVal(d.alacak, b==='TL');
      var hasBorcFazla = d.borc > d.alacak;
      var bg = hasBorcFazla ? '#fff4f4' : '#f0f8ff';
      return '<div style="display:grid;grid-template-columns:52px 1fr 1fr;border-bottom:1px solid #eee;background:'+bg+'">'
        +'<div style="padding:9px 8px;font-size:13px;font-weight:800;color:'+(birimRenk[b]||'#333')+'">'+b+'</div>'
        +'<div style="padding:9px 8px;text-align:right;font-size:13px;font-weight:700;color:#c0392b;font-family:monospace">'+bStr+'</div>'
        +'<div style="padding:9px 8px;text-align:right;font-size:13px;font-weight:700;color:#1a7a3f;font-family:monospace">'+aStr+'</div>'
        +'</div>';
    }).join('');
  }

  // Eğer kapatılmış kayıt varsa küçük özet
  if(kapalilar.length > 0){
    // Kapalı kayıtların toplamını hesapla
    var kapaliBirimMap = {};
    kapalilar.forEach(function(r){
      try{
        var b = r.birim || ((Number(r.gram)||0) > 0 ? 'HAS' : 'TL');
        var m = (r.miktar !== undefined && r.miktar !== null) ? Number(r.miktar) : (b==='TL' ? Math.abs(Number(r.tl)||0) : Math.abs(Number(r.gram)||0));
        if(isNaN(m)||m<0) m=0;
        if(!kapaliBirimMap[b]) kapaliBirimMap[b]={borc:0,alacak:0};
        if(r.tip==='borc') kapaliBirimMap[b].borc+=m; else kapaliBirimMap[b].alacak+=m;
      }catch(e){}
    });
    var kapaliSatirlar = Object.keys(kapaliBirimMap).filter(function(b){ return kapaliBirimMap[b].borc+kapaliBirimMap[b].alacak>0; });
    if(kapaliSatirlar.length>0){
      html += '<div style="padding:6px 8px;background:#f0f0f0;border-top:1px solid #ddd">'
        +'<div style="font-size:9px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">✓ Kapatılanlar ('+kapalilar.length+' kayıt)</div>';
      html += kapaliSatirlar.map(function(b){
        var d=kapaliBirimMap[b];
        var isTL=b==='TL';
        var bStr=fmtVal(d.borc,isTL), aStr=fmtVal(d.alacak,isTL);
        return '<div style="display:flex;gap:8px;font-size:11px;font-family:monospace;color:#888;text-decoration:line-through;margin-bottom:2px">'
          +'<span style="font-weight:700;color:'+(birimRenk[b]||'#888')+'">'+b+'</span>'
          +(bStr?'<span style="color:#c09090">B:'+bStr+'</span>':'')
          +(aStr?'<span style="color:#90c090">A:'+aStr+'</span>':'')
          +'</div>';
      }).join('');
      html += '</div>';
    }
  }

  satirEl.innerHTML = html;

  // HAS toplam (sadece aktif)
  var hasEl = document.getElementById('bd-has-toplam');
  if(hasEl){
    if(aktifler.length === 0 && kapalilar.length > 0){
      hasEl.textContent = '0.000 HAS ✅';
      hasEl.style.color = '#14532d';
    } else {
      var absHas = Math.abs(totalHas);
      var hasStr = absHas < 0.0005 ? '0.000 HAS ✅' : (totalHas > 0 ? '+' : '−') + absHas.toFixed(3) + ' HAS';
      hasEl.textContent = hasStr;
      hasEl.style.color = absHas < 0.0005 ? '#14532d' : (totalHas > 0 ? '#c0392b' : '#1b3f7a');
    }
    hasEl.style.fontSize = '16px';
    hasEl.style.fontWeight = '800';
  }
}

// ── Kayıt ekle ──────────────────────────
function bdIslemEkle(){
  if(!_bdSeciliId){ toast('⚠️ Önce müşteri seçin'); return; }
  var kisi = borcDefteri.find(function(k){ return k.id===_bdSeciliId; });
  if(!kisi){ toast('⚠️ Müşteri bulunamadı'); return; }

  var tip    = (document.getElementById('bd-yeni-tip')||{}).value||'';
  var birim  = (document.getElementById('bd-yeni-birim')||{}).value||'TL';
  var tarihI = (document.getElementById('bd-yeni-tarih')||{}).value||'';
  var miktar = parseFloat((document.getElementById('bd-ekle-miktar')||{}).value||0)||0;
  var kurI   = parseFloat((document.getElementById('bd-ekle-kur')||{}).value||0)||0;
  var acik   = ((document.getElementById('bd-ekle-aciklama')||{}).value||'').trim();

  if(!tip)        { toast('⚠️ İşlem tipi seçin (BORÇ/ALACAK)'); return; }
  if(miktar <= 0) { toast('⚠️ Miktar giriniz'); return; }

  var tarih = tarihI ? new Date(tarihI).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR');
  var kur   = kurI > 0 ? kurI : (birim==='TL' ? gf() : bdGetKur(birim));
  var has   = birim==='TL' ? (miktar/kur) : (miktar*kur);

  if(!kisi.kayitlar) kisi.kayitlar = [];
  kisi.kayitlar.unshift({
    id: Date.now(),
    tarih: tarih,
    tip: tip,
    birim: birim,
    kur: kur,
    miktar: miktar,
    has: has,
    gram: birim!=='TL' ? miktar : 0,
    tl:   birim==='TL' ? miktar : 0,
    aciklama: acik,
    odendi: false
  });

  save();
  bdRenderSecili();
  bdBadgeGuncelle();

  var mikEl = document.getElementById('bd-ekle-miktar'); if(mikEl) mikEl.value='';
  var kurEl = document.getElementById('bd-ekle-kur');   if(kurEl) kurEl.value='';
  var acEl  = document.getElementById('bd-ekle-aciklama'); if(acEl) acEl.value='';

  var birimAd={TL:'₺',HAS:'g HAS',BLZ:'g BLZ',CEY:'x CEY',YRM:'x YRM',TAM:'x TAM',ATA:'x ATA',EAT:'x EAT',EYA:'x EYA'};
  toast('✓ '+(tip==='borc'?'Borç':'Alacak')+' eklendi: '+miktar.toLocaleString('tr-TR',{minimumFractionDigits:2})+' '+(birimAd[birim]||birim));
}

// ── Son Durum ──────────────────────────
function bdSonDurum(){
  if(!_bdSeciliId){ toast('⚠️ Önce müşteri seçin'); return; }
  var kisi = borcDefteri.find(function(k){ return k.id===_bdSeciliId; });
  if(!kisi) return;
  var aktif = (kisi.kayitlar||[]).filter(function(r){ return !r.odendi; });
  if(!aktif.length){ alert('✅ '+kisi.isim+' — Hesap kapalı'); return; }
  var birimMap = {};
  var totalHas = 0;
  aktif.forEach(function(r){
    try {
      var birim = r.birim || ((Number(r.gram)||0)>0?'HAS':'TL');
      var miktar = (r.miktar!==undefined&&r.miktar!==null)?Number(r.miktar):(birim==='TL'?Math.abs(Number(r.tl)||0):Math.abs(Number(r.gram)||0));
      if(isNaN(miktar)) miktar=0;
      var has=bdHasHesapla(r);
      if(!birimMap[birim]) birimMap[birim]={borc:0,alacak:0};
      if(r.tip==='borc'){birimMap[birim].borc+=miktar;totalHas+=has;}
      else{birimMap[birim].alacak+=miktar;totalHas-=has;}
    } catch(e){}
  });
  var lines = Object.keys(birimMap).map(function(b){
    var d=birimMap[b], net=d.borc-d.alacak;
    if(Math.abs(net)<0.0001) return null;
    return b+': '+(net>0?'+':'')+net.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:3});
  }).filter(Boolean);
  alert('📒 '+kisi.isim+'\n'+lines.join('\n')+'\n\nNet: '+(totalHas>=0?'+':'')+totalHas.toFixed(3)+' HAS');
}

// ── Liste toggle ──────────────────────────
function bdListeToggle(){
  var p = document.getElementById('bd-liste-panel');
  if(!p) return;
  var acik = p.style.display !== 'none';
  p.style.display = acik ? 'none' : '';
  if(!acik) bdListeRender();
}

function bdListeRender(){
  bdBadgeGuncelle();
  var filtre = ((document.getElementById('bd-liste-ara')||{}).value||'').toLowerCase();
  var liste = borcDefteri.filter(function(k){ return !filtre||k.isim.toLowerCase().indexOf(filtre)!==-1; });
  var sayi = document.getElementById('bd-liste-sayi'); if(sayi) sayi.textContent=borcDefteri.length;

  var ozBar = document.getElementById('bd-ozet-bar');
  if(ozBar){
    var topBorcTl=0,topAlacakTl=0,topBorcHas=0,topAlacakHas=0;
    borcDefteri.forEach(function(k){
      (k.kayitlar||[]).filter(function(r){return !r.odendi;}).forEach(function(r){
        try {
          var birim=r.birim||((Number(r.gram)||0)>0?'HAS':'TL');
          var miktar=(r.miktar!==undefined&&r.miktar!==null)?Number(r.miktar):(birim==='TL'?Math.abs(Number(r.tl)||0):Math.abs(Number(r.gram)||0));
          var has=bdHasHesapla(r);
          if(r.tip==='borc'){if(birim==='TL')topBorcTl+=miktar;else topBorcHas+=has;}
          else{if(birim==='TL')topAlacakTl+=miktar;else topAlacakHas+=has;}
        }catch(e){}
      });
    });
    var oz='';
    if(topBorcTl>0)    oz+='<div style="padding:8px 14px;background:var(--red-light);border:1.5px solid var(--red);border-radius:var(--radius-sm)"><div style="font-size:9px;font-weight:700;color:var(--red);text-transform:uppercase">🔴 Sana Borçlu (TL)</div><div style="font-size:16px;font-weight:800;font-family:monospace;color:var(--red)">'+fmt(topBorcTl)+'</div></div>';
    if(topAlacakTl>0)  oz+='<div style="padding:8px 14px;background:var(--blue-light);border:1.5px solid var(--blue);border-radius:var(--radius-sm)"><div style="font-size:9px;font-weight:700;color:var(--blue);text-transform:uppercase">🔵 Sen Borçlusun (TL)</div><div style="font-size:16px;font-weight:800;font-family:monospace;color:var(--blue)">'+fmt(topAlacakTl)+'</div></div>';
    if(topBorcHas>0)   oz+='<div style="padding:8px 14px;background:var(--red-light);border:1.5px solid var(--red);border-radius:var(--radius-sm)"><div style="font-size:9px;font-weight:700;color:var(--red);text-transform:uppercase">🔴 Sana Borçlu (HAS)</div><div style="font-size:16px;font-weight:800;font-family:monospace;color:var(--red)">'+topBorcHas.toFixed(3)+'g</div></div>';
    if(topAlacakHas>0) oz+='<div style="padding:8px 14px;background:var(--blue-light);border:1.5px solid var(--blue);border-radius:var(--radius-sm)"><div style="font-size:9px;font-weight:700;color:var(--blue);text-transform:uppercase">🔵 Sen Borçlusun (HAS)</div><div style="font-size:16px;font-weight:800;font-family:monospace;color:var(--blue)">'+topAlacakHas.toFixed(3)+'g</div></div>';
    ozBar.innerHTML = oz;
  }

  var el = document.getElementById('bd-list');
  if(!el) return;
  if(!liste.length){ el.innerHTML='<div class="empty"><div class="empty-icon">📒</div>'+(filtre?'Arama sonucu yok':'Henüz kayıt yok')+'</div>'; return; }

  el.innerHTML = liste.map(function(k){
    var aktif=(k.kayitlar||[]).filter(function(r){return !r.odendi;});
    var totalHas=0;
    var birimMap2={};
    aktif.forEach(function(r){
      try{
        var birim=r.birim||((Number(r.gram)||0)>0?'HAS':'TL');
        var miktar=(r.miktar!==undefined&&r.miktar!==null)?Number(r.miktar):(birim==='TL'?Math.abs(Number(r.tl)||0):Math.abs(Number(r.gram)||0));
        if(isNaN(miktar))miktar=0;
        var has=bdHasHesapla(r);
        if(!birimMap2[birim])birimMap2[birim]={borc:0,alacak:0};
        if(r.tip==='borc'){birimMap2[birim].borc+=miktar;totalHas+=has;}
        else{birimMap2[birim].alacak+=miktar;totalHas-=has;}
      }catch(e){}
    });
    var isBorc=totalHas>0.001,isAlacak=totalHas<-0.001,kapalı=!isBorc&&!isAlacak;
    var borderCol=isBorc?'var(--red)':isAlacak?'var(--blue)':'var(--green)';
    var bgCol=isBorc?'#fff8f8':isAlacak?'#f0f4ff':'var(--green-light)';
    var taglar=Object.keys(birimMap2).map(function(b){
      var d=birimMap2[b],net=d.borc-d.alacak;
      if(Math.abs(net)<0.0001)return'';
      var renk=net>0?'var(--red)':'var(--green)';
      return'<span style="display:inline-block;padding:1px 7px;background:'+(net>0?'var(--red-light)':'var(--green-light)')+';color:'+renk+';border-radius:8px;font-size:10px;font-weight:700;font-family:monospace;margin:1px">'+b+':'+(net>0?'+':'')+Math.abs(net).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:3})+'</span>';
    }).join('');
    var hasHtml=kapalı?'<span style="font-size:11px;font-weight:700;color:var(--green)">✅</span>':'<span style="font-family:monospace;font-size:12px;font-weight:800;color:'+(isBorc?'var(--red)':'var(--blue)')+'">'+(totalHas>0?'+':'')+totalHas.toFixed(3)+'g</span>';
    return'<div style="border:1.5px solid '+borderCol+';border-radius:var(--radius);background:'+bgCol+';margin-bottom:7px;overflow:hidden">'
      +'<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer" onclick="bdKisiSec('+k.id+')">'
        +'<div style="width:36px;height:36px;background:'+borderCol+';border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;flex-shrink:0">'+(isBorc?'🔴':isAlacak?'🔵':'✅')+'</div>'
        +'<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700">'+k.isim+'</div>'
        +'<div style="font-size:11px;margin-top:3px">'+taglar+'</div></div>'
        +'<div>'+hasHtml+'</div>'
        +'<span style="color:var(--text3)">→</span>'
      +'</div></div>';
  }).join('');
}

function bdWpSecili(){ if(_bdSeciliId) bdWpKisi(_bdSeciliId); }
function bdKisiDuzenleAcSecili(){ if(_bdSeciliId) bdKisiDuzenleAc(_bdSeciliId); }
function bdKisiSilSecili(){
  if(!_bdSeciliId) return;
  bdKisiSil(_bdSeciliId);
  _bdSeciliId=null;
  var araEl=document.getElementById('bd-hesap-ara'); if(araEl) araEl.value='';
  bdRenderBos();
}
/* ════════════════════════════════════════
   BAĞLANTI — Atölye Cari Hesap
════════════════════════════════════════ */

var BAG_MALLAR = [
  { tip:'HAS',      label:'HAS',         birim:'gram', ikon:'◈' },
  { tip:'995',      label:'995',          birim:'gram', ikon:'◈' },
  { tip:'HURDA',    label:'Hurda',        birim:'gram', ikon:'▣' },
  { tip:'22BLZ',    label:'22 Bilezik',   birim:'gram', ikon:'◇' },
  { tip:'EURO',     label:'Euro',         birim:'adet', ikon:'€'  },
  { tip:'USD',      label:'USD',          birim:'adet', ikon:'$'  },
  { tip:'ATA',      label:'Ata',          birim:'adet', ikon:'◆' },
  { tip:'YARIM',    label:'Yarım',        birim:'adet', ikon:'◈' },
  { tip:'CEYREK',   label:'Çeyrek',       birim:'adet', ikon:'◉' }
];

var _bagSeciliAtolyeId = null;
var _bagYon = 'ben';        // 'ben' = ben verdim | 'atolye' = atölye verdi
var _bagMalTip = null;

function bagRenderAll(){
  bagRenderAtolye_Tabs();
  bagBadgeGuncelle();
  var td = document.getElementById('bag-tarih');
  if(td && !td.value){
    var n=new Date(); td.value=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
  }
}

function bagBadgeGuncelle(){
  var cnt = document.getElementById('bag-cnt'); if(!cnt) return;
  var n = baglantiTransferler.length;
  if(n>0){cnt.textContent=n;cnt.style.display='';}else cnt.style.display='none';
}

function bagAtolye_Ekle(){
  var el = document.getElementById('bag-atolye-isim');
  var isim = (el.value||'').trim();
  if(!isim){toast('⚠️ Atölye adı girin');return;}
  if(baglantiAtolye.find(function(a){return a.isim.toLowerCase()===isim.toLowerCase();})){toast('⚠️ Zaten kayıtlı');return;}
  baglantiAtolye.push({id:Date.now(),isim:isim});
  save(); el.value='';
  bagRenderAtolye_Tabs();
  // Yeni eklenen atölyeyi otomatik seç
  bagAtolye_Sec(baglantiAtolye[baglantiAtolye.length-1].id);
  toast('✓ Atölye eklendi: '+isim);
}

function bagAtolye_Sil(id){
  var a = baglantiAtolye.find(function(x){return x.id===id;});
  if(!confirm((a?a.isim:'Atölye')+' silinsin mi? Bu atölyeye ait tüm kayıtlar da silinecek.')) return;
  baglantiAtolye = baglantiAtolye.filter(function(x){return x.id!==id;});
  baglantiTransferler = baglantiTransferler.filter(function(t){return t.atolyeId!==id;});
  if(_bagSeciliAtolyeId===id) _bagSeciliAtolyeId=null;
  save();
  bagRenderAtolye_Tabs();
  if(_bagSeciliAtolyeId) bagAtolye_Sec(_bagSeciliAtolyeId);
  else {
    document.getElementById('bag-atolye-panel').style.display='none';
    document.getElementById('bag-bos-mesaj').style.display='';
  }
  toast('✓ Atölye silindi');
}

function bagRenderAtolye_Tabs(){
  var el = document.getElementById('bag-atolye-tabs'); if(!el) return;
  if(!baglantiAtolye.length){
    el.innerHTML='<span style="font-size:12px;color:var(--text3)">Henüz atölye yok</span>';
    document.getElementById('bag-atolye-panel').style.display='none';
    document.getElementById('bag-bos-mesaj').style.display='';
    return;
  }
  el.innerHTML = baglantiAtolye.map(function(a){
    var isSecili = a.id===_bagSeciliAtolyeId;
    return '<div style="display:inline-flex;align-items:center;gap:5px">'
      +'<button type="button" onclick="bagAtolye_Sec('+a.id+')" '
      +'style="padding:7px 14px;border-radius:20px;border:1.5px solid '+(isSecili?'var(--gold-mid)':'var(--border2)')+';'
      +'background:'+(isSecili?'linear-gradient(135deg,#1c1a10,#2a2412)':'#fff')+';'
      +'color:'+(isSecili?'#e8c97a':'var(--text2)')+';font-family:var(--font-body);font-size:12px;font-weight:700;cursor:pointer;transition:all .15s">'
      +a.isim+'</button>'
      +'<button type="button" onclick="bagAtolye_Sil('+a.id+')" title="Sil" '
      +'style="width:18px;height:18px;border-radius:50%;border:1px solid var(--border2);background:#fff;color:var(--text3);font-size:10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center">✕</button>'
      +'</div>';
  }).join('');
}

function bagAtolye_Sec(id){
  _bagSeciliAtolyeId = id;
  var a = baglantiAtolye.find(function(x){return x.id===id;});
  document.getElementById('bag-bos-mesaj').style.display='none';
  document.getElementById('bag-atolye-panel').style.display='';
  var isimEl = document.getElementById('bag-secili-isim'); if(isimEl) isimEl.textContent = a?a.isim:'';
  bagRenderAtolye_Tabs();
  bagRenderMalTuslari();
  bagRenderHesapOzet();
  bagRenderKayitlar();
  bagRenderFiltreMal();
  bagYonSec('ben');
}

function bagRenderMalTuslari(){
  var wrap = document.getElementById('bag-mal-tuslar'); if(!wrap) return;
  wrap.innerHTML = BAG_MALLAR.map(function(m){
    return '<button type="button" class="bag-mal-tus" onclick="bagMalSec(this,\''+m.tip+'\')" '
      +'style="padding:7px 13px;border:1.5px solid rgba(196,154,46,.25);border-radius:8px;'
      +'background:linear-gradient(160deg,#1c1a10,#2a2412);color:#e8c97a;'
      +'font-family:var(--font-body);font-size:11px;font-weight:700;cursor:pointer;transition:all .15s">'
      +m.ikon+' '+m.label+'</button>';
  }).join('');
}

function bagMalSec(el, tip){
  _bagMalTip = tip;
  document.querySelectorAll('.bag-mal-tus').forEach(function(b){
    b.style.borderColor='rgba(196,154,46,.25)'; b.style.boxShadow='none';
  });
  el.style.borderColor='rgba(232,184,75,.9)';
  el.style.boxShadow='0 0 0 3px rgba(196,154,46,.2)';
  var mal = BAG_MALLAR.find(function(m){return m.tip===tip;});
  var lbl = document.getElementById('bag-miktar-lbl');
  var fLbl = document.getElementById('bag-fiyat-lbl');
  if(lbl) lbl.textContent = mal.birim==='gram' ? 'Gram' : 'Adet';
  if(fLbl) fLbl.textContent = (mal.birim==='gram') ? '₺/gram' : '₺/'+(tip==='EURO'?'€':tip==='USD'?'$':'adet');
  bagHesapla();
}

function bagHesapla(){
  var miktar = parseFloat(document.getElementById('bag-miktar').value||0)||0;
  var fiyat  = parseFloat(document.getElementById('bag-fiyat').value||0)||0;
  var toplam = miktar * fiyat;
  var box = document.getElementById('bag-toplam-box');
  var txt = document.getElementById('bag-toplam-txt');
  if(box) box.style.display = (miktar>0&&fiyat>0)?'flex':'none';
  if(txt && miktar>0 && fiyat>0){
    txt.textContent = toplam.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
  }
}

function bagYonSec(yon){
  _bagYon = yon;
  var ben = document.getElementById('bag-yon-ben');
  var atl = document.getElementById('bag-yon-atolye');
  if(yon==='ben'){
    ben.style.background='linear-gradient(135deg,#1c1a10,#2a2412)'; ben.style.color='#e8c97a'; ben.style.borderColor='var(--gold-mid)';
    atl.style.background='#fff'; atl.style.color='var(--text2)'; atl.style.borderColor='var(--border2)';
  } else {
    atl.style.background='linear-gradient(135deg,#1c1a10,#2a2412)'; atl.style.color='#e8c97a'; atl.style.borderColor='var(--gold-mid)';
    ben.style.background='#fff'; ben.style.color='var(--text2)'; ben.style.borderColor='var(--border2)';
  }
}

function bagKaydet(){
  if(!_bagSeciliAtolyeId){toast('⚠️ Atölye seçin');return;}
  if(!_bagMalTip){toast('⚠️ Mal türü seçin');return;}
  var miktar = parseFloat(document.getElementById('bag-miktar').value||0)||0;
  if(miktar<=0){toast('⚠️ Miktar girin');return;}
  var fiyat = parseFloat(document.getElementById('bag-fiyat').value||0)||0;
  if(fiyat<=0){toast('⚠️ Birim fiyat girin');return;}
  var toplam = miktar * fiyat;
  var tarihVal = document.getElementById('bag-tarih').value;
  var tarih = tarihVal ? new Date(tarihVal).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR');
  var not = (document.getElementById('bag-not').value||'').trim();
  var a = baglantiAtolye.find(function(x){return x.id===_bagSeciliAtolyeId;});
  var mal = BAG_MALLAR.find(function(m){return m.tip===_bagMalTip;});

  baglantiTransferler.unshift({
    id: Date.now(),
    atolyeId: _bagSeciliAtolyeId,
    atolyeIsim: a?a.isim:'?',
    yon: _bagYon,        // 'ben'=ben verdim / 'atolye'=atölye verdi
    malTip: _bagMalTip,
    malLabel: mal?mal.label:_bagMalTip,
    malBirim: mal?mal.birim:'adet',
    miktar: miktar,
    fiyat: fiyat,
    toplam: toplam,
    tarih: tarih,
    not: not
  });

  save();
  document.getElementById('bag-miktar').value='';
  document.getElementById('bag-not').value='';
  document.getElementById('bag-toplam-box').style.display='none';
  bagRenderHesapOzet();
  bagRenderKayitlar();
  bagBadgeGuncelle();

  var benTxt = _bagYon==='ben' ? '📤 Ben verdim' : '📥 Atölye verdi';
  var birimTxt = mal&&mal.birim==='gram' ? 'g' : 'adet';
  toast('✓ Kaydedildi — '+benTxt+': '+miktar+birimTxt+' '+mal.label+' @ '+fiyat.toLocaleString('tr-TR')+'₺ = '+toplam.toLocaleString('tr-TR',{minimumFractionDigits:2})+'₺');
}

function bagKayitSil(id){
  if(!confirm('Bu kayıt silinsin mi?')) return;
  baglantiTransferler = baglantiTransferler.filter(function(t){return t.id!==id;});
  save();
  bagRenderHesapOzet();
  bagRenderKayitlar();
  bagBadgeGuncelle();
  toast('✓ Kayıt silindi');
}

function bagRenderHesapOzet(){
  var el = document.getElementById('bag-hesap-ozet'); if(!el) return;
  if(!_bagSeciliAtolyeId){el.innerHTML='';return;}
  var kayitlar = baglantiTransferler.filter(function(t){return t.atolyeId===_bagSeciliAtolyeId;});
  if(!kayitlar.length){
    el.innerHTML='<div style="font-size:12px;color:var(--text3);padding:20px 0;text-align:center">Henüz kayıt yok</div>';
    return;
  }

  // Mal bazında net hesap
  var malMap = {};
  var netTL = 0;
  kayitlar.forEach(function(t){
    if(!malMap[t.malTip]) malMap[t.malTip]={label:t.malLabel,birim:t.malBirim,benMiktar:0,atolyeMiktar:0,benTL:0,atolyeTL:0};
    var m = malMap[t.malTip];
    if(t.yon==='ben'){
      // Ben mal verdim → ben mal alacaklısıyım, atölye TL alacaklısı
      m.benMiktar += t.miktar;
      m.atolyeTL  += t.toplam;
      netTL -= t.toplam; // atölye benden TL alacak → benim TL borcum artar
    } else {
      // Atölye mal verdi → atölye mal alacaklısı, ben TL alacaklısıyım
      m.atolyeMiktar += t.miktar;
      m.benTL += t.toplam;
      netTL += t.toplam; // ben TL alacaklısıyım
    }
  });

  var satirlar = '';
  Object.keys(malMap).forEach(function(tip){
    var m = malMap[tip];
    var netMiktar = m.benMiktar - m.atolyeMiktar;
    var birimTxt = m.birim==='gram'?'g':'adet';
    if(Math.abs(netMiktar)<0.0001) return;
    var benAlacakli = netMiktar > 0;
    var renk = benAlacakli ? 'var(--green)' : 'var(--red)';
    var bg = benAlacakli ? 'var(--green-light)' : 'var(--red-light)';
    var kimTxt = benAlacakli ? '✓ Ben alacaklı' : '✗ Atölye alacaklı';
    satirlar += '<div style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:8px;background:#fff">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
        +'<span style="font-size:12px;font-weight:700;color:var(--text)">'+m.label+'</span>'
        +'<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:'+bg+';color:'+renk+'">'+kimTxt+'</span>'
      +'</div>'
      +'<div style="font-family:var(--font-mono);font-size:16px;font-weight:800;color:'+renk+'">'
        +(benAlacakli?'+':'')+Math.abs(netMiktar).toLocaleString('tr-TR',{minimumFractionDigits:netMiktar%1===0?0:3,maximumFractionDigits:3})+' '+birimTxt
      +'</div>'
    +'</div>';
  });

  // Net TL bakiye
  var tlRenk = netTL>=0 ? 'var(--green)' : 'var(--red)';
  var tlBg   = netTL>=0 ? 'var(--green-light)' : 'var(--red-light)';
  var tlKim  = netTL>=0 ? '✓ Ben TL alacaklı' : '✗ Atölye TL alacaklı';

  el.innerHTML = satirlar
    +'<div style="border:1.5px solid '+tlRenk+';border-radius:var(--radius-sm);padding:12px 14px;background:'+tlBg+';margin-top:4px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
        +'<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text2)">NET TL Bakiye</span>'
        +'<span style="font-size:10px;font-weight:700;color:'+tlRenk+'">'+tlKim+'</span>'
      +'</div>'
      +'<div style="font-family:var(--font-mono);font-size:20px;font-weight:800;color:'+tlRenk+'">'
        +(netTL>=0?'+':'')+Math.abs(netTL).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺'
      +'</div>'
    +'</div>';
}

function bagRenderFiltreMal(){
  var sel = document.getElementById('bag-filtre-mal'); if(!sel) return;
  var val = sel.value;
  sel.innerHTML = '<option value="">Tüm Türler</option>'
    + BAG_MALLAR.map(function(m){ return '<option value="'+m.tip+'">'+m.label+'</option>'; }).join('');
  sel.value = val;
}

function bagRenderKayitlar(){
  var el = document.getElementById('bag-kayit-list'); if(!el) return;
  if(!_bagSeciliAtolyeId){el.innerHTML='';return;}
  var filtreMal = (document.getElementById('bag-filtre-mal')||{}).value||'';
  var liste = baglantiTransferler.filter(function(t){
    if(t.atolyeId!==_bagSeciliAtolyeId) return false;
    if(filtreMal && t.malTip!==filtreMal) return false;
    return true;
  });
  if(!liste.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">🔗</div>Kayıt bulunamadı</div>';
    return;
  }
  el.innerHTML='<div class="tbl-wrap"><table><thead><tr>'
    +'<th>Tarih</th><th>Mal</th><th>Yön</th><th>Miktar</th><th>Fiyat</th><th>Toplam</th><th>Not</th><th></th>'
    +'</tr></thead><tbody>'
    +liste.map(function(t){
      var isBen = t.yon==='ben';
      var mal = BAG_MALLAR.find(function(m){return m.tip===t.malTip;})||{birim:'adet'};
      var birimTxt = mal.birim==='gram'?'g':'adet';
      var yonRenk  = isBen?'var(--orange)':'var(--blue)';
      var yonBg    = isBen?'var(--orange-light)':'var(--blue-light)';
      var yonTxt   = isBen?'📤 Ben Verdim':'📥 Atölye Verdi';
      return '<tr>'
        +'<td style="font-family:var(--font-mono);font-size:11px;color:var(--text2)">'+t.tarih+'</td>'
        +'<td style="font-weight:700">'+t.malLabel+'</td>'
        +'<td><span style="display:inline-block;padding:2px 9px;border-radius:10px;font-size:10px;font-weight:700;background:'+yonBg+';color:'+yonRenk+'">'+yonTxt+'</span></td>'
        +'<td style="font-family:var(--font-mono);font-weight:700">'+t.miktar.toLocaleString('tr-TR',{minimumFractionDigits:t.miktar%1===0?0:3,maximumFractionDigits:3})+' '+birimTxt+'</td>'
        +'<td style="font-family:var(--font-mono);font-size:12px">'+t.fiyat.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+'₺</td>'
        +'<td style="font-family:var(--font-mono);font-weight:800;color:var(--text)">'+t.toplam.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+'₺</td>'
        +'<td style="font-size:12px;color:var(--text2)">'+(t.not||'—')+'</td>'
        +'<td><button class="icon-btn" onclick="bagKayitSil('+t.id+')" title="Sil" style="font-size:12px">✕</button></td>'
        +'</tr>';
    }).join('')
    +'</tbody></table></div>';
}
function bdUpdateHesapDL(){} // no-op, replaced by custom dropdown