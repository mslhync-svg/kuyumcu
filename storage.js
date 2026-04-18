// ═══════════════════════════════════════════════
//  VERİ KATMANI — Supabase + localStorage yedek
// ═══════════════════════════════════════════════

// ── Global Değişkenler (tüm scriptler için) ──
var musteriler=[], islemler=[], borcDefteri=[], siparisler=[];
var bankaHareketleri=[], gecmisGunler=[], baglantiAtolye=[], baglantiTransferler=[];
var secDurum='SATIŞ', currentFis=null, fotoArr=[];


const SUPABASE_URL = 'https://uofrwulfgjtdosebnybw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZnJ3dWxmZ2p0ZG9zZWJueWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NDcwMzIsImV4cCI6MjA5MjAyMzAzMn0.sRFdrlouhZyMVDLMQsS1jplmBBIbdPvBdQpwt_SVyRE';

const SB_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY
};

// ── Supabase: tek kayıt getir ─────────────────
async function sbGet(key) {
  try {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/veriler?key=eq.' + encodeURIComponent(key) + '&select=value',
      { headers: SB_HEADERS }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data && data.length > 0) ? data[0].value : null;
  } catch (e) {
    return null;
  }
}

// ── Supabase: kaydet ──────────────────────────
async function sbSet(key, value) {
  try {
    await fetch(SUPABASE_URL + '/rest/v1/veriler', {
      method: 'POST',
      headers: { ...SB_HEADERS, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ key: key, value: value, updated_at: new Date().toISOString() })
    });
  } catch (e) {}
}

// ── Tüm verileri yükle ────────────────────────
async function veriYukle(cb) {
  const KEYS = ['ks_m','ks_i','ks_bh','ks_gd','ks_bd','ks_s','ks_bag_a','ks_bag_t',
                'ks_durumlar','ks_cd','ks_bankalar','ks_atolyeler','ks_btur','ks_gf'];

  // Tüm key'leri paralel çek
  const results = await Promise.all(KEYS.map(k => sbGet(k)));
  const map = {};
  KEYS.forEach((k, i) => { map[k] = results[i]; });

  function al(k, def) {
    // Supabase > localStorage > default
    if (map[k] !== null && map[k] !== undefined) return map[k];
    try {
      const ls = localStorage.getItem(k);
      if (ls) return JSON.parse(ls);
    } catch(e) {}
    return def;
  }

  // Ana veriler
  musteriler       = al('ks_m',  []);
  islemler         = al('ks_i',  []);
  bankaHareketleri = al('ks_bh', []);
  gecmisGunler     = al('ks_gd', []);
  borcDefteri      = al('ks_bd', []);
  siparisler       = al('ks_s',  []);

  // Ayarlar
  const sd = al('ks_durumlar', null);   if (sd) durumlar = sd;
  const sc = al('ks_cd', null);         if (sc) cikisDurumlar = sc;
  const sb = al('ks_bankalar', null);   if (sb) bankalar = sb;
  const sa = al('ks_atolyeler', null);  if (sa) atolyeler = sa;
  const st = al('ks_btur', null);       if (st) bilezikTurler = st;

  // Gram fiyat
  const gfv = al('ks_gf', null);
  if (gfv !== null) {
    const el  = document.getElementById('gram-fiyat');
    const elv = document.getElementById('gram-fiyat-vis');
    if (el)  el.value  = gfv;
    if (elv) elv.value = gfv;
  }

  if (cb) cb();
}

// ── Kaydet ───────────────────────────────────
function save() {
  // localStorage (hızlı yedek)
  try { localStorage.setItem('ks_m',  JSON.stringify(musteriler)); }      catch(e) {}
  try { localStorage.setItem('ks_i',  JSON.stringify(islemler)); }        catch(e) { toast('⚠️ Fotoğraf çok büyük!'); }
  try { localStorage.setItem('ks_bh', JSON.stringify(bankaHareketleri));} catch(e) {}
  try { localStorage.setItem('ks_gd', JSON.stringify(gecmisGunler)); }    catch(e) {}
  try { localStorage.setItem('ks_bd', JSON.stringify(borcDefteri)); }     catch(e) {}
  try { localStorage.setItem('ks_s',     JSON.stringify(siparisler)); }           catch(e) {}
  try { localStorage.setItem('ks_bag_a', JSON.stringify(baglantiAtolye)); }       catch(e) {}
  try { localStorage.setItem('ks_bag_t', JSON.stringify(baglantiTransferler)); }   catch(e) {}

  // Supabase (bulut — arka planda)
  sbSet('ks_m',  musteriler);
  sbSet('ks_i',  islemler);
  sbSet('ks_bh', bankaHareketleri);
  sbSet('ks_gd', gecmisGunler);
  sbSet('ks_bd',    borcDefteri);
  sbSet('ks_s',     siparisler);
  sbSet('ks_bag_a', baglantiAtolye);
  sbSet('ks_bag_t', baglantiTransferler);
}

// ── Gram fiyat kaydet ─────────────────────────
function saveGramFiyat(v) {
  localStorage.setItem('ks_gf', v);
  sbSet('ks_gf', v);
}

// ── JSON Yedek Al ─────────────────────────────
function veriYedekAl() {
  const yedek = {
    versiyon: 3,
    tarih: new Date().toISOString(),
    musteriler, islemler, bankaHareketleri, gecmisGunler, borcDefteri, siparisler,
    baglantiAtolye: (typeof baglantiAtolye!=='undefined')?baglantiAtolye:[],
    baglantiTransferler: (typeof baglantiTransferler!=='undefined')?baglantiTransferler:[],
    durumlar:      (typeof durumlar      !== 'undefined') ? durumlar      : [],
    cikisDurumlar: (typeof cikisDurumlar !== 'undefined') ? cikisDurumlar : [],
    bankalar:      (typeof bankalar      !== 'undefined') ? bankalar      : [],
    atolyeler:     (typeof atolyeler     !== 'undefined') ? atolyeler     : [],
    bilezikTurler: (typeof bilezikTurler !== 'undefined') ? bilezikTurler : []
  };
  const blob = new Blob([JSON.stringify(yedek, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kuyumcu-yedek-' + new Date().toLocaleDateString('tr-TR').replace(/\./g,'-') + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('✓ Yedek indirildi');
}
