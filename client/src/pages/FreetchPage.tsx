import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

declare global {
  interface Window {
    Hls: any;
    Plyr: any;
    __freetchInit?: boolean;
  }
}

const STYLES = `
.freetch-root { --primary: #9146ff; --dark: #0e0e10; --card: #18181b; --text: #efeff1; --danger: #ff4f4d; --outplayer: #007aff; --vlc: #ff8800; --infuse: #fc3c44; }
.freetch-root, .freetch-root * { box-sizing: border-box; }
.freetch-root { font-family: 'Inter', sans-serif; background-color: var(--dark); color: var(--text); min-height: calc(100vh - 4rem); padding: 20px; }
.freetch-root button, .freetch-root input, .freetch-root select { font-family: 'Inter', sans-serif; }
.freetch-layout { display: flex; gap: 20px; max-width: 1500px; margin: 0 auto; align-items: flex-start; }
.freetch-sidebar { width: 240px; flex-shrink: 0; background: var(--card); border-radius: 16px; padding: 15px; position: sticky; top: 80px; max-height: calc(100vh - 100px); overflow-y: auto; box-shadow: 0 4px 30px rgba(0,0,0,0.5); }
.freetch-sidebar::-webkit-scrollbar { width: 6px; }
.freetch-sidebar::-webkit-scrollbar-thumb { background: #3a3a40; border-radius: 3px; }
.freetch-sidebar-title { font-size: 0.85rem; font-weight: 800; color: #efeff1; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 10px; margin-bottom: 8px; }
.freetch-sidebar-empty { color: #777; padding: 10px; font-size: 0.8rem; text-align: center; line-height: 1.4; }
.sidebar-channel { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.sidebar-channel:hover { background: #2a2a30; }
.sidebar-channel-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; background: #111; }
.sidebar-channel-info { flex: 1; min-width: 0; }
.sidebar-channel-name { font-size: 0.85rem; font-weight: 700; color: #efeff1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar-channel-game { font-size: 0.7rem; color: #adadb8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar-channel-viewers { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #efeff1; font-weight: 600; flex-shrink: 0; }
.sidebar-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #e91916; }
.freetch-root .freetch-sidebar-login { background: var(--primary); color: white; border: none; padding: 10px 6px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; width: 100%; margin-top: 8px; white-space: normal; line-height: 1.3; }
.freetch-main { flex: 1; min-width: 0; }
.freetch-main .container { width: 100%; max-width: none; background: var(--card); padding: 25px; border-radius: 16px; box-shadow: 0 4px 30px rgba(0,0,0,0.5); text-align: center; position: relative; padding-top: 50px; }
@media (max-width: 900px) {
  .freetch-layout { flex-direction: column; }
  .freetch-sidebar { display: none; }
  .freetch-main { width: 100%; }
}
.freetch-root #video-container { width: 100%; margin-bottom: 0; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.8); border: 1px solid #333; border-radius: 12px; overflow: visible; position: relative; }
.freetch-root #video-container .plyr { border-radius: 12px; overflow: hidden; }
.freetch-root #quality-control { position: absolute; top: 12px; right: 12px; z-index: 30; }
.freetch-root #quality-btn { background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: white; border: 1px solid rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 6px; transition: 0.15s; }
.freetch-root #quality-btn:hover { background: rgba(145, 70, 255, 0.7); border-color: var(--primary); }
.freetch-root #quality-menu { position: absolute; top: 100%; right: 0; margin-top: 6px; background: rgba(14,14,16,0.96); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; min-width: 150px; padding: 4px; display: none; box-shadow: 0 4px 20px rgba(0,0,0,0.6); }
.freetch-root #quality-menu.active { display: block; }
.freetch-root .quality-item { padding: 8px 12px; cursor: pointer; color: white; font-size: 0.85rem; font-weight: 600; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; transition: 0.15s; }
.freetch-root .quality-item:hover { background: rgba(145, 70, 255, 0.3); }
.freetch-root .quality-item.active { background: var(--primary); color: white; }
.freetch-root .quality-item.active::after { content: '✓'; margin-left: 8px; }
.freetch-root #stream-title-bar { display: none; padding: 14px 4px 18px; text-align: left; border-bottom: 1px solid #2a2a30; margin-bottom: 18px; }
.freetch-root #stream-title-bar.active { display: block; }
.freetch-root #stream-title { font-size: 1.15rem; font-weight: 700; color: white; margin: 0 0 6px; line-height: 1.35; }
.freetch-root .stream-meta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 0.85rem; color: #adadb8; }
.freetch-root .stream-meta .streamer-name { color: #bf94ff; font-weight: 700; }
.freetch-root .stream-meta .game-name { color: #adadb8; }
.freetch-root .stream-meta .live-tag { display: inline-flex; align-items: center; gap: 5px; background: #e91916; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-weight: 700; }
.freetch-root .stream-meta .live-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: white; }
.freetch-root #chat-side-panel { width: 340px; flex-shrink: 0; background: var(--card); border-radius: 16px; overflow: hidden; display: none; border: 1px solid #333; box-shadow: 0 4px 30px rgba(0,0,0,0.5); position: sticky; top: 80px; align-self: flex-start; height: calc(100vh - 100px); }
.freetch-root #chat-side-panel.active { display: block; }
.freetch-root #chat-side-panel iframe { width: 100%; height: 100%; border: none; display: block; }
@media (max-width: 1100px) {
  .freetch-root #chat-side-panel { width: 100%; height: 400px; position: static; }
}
.freetch-root .plyr { --plyr-color-main: #9146ff; --plyr-video-control-color: #efeff1; --plyr-video-control-background-hover: rgba(255, 255, 255, 0.15); --plyr-menu-background: #18181b; --plyr-menu-color: #efeff1; font-family: 'Inter', sans-serif; border-radius: 12px !important; }
.freetch-root .plyr--video .plyr__control--overlaid { background: rgba(0, 0, 0, 0.6); border-radius: 12px; }
.freetch-root .plyr--video .plyr__control--overlaid:hover { background: #9146ff; }
.freetch-root #chat-overlay { position: absolute; top: 0; right: 0; width: 320px; height: calc(100% - 48px); background: rgba(14, 14, 16, 0.9); z-index: 40; display: none; transition: transform 0.3s ease-in-out; transform: translateX(100%); border-left: 1px solid rgba(255,255,255,0.1); }
.freetch-root #chat-overlay.active { transform: translateX(0); }
.freetch-root #chat-toggle-btn { position: absolute; top: 15px; right: 15px; z-index: 45; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: bold; display: none; backdrop-filter: blur(4px); transition: 0.2s; }
.freetch-root #chat-toggle-btn:hover { background: var(--primary); border-color: var(--primary); }
.freetch-root #langSelect { background: #26262c; border: 1px solid #3a3a40; color: #888; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; width: auto !important; min-width: 60px; }
.freetch-root h1 { font-weight: 800; margin-bottom: 20px; color: #bf94ff; font-size: 1.5rem; margin-top: 0; }
.freetch-root .banner-wrap { position: relative; margin: -10px 0 20px; }
.freetch-root .freetch-banner { display: block; width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(145, 70, 255, 0.25); }
.freetch-root .banner-search { position: absolute; left: 6%; top: 50%; transform: translateY(-50%); width: min(48%, 460px); }
.freetch-root .banner-search > div { position: relative; width: 100%; }
@media (max-width: 700px) {
  .freetch-root .banner-wrap { margin: 0 0 14px; }
  .freetch-root .banner-search { position: static; transform: none; left: auto; top: auto; width: 100%; margin-top: 10px; }
}
.freetch-root .mobile-only { display: none; }
.freetch-root #mobile-alert { display: none; background: rgba(145, 70, 255, 0.15); border: 1px solid var(--primary); color: #e0ccff; padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: left; }
.freetch-root .tabs { display: flex; gap: 10px; margin-bottom: 20px; background: #26262c; padding: 5px; border-radius: 12px; }
.freetch-root .tab-btn { flex: 1; background: transparent; border: none; color: #aaa; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s; }
.freetch-root .tab-btn.active { background: var(--card); color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
.freetch-root .tab-content { display: none; animation: freetchFadeIn 0.3s; }
.freetch-root .tab-content.active { display: block; }
.freetch-root .search-bar { display: flex; gap: 10px; justify-content: center; margin-bottom: 10px; flex-wrap: wrap;}
.freetch-root input[type="text"] { background: #26262c; border: 2px solid #3a3a40; color: white; padding: 12px; border-radius: 10px; font-size: 1rem; flex: 1; min-width: 200px; transition: 0.2s; }
.freetch-root input[type="text"]:focus { outline: none; border-color: var(--primary); }
.freetch-root input#channelInput { background: #1f2937; border: 2px solid #4b5563; color: white; padding: 14px 16px 14px 48px; border-radius: 16px; font-size: 1rem; min-width: 0; width: 100%; transition: all 0.2s; }
.freetch-root input#channelInput::placeholder { color: #6b7280; }
.freetch-root input#channelInput:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
.freetch-root button { border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 1rem; color: white; transition: 0.2s; white-space: nowrap; }
.freetch-root .btn-primary { background: var(--primary); }
.freetch-root .btn-secondary { background: #3a3a40; font-size: 0.9rem; width: 100%; margin-top: 10px; }
.freetch-root .stream-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; margin-top: 10px; }
.freetch-root .stream-card { background: #26262c; border-radius: 12px; overflow: hidden; cursor: pointer; text-align: left; transition: transform 0.2s; border: 1px solid transparent; display: flex; flex-direction: column; }
.freetch-root .stream-card:hover { transform: scale(1.03); border-color: var(--primary); box-shadow: 0 4px 15px rgba(145, 70, 255, 0.2); }
.freetch-root .stream-thumb-wrapper { position: relative; line-height: 0; }
.freetch-root .stream-thumb { width: 100%; aspect-ratio: 16/9; object-fit: cover; background: #111; }
.freetch-root .stream-badge { position: absolute; bottom: 8px; right: 8px; background: rgba(233,25,22,0.95); color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.5); pointer-events: none; }
.freetch-root .stream-info { padding: 10px; }
.freetch-root .stream-title { font-size: 0.85rem; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 5px; line-height: 1.2; color: white;}
.freetch-root .stream-name { font-size: 0.75rem; color: var(--primary); font-weight: 600; }
.freetch-root .history-title { font-size: 0.9rem; color: #bf94ff; margin: 15px 0 10px 0; font-weight: 700; text-align: left; padding-left: 5px; }
.freetch-root #vod-history-container { display: none; margin-bottom: 25px; width: 100%; animation: freetchFadeIn 0.4s; }
.freetch-root #vod-history-list { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: thin; scrollbar-color: var(--primary) #111; }
.freetch-root #vod-history-list::-webkit-scrollbar { height: 8px; }
.freetch-root #vod-history-list::-webkit-scrollbar-track { background: #111; border-radius: 10px; }
.freetch-root #vod-history-list::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }
.freetch-root .history-vod-card { display: flex; align-items: center; gap: 12px; background: #26262c; border: 1px solid #3a3a40; padding: 8px; border-radius: 12px; cursor: pointer; transition: 0.2s; width: 240px; flex-shrink: 0; text-align: left; }
.freetch-root .history-vod-card:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(145, 70, 255, 0.2); }
.freetch-root .history-vod-thumb { width: 80px; height: 45px; object-fit: cover; border-radius: 6px; background: #111; }
.freetch-root .history-vod-info { flex: 1; overflow: hidden; }
.freetch-root .history-vod-title { font-size: 0.8rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white; margin-bottom: 2px; }
.freetch-root .history-vod-streamer { font-size: 0.7rem; color: var(--primary); font-weight: 600; }
.freetch-root #channel-history-container { display: none; margin-bottom: 20px; animation: freetchFadeIn 0.4s; }
.freetch-root #channel-history-list { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.freetch-root .history-tag { background: #26262c; border: 1px solid #3a3a40; color: #ccc; padding: 8px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 5px; }
.freetch-root .history-tag:hover { background: var(--primary); color: white; border-color: var(--primary); transform: scale(1.05); }
.freetch-root .history-clear { font-size: 0.75rem; color: var(--danger); cursor: pointer; font-weight: 600; align-self: center; transition: 0.2s; padding: 6px; margin-left: auto; }
.freetch-root .history-clear:hover { color: white; }
.freetch-root .delete-item-btn { background: rgba(255, 79, 77, 0.15); color: var(--danger); width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; margin-left: auto; transition: 0.2s; flex-shrink: 0; }
.freetch-root .delete-item-btn:hover { background: var(--danger); color: white; }
.freetch-root .live-card { background: rgba(0,0,0,0.2); border: 1px solid #3a3a40; border-radius: 12px; padding: 15px; margin-bottom: 25px; text-align: left; animation: freetchFadeIn 0.5s; display: flex; gap: 15px; flex-wrap: wrap; align-items: center; }
.freetch-root .live-card.online { border-color: #e91916; background: rgba(233, 25, 22, 0.05); }
.freetch-root .live-thumb-container { position: relative; width: 180px; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.freetch-root .live-thumb { width: 100%; height: 100%; object-fit: cover; }
.freetch-root .live-avatar { width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--primary); object-fit: cover; }
.freetch-root .live-info { flex: 1; min-width: 200px; }
.freetch-root .live-title { font-weight: 700; margin-bottom: 5px; line-height: 1.2; }
.freetch-root .live-game { color: var(--primary); font-size: 0.9rem; font-weight: 600; }
.freetch-root .live-badge { display: inline-block; background: #e91916; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-bottom: 5px; }
.freetch-root #vod-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-top: 20px; max-height: 60vh; overflow-y: auto; padding: 5px; display: none; }
.freetch-root .vod-card { background: #26262c; border-radius: 10px; overflow: hidden; cursor: pointer; text-align: left; transition: transform 0.2s; border: 1px solid transparent; }
.freetch-root .vod-card:hover { transform: scale(1.03); border-color: var(--primary); }
.freetch-root .vod-thumb { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
.freetch-root .vod-info { padding: 10px; }
.freetch-root .vod-title { font-size: 0.8rem; font-weight: 600; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;}
.freetch-root .vod-meta { font-size: 0.7rem; color: #aaa; }
.freetch-root #options-bar, .freetch-root .vlc-section { display: none; flex-direction: column; gap: 10px; margin-bottom: 20px; background: #1f1f23; padding: 15px; border-radius: 12px; }
.freetch-root #qualitySelect { background: #26262c; color: white; border: 1px solid #3a3a40; padding: 10px; border-radius: 8px; font-size: 1rem; width: 100%; }
.freetch-root input.vlc-link { width: 100%; font-family: monospace; color: #bf94ff; text-align: center; font-size: 0.8rem; }
.freetch-root #status-msg { margin-bottom: 15px; font-weight: 600; min-height: 1.2em; font-size: 0.95rem; }
.freetch-root .status-loading { color: #e6e619; } .freetch-root .status-success { color: #00ff88; } .freetch-root .status-error { color: #ff4f4d; }
.freetch-root .autocomplete-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: #26262c; border: 1px solid var(--primary); border-radius: 8px; z-index: 100; max-height: 250px; overflow-y: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-align: left; margin-top: 5px; display: none; }
.freetch-root .suggestion-item { padding: 10px; cursor: pointer; color: white; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #3a3a40; transition: 0.2s; }
.freetch-root .suggestion-item:last-child { border-bottom: none; }
.freetch-root .suggestion-item:hover { background: #3a3a40; padding-left: 15px; border-left: 3px solid var(--primary); }
.freetch-root .suggestion-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; background: #111; flex-shrink: 0; }
@media (max-width: 700px) {
  .freetch-root { padding: 10px; }
  .freetch-root .container { padding: 14px; padding-top: 50px; width: 100%; }
  .freetch-root .live-thumb-container { width: 100%; }
  .freetch-root .vlc-section div { flex-wrap: wrap; }
  .freetch-root .stream-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .freetch-root #vod-list { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .freetch-root .tabs { gap: 4px; padding: 4px; }
  .freetch-root .tab-btn { padding: 8px 6px; font-size: 0.85rem; }
  .freetch-root input#channelInput { padding: 12px 14px 12px 42px; font-size: 0.95rem; border-radius: 12px; }
  .freetch-root .history-vod-card { width: 200px; }
  .freetch-root .live-card { padding: 12px; gap: 10px; }
  .freetch-root .live-avatar { width: 42px; height: 42px; }
  .freetch-root .live-thumb-container { width: 100%; }
  .freetch-root #status-msg { font-size: 0.85rem; }
  .freetch-root .history-title { font-size: 0.85rem; }
  .freetch-root #vod-history-list { gap: 8px; }
}
@keyframes freetchFadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function loadStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}

export default function FreetchPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      loadStylesheet('https://cdn.plyr.io/3.8.4/plyr.css');
      await loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest');
      await loadScript('https://cdn.plyr.io/3.8.4/plyr.js');
      if (cancelled) return;

      const API_URL = 'https://test2.kurzmathis4.workers.dev';
      const HELIX_CLIENT_ID = 'lntpeun4pkahw9s90y268acuc141a8';

      const translations: Record<string, Record<string, string>> = {
        fr: { title: 'Regarder Twitch sans Sub', tab_discovery: '🌟 Découverte', tab_id: 'Lien / ID', tab_vod: '📼 VOD', tab_streamer: 'Streamer', mobile_title: '📱 Mode Mobile', mobile_desc: 'Astuce : utilisez Outplayer, VLC ou Infuse.', ph_id: 'ID ou Lien de la VOD', btn_unlock: 'Déverrouiller', ph_streamer: 'Streamer + Mot (Ex: squeezie horreur)', btn_search: '🔍 Chercher', status_ready: 'Prêt.', lbl_quality: 'Qualité :', btn_pip: '📺 Activer PiP', btn_dl: '📥 Fichier M3U8', lbl_link: 'Lien externe :', btn_copy: 'Copier', err_missing: 'Nom manquant.', loading: 'Chargement...', live_on: 'EN DIRECT', btn_watch_live: '▶️ Regarder le Live', no_vod: 'Aucune VOD trouvée.', vods_found: 'VODs trouvées.', err_network: 'Erreur réseau.', err_live: 'Erreur Live.', loading_vod: 'Lancement VOD...', vod_ready: 'VOD en lecture !', err_conn: 'Erreur connexion.', copied: 'Lien copié !', offline: 'HORS LIGNE', offline_since: 'Hors ligne depuis : ', day: 'j', hour: 'h', min: 'min', lbl_vod_history: 'VODs récemment regardées :', lbl_channel_history: 'Streamers récents :', btn_clear: 'Effacer', not_found: '❌ Streamer introuvable.', offline_msg: 'Pas de stream en cours.', followed_channels: '💜 Vos Chaînes Suivies', top_streams: '🔥 Top Streams', btn_refresh: '🔄 Actualiser', btn_logout: 'Déconnexion', login_prompt: 'Connectez-vous pour retrouver facilement vos chaînes préférées et synchroniser votre historique.', btn_login_twitch: '🟣 Se connecter avec Twitch', login_required: 'Veuillez vous connecter pour afficher les streams en cours.', loading_channels: 'Chargement de vos chaînes...', loading_top: 'Chargement du Top...', err_loading: 'Erreur lors du chargement.', no_live: 'Aucune chaîne en live pour le moment.', session_expired: 'Session expirée. Veuillez vous reconnecter.', top_fr: '🇫🇷 FR', top_world: '🌍 Monde' },
        en: { title: 'Watch Twitch No Sub', tab_discovery: '🌟 Discovery', tab_id: 'Link / ID', tab_vod: '📼 VOD', tab_streamer: 'Streamer', mobile_title: '📱 Mobile Mode', mobile_desc: 'Tip: use Outplayer, VLC or Infuse.', ph_id: 'VOD ID or Link', btn_unlock: 'Unlock', ph_streamer: 'Streamer + Word (Ex: shroud horror)', btn_search: '🔍 Search', status_ready: 'Ready.', lbl_quality: 'Quality:', btn_pip: '📺 Toggle PiP', btn_dl: '📥 Download (File)', lbl_link: 'External Link:', btn_copy: 'Copy', err_missing: 'Name missing.', loading: 'Loading...', live_on: 'LIVE NOW', btn_watch_live: '▶️ Watch Live', no_vod: 'No VODs found.', vods_found: 'VODs found.', err_network: 'Network error.', err_live: 'Live error.', loading_vod: 'Loading VOD...', vod_ready: 'VOD Playing!', err_conn: 'Connection error.', copied: 'Link copied!', offline: 'OFFLINE', offline_since: 'Offline since: ', day: 'd', hour: 'h', min: 'min', lbl_vod_history: 'Recently watched VODs:', lbl_channel_history: 'Recent Streamers:', btn_clear: 'Clear', not_found: '❌ Streamer not found.', offline_msg: 'Stream is offline.', followed_channels: '💜 Followed Channels', top_streams: '🔥 Top Streams', btn_refresh: '🔄 Refresh', btn_logout: 'Logout', login_prompt: 'Log in to easily find your favorite channels and sync your history.', btn_login_twitch: '🟣 Log in with Twitch', login_required: 'Please log in to view live streams.', loading_channels: 'Loading your channels...', loading_top: 'Loading Top...', err_loading: 'Error loading data.', no_live: 'No live channels at the moment.', session_expired: 'Session expired. Please log in again.', top_fr: '🇫🇷 FR', top_world: '🌍 World' },
        es: { title: 'Ver Twitch sin Sub', tab_discovery: '🌟 Descubrir', tab_id: 'Enlace / ID', tab_vod: '📼 VOD', tab_streamer: 'Streamer', mobile_title: '📱 Modo Móvil', mobile_desc: 'Consejo: usa Outplayer, VLC o Infuse.', ph_id: 'ID o Enlace VOD', btn_unlock: 'Desbloquear', ph_streamer: 'Streamer + Palabra (Ej: ibai horror)', btn_search: '🔍 Buscar', status_ready: 'Listo.', lbl_quality: 'Calidad:', btn_pip: '📺 Modo PiP', btn_dl: '📥 Descargar', lbl_link: 'Enlace externo:', btn_copy: 'Copiar', err_missing: 'Falta el nombre.', loading: 'Cargando...', live_on: 'EN VIVO', btn_watch_live: '▶️ Ver Directo', no_vod: 'No se encontraron VODs.', vods_found: 'VODs encontrados.', err_network: 'Error de red.', err_live: 'Error de directo.', loading_vod: 'Cargando VOD...', vod_ready: 'VOD Reproduciendo!', err_conn: 'Error de conexión.', copied: 'Enlace copiado!', offline: 'DESCONECTADO', offline_since: 'Desconectado desde: ', day: 'd', hour: 'h', min: 'min', lbl_vod_history: 'VODs recientes:', lbl_channel_history: 'Streamers recientes:', btn_clear: 'Borrar', not_found: '❌ Streamer no encontrado.', offline_msg: 'No hay directo en curso.', followed_channels: '💜 Canales Seguidos', top_streams: '🔥 Top Streams', btn_refresh: '🔄 Actualizar', btn_logout: 'Cerrar sesión', login_prompt: 'Inicia sesión para encontrar tus canales favoritos y sincronizar tu historial.', btn_login_twitch: '🟣 Iniciar sesión con Twitch', login_required: 'Inicia sesión para ver los streams.', loading_channels: 'Cargando tus canales...', loading_top: 'Cargando Top...', err_loading: 'Error al cargar.', no_live: 'No hay canales en vivo ahora.', session_expired: 'Sesión expirada. Inicia sesión de nuevo.', top_fr: '🇫🇷 FR', top_world: '🌍 Mundo' },
      };

      let currentLang: string = 'fr';
      let currentTopLang: string = 'fr';
      let currentLinks: Record<string, string> = {};
      let hls: any = null;
      let player: any = null;
      let useProxy = localStorage.getItem('twitch_use_proxy') !== 'false';
      let searchHistory: any[] = JSON.parse(localStorage.getItem('twitch_vod_history') || '[]');
      let globalTwitchUserId: string | null = null;
      let currentVodId: string | null = null;
      let isNewVodLoad = false;
      let lastSaveTime = 0;
      let searchTimeout: any = null;
      let syncTimeout: any = null;

      const root = rootRef.current!;
      const $ = (id: string) => root.querySelector('#' + id) as HTMLElement | null;

      const elementsCache = {
        status: $('status-msg') as HTMLElement,
        vodList: $('vod-list') as HTMLElement,
        videoContainer: $('video-container') as HTMLElement,
        liveArea: $('live-area') as HTMLElement,
        langSelect: $('langSelect') as HTMLSelectElement,
      };
      let currentQuality = '';

      function qualityLabel(q: string) { return q.toUpperCase().replace('CHUNKED', 'SOURCE'); }

      function buildQualityMenu(links: Record<string, string>) {
        const menu = $('quality-menu') as HTMLElement | null;
        if (!menu) return;
        menu.innerHTML = '';
        Object.keys(links).forEach((q) => {
          const item = document.createElement('div');
          item.className = 'quality-item' + (q === currentQuality ? ' active' : '');
          item.dataset.quality = q;
          item.textContent = qualityLabel(q);
          item.onclick = (e) => {
            e.stopPropagation();
            currentQuality = q;
            menu.classList.remove('active');
            changeQuality();
            updateQualityUI();
          };
          menu.appendChild(item);
        });
      }

      function updateQualityUI() {
        const display = $('quality-current') as HTMLElement | null;
        if (display) display.textContent = qualityLabel(currentQuality);
        const menu = $('quality-menu') as HTMLElement | null;
        if (menu) menu.querySelectorAll('.quality-item').forEach((it) => {
          it.classList.toggle('active', (it as HTMLElement).dataset.quality === currentQuality);
        });
      }

      function txt(key: string) { return translations[currentLang][key] || key; }
      function setStreamTitle(title: string | null, streamer?: string | null, game?: string | null, isLive?: boolean) {
        const bar = $('stream-title-bar') as HTMLElement | null;
        const titleEl = $('stream-title') as HTMLElement | null;
        const metaEl = $('stream-meta') as HTMLElement | null;
        if (!bar || !titleEl || !metaEl) return;
        if (!title) { bar.classList.remove('active'); titleEl.textContent = ''; metaEl.innerHTML = ''; return; }
        bar.classList.add('active');
        titleEl.textContent = title;
        const parts: string[] = [];
        if (isLive) parts.push('<span class="live-tag">EN DIRECT</span>');
        if (streamer) parts.push(`<span class="streamer-name">${streamer}</span>`);
        if (game) parts.push(`<span class="game-name">${game}</span>`);
        metaEl.innerHTML = parts.join('');
      }
      function setStatus(msgKey: string, type?: string) {
        elementsCache.status.textContent = translations[currentLang][msgKey] || msgKey;
        elementsCache.status.className = type ? 'status-' + type : '';
      }

      function setLanguage(lang: string) {
        currentLang = lang;
        if (elementsCache.langSelect) elementsCache.langSelect.value = lang;
        root.querySelectorAll('[data-lang]').forEach((el) => {
          const key = el.getAttribute('data-lang')!;
          if (translations[lang][key]) (el as HTMLElement).innerHTML = translations[lang][key];
        });
        root.querySelectorAll('[data-placeholder]').forEach((el) => {
          const key = el.getAttribute('data-placeholder')!;
          if (translations[lang][key]) (el as HTMLInputElement).placeholder = translations[lang][key];
        });
        renderHistory();
      }

      function toggleProxyPref() {
        useProxy = ($('proxyToggle') as HTMLInputElement).checked;
        localStorage.setItem('twitch_use_proxy', String(useProxy));
      }

      function loginTwitch() {
        const redirectUri = window.location.origin + window.location.pathname;
        const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${HELIX_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=user:read:follows`;
        const width = 500, height = 700, left = (screen.width / 2) - (width / 2), top = (screen.height / 2) - (height / 2);
        window.open(authUrl, 'TwitchLogin', `width=${width},height=${height},top=${top},left=${left}`);
      }

      function logoutTwitch() {
        localStorage.removeItem('twitch_token');
        globalTwitchUserId = null;
        loadDiscovery();
      }

      function checkTwitchAuthFallback() {
        const hash = window.location.hash;
        if (hash.includes('access_token=') && !window.opener) {
          const token = new URLSearchParams(hash.substring(1)).get('access_token');
          if (token) { localStorage.setItem('twitch_token', token); window.history.replaceState(null, '', window.location.pathname); }
        }
      }

      async function syncDataFromServer(userId: string) {
        try {
          const res = await fetch(`${API_URL}/api/sync/get?userId=${userId}`);
          const data = await res.json();
          if (data && data.history) {
            searchHistory = data.history;
            localStorage.setItem('twitch_vod_history', JSON.stringify(searchHistory));
            if (data.progress) {
              for (const [vodId, time] of Object.entries(data.progress)) {
                localStorage.setItem('vod_progress_' + vodId, String(time));
              }
            }
            renderHistory();
          }
        } catch (e) { console.error('Erreur Sync GET:', e); }
      }

      async function syncDataToServer() {
        if (!globalTwitchUserId) return;
        const progressData: Record<string, number> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)!;
          if (key.startsWith('vod_progress_')) progressData[key.replace('vod_progress_', '')] = parseFloat(localStorage.getItem(key)!);
        }
        const payload = { userId: globalTwitchUserId, data: { history: searchHistory, progress: progressData } };
        try { await fetch(`${API_URL}/api/sync/post`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); } catch (e) { /* */ }
      }

      function debouncedCloudSave() { clearTimeout(syncTimeout); syncTimeout = setTimeout(syncDataToServer, 5000); }

      async function loadDiscovery() {
        const followedDiv = $('discovery-followed') as HTMLElement;
        const topDiv = $('discovery-top') as HTMLElement;
        const controlsDiv = $('discovery-controls') as HTMLElement;
        const token = localStorage.getItem('twitch_token');

        if (!token) {
          controlsDiv.innerHTML = '';
          followedDiv.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px dashed #333;">
              <p style="margin-bottom: 15px; color: #aaa; font-weight: 600;" data-lang="login_prompt">${txt('login_prompt')}</p>
              <button class="btn-primary" data-action="login" style="background: #9146ff; font-size: 1.1rem; padding: 15px 30px;" data-lang="btn_login_twitch">${txt('btn_login_twitch')}</button>
            </div>`;
          topDiv.innerHTML = `<span style='color:#777; grid-column: 1 / -1; text-align: center;' data-lang="login_required">${txt('login_required')}</span>`;
          renderFollowedSidebar([], false);
          return;
        }

        controlsDiv.innerHTML = `
          <button class="btn-secondary" data-action="refresh" style="width:auto; padding: 5px 10px; margin:0;" data-lang="btn_refresh">${txt('btn_refresh')}</button>
          <button class="btn-secondary" data-action="logout" style="width:auto; padding: 5px 10px; margin:0; background: rgba(255, 79, 77, 0.2); color: var(--danger); border: 1px solid var(--danger);" data-lang="btn_logout">${txt('btn_logout')}</button>`;

        followedDiv.innerHTML = `<span class="status-loading" data-lang="loading_channels">${txt('loading_channels')}</span>`;
        loadTopStreams(currentTopLang);

        try {
          const userRes = await fetch('https://api.twitch.tv/helix/users', { headers: { 'Authorization': `Bearer ${token}`, 'Client-Id': HELIX_CLIENT_ID } });
          if (!userRes.ok) throw new Error('Token invalide ou expiré');
          const userData = await userRes.json();
          const userId = userData.data[0].id;
          if (globalTwitchUserId !== userId) {
            globalTwitchUserId = userId;
            await syncDataFromServer(userId);
          }
          const resFollowed = await fetch(`https://api.twitch.tv/helix/streams/followed?user_id=${userId}&first=20`, { headers: { 'Authorization': `Bearer ${token}`, 'Client-Id': HELIX_CLIENT_ID } });
          const dataFollowed = await resFollowed.json();
          const followedStreams: any[] = dataFollowed.data || [];
          if (followedStreams.length > 0) {
            try {
              const idsParam = followedStreams.map((s: any) => 'id=' + s.user_id).join('&');
              const usersRes = await fetch('https://api.twitch.tv/helix/users?' + idsParam, { headers: { 'Authorization': `Bearer ${token}`, 'Client-Id': HELIX_CLIENT_ID } });
              const usersData = await usersRes.json();
              const avatarMap: Record<string, string> = Object.fromEntries((usersData.data || []).map((u: any) => [u.id, u.profile_image_url]));
              followedStreams.forEach((s: any) => { s.profile_image_url = avatarMap[s.user_id]; });
            } catch (e) { /* avatars optional */ }
          }
          followedDiv.innerHTML = renderStreamGrid(followedStreams);
          renderFollowedSidebar(followedStreams, true);
        } catch (e) {
          localStorage.removeItem('twitch_token');
          followedDiv.innerHTML = `<span class="status-error" style="grid-column: 1 / -1;" data-lang="session_expired">${txt('session_expired')}</span>`;
          topDiv.innerHTML = ''; controlsDiv.innerHTML = '';
          setTimeout(loadDiscovery, 2000);
        }
      }

      async function loadTopStreams(lang: string) {
        currentTopLang = lang;
        const topDiv = $('discovery-top') as HTMLElement;
        const token = localStorage.getItem('twitch_token');
        if (!token) return;
        const btnFr = $('btn-top-fr') as HTMLElement;
        const btnWorld = $('btn-top-world') as HTMLElement;
        btnFr.classList.remove('active'); btnWorld.classList.remove('active');
        if (lang === 'fr') btnFr.classList.add('active'); else btnWorld.classList.add('active');
        topDiv.innerHTML = `<span class="status-loading" data-lang="loading_top">${txt('loading_top')}</span>`;
        let url = `https://api.twitch.tv/helix/streams?first=20`;
        if (lang === 'fr') url += `&language=fr`;
        try {
          const resTop = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Client-Id': HELIX_CLIENT_ID } });
          const dataTop = await resTop.json();
          topDiv.innerHTML = renderStreamGrid(dataTop.data);
        } catch (e) { topDiv.innerHTML = `<span class="status-error" style="grid-column: 1 / -1;" data-lang="err_loading">${txt('err_loading')}</span>`; }
      }

      function renderFollowedSidebar(streams: any[], loggedIn: boolean) {
        const list = $('sidebar-followed-list') as HTMLElement | null;
        if (!list) return;
        if (!loggedIn) {
          list.innerHTML = `<div class="freetch-sidebar-empty">${txt('login_prompt')}</div><button class="freetch-sidebar-login" data-action="login">${txt('btn_login_twitch')}</button>`;
          return;
        }
        if (!streams || streams.length === 0) {
          list.innerHTML = `<div class="freetch-sidebar-empty">${txt('no_live')}</div>`;
          return;
        }
        list.innerHTML = streams.map((s: any) => {
          const viewers = s.viewer_count >= 1000 ? (s.viewer_count / 1000).toFixed(1) + 'k' : s.viewer_count;
          const avatar = s.profile_image_url || 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-70x70.png';
          return `
            <div class="sidebar-channel" data-action="play-discovery" data-channel="${s.user_login}" title="${s.title || ''}">
              <img src="${avatar}" class="sidebar-channel-avatar" loading="lazy">
              <div class="sidebar-channel-info">
                <div class="sidebar-channel-name">${s.user_name}</div>
                <div class="sidebar-channel-game">${s.game_name || ''}</div>
              </div>
              <div class="sidebar-channel-viewers"><span class="sidebar-live-dot"></span>${viewers}</div>
            </div>`;
        }).join('');
      }

      function renderStreamGrid(streams: any[]) {
        if (!streams || streams.length === 0) return `<span style='color:#aaa; grid-column: 1 / -1;' data-lang="no_live">${txt('no_live')}</span>`;
        return streams.map((s: any) => {
          const thumb = s.thumbnail_url.replace('{width}', '320').replace('{height}', '180');
          const viewers = s.viewer_count >= 1000 ? (s.viewer_count / 1000).toFixed(1) + 'k' : s.viewer_count;
          return `
            <div class="stream-card" data-action="play-discovery" data-channel="${s.user_login}">
              <div class="stream-thumb-wrapper">
                <img src="${thumb}" class="stream-thumb">
                <span class="stream-badge">🔴 ${viewers}</span>
              </div>
              <div class="stream-info">
                <div class="stream-title" title="${s.title}">${s.title}</div>
                <div class="stream-name">${s.user_name} • ${s.game_name}</div>
              </div>
            </div>`;
        }).join('');
      }

      function playFromDiscovery(channelName: string) {
        ($('channelInput') as HTMLInputElement).value = channelName;
        switchTab('discovery');
        searchStreamer(true);
      }

      function saveToHistory(term: string, type: string, displayTitle: string, extraData: any = {}) {
        searchHistory = searchHistory.filter((item) => item.term.toLowerCase() !== term.toLowerCase());
        searchHistory.unshift({ term, type, display: displayTitle || term, ...extraData });
        if (searchHistory.length > 20) searchHistory.pop();
        localStorage.setItem('twitch_vod_history', JSON.stringify(searchHistory));
        renderHistory();
        debouncedCloudSave();
      }

      function removeFromHistory(event: Event, term: string) {
        event.stopPropagation();
        searchHistory = searchHistory.filter((item) => item.term !== term);
        localStorage.setItem('twitch_vod_history', JSON.stringify(searchHistory));
        renderHistory();
        debouncedCloudSave();
      }

      function renderHistory() {
        const vods = searchHistory.filter((h) => h.type === 'vod').slice(0, 10);
        const channels = searchHistory.filter((h) => h.type === 'channel').slice(0, 5);
        const elements = {
          vodHistoryContainer: $('vod-history-container') as HTMLElement,
          vodHistoryList: $('vod-history-list') as HTMLElement,
          chanHistoryContainer: $('channel-history-container') as HTMLElement,
          chanHistoryList: $('channel-history-list') as HTMLElement,
        };

        if (vods.length > 0) {
          elements.vodHistoryContainer.style.display = 'block';
          elements.vodHistoryList.innerHTML = '';
          vods.forEach((item) => {
            const div = document.createElement('div'); div.className = 'history-vod-card';
            const thumb = item.thumb || 'https://vod-secure.twitch.tv/_404/404_processing_320x180.png';
            const streamer = item.streamer || 'VOD';
            div.innerHTML = `<img src="${thumb}" class="history-vod-thumb"><div class="history-vod-info"><div class="history-vod-title">${item.display}</div><div class="history-vod-streamer">${streamer}</div></div><div class="delete-item-btn" data-action="del-history" data-term="${item.term}">✖</div>`;
            div.onclick = () => { fetchAndPlayVod(item.term, item.display, item.thumb, item.streamer); };
            elements.vodHistoryList.appendChild(div);
          });
        } else { elements.vodHistoryContainer.style.display = 'none'; }

        if (channels.length > 0) {
          elements.chanHistoryContainer.style.display = 'block';
          elements.chanHistoryList.innerHTML = '';
          channels.forEach((item) => {
            const tag = document.createElement('div'); tag.className = 'history-tag';
            tag.innerHTML = `👤 ${item.display} <span class="delete-item-btn" data-action="del-history" data-term="${item.term}" style="margin-left: 5px; width: 18px; height: 18px; background: transparent;">✖</span>`;
            tag.onclick = () => { ($('channelInput') as HTMLInputElement).value = item.term; switchTab('channel'); searchStreamer(); };
            elements.chanHistoryList.appendChild(tag);
          });
          const clearBtn = document.createElement('div'); clearBtn.className = 'history-clear';
          clearBtn.innerHTML = `🗑️ ${txt('btn_clear')} Tout`;
          clearBtn.onclick = () => {
            searchHistory = searchHistory.filter((h) => h.type === 'vod');
            localStorage.setItem('twitch_vod_history', JSON.stringify(searchHistory));
            renderHistory();
            debouncedCloudSave();
          };
          elements.chanHistoryList.appendChild(clearBtn);
        } else { elements.chanHistoryContainer.style.display = 'none'; }
      }

      function switchTab(tab: string) {
        root.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        root.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
        if (tab === 'discovery') {
          (root.querySelector('.tabs .tab-btn:nth-child(1)') as HTMLElement).classList.add('active');
          ($('tab-discovery') as HTMLElement).classList.add('active');
          if (($('discovery-followed') as HTMLElement).innerHTML === '') loadDiscovery();
        } else {
          (root.querySelector('.tabs .tab-btn:nth-child(2)') as HTMLElement).classList.add('active');
          ($('tab-vod') as HTMLElement).classList.add('active');
        }
      }

      function getTimeSince(dateString: string, durationSeconds: number) {
        const endDate = new Date(new Date(dateString).getTime() + durationSeconds * 1000);
        const diff = new Date().getTime() - endDate.getTime();
        if (diff < 0) return '';
        const minutes = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
        if (days > 0) return `${days} ${txt('day')}`;
        if (hours > 0) return `${hours} ${txt('hour')}`;
        return `${minutes} ${txt('min')}`;
      }

      async function searchStreamer(autoPlay = false) {
        const rawInput = ($('channelInput') as HTMLInputElement).value.trim();
        if (!rawInput) return setStatus('err_missing', 'error');
        const parts = rawInput.split(' ');
        const channelName = parts[0];
        const searchKeyword = parts.slice(1).join(' ').toLowerCase();
        switchTab('discovery');
        setStatus('loading', 'loading'); elementsCache.vodList.style.display = 'none'; elementsCache.liveArea.innerHTML = ''; hidePlayer();
        try {
          const [resVods, resLive] = await Promise.all([
            fetch(`${API_URL}/api/get-channel-videos?name=${channelName}`),
            fetch(`${API_URL}/api/get-live?name=${channelName}&proxy=${useProxy}`),
          ]);
          const dataLive = await resLive.json(); const dataVods = await resVods.json();
          const hasAvatar = dataLive.avatar || dataVods.avatar;
          if (dataLive.error && dataVods.error && !hasAvatar) { setStatus('not_found', 'error'); return; }
          saveToHistory(channelName, 'channel', channelName);
          const avatarUrl = hasAvatar || 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-70x70.png';

          if (!dataLive.error) {
            const thumbUrl = dataLive.thumbnail ? dataLive.thumbnail.replace('{width}', '320').replace('{height}', '180') : '';
            elementsCache.liveArea.innerHTML = `<div class="live-card online"><img src="${avatarUrl}" class="live-avatar"><div class="live-info"><span class="live-badge">${txt('live_on')}</span><div class="live-title">${dataLive.title}</div><div class="live-game">${dataLive.game}</div><button class="btn-primary" data-action="watch-live" style="margin-top:10px; width:100%">${txt('btn_watch_live')}</button></div>${thumbUrl ? `<div class="live-thumb-container"><img src="${thumbUrl}" class="live-thumb"></div>` : ''}</div>`;
            if (autoPlay) watchLive();
          } else {
            let offlineText = txt('offline_msg') || 'Pas de stream en cours.';
            if (!dataVods.error && dataVods.videos && dataVods.videos.length > 0) {
              const timeSinceStr = getTimeSince(dataVods.videos[0].publishedAt, dataVods.videos[0].lengthSeconds);
              if (timeSinceStr) offlineText = `<span style="color:#e91916; font-weight:700;">${txt('offline_since')} ${timeSinceStr}</span>`;
            }
            elementsCache.liveArea.innerHTML = `<div class="live-card"><img src="${avatarUrl}" class="live-avatar" style="border-color:#555"><div class="live-info"><span class="live-badge" style="background:#555">${txt('offline')}</span><div class="live-title" style="color:#aaa; margin-top:5px;">${offlineText}</div></div></div>`;
          }

          if (dataVods.error) { setStatus('no_vod', 'error'); } else {
            const vodEmpty = $('vod-empty') as HTMLElement | null;
            if (vodEmpty) vodEmpty.style.display = 'none';
            elementsCache.vodList.innerHTML = '';
            elementsCache.vodList.style.display = 'grid';
            let displayedCount = 0;
            dataVods.videos.forEach((vod: any) => {
              const titleLower = vod.title.toLowerCase();
              const date = new Date(vod.publishedAt).toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US');
              if (searchKeyword && !titleLower.includes(searchKeyword) && !date.includes(searchKeyword)) return;
              displayedCount++;
              const card = document.createElement('div'); card.className = 'vod-card';
              card.onclick = () => fetchAndPlayVod(vod.id, vod.title, vod.previewThumbnailURL, channelName);
              const duration = Math.floor(vod.lengthSeconds / 60) + ' min';
              card.innerHTML = `<div class="stream-thumb-wrapper"><img src="${vod.previewThumbnailURL}" class="vod-thumb"></div><div class="vod-info"><div class="vod-title">${vod.title}</div><div class="vod-meta">${date} • ${duration}</div></div>`;
              elementsCache.vodList.appendChild(card);
            });
            if (displayedCount === 0 && searchKeyword) {
              setStatus(`Aucun résultat pour "${searchKeyword}"`, 'error');
              elementsCache.vodList.innerHTML = `<span style='color:#aaa; grid-column: 1 / -1; text-align: center; padding: 20px;'>Aucune VOD trouvée avec le terme <b>"${searchKeyword}"</b> dans les 100 dernières vidéos.</span>`;
            } else {
              setStatus(searchKeyword ? `${displayedCount} résultat(s) pour "${searchKeyword}"` : 'vods_found', 'success');
            }
          }
        } catch (e) { setStatus('err_network', 'error'); }
      }

      async function watchLive() {
        const rawInput = ($('channelInput') as HTMLInputElement).value.trim();
        const channelName = rawInput.split(' ')[0];
        try {
          const response = await fetch(`${API_URL}/api/get-live?name=${channelName}&proxy=${useProxy}`);
          const data = await response.json();
          if (data.error) return setStatus(data.error, 'error');
          const domain = window.location.hostname || 'localhost';
          const chatPanel = $('chat-side-panel') as HTMLElement | null;
          if (chatPanel) {
            chatPanel.innerHTML = `<iframe src="https://www.twitch.tv/embed/${channelName}/chat?parent=${domain}&darkpopout" frameborder="0" scrolling="no"></iframe>`;
            chatPanel.classList.add('active');
          }
          currentVodId = null; setupPlayer(data.links);
          setStreamTitle(data.title || channelName, channelName, data.game, true);
          setStatus('vod_ready', 'success');
          scrollToPlayer();
        } catch (e) { setStatus('err_live', 'error'); }
      }

      async function fetchAndPlayVod(id: string, title: string | null, thumb: string | null = null, streamer: string | null = null) {
        setStatus('loading_vod', 'loading');
        try {
          const response = await fetch(`${API_URL}/api/get-m3u8?id=${id}&proxy=${useProxy}`);
          const data = await response.json();
          if (data.error) return setStatus(data.error, 'error');
          const chatPanel = $('chat-side-panel') as HTMLElement | null;
          if (chatPanel) { chatPanel.innerHTML = ''; chatPanel.classList.remove('active'); }
          saveToHistory(id, 'vod', title || `VOD ${id}`, { thumb, streamer });
          currentVodId = id; isNewVodLoad = true; setupPlayer(data.links);
          setStreamTitle(title || `VOD ${id}`, streamer, null, false);
          setStatus('vod_ready', 'success');
          scrollToPlayer();
        } catch (e) { setStatus('err_conn', 'error'); }
      }

      async function playVodById(rawId: string) {
        const id = (rawId.match(/\d{8,}/) || [])[0];
        if (!id) return setStatus('ID invalide', 'error');
        setStatus('loading_vod', 'loading');
        let title: string | null = null, thumb: string | null = null, streamer: string | null = null;
        try {
          const res = await fetch('https://gql.twitch.tv/gql', {
            method: 'POST',
            headers: { 'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko' },
            body: JSON.stringify({ query: `query { video(id: "${id}") { title, owner { displayName }, previewThumbnailURL(height: 180, width: 320) } }` }),
          });
          const json = await res.json();
          if (json.data && json.data.video) { title = json.data.video.title; streamer = json.data.video.owner?.displayName || 'Inconnu'; thumb = json.data.video.previewThumbnailURL; }
        } catch (e) { /* */ }
        fetchAndPlayVod(id, title, thumb, streamer);
      }

      function scrollToPlayer() { ($('video-container') as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' }); }

      function setupPlayer(links: Record<string, string>) {
        currentLinks = links;
        const keys = Object.keys(links);
        currentQuality = keys[0] || '';
        buildQualityMenu(links);
        updateQualityUI();
        elementsCache.videoContainer.style.display = 'block';
        const qctrl = $('quality-control') as HTMLElement | null;
        if (qctrl) qctrl.style.display = 'block';
        changeQuality();
      }

      function changeQuality() {
        const rawUrl = currentLinks[currentQuality]; if (!rawUrl) return;
        const video = $('freetch-player') as HTMLVideoElement;
        let timeToRestore = isNewVodLoad ? 0 : video.currentTime;
        if (isNewVodLoad && currentVodId) {
          const savedTime = localStorage.getItem('vod_progress_' + currentVodId);
          if (savedTime) timeToRestore = parseFloat(savedTime);
        }
        isNewVodLoad = false;
        const restoreAndPlay = () => { if (timeToRestore > 0) video.currentTime = timeToRestore; video.play().catch(() => {}); };
        const Hls = window.Hls;
        if (Hls && Hls.isSupported()) {
          if (hls) hls.destroy();
          hls = new Hls();
          hls.loadSource(rawUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, restoreAndPlay);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = rawUrl;
          video.addEventListener('loadedmetadata', restoreAndPlay, { once: true });
        }
      }

      function hidePlayer() {
        elementsCache.videoContainer.style.display = 'none';
        const qctrl = $('quality-control') as HTMLElement | null;
        if (qctrl) qctrl.style.display = 'none';
        const qmenu = $('quality-menu') as HTMLElement | null;
        if (qmenu) qmenu.classList.remove('active');
        setStreamTitle(null);
        if (hls) hls.destroy();
        if (player) player.stop();
        const chatPanel = $('chat-side-panel') as HTMLElement | null;
        if (chatPanel) { chatPanel.innerHTML = ''; chatPanel.classList.remove('active'); }
      }

      function setupAutocomplete() {
        const input = $('channelInput') as HTMLInputElement;
        const box = $('autocomplete-box') as HTMLElement;
        input.addEventListener('input', (e) => {
          const rawVal = (e.target as HTMLInputElement).value;
          const val = rawVal.split(' ')[0].toLowerCase().trim();
          clearTimeout(searchTimeout);
          if (!val || rawVal.includes(' ')) { box.style.display = 'none'; return; }
          searchTimeout = setTimeout(async () => {
            const suggestions: any[] = [];
            searchHistory.filter((h) => h.type === 'channel').forEach((h) => {
              if (h.term.toLowerCase().includes(val)) suggestions.push({ login: h.term, name: h.display, avatar: null });
            });
            try {
              const res = await fetch('https://gql.twitch.tv/gql', {
                method: 'POST',
                headers: { 'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko' },
                body: JSON.stringify({ query: `query { searchUsers(userQuery: "${val}", first: 5) { edges { node { login, displayName, profileImageURL(width: 70) } } } }` }),
              });
              const json = await res.json();
              const edges = json.data?.searchUsers?.edges || [];
              edges.forEach((edge: any) => {
                const channel = edge.node;
                if (channel && channel.login) suggestions.push({ login: channel.login, name: channel.displayName, avatar: channel.profileImageURL });
              });
            } catch (err) { console.error('Erreur API Autocomplete:', err); }
            const unique: any[] = []; const seen = new Set();
            suggestions.forEach((s) => { if (!seen.has(s.login)) { seen.add(s.login); unique.push(s); } });
            if (unique.length > 0) {
              box.innerHTML = unique.slice(0, 6).map((s) => `
                <div class="suggestion-item" data-action="suggest" data-login="${s.login}">
                  ${s.avatar ? `<img src="${s.avatar}" class="suggestion-avatar">` : `<div class="suggestion-avatar" style="display:flex;align-items:center;justify-content:center;font-size:12px;">👤</div>`}
                  <div>
                    <div style="font-weight: 700; font-size: 0.9rem;">${s.name}</div>
                    ${s.login !== s.name.toLowerCase() ? `<div style="font-size: 0.7rem; color: #aaa;">${s.login}</div>` : ''}
                  </div>
                </div>`).join('');
              box.style.display = 'block';
            } else {
              box.style.display = 'none';
            }
          }, 300);
        });
        const docClick = (e: Event) => {
          if (!input.contains(e.target as Node) && !box.contains(e.target as Node)) box.style.display = 'none';
        };
        document.addEventListener('click', docClick);
      }

      function selectSuggestion(login: string) {
        const input = $('channelInput') as HTMLInputElement;
        input.value = login + ' ';
        ($('autocomplete-box') as HTMLElement).style.display = 'none';
        searchStreamer();
      }

      // Delegated click handler for dynamic content
      const onRootClick = (e: Event) => {
        const target = e.target as HTMLElement;
        const actionEl = target.closest('[data-action]') as HTMLElement | null;
        if (!actionEl) return;
        const action = actionEl.getAttribute('data-action');
        if (action === 'login') { e.stopPropagation(); loginTwitch(); }
        else if (action === 'logout') { e.stopPropagation(); logoutTwitch(); }
        else if (action === 'refresh') { e.stopPropagation(); loadDiscovery(); }
        else if (action === 'play-discovery') { e.stopPropagation(); playFromDiscovery(actionEl.getAttribute('data-channel')!); }
        else if (action === 'watch-live') { e.stopPropagation(); watchLive(); }
        else if (action === 'suggest') { e.stopPropagation(); selectSuggestion(actionEl.getAttribute('data-login')!); }
        else if (action === 'del-history') { removeFromHistory(e, actionEl.getAttribute('data-term')!); }
      };
      root.addEventListener('click', onRootClick);

      // Static handlers
      ($('proxyToggle') as HTMLInputElement).addEventListener('change', toggleProxyPref);
      (elementsCache.langSelect as HTMLSelectElement).addEventListener('change', (e) => setLanguage((e.target as HTMLSelectElement).value));
      (root.querySelectorAll('.tabs > .tab-btn')[0] as HTMLElement).addEventListener('click', () => switchTab('discovery'));
      (root.querySelectorAll('.tabs > .tab-btn')[1] as HTMLElement).addEventListener('click', () => switchTab('direct'));
      ($('btn-top-fr') as HTMLElement).addEventListener('click', () => loadTopStreams('fr'));
      ($('btn-top-world') as HTMLElement).addEventListener('click', () => loadTopStreams('all'));

      const qBtn = $('quality-btn');
      const qMenu = $('quality-menu');
      if (qBtn && qMenu) {
        qBtn.addEventListener('click', (e) => { e.stopPropagation(); qMenu.classList.toggle('active'); });
      }
      const onDocClickQuality = (e: Event) => {
        if (!qMenu || !qMenu.classList.contains('active')) return;
        const target = e.target as Node;
        if (qMenu.contains(target) || (qBtn && qBtn.contains(target))) return;
        qMenu.classList.remove('active');
      };
      document.addEventListener('click', onDocClickQuality);

      ($('channelInput') as HTMLInputElement).addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          searchStreamer();
          ($('autocomplete-box') as HTMLElement).style.display = 'none';
        }
      });

      // Popup auth message handler
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (typeof event.data === 'string' && event.data.includes('access_token=')) {
          const token = new URLSearchParams(event.data.substring(1)).get('access_token');
          if (token) { localStorage.setItem('twitch_token', token); loadDiscovery(); }
        }
      };
      window.addEventListener('message', onMessage);

      // Init
      const userLang = navigator.language.slice(0, 2);
      if (translations[userLang]) setLanguage(userLang); else setLanguage('fr');
      ($('proxyToggle') as HTMLInputElement).checked = useProxy;

      setupAutocomplete();

      const Plyr = window.Plyr;
      player = new Plyr('#freetch-player', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'],
        settings: ['speed'],
        fullscreen: { enabled: true, fallback: true, iosNative: true },
      });

      player.on('timeupdate', () => {
        const video = $('freetch-player') as HTMLVideoElement;
        if (currentVodId && video.currentTime > 0) {
          if (Math.abs(video.currentTime - lastSaveTime) > 5) {
            localStorage.setItem('vod_progress_' + currentVodId, String(video.currentTime));
            lastSaveTime = video.currentTime;
            debouncedCloudSave();
          }
        }
      });

      checkTwitchAuthFallback();
      renderHistory();

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('id')) { playVodById(urlParams.get('id')!); }
      else if (urlParams.get('channel')) { ($('channelInput') as HTMLInputElement).value = urlParams.get('channel')!; switchTab('discovery'); searchStreamer(true); }
      else { switchTab('discovery'); }

      cleanup = () => {
        window.removeEventListener('message', onMessage);
        document.removeEventListener('click', onDocClickQuality);
        root.removeEventListener('click', onRootClick);
        try { if (hls) hls.destroy(); } catch (e) { /* */ }
        try { if (player) player.destroy(); } catch (e) { /* */ }
      };
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="freetch-root" ref={rootRef}>
        <div className="freetch-layout">
          <aside className="freetch-sidebar">
            <div className="freetch-sidebar-title" data-lang="followed_channels">💜 Vos Chaînes Suivies</div>
            <div id="sidebar-followed-list">
              <div className="freetch-sidebar-empty" data-lang="login_prompt">Connectez-vous pour retrouver facilement vos chaînes préférées et synchroniser votre historique.</div>
            </div>
          </aside>
          <main className="freetch-main">
        <div className="container">
          <div style={{ position: 'absolute', top: 15, right: 15, display: 'flex', gap: 10, alignItems: 'center', zIndex: 10 }}>
            <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }} title="Désactiver pour économiser le serveur (pratique pour VLC)">
              <input type="checkbox" id="proxyToggle" /> Proxy
            </label>
            <select id="langSelect" style={{ position: 'static' }} defaultValue="fr">
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>
          <div className="banner-wrap">
            <img src="/banièrefreetch.png" alt="Freetch" className="freetch-banner" />
            <div className="banner-search">
              <div>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  id="channelInput"
                  placeholder="Streamer + Mot (Ex: squeezie horreur)"
                  data-placeholder="ph_streamer"
                  autoComplete="off"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800 border-2 border-gray-600 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 text-base"
                />
                <div id="autocomplete-box" className="autocomplete-suggestions"></div>
              </div>
            </div>
          </div>
          <div id="channel-history-container">
            <div className="history-title" style={{ marginTop: 5, color: '#aaa', fontSize: '0.85rem' }} data-lang="lbl_channel_history">Streamers récents :</div>
            <div id="channel-history-list"></div>
          </div>

          <div className="tabs">
            <button className="tab-btn active" data-lang="tab_discovery">🌟 Découverte</button>
            <button className="tab-btn" data-lang="tab_vod">📼 VOD</button>
          </div>

          <div id="vod-history-container">
            <div className="history-title" data-lang="lbl_vod_history">VODs récemment regardées :</div>
            <div id="vod-history-list"></div>
          </div>

          <div id="status-msg" data-lang="status_ready">Prêt.</div>

          <div id="video-container">
            <video id="freetch-player" playsInline controls crossOrigin="anonymous"></video>
            <div id="quality-control" style={{ display: 'none' }}>
              <button id="quality-btn" type="button">
                <span id="quality-current">Auto</span>
                <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>▾</span>
              </button>
              <div id="quality-menu"></div>
            </div>
          </div>
          <div id="stream-title-bar">
            <h2 id="stream-title"></h2>
            <div className="stream-meta" id="stream-meta"></div>
          </div>

          <div id="tab-discovery" className="tab-content active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
              <div className="history-title" style={{ margin: 0 }} data-lang="followed_channels">💜 Vos Chaînes Suivies</div>
              <div id="discovery-controls" style={{ display: 'flex', gap: 10 }}></div>
            </div>
            <div id="discovery-followed" className="stream-grid"></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 10px 0', flexWrap: 'wrap', gap: 10 }}>
              <div className="history-title" style={{ margin: 0 }} data-lang="top_streams">🔥 Top Streams</div>
              <div className="tabs" style={{ marginBottom: 0, padding: 3, background: '#1f1f23' }}>
                <button id="btn-top-fr" className="tab-btn active" style={{ padding: '5px 12px', fontSize: '0.8rem' }} data-lang="top_fr">🇫🇷 FR</button>
                <button id="btn-top-world" className="tab-btn" style={{ padding: '5px 12px', fontSize: '0.8rem' }} data-lang="top_world">🌍 Monde</button>
              </div>
            </div>
            <div id="discovery-top" className="stream-grid"></div>
            <div id="live-area"></div>
          </div>

          <div id="tab-vod" className="tab-content">
            <div id="vod-empty" className="freetch-sidebar-empty" style={{ padding: 40 }}>Recherche un streamer ci-dessus pour voir ses VODs ici.</div>
            <div id="vod-list"></div>
          </div>
        </div>
          </main>
          <aside id="chat-side-panel"></aside>
        </div>
      </div>
    </>
  );
}
