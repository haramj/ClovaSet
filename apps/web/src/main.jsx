import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Heart,
  MapPin,
  Search,
  X,
  Play,
  Pause,
  Check,
  Shirt,
  Menu,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import "./styles.css";

const products = [
  {
    id: 1,
    name: "오늘의 주인공, 스카이 드레스",
    category: "드레스",
    brand: "STUDIO COLLECTION",
    image: "dress",
    price: 18000,
    size: "S · M",
    area: "성수동",
    distance: "도보 5분",
    tag: "하객룩",
    description:
      "자연스럽게 떨어지는 실루엣의 스카이 블루 드레스. 결혼식부터 특별한 저녁 약속까지 함께해요.",
  },
  {
    id: 2,
    name: "분위기를 완성하는 봄버 재킷",
    category: "아우터",
    brand: "WEEKEND WARDROBE",
    image: "jacket",
    price: 15000,
    size: "M · L",
    area: "성수동",
    distance: "도보 8분",
    tag: "데이트",
    description:
      "가볍게 걸쳐도 멋스러운 빈티지 무드의 재킷. 평범한 일상에도 새로운 분위기를 더해요.",
  },
  {
    id: 3,
    name: "작지만 확실한 포인트, 미니백",
    category: "가방",
    brand: "THE LITTLE THINGS",
    image: "bag",
    price: 9000,
    size: "ONE SIZE",
    area: "서울숲",
    distance: "도보 12분",
    tag: "파티",
    description:
      "특별한 날 필요한 소지품만 가볍게. 단정한 룩에 포인트가 되어 줄 미니백이에요.",
  },
];
const won = (n) => n.toLocaleString("ko-KR");
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}
function Logo() {
  return (
    <>
      <span className="logo-symbol">
        <Shirt size={23} />
      </span>
      <span>
        shared<span className="logo-light">clothes</span>
        <i>®</i>
      </span>
    </>
  );
}
function App() {
  const [route, setRoute] = useState(
    location.hash.startsWith("#/closet") ? "closet" : "home",
  );
  const [menu, setMenu] = useState(false),
    [category, setCategory] = useState("전체"),
    [search, setSearch] = useState(""),
    [area, setArea] = useState("전체 동네"),
    [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useStored("sharedclothes:saved", []),
    [requests, setRequests] = useStored("sharedclothes:demo-requests", []);
  const [selected, setSelected] = useState(null),
    [notice, setNotice] = useState("");
  const [paused, setPaused] = useState(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [videoFailed, setVideoFailed] = useState(false);
  const video = useRef(null),
    dialog = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    const handler = () => {
      setRoute(location.hash.startsWith("#/closet") ? "closet" : "home");
      setMenu(false);
      setSelected(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [route]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    if (route !== "home" || !video.current) return;
    if (paused) video.current.pause();
    else video.current.play().catch(() => setPaused(true));
  }, [paused, route]);
  useEffect(() => {
    if (selected) {
      dialog.current?.showModal();
    } else if (dialog.current?.open) {
      dialog.current.close();
      trigger.current?.focus();
    }
  }, [selected]);
  const toggleSave = (id) =>
    setSaved((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  const openProduct = (p, e) => {
    trigger.current = e.currentTarget;
    setSelected(p);
  };
  const goSection = (id) => {
    setMenu(false);
    if (route !== "home") {
      location.hash = "/";
      setTimeout(
        () =>
          document.getElementById(id)?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          }),
        70,
      );
    } else
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };
  const filtered = products.filter(
    (p) =>
      (category === "전체" || p.category === category) &&
      (!savedOnly || saved.includes(p.id)) &&
      (area === "전체 동네" || p.area === area) &&
      `${p.name} ${p.category} ${p.tag}`.includes(search.trim()),
  );
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main").focus();
        }}
      >
        본문으로 건너뛰기
      </a>
      <header className="header">
        <a href="#/" className="logo" aria-label="Shared Clothes 홈">
          <Logo />
        </a>
        <nav className={menu ? "nav open" : "nav"} aria-label="주 메뉴">
          <button onClick={() => goSection("story")}>서비스 소개</button>
          <button onClick={() => goSection("how")}>이용 방법</button>
          <a href="#/closet">동네 옷장</a>
        </nav>
        <a href="#/closet" className="nav-cta">
          서비스 시작하기 <ArrowUpRight size={16} />
        </a>
        <button
          className="menu-toggle icon-button"
          aria-label="메뉴 열기"
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main" tabIndex={-1}>
        {route === "home" ? (
          <>
            <section className="hero">
              <div className="hero-media">
                <img
                  src={`${import.meta.env.BASE_URL}media/hero.jpg`}
                  alt="버건디 코트와 선글라스로 스타일을 완성한 모습"
                  fetchPriority="high"
                />
                {!videoFailed && (
                  <video
                    ref={video}
                    muted
                    loop
                    playsInline
                    autoPlay={!paused}
                    preload="metadata"
                    poster={`${import.meta.env.BASE_URL}media/hero.jpg`}
                    onError={() => setVideoFailed(true)}
                    aria-hidden="true"
                  >
                    <source
                      src={`${import.meta.env.BASE_URL}media/brand-film.mp4`}
                      type="video/mp4"
                    />
                  </video>
                )}
              </div>
              <div className="hero-shade" />
              <div className="hero-top">
                <span>
                  <span className="live-dot" /> YOUR NEIGHBORHOOD CLOSET
                </span>
                <span>GOOD CLOTHES. GREAT MOMENTS.</span>
              </div>
              <div className="hero-copy">
                <div className="eyebrow">소유는 가볍게, 순간은 특별하게</div>
                <h1>
                  특별한 날,
                  <br />
                  옷은 <span>가까운 곳에.</span>
                </h1>
                <p>
                  한 번의 순간을 위해 사기엔 아까우니까.
                  <br />
                  우리 동네 옷장에서 새로운 나를 만나보세요.
                </p>
                <a href="#/closet" className="button white">
                  우리 동네 옷장 열기 <ArrowUpRight size={21} />
                </a>
              </div>
              <div className="hero-bottom">
                <button
                  className="scroll-hint"
                  onClick={() => goSection("story")}
                >
                  <span className="scroll-circle">
                    <ArrowDown size={17} />
                  </span>{" "}
                  SCROLL TO DISCOVER
                </button>
                <div className="film-control">
                  <span>THE SHARED MOMENT — 01</span>
                  {!videoFailed && (
                    <button
                      aria-label={
                        paused ? "소개 영상 재생" : "소개 영상 일시정지"
                      }
                      className="video-button"
                      onClick={() => setPaused(!paused)}
                    >
                      {paused ? <Play size={15} /> : <Pause size={15} />}
                    </button>
                  )}
                </div>
              </div>
            </section>
            <div className="ticker" aria-hidden="true">
              <span>A NEW WAY TO DRESS</span>
              <span className="asterisk">✳</span>
              <span>LESS BUYING, MORE LIVING</span>
              <span className="asterisk">✳</span>
              <span>SHARE YOUR STYLE</span>
              <span className="asterisk">✳</span>
              <span>A NEW WAY TO DRESS</span>
            </div>
            <section id="story" className="story section">
              <div className="section-label" data-reveal>
                <span className="blue-dot" /> A CLOSET, WITHOUT LIMITS
              </div>
              <h2 data-reveal>
                옷장에 잠든 특별함을,
                <br />
                <span className="muted">누군가의 특별한 하루로.</span>
              </h2>
              <p className="section-description" data-reveal>
                결혼식에 한 번 입은 원피스, 여행을 위해 샀던 가방.
                <br />
                좋은 옷의 이야기는 한 번으로 끝나기 아쉬우니까.
                <br />
                이제 가까운 이웃과 다음 장면을 만들어보세요.
              </p>
              <div className="story-grid">
                <div className="story-photo" data-reveal>
                  <img
                    loading="lazy"
                    src={`${import.meta.env.BASE_URL}media/dress.jpg`}
                    alt="특별한 날을 위한 스카이 블루 드레스"
                  />
                  <div className="photo-caption">
                    <span>
                      ONE DRESS.
                      <br />
                      MANY STORIES.
                    </span>
                    <ArrowUpRight size={30} />
                  </div>
                  <div className="floating-note">
                    <span className="note-icon">
                      <Heart size={18} />
                    </span>
                    <div>
                      내일의 하객룩, 찾았어요.
                      <small>새 옷 대신, 새로운 순간</small>
                    </div>
                  </div>
                </div>
                <div className="story-content" data-reveal>
                  <span className="pill">01 / 가까워서 더 편하게</span>
                  <h3>
                    마음에 드는 옷이
                    <br />
                    산책 거리 안에.
                  </h3>
                  <p>
                    택배를 기다릴 필요 없이,
                    <br />
                    우리 동네에서 보고 빌려요.
                    <br />
                    당신의 다음 스타일은 생각보다 가까워요.
                  </p>
                  <a href="#/closet" className="text-link">
                    동네 옷장 둘러보기 <ArrowRight size={19} />
                  </a>
                  <div className="neighborhood">
                    <MapPin size={21} />
                    <span>
                      성수동 <i>············</i> 서울숲
                    </span>
                    <span className="walk">가벼운 산책, 새로운 옷</span>
                  </div>
                </div>
              </div>
            </section>
            <section className="collection section" id="collection">
              <div className="section-heading" data-reveal>
                <div>
                  <div className="section-label">FOR YOUR NEXT MOMENT</div>
                  <h2>
                    어떤 하루를
                    <br />
                    준비하고 있나요?
                  </h2>
                </div>
                <a className="text-link" href="#/closet">
                  모든 옷 보기 <ArrowUpRight size={20} />
                </a>
              </div>
              <div className="occasion-grid">
                {[
                  {
                    title: "마음을 전하는 날",
                    sub: "WEDDING GUEST",
                    image: "dress",
                    category: "드레스",
                    n: "01",
                  },
                  {
                    title: "조금 다른 나를 만나는 날",
                    sub: "A SPECIAL DATE",
                    image: "jacket",
                    category: "아우터",
                    n: "02",
                  },
                  {
                    title: "작은 포인트가 필요한 날",
                    sub: "FINISHING TOUCH",
                    image: "bag",
                    category: "가방",
                    n: "03",
                  },
                ].map((x) => (
                  <a
                    data-reveal
                    href="#/closet"
                    className={`occasion ${x.image}`}
                    key={x.n}
                    onClick={() => setCategory(x.category)}
                  >
                    <img
                      loading="lazy"
                      src={`${import.meta.env.BASE_URL}media/${x.image}.jpg`}
                      alt={x.title}
                    />
                    <span className="occasion-num">{x.n}</span>
                    <div>
                      <small>{x.sub}</small>
                      <h3>{x.title}</h3>
                    </div>
                    <span className="round-arrow">
                      <ArrowUpRight size={22} />
                    </span>
                  </a>
                ))}
              </div>
            </section>
            <section className="how section" id="how">
              <div data-reveal>
                <div className="section-label">LESS EFFORT. MORE STYLE.</div>
                <h2>
                  빌리는 건 쉽게.
                  <br />
                  기억은 오래.
                </h2>
                <p className="section-description">
                  복잡한 과정 없이, 옷을 나누는 즐거움만.
                  <br />
                  당신의 특별한 하루를 이렇게 준비해요.
                </p>
              </div>
              <div className="steps">
                {[
                  {
                    icon: <Search />,
                    title: "내 취향의 옷 찾기",
                    text: "동네와 스타일을 골라 나에게 어울리는 옷을 찾아요.",
                  },
                  {
                    icon: <CalendarDays />,
                    title: "필요한 날만 빌리기",
                    text: "대여 날짜를 정하고 이웃과 만날 시간을 이야기해요.",
                  },
                  {
                    icon: <Shirt />,
                    title: "멋지게 입고, 기분 좋게 돌려주기",
                    text: "소중한 순간을 즐긴 뒤 다음 이야기를 위해 돌려줘요.",
                  },
                ].map((s, i) => (
                  <div className="step" data-reveal key={s.title}>
                    <span className="step-number">0{i + 1}</span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                    <span className="step-icon">{s.icon}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="care section" data-reveal>
              <span className="care-icon">
                <ShieldCheck size={34} />
              </span>
              <div>
                <div className="section-label">SHARING STARTS WITH CARING</div>
                <h3>서로의 옷을, 내 옷처럼.</h3>
                <p>
                  옷의 상태는 솔직하게, 약속한 시간은 정확하게.
                  <br />
                  작은 배려가 더 좋은 동네 옷장을 만들어요.
                </p>
              </div>
              <span className="care-word">
                Take care.
                <br />
                <em>Share more.</em>
              </span>
            </section>
            <section className="final-cta">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <span className="section-label">YOUR NEXT STORY STARTS HERE</span>
              <h2 data-reveal>
                옷장은 나누고,
                <br />
                가능성은 넓히고.
              </h2>
              <a href="#/closet" className="button white">
                나의 다음 스타일 찾기 <ArrowUpRight size={21} />
              </a>
              <span className="cta-footnote">
                가까운 이웃과 함께하는 새로운 옷 생활
              </span>
            </section>
          </>
        ) : (
          <section className="closet section">
            <div className="closet-intro">
              <div>
                <div className="section-label">
                  <MapPin size={14} /> OUR NEIGHBORHOOD CLOSET
                </div>
                <h1>
                  가까운 옷장,
                  <br />
                  <span>새로운 발견.</span>
                </h1>
                <p>특별한 날에 어울리는 옷을 찾아보세요.</p>
              </div>
              <div className="demo-badge">
                <span className="blue-dot" /> 미리 만나는 동네 옷장
                <small>예시 상품으로 체험하는 서비스입니다.</small>
              </div>
            </div>
            <div className="search-row">
              <label className="search-box">
                <Search size={21} />
                <input
                  aria-label="옷 검색"
                  placeholder="어떤 옷을 찾고 있나요?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="icon-button"
                    aria-label="검색 초기화"
                    onClick={() => setSearch("")}
                  >
                    <X size={17} />
                  </button>
                )}
              </label>
              <label className="area-select">
                <MapPin size={17} />
                <select
                  aria-label="동네 선택"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option>전체 동네</option>
                  <option>성수동</option>
                  <option>서울숲</option>
                </select>
              </label>
            </div>
            <div className="filters">
              <div className="categories">
                {["전체", "드레스", "아우터", "가방"].map((c) => (
                  <button
                    key={c}
                    className={category === c ? "active" : ""}
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                className={`saved-filter ${savedOnly ? "active" : ""}`}
                aria-pressed={savedOnly}
                onClick={() => setSavedOnly(!savedOnly)}
              >
                <Heart size={16} /> 찜한 옷 {saved.length}
              </button>
            </div>
            <div className="results-title">
              <h2>
                {savedOnly ? "나의 관심 옷장" : "이웃의 옷장"}{" "}
                <span>{filtered.length}</span>
              </h2>
              <span>샘플 컬렉션 · 1일 대여 기준</span>
            </div>
            <div className="product-grid">
              {filtered.map((p) => (
                <article className="product" key={p.id}>
                  <div className="product-image">
                    <button
                      onClick={(e) => openProduct(p, e)}
                      aria-label={`${p.name} 상세 보기`}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}media/${p.image}.jpg`}
                        alt={p.name}
                      />
                    </button>
                    <span className="product-tag">{p.tag}</span>
                    <button
                      className={`save-button ${saved.includes(p.id) ? "saved" : ""}`}
                      aria-label={`${p.name} ${saved.includes(p.id) ? "찜 취소" : "찜하기"}`}
                      aria-pressed={saved.includes(p.id)}
                      onClick={() => toggleSave(p.id)}
                    >
                      <Heart
                        size={20}
                        fill={saved.includes(p.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <small>{p.brand}</small>
                  <button
                    className="product-title"
                    onClick={(e) => openProduct(p, e)}
                  >
                    {p.name}
                  </button>
                  <div className="product-info">
                    <span>{p.size}</span>
                    <span>
                      <MapPin size={12} />
                      {p.area} · {p.distance}
                    </span>
                  </div>
                  <div className="price">
                    {won(p.price)}원 <span>/ 일</span>
                  </div>
                </article>
              ))}
            </div>
            {!filtered.length && (
              <div className="empty">
                <Search size={32} />
                <h3>아직 일치하는 옷이 없어요.</h3>
                <p>다른 검색어나 동네로 찾아보세요.</p>
                <button
                  className="button dark"
                  onClick={() => {
                    setSearch("");
                    setArea("전체 동네");
                    setCategory("전체");
                    setSavedOnly(false);
                  }}
                >
                  전체 옷 보기 <ArrowRight size={17} />
                </button>
              </div>
            )}
            {requests.length > 0 && (
              <section className="requests">
                <h2>나의 체험 대여 요청</h2>
                <p>
                  이 브라우저에만 저장되며, 실제 예약이나 결제는 이루어지지
                  않아요.
                </p>
                {requests.map((r) => (
                  <div className="request" key={r.id}>
                    <div>
                      <strong>{r.name}</strong>
                      <small>
                        {r.start} — {r.end} · {won(r.total)}원
                      </small>
                    </div>
                    <span>체험 요청 완료</span>
                    <button
                      onClick={() => {
                        setRequests((old) => old.filter((x) => x.id !== r.id));
                        setNotice("체험 요청을 취소했어요.");
                      }}
                    >
                      취소
                    </button>
                  </div>
                ))}
              </section>
            )}
          </section>
        )}
      </main>
      <footer>
        <a className="logo" href="#/">
          <Logo />
        </a>
        <p>좋은 옷의 다음 이야기를 함께해요.</p>
        <div>
          <span>© {new Date().getFullYear()} Shared Clothes</span>
          <span>MADE FOR MOMENTS, SHARED WITH NEIGHBORS.</span>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="product-dialog"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setSelected(null);
        }}
        aria-labelledby="detail-title"
      >
        {selected && (
          <ProductDetail
            key={selected.id}
            product={selected}
            onClose={() => setSelected(null)}
            onRequest={(r) => {
              setRequests((old) => [r, ...old]);
              setSelected(null);
              setNotice("체험 대여 요청이 저장됐어요. 실제 예약은 아니에요.");
            }}
          />
        )}
      </dialog>
      <div className={`toast ${notice ? "show" : ""}`} role="status">
        {notice && (
          <>
            <Check size={18} />
            {notice}
          </>
        )}
      </div>
    </>
  );
}
function ProductDetail({ product: p, onClose, onRequest }) {
  const today = new Date();
  const localDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const min = localDate(today);
  const [start, setStart] = useState(""),
    [end, setEnd] = useState("");
  const days =
    start && end
      ? Math.round(
          (new Date(end + "T00:00:00Z") - new Date(start + "T00:00:00Z")) /
            86400000,
        ) + 1
      : 0;
  const valid = start >= min && end >= start && days > 0 && days <= 30;
  return (
    <>
      <button
        className="dialog-close icon-button"
        aria-label="상세 닫기"
        onClick={onClose}
      >
        <X />
      </button>
      <div className="detail-image">
        <img
          src={`${import.meta.env.BASE_URL}media/${p.image}.jpg`}
          alt={p.name}
        />
      </div>
      <div className="detail-body">
        <span className="section-label">{p.brand}</span>
        <h2 id="detail-title">{p.name}</h2>
        <div className="detail-meta">
          <span>{p.size}</span>
          <span>
            <MapPin size={14} />
            {p.area} · {p.distance}
          </span>
        </div>
        <p>{p.description}</p>
        <div className="detail-price">
          {won(p.price)}원 <small>/ 일</small>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid)
              onRequest({
                id: crypto.randomUUID(),
                name: p.name,
                start,
                end,
                total: days * p.price,
              });
          }}
        >
          <h3>언제 필요한가요?</h3>
          <div className="dates">
            <label>
              대여일
              <input
                type="date"
                required
                min={min}
                value={start}
                onInput={(e) => {
                  setStart(e.target.value);
                  if (end < e.target.value) setEnd("");
                }}
              />
            </label>
            <label>
              반납일
              <input
                type="date"
                required
                min={start || min}
                value={end}
                onInput={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
          <p className="date-help">
            대여일과 반납일을 포함해 계산해요. 최대 30일까지 체험할 수 있어요.
          </p>
          <div className="total">
            <span>
              {valid ? `${days}일 대여 예상 금액` : "날짜를 선택해주세요"}
            </span>
            <strong>{valid ? `${won(days * p.price)}원` : "—"}</strong>
          </div>
          <button className="button blue" type="submit" disabled={!valid}>
            대여 요청 체험하기 <ArrowUpRight size={18} />
          </button>
          <p className="demo-note">
            체험 요청은 이 브라우저에만 저장됩니다.
            <br />
            실제 이웃에게 전송되거나 결제되지 않습니다.
          </p>
        </form>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
