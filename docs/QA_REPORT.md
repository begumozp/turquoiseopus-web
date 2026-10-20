# QA raporu — 19.10.2026

**Durum:** Kod, birim/API senaryo ve render kontrolleri tamamlandı. Gerçek Supabase/Cloudflare hesabında entegrasyon, görsel tarayıcı ve fiziksel cihaz testi yapılmadı. Bunlar yapılmış gibi sunulmaz.

## Çalıştırılan kontroller

`npm run qa` başarılı: **38/38 test**, üretim derlemesi ve JavaScript sözdizimi kontrolleri.

| Alan | Sonuç |
|---|---|
| Veri | 40 ayrı eser; 008/012 tekrarlarının ayrılmaması; 23 onaylı ana fotoğraf |
| Ölçüler | 004/011: 29,7 × 21 cm; WB014/WB015: 24 × 34 cm |
| Global gizleme | Varsayılan kapalı erişim; eksik flag ve kurulumsuz backend kapalı davranıyor |
| Direkt dosya erişimi | Gizliyken Storage isteği bile yapılmıyor; anonim preview reddediliyor |
| Yetki | Oturumsuz yönetim 401; yanlış UUID 403; başka origin mutasyon 403 |
| Yayın | Taslak kayıt canlı belgeyi değiştirmiyor; yayın global kilidi açmıyor |
| Çakışma | Eski sürümle kayıt ve eski toplu fiyat önizlemesi reddediliyor |
| Önbellek | Public/özel medya no-store; redirect/signed URL dönmüyor |
| Toplu fiyat | Yalnız seçili koleksiyon ve var olan boyut; orijinal/diğer boyutlar korunuyor |
| URL güvenliği | Yalnız HTTPS Etsy listing; YouTube host + ID doğrulaması |
| Metin | HTML/script girişleri render sırasında escape ediliyor |
| Render | 23 eserin her biri EN/NL/TR’de üretiliyor; fotoğrafı gizli galeride URL yok |
| Ana sayfa | Carousel kontrol/count/kapak bağlantısı sözleşmeleri mevcut |
| FAQ | 7 bağımsız native details kutusu |
| Yedek ZIP | Bilinen CRC32 vektörü, ZIP central directory ve güvenli yol kontrolü |

Ayrıca oluşturulan örnek ZIP Python `zipfile` ile açılıp CRC doğrulaması yapıldı; Unicode dosya adı korundu.

Üretim çıktısında sanat fotoğrafı/portre, RAW/DNG/TIFF veya gömülü JPEG/PNG artwork bytes bulunmadığı tarandı. Gizli anahtarların gerçek değerleri hiçbir dosyaya girilmedi. Tüm kaynak/çıktı JavaScript dosyalarının sözdizimi kontrol edildi.

95 özel dosyada EXIF bulunmadığı, en uzun kenarın 2000 px’i aşmadığı ve aktarım manifestindeki SHA-256 değerleri denetlendi. Aktarım sırasında da SHA-256 kontrolü yapılır.

## Testlerin kapsam sınırı

API senaryoları Supabase HTTP çağrılarının kontrollü mock’larını kullanır. SQL şemasının gerçek Postgres üzerinde çalışması, Storage RLS ve cookie’lerin canlı domain davranışı bu koşumda doğrulanmadı. Render testleri Node içindeki minimal DOM yüzeyiyle HTML üretimini denetler; gerçek tarayıcı ekran yerleşimi/renk/odak testi değildir.

Bu ortamda Sites’ın öngördüğü tarayıcı kontrol yeteneği mevcut değildi; alternatif tarayıcı kurup test yapılmadı. Masaüstü/mobil tam uyum iddiası yalnız CSS kaynaklarına bakılarak “doğrulanmış” sayılmadı. Responsive uygulama hazır; **`BROWSER_QA.md` cihaz testleri ve canlı servis denemeleri yayından önce tamamlanmalı**.

## Bulunup düzeltilenler

- Acil gizleme, geçersiz/kaydedilmemiş editör alanlarından bağımsız çalışır ve formu silmez.
- Gizlenen fiyatlar public API yanıtından da çıkarılır.

- Carousel’in dinamik HTML’inde eksik sayaç ve kapak link sınıfı tamamlandı.
- 2 koleksiyon kaldığında şerit denetimlerinin çalışması; tek koleksiyonda okların saklanması eklendi.
- Toplu fiyat önizlemesinden önce kayıt yapılırken seçili fiyatın sıfırlanması önlendi.
- Kilit düğmesinin kaydedilmemiş editör alanlarını kaybetmesi önlendi.
- Detay kırpmanın CSS boyutlandırmasından kaynaklanabilecek koordinat sapması giderildi.
- API görüntü kilidinde eksik/null bayrağın açık sayılması önlendi.
- Sonradan eklenecek eser/koleksiyon sayfaları için yönlendirmeler eklendi.
- Türkçe dosya adlarının HTTP başlığında sorun çıkarması için URL encoding eklendi.
- Eski CSS içindeki gömülü sanat fotoğrafı parçaları kaldırıldı; yalnız dekoratif suluboya fonu bırakıldı.

## Mühendis kabulü bekleyenler

1. Şemayı taze Supabase projesinde çalıştırma; RLS, private bucket ve RPC yetkilerini gerçek isteklerle deneme.
2. Gerçek owner hesabıyla giriş/çıkış, oturum yenileme, şifre değişimi ve izinsiz hesap reddi.
3. 95 dosyanın gerçek aktarımı; taslak önizlemesi; fotoğraflar gizliyken yayın.
4. Chrome/Firefox/Safari ve iOS/Android yerleşim, menü, dil, carousel, FAQ, fotoğraf zoom ve klavye testleri.
5. Yükleme/kırpma, yeni kayıt ve yeni URL, toplu fiyat/undo, yedek ZIP ve test projesine tam restore.
6. info@ adresinde FormSubmit aktivasyonu ve gerçek mesaj/Reply-To teslimi.
7. Kontrol tamamlanana kadar global kilidi kapalı tutma. Kilit açıldıktan sonra ayrı oturumsuz pencerede yalnız yayımlanmış/onaylı fotoğrafın erişilmesi.

Kod bu kontrolleri kendiliğinden “mühendis onaylandı” saymaz; global anahtar otomatik açılmaz.

## 20.10.2026 — Koleksiyon kapakları açık, eser galerisi kapalı

`pages.artworks=false` ayarı panelin Ayarlar ve yedek bölümünden yönetilir. Home ve About sayfaları kalır; koleksiyon kapakları public belgede ayrı `coverMedia` alanıyla sunulur. Eser kayıtları, satış bilgileri ve detay listeleri public belgeden çıkarılır. Gallery bağlantıları kaldırılır; doğrudan eser adresi kayıt sunmaz. Medya API'si mevcut izin listesini kullandığı için seçili kapaklar, hero ve portre dışındaki eser/detay dosyalarını 404 ile reddeder. Global gizleme bütün fotoğrafları kapatmaya devam eder. Kapak seçili eserin ana fotoğrafıdır; kapak olarak yayımlanan fotoğrafın gizli olduğu iddia edilmez.

`npm run qa`: **45/45 test**, derleme ve kaynak/çıktı kontrolleri başarılı. Yeni senaryolar: galeri kapalıyken yalnız kapak/Home/About izinleri; direkt özel dosya reddi; onaysız/arşivde/başka koleksiyondaki kapak reddi; global kilit; taslak ve yayın ayrımı; üç dilde sayfa üretimi. Tasarım ve görseller değiştirilmedi. Ayar isteğe bağlıdır; mevcut belgedeki eksik değer önceki galeri davranışını korur. SQL değişikliği ve yeniden medya yükleme gerekmez.

Bu turda canlı sitede Home ve About gezinmesi, `/api/status` ve `/api/public` okundu: siteye erişim var, global görsel kilidi kapalı erişimde, yayımlanmış koleksiyon/eser listesi boş. Yönetici oturumu kullanılmadı; yüklenen dosya sayısı ve taslak içeriği bu bulgudan doğrulanamaz. Yeni ayar bu çalışma kopyasında test edildi; GitHub/Cloudflare'a bu ortamdan gönderilmedi ve canlıda uygulanmış sayılmaz. Yeni arayüzün gerçek tarayıcı/mobil testi ve canlı izin denemeleri dağıtımdan sonra yapılmalı.

## 20.10.2026 — Cloudflare yönlendirme düzeltmesi

Canlı `turquoiseopus-web.pages.dev/admin` isteğinde `308 Location: /admin` öz yönlendirme döngüsü doğrulandı. `/admin /admin.html 200` kuralı, Cloudflare Pages’in `.html` uzantısını kaldıran otomatik yönlendirmesiyle çakışıyordu. Gereksiz admin kuralı kaldırıldı; Pages mevcut `admin.html` dosyasını `/admin` adresinde kendisi sunar. Eser/koleksiyon proxy hedefleri de `/index.html` yerine onun kanonik karşılığı `/` olarak değiştirildi. Dinamik URL desteği korunur.

Düzeltmeden sonra `npm run qa` tekrar başarılı: 38/38 test, üretim derlemesi ve özel fotoğraf/anahtar dışlama kontrolleri. Wrangler 4.151.2, düzeltilmiş dosyada iki geçerli yönlendirme kuralını ayrıştırdı. Yerel HTTP/tarayıcı denemeleri ortam sınırlamaları nedeniyle tamamlanamadı; bu, canlı dağıtım sonrası doğrulamanın yerine geçmez. GitHub/Cloudflare’a bu ortamdan değişiklik gönderilmedi.

Ayrı canlı denemede `/api/status`, 503 ve `Sunucu kurulumu henüz tamamlanmadı.` cevabı verdi. Yeni dağıtımdan sonra production ortamındaki Supabase bağlantısı yeniden kontrol edilmeli. Gerçek giriş, fotoğraf aktarımı ve mühendis kabulü tamamlanmış sayılmaz.

## 20.10.2026 — Boş taslakta panel kilitlenmesi

Kullanıcının bildirdiği `Cannot read properties of undefined (reading 'forEach')` hatası mevcut `capture()` fonksiyonu ve boş `{}` taslakla yeniden üretildi. Koleksiyonlar menüsüne girip başka bölüme geçerken `doc.collections.forEach` çalışıyor, koleksiyon listesi henüz bulunmadığından geçiş yarıda kalıyordu. Process ve ayar alanlarında da benzer boş-veri varsayımları vardı.

Panel artık çalışma kopyasında eksik liste/dil/alan kaplarını hazırlar; kaynak taslağı değiştirmez ve kendiliğinden görsel onayı vermez. İlk kurulumda form yakalama atlanır, eksik içerik kaydedilip yayımlanmaz; menüler kilitlenmez. Görseller, geçmiş, hesap ve yedek ekranlarına erişilebilir. Geçerli JSON yedeği boş panelde de taslağa aktarılabilir.

Yalnız boş taslağa çalışan, yönetici yetkili `POST /api/initialize` kurtarma akışı eklendi. Gereken 95 medya kimliği ve filigran onayı kontrol edilir; eksik dosya varsa sayı bildirilir ve yazma yapılmaz. Başarılı işlem 40 eserlik başlangıç içeriğini, eser galerisi kapalı olarak yalnız taslağa kaydeder. Mevcut/yarım kullanıcı içeriğinin üzerine yazılması, eski sürümle kayıt ve oturumsuz çağrı reddedilir. Yayın ve global görünürlük değişmez. Supabase şeması değişmedi.

`npm run qa`: **52/52 test**, üretim derlemesi ve özel varlık/anahtar dışlama kontrolleri başarılı. Wrangler 4.151.2 ile Pages Functions derlemesi de başarılı; başlangıç JSON'u sunucu paketine alınır, public çıktıya konmaz. Yeni regresyonlar boş/null/eksik taslak, menüde form yakalama, editör bölümlerinin render edilmesi, veri koruma, ilk kurulum yetkisi/sürüm/medya kontrolü ve otomatik yayın açılmamasını kapsar. Bu doğrulamalar canlı admin oturumu veya gerçek tarayıcı/mobil testi değildir; dağıtım bu ortamdan yapılmadı.

## 20.10.2026 — Pages Wrangler 3 uyumluluğu

Kullanıcının canlı build günlüğünde statik üretim başarılı, Functions derlemesi ise Wrangler **3.114.17** altında `Expected ";" but found "with"` ile başarısızdı. Önceki Wrangler 4 kontrolü, eski paketleyicinin JSON import attribute desteği eksikliğini yakalamamıştı.

`server/api.mjs` artık JSON import attribute yerine düz ES module olan `server/initial-content.mjs` dosyasını alır. Bu veri dosyası kanonik `seed/content.json` içeriğinden build sırasında üretilir ve kaynak paketinde de bulunur; testler iki içeriğin aynı olduğunu denetler. Node ve eski Wrangler aynı sözdizimini kullanır. Gizli anahtar, SQL, yüklenen medya, taslak ve yayın içeriği değişmez.

**53/53 test**, üretim derlemesi, sözdizimi ve özel varlık/anahtar dışlama kontrolleri başarılı. Logdaki tam sürüm **Wrangler 3.114.17** ile `pages functions build functions` başarılı; ayrıca CI'ya bu sürümle derleme kontrolü eklendi. Bu, yerel derleme doğrulamasıdır; yeni GitHub commit'i ve Cloudflare dağıtımı kullanıcı hesabında uygulanmalıdır.
