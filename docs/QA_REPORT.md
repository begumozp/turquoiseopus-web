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
