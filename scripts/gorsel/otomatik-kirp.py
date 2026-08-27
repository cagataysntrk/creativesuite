"""Akıllı kırpma — SAYDAM kenarları atar, özneyi kadraja oturtur (FAZ-19.13).

⚠ ⚠ **BU BETİK BİR ÖLÇÜMDEN DOĞDU.** Arka plan silindikten sonra özne kadrajın
ortasında küçük bir ada olarak kalıyor: `arkaplan-sil` gerçek koşularda %41–91 saydam
pay ölçtü, yani kadrajın yarısından fazlası BOŞ. O boşluk slayta olduğu gibi
yerleştirilince yuva doluymuş gibi görünüyor ama özne minicik kalıyor — tasarım değil,
kaza gibi okunuyor. Depo sahibi: *"görseli akıllıca kırpma kesme çerçeveleme vs gibi
şeyler de olmalı."*

⚠ ⚠ **KIRPMA ÖLÇÜMDEN GELİYOR, TAHMİNDEN DEĞİL.** Kesilecek yer alfa kanalının
sınırlayıcı kutusudur: hangi pikselin gerçekten opak olduğunu yalnız görüntünün kendisi
bilir. "Kenardan %10 at" diyen bir kural, özneyi kadrajın köşesinde olan bir görselde
özneyi keser.

⚠ **PAY BIRAKILIYOR.** Sınırlayıcı kutuya sıfır payla kesmek özneyi kadraja yapıştırır
ve slaytta nefes almayan bir blok üretir. Pay, kutunun kısa kenarının yüzdesi olarak
veriliyor (varsayılan %4) — sabit piksel, farklı boyutlardaki görsellerde farklı
sonuç verirdi.

⚠ **ORAN KORUNABİLİR (`--oran en:boy`).** Yuva 4:5 istiyorsa kesilen kutu o orana
GENİŞLETİLİYOR, sıkıştırılmıyor: sıkıştırmak özneyi bozar ve bozulmuş bir 3B nesne
tasarım hatası gibi okunur.

⚠ Sınır METİN: base64 girer, base64 çıkar — `arkaplan-sil` ile aynı sözleşme, aynı
gerekçe (ring 0'ın boru sözleşmesi `string` taşıyor).
"""

import base64
import io
import sys

# Alfa bu eşiğin ÜSTÜNDEYSE piksel "özneye ait" sayılıyor.
#
# ⚠ ⚠ **EŞİK 0 OLAMAZ.** `rembg` çıktısında kenarlarda 1–10 arası tüy alfası kalıyor;
# sıfır eşik bütün tuvali "dolu" görür ve kırpma hiçbir şey yapmaz. 24, ölçülen tüy
# değerlerinin üstünde ve gerçek yarı saydam kenarların (cam, duman) altında.
ESIK = 24

# Kutunun kısa kenarına oranla bırakılan pay.
PAY_ORANI = 0.04


def _oran_coz(metin: str) -> "tuple[float, float] | None":
    try:
        en, boy = metin.split(":")
        a, b = float(en), float(boy)
        return (a, b) if a > 0 and b > 0 else None
    except Exception:  # noqa: BLE001 — sınır: bozuk argüman kırpmayı düşürmesin
        return None


def main() -> int:
    hedef_oran = None
    for arg in sys.argv[1:]:
        if arg.startswith("--oran="):
            hedef_oran = _oran_coz(arg[len("--oran=") :])

    metin = sys.stdin.read().strip()
    if not metin:
        sys.stderr.write("bos girdi\n")
        return 2
    try:
        ham = base64.b64decode(metin, validate=True)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"base64 cozulemedi: {e}\n")
        return 4

    from PIL import Image

    try:
        im = Image.open(io.BytesIO(ham))
        im.load()
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"goruntu acilamadi: {e}\n")
        return 3

    if im.mode not in ("RGBA", "LA"):
        # ⚠ ⚠ **ALFASIZ GÖRSEL KIRPILMIYOR ve bu SESSİZ bir atlama DEĞİL.** Kesilecek
        # yeri söyleyen tek şey alfa kanalı; onsuz kırpmak, hangi pikselin özne
        # olduğunu TAHMİN etmek olurdu. Çağıran bunu görüyor ve önce arka planı
        # silmesi gerektiğini öğreniyor.
        sys.stderr.write("alfa-yok\n")
        sys.stdout.write(base64.b64encode(ham).decode("ascii"))
        return 0

    im = im.convert("RGBA")
    en, boy = im.size
    kutu = im.getchannel("A").point(lambda a: 255 if a > ESIK else 0).getbbox()
    if kutu is None:
        # Tamamen saydam: kesecek bir şey yok ve kesmek boş bir kare üretirdi.
        sys.stderr.write("tumu-saydam\n")
        sys.stdout.write(base64.b64encode(ham).decode("ascii"))
        return 0

    sol, ust, sag, alt = kutu
    kutu_en, kutu_boy = sag - sol, alt - ust
    pay = int(round(min(kutu_en, kutu_boy) * PAY_ORANI))
    sol, ust = max(0, sol - pay), max(0, ust - pay)
    sag, alt = min(en, sag + pay), min(boy, alt + pay)

    if hedef_oran is not None:
        # ⚠ Kutu GENİŞLETİLİYOR, sıkıştırılmıyor: sıkıştırmak özneyi bozar.
        a, b = hedef_oran
        k_en, k_boy = sag - sol, alt - ust
        istenen_en = k_boy * a / b
        if istenen_en > k_en:
            ek = (istenen_en - k_en) / 2
            sol, sag = max(0, int(sol - ek)), min(en, int(sag + ek))
        else:
            istenen_boy = k_en * b / a
            ek = (istenen_boy - k_boy) / 2
            ust, alt = max(0, int(ust - ek)), min(boy, int(alt + ek))

    kesilen = im.crop((sol, ust, sag, alt))
    # ⚠ Kesilen ORAN ölçülüp bildiriliyor: "kırpıldı" ile "hiçbir şey değişmedi" ayrı
    # şeyler ve çağıran hangisi olduğunu SÖYLEYEBİLMELİ (`arkaplan-sil` ile aynı ilke).
    onceki = en * boy
    sys.stderr.write(
        "kirpma-orani=%.4f kutu=%dx%d\n"
        % (1.0 - (kesilen.size[0] * kesilen.size[1]) / float(onceki), *kesilen.size)
    )
    cikti = io.BytesIO()
    kesilen.save(cikti, format="PNG")
    sys.stdout.write(base64.b64encode(cikti.getvalue()).decode("ascii"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
