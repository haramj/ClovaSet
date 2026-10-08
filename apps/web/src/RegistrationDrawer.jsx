import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  MapPin,
  X,
} from "lucide-react";
import { isDemoStorage, saveRegistered } from "./registration-store";

const OCCASIONS = {
  격식: ["레스토랑", "장례", "결혼하객", "면접"],
  파티: ["클럽", "패션쇼", "페스티벌", "콘서트", "기타"],
  일상: ["산책", "데이트", "카페", "운동", "기타"],
};
const PLACE = "경기도 용인시 기흥구 서농동";
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function RegistrationDrawer({ open, onClose, onRegistered }) {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [occasions, setOccasions] = useState([]);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [rentalStart, setRentalStart] = useState("");
  const [rentalEnd, setRentalEnd] = useState("");
  const [pickupPlace, setPickupPlace] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");
  const fileInput = useRef(null);
  const panel = useRef(null);

  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, saving]);
  useEffect(() => {
    if (open) return;
    setStep(1);
    setGender("");
    setCategory("");
    setOccasions([]);
    setName("");
    setPhoto(null);
    setDescription("");
    setPrice("");
    setRentalStart("");
    setRentalEnd("");
    setPickupPlace("");
    setError("");
  }, [open]);
  if (!open) return null;

  const onFile = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("JPG, PNG, WebP 사진을 선택해주세요.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("사진은 5MB 이하로 선택해주세요.");
      return;
    }
    setError("");
    setPhoto(file);
  };
  const next = () => {
    if (step === 1 && (!gender || !category || !occasions.length)) {
      setError("성별, 카테고리, 용도를 선택해주세요.");
      return;
    }
    if (step === 2 && (!name.trim() || !photo || !description.trim())) {
      setError("옷 이름, 사진, 설명을 모두 입력해주세요.");
      return;
    }
    setError("");
    setStep(step + 1);
    panel.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = async (event) => {
    event.preventDefault();
    if (
      !Number.isInteger(Number(price)) ||
      Number(price) < 1 ||
      Number(price) > 10000000
    ) {
      setError("가격은 1원부터 1천만 원까지 입력해주세요.");
      return;
    }
    if (
      !rentalStart ||
      !rentalEnd ||
      rentalStart < today() ||
      rentalEnd < rentalStart
    ) {
      setError("대여 시작일과 종료일을 확인해주세요.");
      return;
    }
    if (!pickupPlace) {
      setError("내 위치 버튼을 눌러 희망 장소를 설정해주세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const product = await saveRegistered(
        {
          gender,
          category,
          occasions,
          name: name.trim(),
          description: description.trim(),
          pricePerDay: Number(price),
          rentalStart,
          rentalEnd,
          pickupPlace,
        },
        photo,
      );
      onRegistered(product, isDemoStorage);
    } catch (ex) {
      setError(ex.message || "등록하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="registration-layer">
      <button
        className="registration-backdrop"
        aria-label="등록 화면 닫기"
        onClick={onClose}
      />
      <aside
        ref={panel}
        className="registration-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-title"
        tabIndex={-1}
      >
        <div className="registration-top">
          <span>ClovaSet / REGISTER</span>
          <button type="button" aria-label="등록 화면 닫기" onClick={onClose}>
            <X size={23} />
          </button>
        </div>
        <div className="registration-progress">
          <span>0{step} / 03</span>
          <div>
            <i style={{ width: `${step * 33.333}%` }} />
          </div>
        </div>
        <form onSubmit={submit}>
          {step === 1 && (
            <section className="registration-step" key="one">
              <span className="registration-kicker">01 / STYLE</span>
              <h2 id="registration-title">
                어떤 옷을
                <br />
                나누고 싶나요?
              </h2>
              <p>옷에 어울리는 순간을 골라주세요.</p>
              <fieldset>
                <legend>
                  누구의 옷인가요? <b>*</b>
                </legend>
                <div className="registration-choice">
                  {["남", "녀"].map((x) => (
                    <button
                      type="button"
                      key={x}
                      className={gender === x ? "selected" : ""}
                      aria-pressed={gender === x}
                      onClick={() => setGender(x)}
                    >
                      {x === "남" ? "남성" : "여성"}{" "}
                      {gender === x && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>
                  카테고리 <b>*</b>
                </legend>
                <div className="registration-choice thirds">
                  {Object.keys(OCCASIONS).map((x) => (
                    <button
                      type="button"
                      key={x}
                      className={category === x ? "selected" : ""}
                      aria-pressed={category === x}
                      onClick={() => {
                        setCategory(x);
                        setOccasions([]);
                      }}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </fieldset>
              {category && (
                <fieldset>
                  <legend>
                    어떤 날에 어울리나요? <small>중복 선택 가능</small> <b>*</b>
                  </legend>
                  <div className="occasion-choices">
                    {OCCASIONS[category].map((x) => (
                      <button
                        type="button"
                        key={x}
                        className={occasions.includes(x) ? "selected" : ""}
                        aria-pressed={occasions.includes(x)}
                        onClick={() =>
                          setOccasions((prev) =>
                            prev.includes(x)
                              ? prev.filter((a) => a !== x)
                              : [...prev, x],
                          )
                        }
                      >
                        {x} {occasions.includes(x) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
            </section>
          )}
          {step === 2 && (
            <section className="registration-step" key="two">
              <span className="registration-kicker">02 / DETAILS</span>
              <h2 id="registration-title">
                옷의 이야기를
                <br />
                들려주세요.
              </h2>
              <p>사진 한 장과 짧은 소개면 충분해요.</p>
              <label className="registration-field">
                내 옷 이름 <b>*</b>
                <input
                  type="text"
                  maxLength="100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 특별한 날의 블랙 재킷"
                  autoFocus
                />
              </label>
              <div className="registration-field">
                사진 등록 <b>*</b>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="visually-hidden"
                  aria-label="옷 사진 선택"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  className={`photo-upload ${preview ? "has-photo" : ""}`}
                  onClick={() => fileInput.current?.click()}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="등록할 옷 미리보기" />
                      <span>사진 변경하기</span>
                    </>
                  ) : (
                    <>
                      <Camera size={28} />
                      <strong>사진을 선택해주세요</strong>
                      <small>JPG · PNG · WebP, 최대 5MB</small>
                    </>
                  )}
                </button>
              </div>
              <label className="registration-field">
                설명 <b>*</b>
                <textarea
                  rows="4"
                  maxLength="5000"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="옷의 상태, 소재, 스타일을 자유롭게 소개해주세요."
                />
              </label>
            </section>
          )}
          {step === 3 && (
            <section className="registration-step" key="three">
              <span className="registration-kicker">03 / SHARE</span>
              <h2 id="registration-title">
                마지막으로
                <br />
                대여 조건을 정해요.
              </h2>
              <p>이웃이 빌릴 수 있는 날짜와 장소를 알려주세요.</p>
              <label className="registration-field">
                하루 대여 가격 <b>*</b>
                <div className="price-input">
                  <input
                    type="number"
                    min="1"
                    max="10000000"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="예: 15000"
                  />
                  <span>원 / 일</span>
                </div>
              </label>
              <fieldset>
                <legend>
                  대여 가능 기간 <b>*</b>
                </legend>
                <div className="registration-dates">
                  <label>
                    시작일
                    <input
                      type="date"
                      min={today()}
                      value={rentalStart}
                      onInput={(e) => {
                        setRentalStart(e.target.value);
                        if (rentalEnd < e.target.value) setRentalEnd("");
                      }}
                    />
                  </label>
                  <label>
                    종료일
                    <input
                      type="date"
                      min={rentalStart || today()}
                      value={rentalEnd}
                      onInput={(e) => setRentalEnd(e.target.value)}
                    />
                  </label>
                </div>
              </fieldset>
              <fieldset>
                <legend>
                  대여 희망 장소 <b>*</b>
                </legend>
                <button
                  className="location-button"
                  type="button"
                  onClick={() => setPickupPlace(PLACE)}
                >
                  <MapPin size={18} /> 내 위치{" "}
                  {pickupPlace && <Check size={17} />}
                </button>
                {pickupPlace && (
                  <div className="chosen-location">
                    <MapPin size={17} />
                    {pickupPlace}
                  </div>
                )}
              </fieldset>
              <div className="registration-summary">
                <span>선택한 옷</span>
                <strong>
                  {gender} · {category} · {occasions.join(", ")}
                </strong>
              </div>
            </section>
          )}
          <div className="registration-actions">
            {error && (
              <p className="registration-error" role="alert">
                {error}
              </p>
            )}
            {step > 1 && (
              <button
                type="button"
                className="registration-prev"
                onClick={() => {
                  setStep(step - 1);
                  setError("");
                }}
              >
                <ArrowLeft size={18} /> 이전
              </button>
            )}
            <button
              className="registration-next"
              type="button"
              onClick={step === 3 ? submit : next}
              disabled={saving}
            >
              {saving
                ? "등록 중..."
                : step === 3
                  ? "내 옷 등록하기"
                  : "다음으로"}
              {step === 3 ? (
                <ArrowUpRight size={20} />
              ) : (
                <ArrowRight size={19} />
              )}
            </button>
          </div>
        </form>
        <p className="registration-note">
          {isDemoStorage
            ? "시연용 등록 내용은 이 브라우저에만 저장돼요."
            : "등록 내용과 사진은 연결된 Spring API에 저장돼요."}
        </p>
      </aside>
    </div>
  );
}
