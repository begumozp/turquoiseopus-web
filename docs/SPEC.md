# Turquoise Opus — uygulama kapsamı

## Sistem

| Parça | Uygulama |
|---|---|
| Frontend | Mevcut onaylı CSS, yerel fontlar, Vanilla JavaScript, çok sayfalı kabuk + API’den içerik |
| Yönetim | Aynı domain altında responsive `/admin`, tek kullanıcı |
| API | Cloudflare Pages Functions, standart Fetch API |
| Kimlik | Supabase Auth; sunucuda `getUser` eşdeğeri doğrulama + UUID/e-posta/onay kontrolü |
| İçerik | Postgres `opus_state`: taslak ve yayımlanmış JSON belge |
| İşlem güvenliği | Sürüm numarası, satır kilidi ve atomik `opus_commit` RPC |
| Geçmiş | Son 100 sürüm, önce taslağa geri yükleme |
| Görseller | Private Storage; aynı origin’den yetkili proxy; signed/public URL yok |
| E-posta | info@turquoiseopus.art için FormSubmit AJAX; aktivasyon ayrıca |
| Ticaret | Yalnız tam Etsy listing URL’sine yönlendirme |
| Diller | Manuel EN/NL/TR; dış çeviri servisi yok |

## Korunan görsel dil

Monochrome turkuaz suluboya fonu; blurlu header/footer; krem wordmark ve #A6F2E8 nokta. Yerel Cormorant Garamond wordmark, Source Serif 4 / Opus Editorial başlıklar, mevcut DM Sans yardımcı yazılar. Menü/koleksiyon adları regular, bölüm başlıkları 700, ana başlıklar 800; onaylı ana sayfa sloganının bold kararı korunur. Terracotta vurgu, solid bej galeri paspartusu ve gölgeler kullanılır. Ana sayfa 007 yakın planından koleksiyonlara geçer; araya tam 007 eklenmez. Koleksiyonlar düz ve yavaş kayan şerit, oklar ve klavye ile yönetilir. FAQ ayrı native açılır kutular; About metni ve kapanış sorusu onaylı kopyadan alınır. Footer’da Etsy → Instagram sırası korunur.

## Veri ve görünürlük

40 ayrı eser, 4 koleksiyon; başlangıçta 3 koleksiyon görünür. Her eserde kod, dil bazında başlık/açıklama/medium, koleksiyon, yıl, genişlik/yükseklik, gsm, asitsiz kağıt/çerçeve bilgisi, görsel/onay, orijinal durumu ve baskı seçenekleri tutulur. QC’nin iç fotoğraf tanıma açıklamaları kamuya açıklama diye aktarılmaz. QC dosyası değişmeden kalır.

Baskı seçenekleri aynı eser sayfasında bulunur. Her seçenekte boyut, fiyat, Etsy URL’si ve satış görünürlüğü vardır. Fiyat gösterimi eser bazındadır. Satıldı orijinal, baskı satışını otomatik kapatmaz. Başlangıçta gerçek Etsy ürün URL’si verilmediğinden satın alma bağlantıları uydurulmaz.

Görsel yayını için üç koşul gerekir: global kilit açık olacak, eser dahil/onaylı olacak ve ana dosya özel depoda bulunacak. Detaylar ayrıca onaylı olmalı. Fotoğrafı olmayan veya arşivlenen eser public projeksiyona girmez. Global kilit açılınca taslakta olup yayımlanmamış dosya hâlâ public olmaz.

## Toplu fiyat ve geri alma

Koleksiyon + mevcut boyut + EUR fiyatı → sunucudan hedef/hariç listesi → sürüm doğrulaması → atomik taslak değişikliği. Orijinaller ve diğer boyutlar etkilenmez. Yeni seçenek oluşturulmaz. Undo, `bulk-price` işleminden önceki belgenin revizyon geçmişinden taslağa geri alınmasıdır; global kilit bağımsızdır.

## Güvenlik kararları

- Hiçbir fotoğraf binary’si, baskı masterı veya service_role key frontend/build/repo içinde yer almaz. Dekoratif suluboya fonu bu fotoğraf kilidinden ayrı, açık bir tasarım varlığıdır.
- Kilit DB’de varsayılan `true`. Belirsiz veya erişilemeyen servis görsel açamaz. Yeni API talepleri kontrolden geçer. Metadata isteği de gizliyken medya kimliklerini döndürmez.
- Admin session/refresh token’ları HttpOnly + Secure + SameSite=Strict cookie’dedir. JWT tarayıcı localStorage’ına yazılmaz. Sunucu tarafı doğrulama gerekir.
- Mutasyonlarda Origin kontrolü; login’de IP başına sınırlama; isteğe bağlı Turnstile; CSP ve frame kısıtları; SVG/HTML yükleme reddi; MIME sihirli bayt/ölçü başlığı kontrolü, 3000 px ve 8 MB sınırı; istek gövdesi akışta sınırlandırılır.
- Yükleme suistimaline karşı resim dosyası/başlık doğrulaması var; bu bir antivirüs veya filigran tespit sistemi değildir. Filigran uygunluğu yönetici tarafından onaylanır.
- Kamuya gösterilen içerikte düz metin escape edilir. Etsy/YouTube host ve protokol kontrolleri yapılır.
- Kamuya sunulan dosyalar zaten filigranlı web kopyasıdır. Yakınlaştırma aynı web dosyasını kullanır, gizli baskı masterını açmaz.
- Kopyalamayı tamamen engelleme, ekran görüntüsünü önleme, geçmişte indirilmiş dosyayı geri silme veya AI kullanımını kesin engelleme garantisi yoktur.

## İşletim sınırları

Çalışan kurulum için kullanıcının Supabase/Cloudflare hesapları, secret’ları ve DNS ayarları gerekir. Ücretsiz katman kotaları ve hareketsizlik duraklatması izlenmelidir. Kod bunları aşmak için ücretli plana geçmez. E-posta onayı/teslimat testi sahibi tarafından yapılır. Tarayıcı/cihaz ve gerçek SaaS entegrasyon testleri ayrı onay kapısıdır.

Repo değişiklikleri otomatik olarak yönetim paneli içeriğinin üstüne seed yazmaz. Yedek alma manuel başlatılır. Günlük sergi takibi otomasyonu ve Sergiler sekmesi bu uygulamadan bağımsızdır ve bu çalışma sırasında değiştirilmedi.
