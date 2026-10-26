import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Ad = {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
};

const API_URL = "https://inai-col1.fishrungames.com";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);
}

function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [status, setStatus] = useState("Загружаем свежие объявления…");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/ads`);
      if (!response.ok) throw new Error("Не удалось получить список");
      const result = await response.json();
      setAds(Array.isArray(result.items) ? result.items : []);
      setStatus("");
    } catch {
      setStatus("Не получилось загрузить объявления. Проверь подключение и попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAds(); }, [fetchAds]);

  const visibleAds = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru");
    if (!query) return ads;
    return ads.filter((ad) =>
      `${ad.title} ${ad.description}`.toLocaleLowerCase("ru").includes(query)
    );
  }, [ads, search]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    setSending(true);
    setStatus("");
    try {
      const response = await fetch(`${API_URL}/ads`, {
        method: "POST",
        body: new FormData(form),
      });
      if (!response.ok) throw new Error("Не удалось отправить объявление");
      const created: Ad = await response.json();
      setAds((current) => [created, ...current]);
      form.reset();
      setStatus("Объявление успешно опубликовано.");
    } catch {
      setStatus("Не удалось опубликовать объявление. Попробуй ещё раз.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="На главную">
          <span className="brand-mark">Д</span>
          <span>Доска<span className="brand-light">+</span></span>
        </a>
        <a className="top-link" href="#publish">Разместить объявление <span aria-hidden="true">↗</span></a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="live-dot" /> МЕСТО ДЛЯ ВЫГОДНЫХ НАХОДОК</span>
            <h1>Найди своё.<br /><em>Продай лишнее.</em></h1>
            <p>Простая доска объявлений, где нужные вещи находят новых владельцев.</p>
            <a className="primary-link" href="#listings">Смотреть объявления <span>↓</span></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-circle circle-one" />
            <div className="art-circle circle-two" />
            <div className="art-card card-back"><span>ВЫГОДНО</span><b>✳</b></div>
            <div className="art-card card-front"><span className="art-icon">↗</span><small>ХОРОШАЯ НАХОДКА</small><strong>Уже ждёт<br />своего человека</strong><i>Объявления рядом</i></div>
            <span className="spark spark-one">✳</span><span className="spark spark-two">✦</span>
          </div>
        </section>

        <section className="publish-panel" id="publish">
          <div className="section-heading">
            <div><span className="section-kicker">ЕСТЬ ЧТО ПРЕДЛОЖИТЬ?</span><h2>Создать объявление</h2></div>
            <span className="step-label">01 / ПУБЛИКАЦИЯ</span>
          </div>
          <form className="ad-form" onSubmit={handleSubmit}>
            <label className="field"><span>Название</span><input name="title" placeholder="Например, наушники в отличном состоянии" required maxLength={120} /></label>
            <label className="field"><span>Описание</span><textarea name="description" placeholder="Расскажи о состоянии и особенностях вещи…" required rows={3} maxLength={1500} /></label>
            <div className="form-bottom">
              <label className="field price-field"><span>Цена, сом</span><input name="price" type="number" min="0" step="0.01" placeholder="0" required /></label>
              <label className="file-field"><span className="file-icon">＋</span><span><b>Добавить фото</b><small>Изображение товара</small></span><input name="image" type="file" accept="image/*" required /></label>
              <button className="submit-button" disabled={sending}>{sending ? "Публикуем…" : "Опубликовать"} <span>↗</span></button>
            </div>
          </form>
          {status && <p className="status-message" role="status">{status}</p>}
        </section>

        <section className="listings-section" id="listings">
          <div className="listing-heading">
            <div><span className="section-kicker">ВЫБИРАЙ И НАХОДИ</span><h2>Свежие объявления <span className="count">{ads.length}</span></h2></div>
            <div className="listing-tools">
              <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по объявлениям" aria-label="Поиск по объявлениям" /></label>
              <button className="refresh-button" onClick={() => void fetchAds()} disabled={loading} aria-label="Обновить объявления">↻</button>
            </div>
          </div>

          {loading && ads.length === 0 ? <div className="empty-state"><span className="empty-symbol">…</span><p>Собираем объявления</p></div> :
            visibleAds.length === 0 ? <div className="empty-state"><span className="empty-symbol">⌕</span><p>{search ? "Ничего не найдено. Попробуй другой запрос." : "Пока объявлений нет — стань первым!"}</p></div> :
            <div className="ad-grid">{visibleAds.map((ad) => (
              <article className="ad-card" key={ad.id}>
                <div className="ad-image">
                  {ad.image_url ? <img src={new URL(ad.image_url, API_URL).href} alt={ad.title} loading="lazy" /> :
                    <div className="image-placeholder" aria-label="Нет фотографии">✳</div>}
                  <span className="image-badge">ОБЪЯВЛЕНИЕ</span>
                </div>
                <div className="ad-content">
                  <h3>{ad.title}</h3><p className="ad-description">{ad.description}</p>
                  <div className="ad-card-footer"><strong>{formatPrice(ad.price)} <small>сом</small></strong><span>#{ad.id}</span></div>
                </div>
              </article>
            ))}</div>
          }
        </section>
      </main>
      <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark">Д</span><span>Доска<span className="brand-light">+</span></span></a><span>Покупай осознанно. Продавай с пользой.</span><span>© {new Date().getFullYear()}</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
