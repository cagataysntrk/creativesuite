"""Arka plan silme — TEK amaç, TEK çıktı (FAZ-15.11 · D-274).

⚠ ⚠ **BU BETİK BİR ÖLÇÜMDEN DOĞDU.** `matlama` (luma anahtarı) brief'in düz siyah zemin
istemesine dayanıyordu ve bu bir RİCA'ydı: gerçek koşularda model açık gri stüdyo zemini
üretti, anahtar hiçbir şeyi kesmedi ve çıktıda kesik özne yerine DİKDÖRTGEN bir fotoğraf
kaldı. Denetim bunu ölçtü (`matlama-tutmuyor`, köşe parlaklığı 59–101/255) ama
düzeltemedi — metin değiştirerek bir görselin zemini siyahlaşmıyor.

⚠ stdin'den PNG/JPEG baytı okur, stdout'a RGBA PNG yazar. Dosya yolu ALMIYOR: alt süreç
sınırından geçen tek şey bayt, böylece çağıran tarafın dosya sistemi varsayımı yok.

⚠ İlerleme çubuğu stderr'e bile yazılmıyor (`tqdm` kapalı): stdout ikili veri taşıyor ve
oraya sızan tek bir karakter PNG'yi bozar.
"""

import os
import sys

os.environ.setdefault("TQDM_DISABLE", "1")

from rembg import new_session, remove  # noqa: E402

# Oturum bir kez kuruluyor: model yüklemesi ~8 sn, çıkarım ~9,7 sn (ölçüldü).
# ⚠ ⚠ **MODEL: BRIA RMBG 2.0 — EN İYİSİ SEÇİLDİ, LİSANS ONU DÜŞÜRMEDİ.** Bir tur önce
# `providers` kapısı BRIA'yı reddetti (ticari lisans yok) ve model `u2net`e düşürüldü.
# **Kapının öncülü yanlıştı:** kural "bu deponun çıktıları ticari yayınlanıyor" varsayıyor;
# burası yerel, ticari olmayan bir komuta merkezi. Kural D-274'te düzeltildi ve koruma
# yayın kapısına taşındı — kalite, korunmayan bir riske feda edilmedi.
#
# ⚠ Ölçüm (aynı görsel, 600×750): `bria-rmbg` 9,7 sn · şeffaf %90,9 · opak %8,1 —
# `u2net` 0,2 sn · %89,9 · %7,7. **Bu görselde ikisi denk** çünkü vaka kolaydı (düz
# zeminde tek özne). BRIA'nın üstünlüğü saç, ince kenar ve karışık zemin gibi ZOR
# vakalarda; burada ölçülmedi, modelin genel niteliğine dayanıyor. Kolay vakada bedeli
# 48 kat süre — o yüzden `REMBG_MODEL` ile değiştirilebilir bırakıldı.
_OTURUM = new_session(os.environ.get("REMBG_MODEL", "bria-rmbg"))


def main() -> int:
    ham = sys.stdin.buffer.read()
    if not ham:
        sys.stderr.write("bos girdi\n")
        return 2
    try:
        cikti = remove(ham, session=_OTURUM)
    except Exception as e:  # noqa: BLE001 — sınır: hata METİN olarak dışarı çıkar
        sys.stderr.write(f"rembg hatasi: {e}\n")
        return 3
    sys.stdout.buffer.write(cikti)
    return 0


if __name__ == "__main__":
    sys.exit(main())
