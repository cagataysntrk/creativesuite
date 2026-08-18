"""Arka plan silme — TEK amaç, TEK çıktı (FAZ-15.11 · D-274).

⚠ ⚠ **BU BETİK BİR ÖLÇÜMDEN DOĞDU.** `matlama` (luma anahtarı) brief'in düz siyah zemin
istemesine dayanıyordu ve bu bir RİCA'ydı: gerçek koşularda model açık gri stüdyo zemini
üretti, anahtar hiçbir şeyi kesmedi ve çıktıda kesik özne yerine DİKDÖRTGEN bir fotoğraf
kaldı. Denetim bunu ölçtü (`matlama-tutmuyor`, köşe parlaklığı 59–101/255) ama
düzeltemedi — metin değiştirerek bir görselin zemini siyahlaşmıyor.

⚠ ⚠ **SINIR METİN: base64 girer, base64 çıkar — ve bu bir ÖLÇÜMDEN geldi.** İlk sürüm
ham bayt okuyup ham bayt yazıyordu; `spawnProcess` sözleşmesi ise stdin'i `string`
alıyor ve stdout'u `chunk.toString('utf8')` ile topluyor. İkili veri o kanaldan geçince
BOZULUYOR: gerçek koşuda Python `cannot identify image file` dedi. Kernel'in boru
sözleşmesini tek bir yetenek için genişletmek yerine (ring 0 sabittir) sınır metin
tutuldu — base64 tam olarak bunun için var.

⚠ İlerleme çubuğu stderr'e bile yazılmıyor (`tqdm` kapalı): stdout tek satır base64
taşıyor ve oraya sızan tek bir karakter çıktıyı bozar.
"""

import base64
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
    metin = sys.stdin.read().strip()
    if not metin:
        sys.stderr.write("bos girdi\n")
        return 2
    try:
        ham = base64.b64decode(metin, validate=True)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"base64 cozulemedi: {e}\n")
        return 4
    try:
        cikti = remove(ham, session=_OTURUM)
    except Exception as e:  # noqa: BLE001 — sınır: hata METİN olarak dışarı çıkar
        sys.stderr.write(f"rembg hatasi: {e}\n")
        return 3
    sys.stdout.write(base64.b64encode(cikti).decode("ascii"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
