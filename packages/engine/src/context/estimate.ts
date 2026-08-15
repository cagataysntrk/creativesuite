// Token TAHMİNİ (§5.3).
//
// **Adı `estimate`, çünkü tahmindir.** Gerçek token sayısı sağlayıcının tokenizer'ına
// bağlıdır ve o tokenizer ağ üstünde yaşar; bütçe kararı ise `just plan` sırasında,
// SIFIR AĞ ile verilmek zorunda (R-47). Bu yüzden burada deterministik bir yaklaşım var
// ve adı hiçbir yerde `tokens` değil `tokenEstimate` — bir tahmini kesin sayı gibi
// göstermek, bütçe kapısını yalancı yapar.
//
// **Türkçe için oran neden 3.2:** Türkçe eklemeli bir dil ve BPE sözlükleri ağırlıklı
// olarak İngilizceye göre eğitilmiş; "ölçümlerinizi" gibi bir kelime tek token olmaz,
// 4-6 parçaya bölünür. İngilizce için yaygın kabul ~4 karakter/token; Türkçe'de gözlenen
// aralık 2.8-3.5. Ortası alındı ve **kasten kötümser tarafta**: bütçeyi aşan bir tahmin
// bir bölümü erken keser (görünür), az tahmin eden bir oran ise sağlayıcıda bağlam
// taşmasına yol açar (görünmez, pahalı).
const KARAKTER_BASINA_TOKEN = 3.2

/** En az 1: boş olmayan hiçbir metin "0 token" değildir. */
export const estimateTokens = (text: string): number =>
  text.length === 0 ? 0 : Math.max(1, Math.ceil(text.length / KARAKTER_BASINA_TOKEN))
